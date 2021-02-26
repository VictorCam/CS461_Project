<template>
    <div class="document-detail">
        <Header v-bind:title="doc.Name" v-bind:showBackButton="true" v-bind:showTutorialButton="true"/>
        <b-container fluid class="mx-3 my-3">
            <b-row class="my-4">
                <b-col>
                    <h1>ID: {{doc.DocID}}</h1>
                </b-col>
            </b-row>
            <b-row class="my-4">
                <b-col>
                    <h3>Document Name: {{doc.Dname}}</h3>
                </b-col>
            </b-row>
            <b-row class="my-4">
                <b-col>
                    <h3>Project Name: {{doc.Pname}}</h3>
                </b-col>
            </b-row>
            <b-row class="my-4">
                <b-col>
                    <h3>Owner: {{owner}}</h3>
                </b-col>
            </b-row>
            <b-row class="my-4">
                <b-col>
                    <h6>Date Added: {{doc.DateAdded}}</h6>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import Header from './layout/Header';

export default {
    name: "DocumentDetail",
    created() {
        this.$store.dispatch("find_owner_of_document", this.$store.state.loadedDocuments[parseInt(this.$route.params.DocID) - 1]);
    },
    computed: {
        doc() {
            return this.$store.state.loadedDocuments[parseInt(this.$route.params.DocID) - 1];
        },
        owner() {
            return this.$store.state.ownerOfViewedDocument;
        }
    },
    components: {
        Header
    }
}
</script>

<style scoped>
    
</style>
