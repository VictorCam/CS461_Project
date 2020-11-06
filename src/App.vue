<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <ledger></ledger>
  </div>
</template>

<script>
import ledger from './components/ledger.vue'

export default {
  name: 'App',
  components: {
    ledger: ledger
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
