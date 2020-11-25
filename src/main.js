import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import store from "../store/store";

import DocumentDetail from './components/DocumentDetail';
import Home from './Home';
import Tutorial from './components/Tutorial';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faHome, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faHome, faFileAlt);
 
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

Vue.use(VueRouter);

const routes = [
  { path: '/home', name: "home", component: Home, meta: {force_redirect: true}},
  { path: '/docs/:DocID', name: "docs", component: DocumentDetail, meta: {force_redirect: true}},
  { path: '/tutorial', name: "tutorial", component: Tutorial, meta: {force_redirect: true}}
];

const router = new VueRouter({
  // routes: routes
  routes,
  mode: 'history' 
});

router.beforeEach((to,from,next) => {
  redirections(to,from,next)
})

function redirections(to,from,next) {
  if (!to.matched.some(record => record.meta.force_redirect)) {
    next("/home")
  }
  else {
    next()
  }
}


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
