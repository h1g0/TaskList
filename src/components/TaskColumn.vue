<template>
  <div class="column">
    <div class="column-header" >
      <div class="column-title" @click.stop="showTitleEdit">
      <span :class="['column-title',this.isTitleEmpty()?'column-title-empty':'']"
        v-if=" ! this.isTitleEditing"
        >{{this.getTitle()}}</span>
      <input type="text"
              class = "input-text column-title"
              placeholder="カラムのタイトルを入力"
              title="カラムタイトル"
              ref="title"
              v-if="this.isTitleEditing"
              @change="saveItem"
              @keyup.enter="onPressEnterTitleEdit"
              @blur="hideTitleEdit"
              v-model="column.title"
      >
      </div>
      <button class="menu-button" title = "カラムのメニューを表示" @click="showMenu">
        <img src="img/more-vertical.svg" />
      </button>
    </div>
    <hr/>
    <draggable
      :list="column.taskList"
      v-bind="dragOptions"
      group="task"
      draggable=".task-item"
      filter=".input-text"
      :preventOnFilter="false"
      @start="onDragDropStart"
      @end="onDragDropEnd"
      class="tasks"
      >
        <task-item
          v-for="(item,index) in column.taskList"
          v-bind:task="item"
          v-bind:index="index"
          v-bind:totalsize="column.taskList.length"
          v-bind:key="item.id"
          :ref="index"
          @add-item="addItem(index+1)"
          @delete-item="deleteItem(index)"
          @save-item="saveItem()"
          @up-key-on-text-edit="onPressKeyUpItemTextEdit(index)"
          @down-key-on-text-edit="onPressKeyDownItemTextEdit(index)"
        ></task-item>
      </draggable>
    <div class="task-add-button-container">
      <button class="task-add-button menu-button" @click="addItem(column.taskList.length)">
        <img src="img/plus.svg" title="タスクを追加"/>
      </button>
    </div>

    <div class="column-menu-container" v-if="isShowingMenu" v-click-outside="hideMenu">
      <div class="column-menu" @click="deleteCheckedItem" >
        チェック済タスクを全て削除
      </div>
      <div class="column-menu" @click="deleteAllItem" >
        タスクを全て削除
      </div>
      <hr />
      <div class="column-menu" @click="toggleOutput" >
        <input type="checkbox" v-model="column.output">
        このカラムを出力対象とする
      </div>
      <hr />
      <div class="column-menu" @click="$emit('delete-column')" >
        カラムを削除
      </div>
    </div>
  </div>
</template>
<script>
import TaskItem from "./TaskItem.vue";
import draggable from 'vuedraggable'
import vClickOutside from 'v-click-outside'
export default {
  name: "TaskColumn",
  components: {
    TaskItem,
    draggable,
  },
  props: ["columnProp", "index", "totalsize"],
  directives: {
    visible: {
      update: function(el, binding) {
        el.style.visibility = binding.value ? "visible" : "hidden";
      },
    },
    clickOutside: vClickOutside.directive,
  },
  data: function() {
    return {
      column: this.columnProp,
      isTitleEditing:false,
      isNewColumn:false,
      drag: false,
      isShowingMenu:false,
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
    },
  },
  methods:{
    buildId: function() {
      return "xxxxx".replace(/x/g, function() {
        return ((Math.random() * 16) | 0).toString(16);
      });
    },
    buildNewItem: function() {
      return { id: this.buildId(), indent: 0, checked: false, text: "" };
    },
    addItem: function(index) {
      this.column.taskList.splice(index, 0, this.buildNewItem());
      this.saveItem();
      this.$nextTick(() => {
        this.$refs[index]['0'].isNewItem=true;
        this.$refs[index]['0'].showEditItemText();
      });
    },
    deleteItem: function(index) {
      this.hideMenu();
      if (
        ! this.$refs[index]['0'].isNewItem &&
        ! window.confirm("アイテムを削除します。よろしいですか？")) {
        return;
      }
      this.$refs[this.column.taskList.length - 1]['0'].isNewItem=false;
      this.column.taskList.splice(index, 1);
      this.saveItem();
    },
    onDragDropStart:function(){
      this.drag=true;
    },
    onDragDropEnd:function(){
      this.drag=false;
      this.saveItem();
    },
    saveItem:function(){
      this.$emit('emit-item',this.index,this.column);
      this.$emit('save-item');
    },
    isTitleEmpty:function(){
      if(this.column.title==""){
        return true;
      }else{
        return false;
      }
    },
    getTitle:function(){
      if(this.column.title==""){
        return "クリックしてタイトルを入力";
      }else{
        return this.column.title;
      }
    },
    showTitleEdit:function(){
      this.isTitleEditing=true;
      this.setFocusToTextInput();
    },
    hideTitleEdit:function(){
      this.isTitleEditing=false;
      if(this.isNewColumn){
        if(this.isTitleEmpty()){
          this.$emit('delete-column');
        }else{
          this.isNewColumn=false;
        }
      }
    },
    setFocusToTextInput: function() {
      this.$nextTick(() => {
        this.$refs.title.focus();
      });
    },
    onPressEnterTitleEdit:function(){
      this.hideTitleEdit();
      if( ! this.isTitleEmpty() && this.column.taskList.length==0){
        this.addItem(0);
      }
    },
    onPressKeyUpItemTextEdit:function(index){
      if(index <= 0){return;}
      this.$nextTick(()=>{
        this.$refs[index - 1]['0'].showEditItemText();
      });
    },
    onPressKeyDownItemTextEdit:function(index){
      if(index >= this.column.taskList.length - 1){return;}
      this.$nextTick(()=>{
        this.$refs[index + 1]['0'].showEditItemText();
      });
    },
    showMenu:function(){
      this.$nextTick(() => {
        this.isShowingMenu=true;
      });
    },
    hideMenu:function(){
      this.isShowingMenu=false;
    },
    toggleOutput:function(){
      if( ! this.column.output){
        this.column.output = true;
      }else{
        this.column.output = false;
      }
      this.saveItem();
    },
    deleteCheckedItem:function() {
      this.hideMenu();
      if( ! window.confirm("チェック済みのタスクを全て削除します。よろしいですか？")){
        return;
      }
      for(let i in this.column.taskList){
        if(this.column.taskList[i].checked){
          this.column.taskList.splice(i, 1);
        }
      }
      this.saveItem();
    },
    deleteAllItem:function() {
      this.hideMenu();
      if( ! window.confirm("全てのタスクを削除します。よろしいですか？")){
        return;
      }
      this.column.taskList.splice(0);
      this.saveItem();
    },
  },
};
</script>
<style scoped>
.column{
  position: relative;
  margin-top: 50px;
  margin-left:10px;
  z-index: 1;
  padding: 0;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: -8px 0px 8px 0px rgba(0,0,0,0.3), 8px 0px 8px 0px rgba(0,0,0,0.3);
  min-width: 350px;
  height: auto;
}
.column-header{
  position: sticky;
  top:40px;
  margin:0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width:100%;
  height:auto;
  background-color: #ffffff;
  border-radius: 10px;
  z-index: 2;
}
.column-title{
  cursor: text;
  margin:5px;
  font-size: 20px;
  font-weight: bold;
  flex-grow: 2;
}
.column-title-empty{
  color: rgba(0,0,0,0.3);
}
.column-menu-container{
  position: absolute;
  right: 20px;
  top: 20px;
  width: 250px;
  height: auto;
  padding-top: 10px;
  padding-bottom: 10px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: -8px 0px 8px 0px rgba(0,0,0,0.3), 8px 0px 8px 0px rgba(0,0,0,0.3);
  border-radius: 10px;
}
.column-menu{
  font-size: small;
  cursor: pointer;
  margin: 0;
  padding: 5px;
  width:240px;
}
.column-menu:hover{
  background:rgba(0,0,0,0.3);
}
.task-add-button-container{
  display: flex;
  align-items: center;
  width: 100%;
}
.task-add-button{
  padding: 0px;
  margin-left:auto;
  margin-right: auto;
  position: relative;
}
.tasks{
  padding: 0px;
  position: relative;
  min-width:350px;
  width:100%;
  min-height:30px;
}

</style>