<template>
  <div id="app">
    <Header/>
    <Ledger/>
    <!-- Pass in "documents" as a prop -->
    <Documents v-bind:documents="documents"/> 
  </div>
</template>

<script>
import Ledger from './components/Ledger'
import Header from './components/layout/Header';
import Documents from './components/Documents'

export default {
  name: 'App',
  components: {
    Header,
    Ledger,
    Documents
  },
  data() {
    return {
      documents: [
        {
          id: 1,
          title: "Document 1",
          content: "This is the first document"
        },
        {
          id: 2,
          title: "Document 2",
          content: "This is the second document"
        },
        {
          id: 3,
          title: "Document 3",
          content: "This is the third document"
        }
      ]
    }
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
