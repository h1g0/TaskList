<template>
  <div
    class="task-item"
    :id="task.id"
    v-bind:style="{marginLeft: task.indent * this.indentWidth + 'px',width:'100%'}"
    @click="showEditItemText"
    @mouseenter="showItemButtons"
    @mouseleave="hideItemButtons"
  >
  <span class="handle" v-visible="this.isShowItemButtons">⠿</span>
    <input type="checkbox" :id="task.id" v-model="task.checked" @change="$emit('save-item')" />
    <label :for="task.id" @click.stop="(task.checked)?task.checked=false:task.checked=true" style="display:inline-block;">&nbsp;</label>
    <div
      v-show=" ! isEditing"
      v-bind:style="{display:'inline-block', cursor: 'text', width:'80%',height:'1em', textDecoration: (task.checked)?'line-through':'none'}"
    >{{ task.text }}</div>
    <input
      type="text"
      ref="input"
      v-model="task.text"
      v-show="isEditing"
      @change="$emit('save-item')"
      @blur="hideEditItemText"
      @keyup.enter="hideEditItemText"
      v-bind:style="{display:'inline-block', width:'80%', height:'1em', textDecoration: (task.checked)?'line-through':'none'}"
      title="内容"
    />
    <div v-show="isShowItemButtons" style="display:inline-block; position:relative; float: right;">
      <input type="button" @click.stop="$emit('add-item')" class="menu" value="➕" title="下に項目を追加" />
      <input
        type="button"
        @click.stop="function(){(task.indent > 0)?task.indent--:task.indent=0;}"
        class="menu"
        value="◀"
        title="インデントを戻す"
        v-show="task.indent"
      />
      <input
        type="button"
        @click.stop="task.indent++;"
        class="menu"
        value="▶"
        title="インデント"
      />
      <input
        type="button"
        @click.stop="$emit('delete-item')"
        class="menu"
        value="❌"
        title="この項目を削除"
        v-show="this.isDeletableItem"
      />
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
      isDeletableItem: false,
      isEditing: false,
      isShowItemButtons: false
    };
  },
  methods: {
    setItemState: function() {
      if (this.index == 0) {
        this.isTopItem = true;
      } else {
        this.isTopItem = false;
      }
      if (this.index == this.totalsize - 1) {
        this.isBottomItem = true;
      } else {
        this.isBottomItem = false;
      }
      if (this.totalsize > 1) {
        this.isDeletableItem = true;
      } else {
        this.isDeletableItem = false;
      }
    },
    showEditItemText: function() {
      this.isEditing=true;
      this.setFocusToTextInput();
    },
    hideEditItemText: function() {
      this.isEditing = false;
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
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input[type="checkbox"] { display: none; }

input[type="checkbox"] + label {
  display: block;
  position: relative;
  padding-left: 30px;
  margin-bottom: 0px;
  cursor: pointer;
}

input[type="checkbox"] + label:last-child { margin-bottom: 0; }

input[type="checkbox"] + label:before {
  content: '';
  display: block;
  width: 20px;
  height: 20px;
  border: 1px solid #6cc0e5;
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

.handle{
  color: rgba(0,0,0,0.5);
  cursor:move;
  font-size: 16px;
  margin-right: 3px;
}
</style>
