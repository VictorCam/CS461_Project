<template>
    <div class="documents">
        <div v-bind:key="doc.DocID" v-for="doc in loadedDocuments">
            <DocumentItem v-bind:doc="doc"/>
        </div>
    </div>
</template>

<script>
import DocumentItem from './DocumentItem'
// import loadedDocuments from '../../routes/route_data.js'
// Name, Description, Location, OwnerID, Project, DateAdded
export default {
    name: "Documents",
    components: {
        DocumentItem
    },
    computed: {
        loadedDocuments() {
            return this.$store.state.loadedDocuments;
        }
    }
}
</script>

<style scoped>
    
</style>
