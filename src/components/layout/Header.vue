<template>
  <div class="header">
    <h1 class="title">
      {{ title }}
    </h1>
    <router-link :to="{ name: 'home' }">
      <button class="home-btn">
        <font-awesome-icon icon="home"></font-awesome-icon>
      </button>
    </router-link>
    
    <router-link :to="{ name: 'tutorial' }">
      <button class="tutorial-btn">Tutorial</button>
    </router-link>
  </div>
</template>

<script>
export default {
  name: "Header",
  props: ["title"],
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  background-color: #de953c;
}
.title {
  color: black;
  text-align: center;
  width: 100%;
  padding: 15px;
}
.home-btn {
  align-self: flex-start;
  margin: 20px;
  padding: 5px;
}
.tutorial-btn {
  align-self: flex-end;
  margin: 20px;
  padding: 5px;
}
</style>
