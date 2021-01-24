<template>
  <div class="search-sort">
    <div class="search-bar">
      <b-input-group size="lg">
        <b-button variant="secondary" size="lg">
          <b-icon-search v-on:click="searchEvent"></b-icon-search>
        </b-button>
        <b-form-input placeholder="Search Project..." v-model="searchText"></b-form-input>
      </b-input-group>
    </div>
    <div class="sort-btn">
      <b-button variant="secondary" size="lg">
        <b-icon-sort-down-alt></b-icon-sort-down-alt>
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "SearchSort",
  methods: {
    searchEvent() {
      if (this.searchText === undefined) {
        this.searchText = "";
      } 
      if (this.searchText === "") {
        this.$store.dispatch("load_documents");
      } else {
        this.$store.dispatch("search_documents", this.searchText);
      }
    }
  }
};
</script>

<style scoped>
.search-sort {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #242424;
  flex-wrap: wrap;
}

.sort-btn {
  padding: 5px;
}
</style>