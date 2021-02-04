<template>
    <div class="document-detail">
        <Header v-bind:title="doc.Name" v-bind:showBackButton="true"/>
        <div class="content">
            <div class="text">
                <h3>Permissions:</h3>
                <p>{{doc.Description}}</p>
            </div>
        </div>
    </div>
</template>

<script>
import Header from './layout/Header';

export default {
    name: "DocumentDetail",
    computed: {
        doc() {
            return this.$store.state.loadedDocuments[parseInt(this.$route.params.DocID) - 1];
        }
    },
    components: {
        Header
    }
}
</script>

<style scoped>
    .content {
        display: flex;
        flex-direction: column;
    }
    .text {
        margin: 10px;
    }
    .other-info {
        align-self: center;
        margin-top: 30px;
        margin-bottom: 10px;
    }
</style>
