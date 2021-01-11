<template>
  <div class="search-sort">
    <div class="search-bar">
      <b-input-group size="lg" prepend="Search">
        <b-form-input></b-form-input>
      </b-input-group>
    </div>
    <div class="sort-btn">
      <b-button variant="outline-secondary" size="lg">Sort</b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "SearchSort",
};
</script>

<style scoped>
.search-sort {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #ddd;
  flex-wrap: wrap;
}

.sort-btn {
  position: absolute;
  padding: 2px;
  margin-left: 90%;
}
</style>