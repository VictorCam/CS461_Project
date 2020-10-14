import Vue from 'vue'
import App from './App.vue'
//import VueRouter from "vue-router"
import store from "../store/store"

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  store
}).$mount('#app')
