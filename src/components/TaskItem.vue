<template>
  <div class = "task-item" :id = "task.id" v-bind:style="{marginLeft: task.indent * 20 + 'px'}" @mouseenter="$emit('show-item-buttons')" @mouseleave="$emit('hide-item-buttons')">
  <input type = "checkbox" v-model="task.checked" @change="$emit('save-item')" />
  <div v-show=" ! isEditing" @click="$emit('show-edit-item-text')" v-bind:style="{display:'inline-block', width:500 - task.indent * 20  + 'px', height:'1em', textDecoration: (task.checked)?'line-through':'none'}"> {{ task.text }}</div>
  <input type="text" ref="input" v-model = "task.text" v-show="isEditing" @change="$emit('save-item')" @blur="$emit('hide-edit-item-text')" v-bind:style="{display:'inline-block', width:500 - task.indent * 20  + 'px', height:'1em', textDecoration: (task.checked)?'line-through':'none'}" title = "内容" />
  <div v-show="isShowItemButtons" v-bind:style="{display:'inline-block'}">
  <input type = "button" @click="$emit('add-item')" class="menu" value= "➕" title ="下に項目を追加" />
  <input type = "button" @click="$emit('move-item-to-left')" class="menu" value= "◀" title = "インデントを戻す" v-visible="task.indent" />
  <input type = "button" @click="$emit('move-item-to-right')" class="menu" value= "▶" title = "インデント" />
  <input type = "button" @click="$emit('move-item-to-up')" class="menu" value= "🔼" title = "この内容を上に移動" v-visible="!this.isTopItem" />
  <input type = "button" @click="$emit('move-item-to-down')" class="menu" value= "🔽" title = "この内容を下に移動" v-visible="!this.isBottomItem" />
  <input type = "button" @click="$emit('delete-item')" class="menu" value= "❌" title = "この項目を削除" v-visible="this.isDeletableItem" />
  </div>
  <hr />
  </div>
</template>

<script>
export default {
  name: 'TaskItem',
  props: ['task','index','totalsize'],
  directives:{
    visible: {
      update: function(el, binding){
        el.style.visibility = binding.value ? 'visible' : 'hidden';
      }
    }
  },
  data: function () {
    return {
        isTopItem: true,
        isBottomItem: true,
        isDeletableItem: false,
        isEditing: false,
        isShowItemButtons: false,
    }
  },
  methods:{
    setItemState: function(){
        if(this.index == 0){
            this.isTopItem = true;
        }else{
            this.isTopItem = false;
        }
        if(this.index == this.totalsize - 1){
            this.isBottomItem = true;
        }else{
            this.isBottomItem = false;
        }
        if(this.totalsize > 1){
            this.isDeletableItem = true;
        }else{
            this.isDeletableItem = false;
        }    
      },
      setFocusToTextInput: function () {
          this.$nextTick(() => {
              this.$refs.input.focus();
          });
      }
  },
  //updated: function () {
  //    this.$nextTick(function () {
   //       this.$emit('set-all-item-state');
    //  });
  //},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
