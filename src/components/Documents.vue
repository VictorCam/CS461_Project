<template>
    <div class="documents">
        <b-container fluid>
            <b-row class="text-center align-items-center document-item-fields">
                <b-col class="field">
                    <h3><strong>DocID</strong></h3>
                </b-col>
                <b-col class="field">
                    <h3><strong>Document Name</strong></h3>
                </b-col>
                <b-col class="field">
                    <h3><strong>Project Name</strong></h3>
                </b-col>
                <b-col class="field">
                    <h3><strong>Date Added</strong></h3>
                </b-col>
                <b-col class="field">
                    <b-icon-emoji-sunglasses font-scale="5" variant="dark"></b-icon-emoji-sunglasses>
                </b-col>
            </b-row>
            
        </b-container>
            <div v-for="doc in loadedDocuments" :key="doc.DocID">
            <DocumentItem v-bind:doc="doc"/>
            </div>
    </div> 
        
</template>

<script>
import DocumentItem from './DocumentItem';
import {mapState} from 'vuex';
// import loadedDocuments from '../../routes/route_data.js'
// Name, Description, Location, OwnerID, Project, DateAdded
export default {
    name: "Documents",
    components: {
        DocumentItem
    },
    created() {
        this.$store.dispatch("load_documents");
    },
    computed: {
        ...mapState(["loadedDocuments"])
    },
    // data() {
    //     return {
    //         frontPageFields: ['DocID', 'Name', 'Project', 'DateAdded']
    //     }
    // }
}
</script>

<style scoped>
    .document-item-fields {
        border-bottom: 2px solid black;
        padding: 20px;
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-around;
    }
    .field {
        color: #444
    }
</style>
