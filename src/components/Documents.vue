<template>
    <div class="documents">
        <div v-bind:key="doc.id" v-for="doc in documents" class="doc">
            <h3>{{doc.title}}</h3>
            <DocumentItem v-bind:doc="doc"/>
        </div>
    </div>
</template>

<script>
import DocumentItem from './DocumentItem';

export default {
    name: "Documents",
    components: {
        DocumentItem
    },
    props: ["documents"]
}
</script>

<style scoped>
    .doc {
        padding: 10px;
        border-bottom: 1px, solid, black;
    }
</style>
