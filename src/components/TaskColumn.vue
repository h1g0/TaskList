<template>
  <div class="column">
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
          @add-item="addItem()"
          @delete-item="deleteItem(index)"
          @save-item="saveItem()"
        ></task-item>
        </transition-group>
      </draggable>
    </div>

      <button class="header-menu-button" @click="addItem"> <img src="img/plus.svg" title="タスクを追加"/></button>
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
  props: ["taskList", "index", "totalsize"],
  directives: {
    visible: {
      update: function(el, binding) {
        el.style.visibility = binding.value ? "visible" : "hidden";
      }
    }
  },
  data: function() {
    return {
      indentWidth: 30,
      isTopItem: true,
      isBottomItem: true,
      isDeletableItem: false,
      isEditing: false,
      isShowItemButtons: false,
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
      
      this.taskList.splice(this.taskList.length, 0, this.buildNewItem());
      //this.taskList[index + 1].indent = this.taskList[index].indent;
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
    saveItem:function(){
      this.$emit('save-item');
    },
    setAllItemState: function() {
      for (var item in this.$refs) {
        if (this.$refs[item]["0"] != null) {
          this.$refs[item]["0"].setItemState();
        }
      }
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
<style scoped>

.column{
  margin-top: 70px;
  margin-left:10px;
  z-index: 1;
  padding: 10px 0px 3px 0px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: -8px 0px 8px 0px rgba(0,0,0,0.3), 8px 0px 8px 0px rgba(0,0,0,0.3);
  min-width: 350px;
  height: auto;
  overflow: hidden;
}

</style>