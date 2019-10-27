<template>
  <div class="column">
    <p class="column-title"
      v-show=" ! this.isTitleEditing"
      @click.stop="showTitleEdit">{{column.title}}</p>
    <input type="text"
            class = "input-text column-title"
            ref="title"
            v-show="this.isTitleEditing"
            @change="saveItem"
            @blur="hideTitleEdit"
            v-model="column.title"
    >
    <hr />
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
      <transition-group type="transition" :name="drag ? 'flip-list' : null">
        <task-item
          v-for="(item,index) in column.taskList"
          v-bind:task="item"
          v-bind:index="index"
          v-bind:totalsize="column.taskList.length"
          v-bind:key="item.id"
          :ref="index"
          @add-item="addItem()"
          @delete-item="deleteItem(index)"
          @save-item="saveItem()"
        ></task-item>
        </transition-group>
      </draggable>
    <div class="task-add-button-container">
    <button class="task-add-button menu-button" @click="addItem">
      <img src="img/plus.svg" title="タスクを追加"/>
    </button>
    </div>
  </div>
</template>
<script>
import TaskItem from "./TaskItem.vue";
import draggable from 'vuedraggable'
export default {
  name: "TaskColumn",
  components: {
    TaskItem,
    draggable
  },
  props: ["columnProp", "index", "totalsize"],
  directives: {
    visible: {
      update: function(el, binding) {
        el.style.visibility = binding.value ? "visible" : "hidden";
      }
    }
  },
  data: function() {
    return {
      column: this.columnProp,
      isTitleEditing:false,
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
  methods:{
    buildId: function() {
      return "xxxxx".replace(/x/g, function() {
        return ((Math.random() * 16) | 0).toString(16);
      });
    },
    buildNewItem: function() {
      return { id: this.buildId(), indent: 0, checked: false, text: "" };
    },
    addItem: function() {
      this.column.taskList.splice(this.column.taskList.length, 0, this.buildNewItem());
      this.saveItem();
      this.$nextTick(() => {
        this.$refs[this.column.taskList.length - 1]['0'].showEditItemText();
      });


    },
    deleteItem: function(index) {
      if (this.column.taskList[index].text!="" &&
       ! window.confirm("アイテムを削除します。よろしいですか？")) {
        return;
      }
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
    showTitleEdit:function(){
      this.isTitleEditing=true;
      this.setFocusToTextInput();
    },
    hideTitleEdit:function(){
      this.isTitleEditing=false;
      if(this.column.title==""){
        this.$emit('delete-column');
      }
    },
    setFocusToTextInput: function() {
      this.$nextTick(() => {
        this.$refs.title.focus();
      });
    },
    setAllItemState: function() {
      for (var item in this.$refs) {
        if (this.$refs[item]["0"] != null) {
          this.$refs[item]["0"].setItemState();
        }
      }
    }
  },
  watch:{
    /*
    column:function () {
      this.saveItem();
    }
    */
  },
  updated: function() {
    /*
    this.$nextTick(function() {
      this.setAllItemState();
      this.saveItem();
    });
    */

  }
};
</script>
<style scoped>

.column{
  margin-top: 50px;
  margin-left:10px;
  z-index: 1;
  padding: 10px 0px 3px 0px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: -8px 0px 8px 0px rgba(0,0,0,0.3), 8px 0px 8px 0px rgba(0,0,0,0.3);
  min-width: 350px;
  height: auto;
}
.column-title{
    cursor: text;
  margin:10px;
  font-size: 20px;
  font-weight: bold;
  height: 1em;
  width:80%;
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