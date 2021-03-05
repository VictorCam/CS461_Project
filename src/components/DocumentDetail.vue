<template>
    <div class="document-detail">
        <Header v-bind:title="doc.Dname" v-bind:showBackButton="true" v-bind:showTutorialButton="true"/>
        <b-container fluid class="mx-3 my-3" v-if="doc">
            <b-row class="my-4">
                <b-col>
                    <h1>ID: {{doc.Year}}-{{doc.DocID.toString().padStart(4, '0')}}</h1>
                </b-col>
            </b-row>
            <b-row class="my-4">
                <b-col>
                    <h3>Document Name: {{doc.Dname}}</h3>
                </b-col>
            </b-row>
            <b-row class="my-4">
                <b-col>
                    <h3>Owner: {{doc.Owner}}</h3>
                </b-col>
            </b-row>
            <b-row class="my-4">
                <b-col>
                    <h4>Date Added: {{doc.DateAdded.substring(0, 24)}}</h4>
                </b-col>
            </b-row>
            <b-row class="my-4">
                <b-col>
                    <h4 v-if="doc.Description">Description: {{doc.Description}}</h4>
                    <h4 v-else>No Description - Contact {{doc.Owner}} for more information.</h4>
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
        this.$store.dispatch("set_current_doc", {year: this.$route.params.year, docID: this.$route.params.docID});
    },
    computed: {
        doc() {
            console.log(this.$store.state.currentDoc);
            return this.$store.state.currentDoc;
        }
    },
    components: {
        Header
    }
}
</script>

<style scoped>
    
</style>
