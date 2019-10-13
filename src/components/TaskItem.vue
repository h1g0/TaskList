<template>
  <div
    class="task-item"
    :id="task.id"
    v-bind:style="{paddingLeft: task.indent * this.indentWidth + 'px'}"
    @mouseenter="$emit('show-item-buttons')"
    @mouseleave="$emit('hide-item-buttons')"
  >
  <span class="handle"></span>
    <input type="checkbox" :id="task.id" v-model="task.checked" @change="$emit('save-item')" />
    <label :for="task.id" @click="function(){task.checked?task.checked=false:task.checked=true}" style="display:inline-block;">&nbsp;</label>
    <div
      v-show=" ! isEditing"
      @click="$emit('show-edit-item-text')"
      v-bind:style="{display:'inline-block', cursor: 'text', width:500 - task.indent * this.indentWidth + 'px',height:'1em', textDecoration: (task.checked)?'line-through':'none'}"
    >{{ task.text }}</div>
    <input
      type="text"
      ref="input"
      v-model="task.text"
      v-show="isEditing"
      @change="$emit('save-item')"
      @blur="$emit('hide-edit-item-text')"
      @keyup.enter="$emit('hide-edit-item-text')"
      v-bind:style="{display:'inline-block', width:500 - task.indent * 20  + 'px', height:'1em', textDecoration: (task.checked)?'line-through':'none'}"
      title="内容"
    />
    <div v-show="isShowItemButtons" style="display:inline-block; position:relative; float: right;">
      <input type="button" @click="$emit('add-item')" class="menu" value="➕" title="下に項目を追加" />
      <input
        type="button"
        @click="$emit('move-item-to-left')"
        class="menu"
        value="◀"
        title="インデントを戻す"
        v-show="task.indent"
      />
      <input
        type="button"
        @click="$emit('move-item-to-right')"
        class="menu"
        value="▶"
        title="インデント"
      />
      <!--
      <input
        type="button"
        @click="$emit('move-item-to-up')"
        class="menu"
        value="🔼"
        title="この内容を上に移動"
        v-visible="!this.isTopItem"
      />
      <input
        type="button"
        @click="$emit('move-item-to-down')"
        class="menu"
        value="🔽"
        title="この内容を下に移動"
        v-visible="!this.isBottomItem"
      />
      -->
      <input
        type="button"
        @click="$emit('delete-item')"
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
</style>
