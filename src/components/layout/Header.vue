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
    
    <!-- <inmg class="osu logo"> -->
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
    
      <button class="tutorial">
        <router-link :to="{ name: 'tutorial' }">
        <img class="find-button" src="@/assets/help.png" />
        </router-link>
      </button>
      <!-- <b-button variant="secondary" class="tutorial-btn">Tutorial</b-button> -->
  </div>
</template>

<script>
export default {
  name: "Header",
  props: ["title", "showBackButton"],
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

/* TUTORIAL BUTTON */
.tutorial {
  border: none;
  opacity: 1.0;
  margin: 20px;
  background-color: rgb(219, 115, 30);
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

.tutorial:hover {
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
