function buildId(){
    return "xxxxx".replace(/x/g,
        function(){return (Math.random() * 16 | 0).toString(16)});
};

Vue.directive('visible', function(el, binding) {
    el.style.visibility = !!binding.value ? 'visible' : 'hidden';
});

Vue.component('task-item', {
    props: ['task','index','totalsize'],
    template: `
      <li class = "task-item" :id = "task.id" style="margin-left:20px">
      <input type = "checkbox" v-model="task.checked" />
      <input type="text" v-model = "task.text" title = "内容" />
      </li>
      `,
});

var vm = new Vue({
    el: "#main",
    data: {
        taskList: [
        {id: buildId(), depth: 0, checked: false, text: ''}
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
});