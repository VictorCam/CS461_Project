<template>
    <div class="documents">
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
    }
}
</script>

<style scoped>
    
</style>
