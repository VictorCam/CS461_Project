<template>
  <div class="header">
    <div v-if="showBackButton">
      <button @click="goBack" class="back">
        <img class="find-button" src="@/assets/back.png" />
      </button>
        <!-- <b-button  variant="secondary" class="back-btn"> -->
          <!-- <b-icon-arrow-left-circle-fill></b-icon-arrow-left-circle-fill> -->
        <!-- </b-button> -->
    </div>
    
    <!-- <img class="osu logo"> -->
    <h1 class="title">
      {{ title }}
    </h1>
    <button class="home">
    <router-link :to="{ name: 'home' }">
        <img class="find-button" src="@/assets/home.png" />
      <!-- <b-button variant="secondary" class="home-btn"> -->
        <!-- <b-icon-house-door-fill></b-icon-house-door-fill> -->
      <!-- </b-button> -->
    </router-link>
    </button>
    
    <div v-if="showTutorialButton">
      <button class="tutorial" >
        <router-link :to="{ name: 'save' }">
        <img class="find-button" src="@/assets/help.png" />
        </router-link>
      </button>
      <!-- <b-button variant="secondary" class="tutorial-btn">Tutorial</b-button> -->
    </div>

    <div v-if="!showTutorialButton">
      <button class="tutorial">
        <router-link :to="{name: 'save'}">
          <h3 v-if="this.$route.name==='save'" style="color: black">Save</h3>
          <h3 v-else>Save</h3>
        </router-link>
      </button>
    </div>

    <div v-if="!showTutorialButton">
      <button class="tutorial">
        <router-link :to="{name: 'get'}">
          <h3 v-if="this.$route.name==='get'" style="color: black">Get</h3>
          <h3 v-else>Get</h3>
        </router-link>
      </button>
    </div>

    <div v-if="!showTutorialButton">
      <button class="tutorial">
        <router-link :to="{name: 'update'}">
          <h3 v-if="this.$route.name==='update'" style="color: black">Update</h3>
          <h3 v-else>Update</h3>
        </router-link>
      </button>
    </div>
      
  </div>
</template>

<script>
export default {
  name: "Header",
  props: ["title", "showBackButton", "showTutorialButton"],
  methods: {
    goBack() {
      return this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@700&display=swap');

.header {
  display: flex;
  align-items: center;
  background-color: #db731e;
}
.title {
  font-family: 'Open Sans', sans-serif;
  color: black;
  text-align: center;
  width: 100%;
  padding: 15px;
}
/* .home-btn {
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
} */

/* TUTORIAL BUTTON */
.tutorial {
  border: none;
  opacity: 1.0;
  margin: 20px;
  background-color: rgb(219, 115, 30);
}

.tutorial h3 {
  color: white;
}
.tutorial h3:hover {
  color: black;
}

.tutorial:hover {
  border: none;
  opacity: 1.0;
  background-color: rgb(219, 115, 30);
}

.find-button {
  text-decoration: none;
  border: none;
  width: 2em;
  height: 2em;
}

.find-button:hover {
  filter: invert(100%);
  text-decoration: none;
  border: none;
  width: 2em;
  height: 2em;
}

/* HOME BUTTON */
.home {
  border: none;
  opacity: 1.0;
  margin: 20px;
  background-color: rgb(219, 115, 30);
}

.home:hover {
  border: none;
  opacity: 1.0;
  background-color: rgb(219, 115, 30);
}


/* BACK BUTTON */
.back {
  border: none;
  opacity: 1.0;
  margin: 20px;
  background-color: rgb(219, 115, 30);
}

.back:hover {
  border: none;
  opacity: 1.0;
  background-color: rgb(219, 115, 30);
}


</style>
