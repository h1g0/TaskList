<template>
  <div id="app">
    <div class="header">
      <div class="header-menu"> 
        <button class="menu-button" @click="showSidebar()">
          <img src="img/menu.svg" title="サイドバーを表示/非表示"/>
        </button>
      </div>
      <h1>TaskList</h1>
      <div class="header-menu"> 
        <button class="menu-button" @click="showOutput()"> <img src="img/note-text.svg" title="出力画面を表示/非表示"/></button>
        <button class="menu-button" @click="showSettings()" ><img src="img/settings.svg" title="設定画面を表示/非表示"/></button>
      </div>
    </div>
    <transition>
    <div class="sidebar" v-if="taskListSettings.isSidebarVisible">
      <a href = "#" v-for = "column in taskColumnList" :key="column.id" class="sidebar-content" v-scroll-to="'#column-' + column.id">
        <div class="sidebar-content">
         {{column.title}}
          <hr />
        </div>
      </a>
      <a href="#" v-scroll-to="'#new-button'" @click="addColumn(taskColumnList.length)" title="新規カラムを追加">
      <div class="menu-button sidebar-content">
        <img src="img/plus.svg">
      </div>
      </a>
    </div>
    </transition>
    <draggable
      v-model="taskColumnList"
      v-bind="dragOptions"
      group="column"
      draggable=".column"
      filter=".input-text"
      :forceFallback="true"
      scrollSensitivity="100"
      :preventOnFilter="false"
      @start="onDragDropStart"
      @end="onDragDropEnd"
      class="column-container"
      v-bind:style="{marginLeft: taskListSettings.isSidebarVisible?'350px':'0px'}"
    >
      <task-column 
        v-for="(column,index) in taskColumnList"
        :columnProp="column"
        :index="index"
        :totalsize="taskColumnList.length"
        :key="column.id"
        :id="'column-' + column.id"
        :ref="index"
        @add-column="addColumn(index)"
        @delete-column="deleteColumn(index)"
        @emit-item="emitItem"
        @save-item="saveItem()"
      ></task-column>
      <div slot="footer" key="footer" class="column-dummy" id="new-button">
        <button class="menu-button" style="width:100%;height:100%;" @click="addColumn(taskColumnList.length)" title="新規カラムを追加">
          <img src="img/plus.svg" />
        </button>
      </div>
    </draggable>
    <div class="output" v-if="taskListSettings.isOutputVisible">
      <input type="button" value="出力" class="menu" @click="outputResult" title="テキストとして出力" />
      <input type="button" value="コピー" class="menu" @click="copyResult" title="出力結果をクリップボードにコピー"/>
      <button class="close-button" @click="showOutput" title="閉じる" >
        <img src="img/x.svg" />
      </button>
      <br />
      <textarea class="result" v-bind:value="outputStr"></textarea>
    </div>
    <div class="settings" v-if="this.taskListSettings.isSettingsVisible">
      <button class="close-button" @click="showSettings" title="閉じる" >
        <img src="img/x.svg" />
      </button>
      <h2>設定</h2>
      <ul style="padding-left:20px;">
        <li>ヘッダ：<br />
        <input type="text" class="settings-text" @change="saveSettings" v-model="taskListOutputTemplate.header"></li>
        <li>カラムのタイトル：<br />
        <input type="text" class="settings-text"  @change="saveSettings" v-model="taskListOutputTemplate.titleStr"></li>
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
          <li>{Title}: カラムのタイトル</li>
          <li>{CheckBoxText}: チェックボックス</li>
          <li>{Text}: 本文</li>
          <li>{br}: 改行</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import TaskColumn from "./components/TaskColumn.vue";
import draggable from 'vuedraggable';

export default {
  name: "app",
  components: {
    TaskColumn,
    draggable,
  },
  directives: {},
  data: function() {
    return {
      taskColumnList: [],
      outputStr: "",
      taskListOutputTemplate: {
        header: "## TODO{br}",
        titleStr: "{br}### {Title}{br}{br}",
        body: "- {CheckBoxText} {Text}{br}",
        footer: "",
        uncheckedText: "[ ]",
        checkedText: "[x]"
      },
      taskListSettings: {
        isSettingsVisible: false,
        isOutputVisible: false,
        isSidebarVisible: true,
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
    buildNewColumn: function() {
      return {
        id: this.buildId(), 
        title: "",
        taskList: [],
        output: true,
      };
    },
    addColumn: function(index) {
      this.taskColumnList.splice(index, 0, this.buildNewColumn());
      this.saveItem();
      this.$nextTick(() => {
        this.$refs[index]['0'].isNewColumn=true;
        this.$refs[index]['0'].showTitleEdit();
      });
    },
    deleteColumn: function(index) {
      if ( ! this.$refs[index]['0'].isNewColumn &&
          ! window.confirm("カラムを削除します。よろしいですか？")) {
        return;
      }
      this.taskColumnList.splice(index, 1);
      this.$refs[index]['0'].isNewColumn=false;
      this.saveItem();
    },
    onDragDropStart:function(){
      this.drag=true;
    },
    onDragDropEnd:function(){
      this.drag=false;
      this.saveItem();
    },
    showSidebar:function(){
      (this.taskListSettings.isSidebarVisible)?
      this.taskListSettings.isSidebarVisible=false:
      this.taskListSettings.isSidebarVisible=true;
      this.saveSettings();
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
    emitItem:function(columnIndex,column){
      this.taskColumnList[columnIndex] = column;
    },
    saveItem: function() {
      localStorage.taskColumnList = JSON.stringify(this.taskColumnList);
    },
    saveSettings: function(){
      localStorage.taskListOutputTemplate = JSON.stringify(this.taskListOutputTemplate);
      localStorage.taskListSettings = JSON.stringify(this.taskListSettings);
    },
    replaceOutputStrHeader:function(template){
      let result = template.replace(/\{br\}/g, "\n");
      return result;
    },
    replaceOutputStrTitle:function(column,template){
      let result = template
        .replace(/\{Title\}/g, this.taskColumnList[column].title)
        .replace(/\{br\}/g, "\n") ;
      return result;
    },
    replaceOutputStr: function(column,index, template){
      let checkStr = this.taskColumnList[column].taskList[index].checked ? 
        this.taskListOutputTemplate.checkedText:
        this.taskListOutputTemplate.uncheckedText;
      let lineStr = template
        .replace(/\{CheckBoxText\}/g, checkStr)
        .replace(/\{Text\}/g, this.taskColumnList[column].taskList[index].text)
        .replace(/\{br\}/g, "\n") ;
      return lineStr;
    },
    replaceOutputStrFooter:function(template){
      let result = template.replace(/\{br\}/g, "\n") ;
      return result;
    },
    outputResult: function(){
      this.outputStr = this.replaceOutputStrHeader(this.taskListOutputTemplate.header);

      for (let column in this.taskColumnList) {
        if(this.taskColumnList[column].output){
          this.outputStr += this.replaceOutputStrTitle(column,this.taskListOutputTemplate.titleStr);
          for(let i in this.taskColumnList[column].taskList){
            this.outputStr += this.replaceOutputStr(column,i, this.taskListOutputTemplate.body);
          }
        }
      }
      this.outputStr += this.replaceOutputStrFooter(this.taskListOutputTemplate.footer);
    },
    copyResult: function(){
      let textarea = document.getElementsByClassName("result")[0];
      textarea.select();
      document.execCommand("copy");
    },

  },
  mounted() {
    if (localStorage.taskColumnList) {
      this.taskColumnList = JSON.parse(localStorage.taskColumnList);
    }
    if (localStorage.taskListOutputTemplate) {
      this.taskListOutputTemplate = JSON.parse(localStorage.taskListOutputTemplate);
    }
    if (localStorage.taskListSettings) {
      this.taskListSettings = JSON.parse(localStorage.taskListSettings);
    }
  },
};
</script>

<style>

.v-enter-active,
.v-leave-active,
.v-move {
  animation-timing-function: ease;
  transition: opacity 0.3s, transform 0.3s;
}

.v-enter {
  transform: translateX(-350px);
}
.v-leave-to {
  transform: translateX(-350px);
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
  background: linear-gradient(to top, #414345, #232526);
  background-attachment: fixed;
}
#app{
  margin: 0px;
  padding: 0px;
  height: 100%;

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
  height: 40px;
}
.header-menu{
  margin-right: 10px;
  display: flex;
  align-items: center;
}
.header-dummy{
  width:100%;
  height:40px;
}
.sidebar{
  position: fixed;
  z-index: 998;
  top: 40px;
  left: 0;
  width:330px;
  padding: 10px;
  height:100%;
  background: linear-gradient(to left, #ece9e6, #ffffff);
  box-shadow: -8px 0px 8px 0px rgba(0,0,0,0.3), 8px 0px 8px 0px rgba(0,0,0,0.3);
}
.sidebar-content{
  text-decoration: none;
  color: #000000;
  border-radius: 5px;
}
.sidebar-content:hover{
  text-decoration: none;
  color: #000000;
  background: rgba(0, 0, 0, 0.3);
}
.column-container{
  width:auto;
  margin-left:350px;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items:flex-start;
  overflow-x: scroll;
}
.column-dummy{
  margin-top: 50px;
  margin-left:10px;
  z-index: 1;
  padding: 10px 0px 3px 0px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  min-width: 350px;
  height: 50px;
  display:flex;
  justify-content:center;
  align-content: center;
}
.column-dummy:hover{
    background-color: rgba(255, 255, 255, 0.5);
}
.output{
  z-index: 12;
  position: absolute;
  top: 65px;
  right:5px;
  width: 350px;
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
  z-index: 13;
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
  padding-left:10px;
  cursor: default;
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
  border-radius: 5px;
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
  color: #000000;
}
.close-button:hover{
  filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.4));
}
.menu-button{
  cursor: pointer;
  color: #49494967;
  opacity: 0.5;
  font-size: 20px;
  transition: 0.3s;
  margin:5px;
}
.menu-button:hover {
  opacity: 1.0;
  color:green;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.4));
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
