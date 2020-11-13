<template>
  <div id="app">
    <Header v-bind:title="'OSU File System'"/>
    <Ledger/>
    <Documents/>
  </div>
</template>

<script>
import Ledger from './components/Ledger'
import Header from './components/layout/Header';
import Documents from './components/Documents'

export default {
  name: 'App',
  components: {
    Documents,
    Header,
    Ledger
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
