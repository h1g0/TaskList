<template>
  <div
    class="task-item"
    :id="task.id"
    v-bind:style="{display:'relative',marginLeft: task.indent * this.indentWidth + 'px',width:'100%'}"
    @click="showEditItemText"
    @mouseenter="showItemButtons"
    @mouseleave="hideItemButtons"
  >
  <span class="handle" v-visible="this.isShowItemButtons">⠿</span>
    <input type="checkbox" :id="task.id" v-model="task.checked" />
    <label :for="task.id" @click.stop="toggleCheckBox">&nbsp;</label>
    <div
      :class = "['task-item-text',this.isTextEmpty()?'task-item-text-empty':'']"
      v-if=" ! isEditing"
      v-bind:style="{textDecoration: (task.checked)?'line-through':'none'}"
    >{{ this.getText() }}</div>
    <input
      class = "input-text task-item-text"
      type="text"
      placeholder="タスクの内容を入力"
      ref="input"
      v-model="task.text"
      v-if="isEditing"
      @change="$emit('save-item')"
      @blur="hideEditItemText"
      @keyup.enter="onPressEnterEditItemText"
      @keyup.up="$emit('up-key-on-text-edit')"
      @keyup.down="$emit('down-key-on-text-edit')"
      v-bind:style="{ textDecoration: (task.checked)?'line-through':'none'}"
      title="内容"
    />
    <div v-if="isShowItemButtons" style="display:inline-block; position:absolute; right:0;">

      <button
        v-show="this.isDeletableItem"
      >
      <img src="img/circle-x.svg"
        class="menu-button"
        @click.stop="$emit('delete-item')"
        title="この項目を削除"
      >
      </button>
    </div>
    <hr />
  </div>
</template>

<script>
export default {
  name: "TaskItem",
  props: ["task", "index", "totalsize"],
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
      isDeletableItem: true,
      isEditing: false,
      isShowItemButtons: false,
      isNewItem: false,
    };
  },
  methods: {
    isTextEmpty:function(){
      if(this.task.text==""){
        return true;
      }else{
        return false;
      }
    },
    getText:function(){
      if(this.isTextEmpty()){
        return "クリックして内容を入力";
      }else{
        return this.task.text;
      }
    },
    showEditItemText: function() {
      this.isEditing=true;
      this.setFocusToTextInput();
    },
    hideEditItemText: function() {
      this.isEditing = false;
      if(this.isNewItem){
        if(this.isTextEmpty()){
          this.$emit('delete-item');
        }else{
          this.isNewItem=false;
        }
      }
    },
    onPressEnterEditItemText:function(){
      this.hideEditItemText();
      if( ! this.isTextEmpty()){
        this.$emit('add-item',this.index);
      }
    },
    showItemButtons: function() {
      this.isShowItemButtons = true;
    },
    hideItemButtons: function() {
      this.isShowItemButtons = false;
    },
    setFocusToTextInput: function() {
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    toggleCheckBox:function(){
      this.task.checked = ! this.task.checked;
      this.$nextTick(()=>{
        this.$emit('save-item');
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.task-item{
  position: relative;
}
input[type="checkbox"] { display: none; }

input[type="checkbox"] + label {
  display: inline-block;
  position: absolute;
  top: 2px;
  left:10px;
  padding-left: 30px;
  margin-top:0;
  margin-bottom:auto;
  cursor: pointer;
  
}

input[type="checkbox"] + label:last-child {
  margin-top: auto;
  margin-bottom: auto;
  }

input[type="checkbox"] + label:before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 1px solid #6cc1e5;
  position: absolute;
  left: 0;
  top: 0;
  opacity: .6;
  transition: all .12s, border-color .08s;
}

input[type="checkbox"]:checked + label:before {
  width: 10px;
  top: -5px;
  left: 5px;
  border-radius: 0;
  opacity: 1;
  border-width: 2px;
  border-top-color: transparent;
  border-left-color: transparent;
  border-right-color: green;
  border-bottom-color: green;
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
}
.task-item-text{
  margin-left:25px;
  display:inline-block;
  cursor: text;
  width:80%;
  height:1em; 
  font-size:14px;
}
.task-item-text-empty{
  color: rgba(0,0,0,0.3);
}
.handle{
  color: rgba(0,0,0,0);
  cursor:move;
  font-size: 16px;
  margin-right: 3px;
}
</style>
