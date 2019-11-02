import Vue from 'vue';
import App from './App.vue';
import VueScrollTo from "vue-scrollto";
Vue.use(VueScrollTo, {
  container: '.column-container',
  offset: -50,
  force: true,
  x: true,
  y: true,
});
Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
