<template>
  <div id = "app">
    <h1>TODO</h1>
  <transition-group>
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
  </div>
</template>

<script>
import TaskItem from './components/TaskItem.vue'

export default {
  name: 'app',
  components: {
    TaskItem
  },
  directives:{
  },
  data: function(){
    return {
      taskList: [
      this.buildNewItem()
      ],
      outputStr: '',
      outputTemplate: {
          header: '## TODO{br}{br}',
          body: '- {CheckBoxText} {Text}{br}',
          footer: '{br}',
          uncheckedText: '[ ]',
          checkedText: '[x]',
      },
      settings: {
          showSettings: false,
      }
    };
  },
  methods: {
    buildId: function(){
        return "xxxxx".replace(/x/g,
            function(){return (Math.random() * 16 | 0).toString(16)});
    },
    buildNewItem: function() {
        return { id: this.buildId(), indent: 0, checked: false, text: '' };
    },
    setAllItemState: function(){
        for(var item in this.$refs){
            if (this.$refs[item]['0'] != null) {
                this.$refs[item]['0'].setItemState();
            }
        }
    },
    addItem: function(index){
        this.taskList.splice(index + 1, 0, this.buildNewItem());
        this.saveItem();
    },
    replaceItem: function (upperIndex, lowerIndex) {
        var temp = this.taskList[lowerIndex];
        this.taskList.splice(lowerIndex,1,this.taskList[upperIndex]);
        this.taskList.splice(upperIndex, 1, temp);
    },
    moveItemToUp: function(index){
        if (this.$refs[index]['0'].isTopItem) { return; }
        this.replaceItem(index - 1, index);
        this.saveItem();
    },
    moveItemToDown: function(index){
        if(this.$refs[index]['0'].isBottomItem){return;}
        this.replaceItem(index, index + 1);
        this.saveItem();
    },
    moveItemToRight: function (index) {
        this.taskList[index].indent++;
        this.saveItem();
    },
    moveItemToLeft: function (index) {
        if (this.taskList[index].indent <= 0) {
            return;
        }
        this.taskList[index].indent--;
        this.saveItem();
    },
    deleteItem: function (index) {
        if( ! this.$refs[index]['0'].isDeletableItem){return;}
        if ( ! window.confirm('アイテムを削除します。よろしいですか？')) {
          return;
        }
        this.taskList.splice(index, 1);
        this.saveItem();
    },
    showEditItemText: function (index) {
        this.$set(this.$refs[index]['0'], 'isEditing', true);
        this.$refs[index]['0'].setFocusToTextInput();
    },
    hideEditItemText: function (index) {
        this.$refs[index]['0'].isEditing = false;
    },
    showItemButtons: function (index) {
        this.$refs[index]['0'].isShowItemButtons = true;
    },
    hideItemButtons: function (index) {
        this.$refs[index]['0'].isShowItemButtons = false;
    },
    saveItem: function(){
        localStorage.taskList = JSON.stringify(this.taskList);
    },

  },
  mounted() {
      if (localStorage.taskList) {
          this.taskList = JSON.parse(localStorage.taskList);
      }
  },
    updated: function () {
      this.$nextTick(function () {
          this.setAllItemState();
      });
  },
}
</script>

<style>
  .v-enter-active, .v-leave-active, .v-move {
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

  h1 {
      font-size: 16px;
      padding: 0.3em 0.3em;
      color: #494949;
      background: #f4f4f4;
      border-left: solid 16px #7db4e6;
      border-bottom: solid 3px #d7d7d7;
  }
  h2 {
      font-size: 16px;
      padding: 0.1em 1.0em;
      color: #494949;
      background: #f4f4f4;
      border-left: solid 16px #7db4e6;
  }
  h3 {
      font-size: 14px;
      padding: 0.1em 1.0em;
      color: #494949;
      border-left: solid 8px #7db4e6;
  }

  button{
      background-color: transparent;
      border: none;
      cursor: pointer;
      outline: none;
      padding: 0;
      appearance: none;
  }
  .menu {
      display : inline-block;
      border-radius : 5%;
      font-size : 11pt;
      text-align : center;
      cursor : pointer;
      padding : 3px 3px;
      background : #f4f4f4;
      color : #494949;
      line-height : 1em;
      transition : .3s;
      border : 1px solid #494949;
  }
  .menu:hover {
      color : #f4f4f4;
      background : #7db4e6;
  }
  hr {
      height: 1px;
      border: none;
      background-image: linear-gradient(90deg, #d7d7d7, #ffffff);
      width: 640px;
      text-align:left;
      margin-left:0px;
  }
</style>
