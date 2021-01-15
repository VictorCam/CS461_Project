<template>
  <div class="header">
    <div v-if="showBackButton">
      <router-link :to="{ name: 'home' }">
        <b-button variant="secondary" class="back-btn">
          <b-icon-arrow-left-circle-fill></b-icon-arrow-left-circle-fill>
        </b-button>
      </router-link>
      
    </div>
    
    <h1 class="title">
      {{ title }}
    </h1>
    <router-link :to="{ name: 'home' }">
      <b-button variant="secondary" class="home-btn">
        <b-icon-house-door-fill></b-icon-house-door-fill>
      </b-button>
    </router-link>
    
    <router-link :to="{ name: 'tutorial' }">
      <b-button variant="secondary" class="tutorial-btn">Tutorial</b-button>
    </router-link>
  </div>
</template>

<script>
export default {
  name: "Header",
  props: ["title", "showBackButton"],
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
  padding: 7px;
}
.tutorial-btn {
  align-self: flex-end;
  margin: 20px;
  padding: 5px;
}
.back-btn {
  margin: 20px;
  padding: 8px;
}
</style>
