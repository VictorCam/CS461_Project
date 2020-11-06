import Vue from 'vue'
import App from './App.vue'
//import VueRouter from "vue-router"
import store from "../store/store"
// import ledger from './components/ledger.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  store
}).$mount('#app')
