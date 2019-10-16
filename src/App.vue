<template>
  <div id="app">
    <div class="header">
      <h1>TODO</h1>
    </div>

    <div class="main-content">
      <div class="tasks">
    <draggable
      v-model="taskList"
      v-bind="dragOptions"
      group="task"
      @start="drag=true"
      @end="drag=false"
    >
      <transition-group type="transition">
      <task-item
        v-for="(item,index) in taskList"
        v-bind:task="item"
        v-bind:index="index"
        v-bind:totalsize="taskList.length"
        v-bind:key="item.id"
        :ref="index"
        @add-item="addItem(index)"
        @delete-item="deleteItem(index)"
        @move-item-to-up="moveItemToUp(index)"
        @move-item-to-down="moveItemToDown(index)"
        @move-item-to-left="moveItemToLeft(index)"
        @move-item-to-right="moveItemToRight(index)"
        @show-edit-item-text="showEditItemText(index)"
        @hide-edit-item-text="hideEditItemText(index)"
        @show-item-buttons="showItemButtons(index)"
        @hide-item-buttons="hideItemButtons(index)"
        @save-item="saveItem()"
      ></task-item>
      </transition-group>
    </draggable>
    </div>
    <div class="output">
      <input type="button" value="出力" class="menu" @click="outputResult" />
      <input type="button" value="コピー" class="menu" @click="copyResult" />
      <br />
      <textarea class="result" v-bind:value="outputStr"></textarea>
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
        showSettings: false
      }
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
    moveItemToUp: function(index) {
      if (this.$refs[index]["0"].isTopItem) {
        return;
      }
      this.$refs[index]["0"].isShowItemButtons=false;
      this.replaceItem(index - 1, index);
      this.saveItem();
    },
    moveItemToDown: function(index) {
      if (this.$refs[index]["0"].isBottomItem) {
        return;
      }
      this.$refs[index]["0"].isShowItemButtons=false;
      this.replaceItem(index, index + 1);
      this.saveItem();
    },
    moveItemToRight: function(index) {
      this.taskList[index].indent++;
      this.saveItem();
    },
    moveItemToLeft: function(index) {
      if (this.taskList[index].indent <= 0) {
        return;
      }
      this.taskList[index].indent--;
      this.saveItem();
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
    showEditItemText: function(index) {
      this.$set(this.$refs[index]["0"], "isEditing", true);
      this.$refs[index]["0"].setFocusToTextInput();
    },
    hideEditItemText: function(index) {
      this.$refs[index]["0"].isEditing = false;
    },
    showItemButtons: function(index) {
      this.$refs[index]["0"].isShowItemButtons = true;
    },
    hideItemButtons: function(index) {
      this.$refs[index]["0"].isShowItemButtons = false;
    },
    saveItem: function() {
      localStorage.taskList = JSON.stringify(this.taskList);
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
  transition: transform 0.5s;
}
.ghost {
  opacity: 0.5;
  background: #fdfcf4;
  box-shadow: 0 0 8px rgba(0,0,0,0.3);
}

html{
  height: 100%;
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
  top: 0;
  left: 0;
  box-shadow:0px 0px 10px;
  z-index: 999;
  width: 100%;
  background: linear-gradient(to top, #ece9e6, #ffffff);
  margin: 0px 0px 0px 0px;
  padding-left: 30px;
  height: 60px;
}

.main-content{
  position: relative;
  margin-left: auto;
  margin-right: auto;
  z-index: 1;
  padding: 0px 20px 0px 20px;
  background-color: #ffffff;
  box-shadow: -8px 0px 8px 0px rgba(0,0,0,0.3), 8px 0px 8px 0px rgba(0,0,0,0.3);
  width: 750px;
  min-height: 100%;
}

.tasks{
  padding-top: 120px;
  margin-bottom: 60px;
  /*font-size: 120%;*/
  font-size:medium;
}
.result{
  width:100%;
  height:10em;
  resize: vertical;
}
h1 {
  font-size: 21px;
  color: rgba(0,0,0,0.6);
  text-shadow: 2px 2px 3px rgba(255,255,255,0.1);
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
hr {
  height: 1px;
  border: none;
  background-image: linear-gradient(90deg, #d7d7d7, #ffffff);
  width: 640px;
  text-align: left;
  margin-left: 0px;
}
</style>
