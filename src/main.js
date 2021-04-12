import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import store from "./store/store";
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import DocumentDetail from './components/DocumentDetail';
import ProjectDetail from './components/ProjectDetail';
import Home from './Home';
import SaveTutorial from './views/SaveTutorial';
import GetTutorial from './views/GetTutorial';
import UpdateTutorial from './views/UpdateTutorial';
import OtherInfo from './views/OtherInfo';

Vue.config.productionTip = false;

Vue.use(VueRouter);

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

const routes = [
  { path: '/', name: "home", component: Home, meta: {force_redirect: true}},
  { path: '/docs/:year/:docID', name: "docs", component: DocumentDetail, meta: {force_redirect: true}},
  { path: '/projects/:year/:projID', name: "projects", component: ProjectDetail, meta: {force_redirect: true}},
  { path: '/save', name: "save", component: SaveTutorial, meta: {force_redirect: true}},
  { path: '/get', name: "get", component: GetTutorial, meta: {force_redirect: true}},
  { path: '/update', name: "update", component: UpdateTutorial, meta: {force_redirect: true}},
  { path: '/info', name: "other-info", component: OtherInfo, meta: {force_redirect: true}},
]

const router = new VueRouter({
  routes,
  mode: 'history' 
})

// router.beforeEach((to,from,next) => {
//   if (!to.matched.some(record => record.meta.force_redirect)) {
//     next("/")
//   }
//   else {
//     next()
//   }
// })

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
