<template>
  <div class="ledger">

    <p>content from backend: {{gmail}}</p>
  </div>
</template>

<script>
import { mapState } from "vuex"; //imports go here
export default {
  data() {
    return {
      //data objects (created by user) go here
    }
  },
  created() { //first api calls go here (function)
    this.$store.dispatch("load_gmail")
  },
  methods: { //methods that manipulate the api go here (multiple functions)

  },
  computed: { //grabbing the current state goes here
    ...mapState(["gmail"])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
