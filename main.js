function buildId(){
    return "xxxxx".replace(/x/g,
        function(){return (Math.random() * 16 | 0).toString(16)});
};

Vue.directive('visible', function(el, binding) {
    el.style.visibility = !!binding.value ? 'visible' : 'hidden';
});

function buildNewItem() {
    return { id: buildId(), indent: 0, checked: false, text: '' };
}

Vue.component('task-item', {
    props: ['task','index','totalsize'],
    template: `
      <div class = "task-item" :id = "task.id" v-bind:style="{marginLeft: task.indent * 20 + 'px'}" @mouseenter="$emit('show-item-buttons')" @mouseleave="$emit('hide-item-buttons')">
      <input type = "checkbox" v-model="task.checked" @change="$emit('save-item')" />
      <div v-show=" ! isEditing" @click="$emit('show-edit-item-text')" v-bind:style="{display:'inline-block', width:500 - task.indent * 20  + 'px', height:'1em', textDecoration: (task.checked)?'line-through':'none'}"> {{ task.text }}</div>
      <input type="text" ref="input" v-model = "task.text" v-show="isEditing" @change="$emit('save-item')" @blur="$emit('hide-edit-item-text')" v-bind:style="{display:'inline-block', width:500 - task.indent * 20  + 'px', height:'1em', textDecoration: (task.checked)?'line-through':'none'}" title = "内容" />
      <div v-show="isShowItemButtons" v-bind:style="{display:'inline-block'}">
      <input type = "button" @click="$emit('add-item')" class="menu" value= "➕" title ="下に項目を追加" />
      <input type = "button" @click="$emit('move-item-to-left')" class="menu" value= "◀" title = "インデントを戻す" v-visible="task.indent" />
      <input type = "button" @click="$emit('move-item-to-right')" class="menu" value= "▶" title = "インデント" />
      <input type = "button" @click="$emit('move-item-to-up')" class="menu" value= "🔼" title = "この内容を上に移動" v-visible="!isTopItem" />
      <input type = "button" @click="$emit('move-item-to-down')" class="menu" value= "🔽" title = "この内容を下に移動" v-visible="!isBottomItem" />
      <input type = "button" @click="$emit('delete-item')" class="menu" value= "❌" title = "この項目を削除" v-visible="isDeletableItem" />
      </div>
      <hr />
      </div>
      `,
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
    
});

var vm = new Vue({
    el: "#main",
    data: {
        taskList: [
        buildNewItem()
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
        },
    },
    methods: {
        setAllItemState: function(){
            for(item in this.$refs){
                if (this.$refs[item]['0'] != null) {
                    this.$refs[item]['0'].setItemState();
                }
            }
        },
        addItem: function(index){
            this.taskList.splice(index + 1, 0, buildNewItem());
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
            if ( ! window.confirm('アイテムを削除します。よろしいですか？')) { return; }
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
});