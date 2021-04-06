<template>
  <div id="app">
    <Header v-bind:title="'OSU File System'" v-bind:showBackButton="false" v-bind:showTutorialButton="true"/>
    <SearchSort/>
    <Documents/>
  </div>
</template>

<script>
import Header from './components/Header'
import Documents from './views/Documents'
import SearchSort from './components/SearchSort'

export default {
  name: 'App',
  components: {
    Documents,
    Header,
    SearchSort
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.5;
  background-color: #eee;
}
</style>
