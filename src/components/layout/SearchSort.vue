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
      <b-button variant="secondary" size="lg" v-b-modal.sort-modal>
        <b-icon-sort-down-alt></b-icon-sort-down-alt>
      </b-button>
      <b-modal id="sort-modal" title="Sort Documents">
        <div>
          <b-form-group label="Sort By:" v-slot="{ ariaDescribedby }">
            <b-form-radio-group
              v-model="selected"
              :options="options"
              :aria-describedby="ariaDescribedby"
              name="radios-stacked"
              size="lg"
              stacked
            >

              <b-form-radio value="Sort By Date" v-model="selected" :aria-describedby="ariaDescribedby" name="sort-radio" class="my-1">Date Added</b-form-radio>
              <b-form-radio value="Sort By Document Name" v-model="selected" :aria-describedby="ariaDescribedby" name="sort-radio" class="my-1">Document Name Alphabetical</b-form-radio>
              <b-form-radio value="Sort By Project Name" v-model="selected" :aria-describedby="ariaDescribedby" name="sort-radio" class="my-1">Project Name Alphabetical</b-form-radio>

            </b-form-radio-group>
          </b-form-group>

          <div class="mt-3">Selected: <strong>{{ selected }}</strong></div>
          
        </div>
      </b-modal>
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
  },
  data() {
    return {
      selected: '',
      options: [
    
      ]
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