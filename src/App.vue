<template>
  <div id="app">
    <div class="header">
      <h1>TODO</h1>
      <div class="header-menu">
        <!-- 
          <button class="header-menu-button" @click="showOutput()"> <img src="img/plus.svg" title="カラムを追加"/></button>
        -->
        <button class="header-menu-button" @click="showOutput()"> <img src="img/note-text.svg" title="出力画面を表示/非表示"/></button>
        <button class="header-menu-button" @click="showSettings()" ><img src="img/settings.svg" title="設定画面を表示/非表示"/></button>
      </div>
    </div>

    <div class="main-content">
      <div class="tasks">
    <draggable
      v-model="taskList"
      v-bind="dragOptions"
      group="task"
      handle=".handle"
      @start="drag=true"
      @end="drag=false"
    >
    <transition-group type="transition" :name="drag ? 'flip-list' : null">
      <task-item
        v-for="(item,index) in taskList"
        v-bind:task="item"
        v-bind:index="index"
        v-bind:totalsize="taskList.length"
        v-bind:key="item.id"
        :ref="index"
        @add-item="addItem(index)"
        @delete-item="deleteItem(index)"
        @save-item="saveItem()"
      ></task-item>
    </transition-group>
    </draggable>
    </div>
    </div>
    <div class="output" v-show="taskListSettings.isOutputVisible">
      <input type="button" value="出力" class="menu" @click="outputResult" title="テキストとして出力" />
      <input type="button" value="コピー" class="menu" @click="copyResult" title="出力結果をクリップボードにコピー"/>
      <input type="button" value="✖" class="close-button" @click="showOutput" title="閉じる" />
      <br />
      <textarea class="result" v-bind:value="outputStr"></textarea>
    </div>
    <div class="settings" v-show="this.taskListSettings.isSettingsVisible">
      <input type="button" value="✖" class="close-button"  @click="showSettings" title="閉じる" />
      <h2>設定</h2>
      <ul style="padding-left:20px;">
      <li>ヘッダ：<br />
      <input type="text" class="settings-text" @change="saveSettings" v-model="taskListOutputTemplate.header"></li>
      <li>インデントの文字：<br />
      <input type="text" class="settings-text"  @change="saveSettings" v-model="taskListOutputTemplate.indentStr"></li>
      <li>チェックボックス（未）：<br />
      <input type="text" class="settings-text"  @change="saveSettings" v-model="taskListOutputTemplate.uncheckedText"></li>
      <li>チェックボックス（済）：<br />
      <input type="text" class="settings-text"  @change="saveSettings" v-model="taskListOutputTemplate.checkedText"></li>
      <li>本文：<br />
      <input type="text" class="settings-text"  @change="saveSettings" v-model="taskListOutputTemplate.body"></li>
      <li>フッタ：<br />
      <input type="text" class="settings-text"  @change="saveSettings" v-model="taskListOutputTemplate.footer"></li>
      </ul>
      <div style="border: dotted 2px #7db4e6;">
        <ul style="font-size:small">
        <li>{IndentText}: インデントの文字</li>
        <li>{CheckBoxText}: チェックボックス</li>
        <li>{Text}: 本文</li>
        <li>{br}: 改行</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import TaskItem from "./components/TaskItem.vue";
import draggable from 'vuedraggable'

export default {
  name: "app",
  components: {
    TaskItem,
    draggable
  },
  directives: {},
  data: function() {
    return {
      taskList: [this.buildNewItem()],
      outputStr: "",
      taskListOutputTemplate: {
        header: "## TODO{br}{br}",
        indentStr: "  ",
        body: "{IndentText}- {CheckBoxText} {Text}{br}",
        footer: "",
        uncheckedText: "[ ]",
        checkedText: "[x]"
      },
      taskListSettings: {
        isSettingsVisible: false,
        isOutputVisible: false,
      },
      drag: false,
    };
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "task",
        disabled: false,
        ghostClass: "ghost"
      };
    }
  },
  methods: {
    buildId: function() {
      return "xxxxx".replace(/x/g, function() {
        return ((Math.random() * 16) | 0).toString(16);
      });
    },
    buildNewItem: function() {
      return { id: this.buildId(), indent: 0, checked: false, text: "" };
    },
    showOutput:function(){
      (this.taskListSettings.isOutputVisible)?
      this.taskListSettings.isOutputVisible=false:
      this.taskListSettings.isOutputVisible=true;
      this.saveSettings();
    },
    showSettings:function(){
      (this.taskListSettings.isSettingsVisible)?
      this.taskListSettings.isSettingsVisible=false:
      this.taskListSettings.isSettingsVisible=true;
      this.saveSettings();
    },
    setAllItemState: function() {
      for (var item in this.$refs) {
        if (this.$refs[item]["0"] != null) {
          this.$refs[item]["0"].setItemState();
        }
      }
    },
    addItem: function(index) {
      this.taskList.splice(index + 1, 0, this.buildNewItem());
      this.taskList[index + 1].indent = this.taskList[index].indent;
      this.saveItem();
    },
    replaceItem: function(upperIndex, lowerIndex) {
      var temp = this.taskList[lowerIndex];
      this.taskList.splice(lowerIndex, 1, this.taskList[upperIndex]);
      this.taskList.splice(upperIndex, 1, temp);
    },
    deleteItem: function(index) {
      if (!this.$refs[index]["0"].isDeletableItem) {
        return;
      }
      if (!window.confirm("アイテムを削除します。よろしいですか？")) {
        return;
      }
      this.taskList.splice(index, 1);
      this.saveItem();
    },
    saveItem: function() {
      localStorage.taskList = JSON.stringify(this.taskList);
    },
    saveSettings: function(){
      localStorage.taskListOutputTemplate = JSON.stringify(this.taskListOutputTemplate);
      localStorage.taskListSettings = JSON.stringify(this.taskListSettings);
    },
    replaceOutputStr: function(index, template){
      let indentStr = "";
      for(let i = 0; i < this.taskList[index].indent;i++){
        indentStr += this.taskListOutputTemplate.indentStr;
      }
      let checkStr = this.taskList[index].checked ? 
        this.taskListOutputTemplate.checkedText:
        this.taskListOutputTemplate.uncheckedText;
      let lineStr = template
        .replace(/\{IndentText\}/g, indentStr)
        .replace(/\{CheckBoxText\}/g, checkStr)
        .replace(/\{Text\}/g, this.taskList[index].text)
        .replace(/\{br\}/g, "\n");
      return lineStr;
    },
    outputResult: function(){
      this.outputStr = this.replaceOutputStr(0, this.taskListOutputTemplate.header);
      for (let item in this.taskList) {
        this.outputStr += this.replaceOutputStr(item, this.taskListOutputTemplate.body);
      }
      this.outputStr += this.replaceOutputStr(0, this.taskListOutputTemplate.footer);
    },
    copyResult: function(){
      let textarea = document.getElementsByClassName("result")[0];
      textarea.select();
      document.execCommand("copy");
    },
  },
  mounted() {
    if (localStorage.taskList) {
      this.taskList = JSON.parse(localStorage.taskList);
    }
    if (localStorage.taskListOutputTemplate) {
      this.taskListOutputTemplate = JSON.parse(localStorage.taskListOutputTemplate);
    }
    if (localStorage.taskListSettings) {
      this.taskListSettings = JSON.parse(localStorage.taskListSettings);
    }
  },
  updated: function() {
    this.$nextTick(function() {
      this.setAllItemState();
    });
    this.saveItem();
  }
};
</script>

<style>

.v-enter-active,
.v-leave-active,
.v-move {
  animation-timing-function: ease;
  transition: opacity 0.3s, transform 0.3s;
}
.v-leave-active {
  position: absolute;
}
.v-enter {
  opacity: 0;
  transform: translateX(-64px);
}
.v-leave-to {
  opacity: 0;
  transform: translateX(64px);
}

.flip-list-move {
  transition: transform 0s;
}
.no-move {
  transition: transform 0.5s;
}

.ghost {
  opacity: 0.5;
  background: #fdfcf4;
  box-shadow: 0 0 8px rgba(0,0,0,0.3);
}

html{
  height: 100%;
  -webkit-font-smoothing: subpixel-antialiased;
  -moz-osx-font-smoothing: unset;
}
body{
  margin:0px;
  height: 100%;
  background-color:#414345;
}
#app{
  margin: 0px;
  padding: 0px;
  height: 100%;
  background: linear-gradient(to top, #414345, #232526);
}
.header{
  position: fixed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: 0;
  left: 0;
  box-shadow:0px 0px 10px;
  z-index: 1000;
  width: 100%;
  background: linear-gradient(to top, #ece9e6, #ffffff);
  margin: 0px 0px 0px 0px;
  height: 60px;
}
.header-menu{
  margin-right: 30px;
  display: flex;
  align-items: center;
}
.sidebar{
  position: fixed;
  z-index: 998;
  top: 60px;
  left: 0;

  width:50px;
  height:100%;
  background: linear-gradient(to left, #ece9e6, #ffffff);
}
.main-content{
  position: relative;
  margin-left: auto;
  margin-right: auto;
  z-index: 1;
  padding: 0px 20px 0px 20px;
  background-color: #ffffff;
  box-shadow: -8px 0px 8px 0px rgba(0,0,0,0.3), 8px 0px 8px 0px rgba(0,0,0,0.3);
  width: 800px;
  min-height: 100%;
}

.tasks{
  padding-top: 120px;
  margin-bottom: 60px;
  /*font-size: 120%;*/
  /*font-size:16px;*/
}
.output{
  z-index: 2;
  position: absolute;
  top: 65px;
  right:5px;
  width: 500px;
  height: auto;
  padding: 10px;
  background-color: #ffffff;
  box-shadow:0px 0px 10px;
  border-radius: 10px;
}
.result{
  width:100%;
  height:10em;
  resize: vertical;
}
.settings{
  z-index: 3;
  position: absolute;
  top: 65px;
  right:5px;
  width: 300px;
  height: auto;
  padding: 10px;
  background-color: #ffffff;
  box-shadow:0px 0px 10px;
  border-radius: 10px;
}
.settings-text{
  width: 100%;
}
h1 {
  font-size:22px;
  color: rgba(0,0,0,0.6);
  text-shadow: 2px 2px 3px rgba(255,255,255,0.1);
  display: inline-block;
  padding-left:30px;
}
h2 {
  font-size: 16px;
  padding: 0.1em 1em;
  color: #494949;
  background: #f4f4f4;
  border-left: solid 16px #7db4e6;
}
h3 {
  font-size: 14px;
  padding: 0.1em 1em;
  color: #494949;
  border-left: solid 8px #7db4e6;
}

button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  appearance: none;
}
.menu {
  display: inline-block;
  border-radius: 5%;
  font-size: 11pt;
  text-align: center;
  cursor: pointer;
  padding: 3px 3px;
  background: #f4f4f4;
  color: #494949;
  line-height: 1em;
  transition: 0.3s;
  border: 1px solid #494949;
}
.menu:hover {
  color: #f4f4f4;
  background: #7db4e6;
}
.close-button{
  float:right;
  border:none;
  background-color: transparent;
  color: #000;
}
.close-button:hover{
  filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.4));
}
.header-menu-button{
  cursor: pointer;
  color: #49494967;
  opacity: 0.5;
  font-size: 20px;
  transition: 0.3s;
  margin:5px;
}
.header-menu-button:hover {
  opacity: 1.0;
  filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.4));

}

hr {
  height: 1px;
  border: none;
  background-image: linear-gradient(90deg, #d7d7d7, rgba(0,0,0,0));
  width: 100%;
  text-align: left;
  margin-left: 0px;
}
</style>
