import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import store from "../store/store"

import DocumentDetail from './components/DocumentDetail'
import Home from './Home';

Vue.config.productionTip = false

Vue.use(VueRouter);

const routes = [
  { path: '/', name: "home", component: Home },
  { path: '/docs/:DocID', name: "docs", component: DocumentDetail }
];

const router = new VueRouter({
  // routes: routes
  routes,
  mode: 'history' 
});

new Vue({
  router,
  render: h => h(App),
  store
}).$mount('#app')
