<template>
    <div class="documents">
        <DocumentItemLabels/>
            <div v-for="doc in loadedDocuments" :key="doc.DocID">
                <DocumentItem v-bind:doc="doc"/>
            </div>

            <p>Page: {{this.$route.query.page}} / {{max.page}}</p>

        <div class="paginate_buttons">
            <button @click="navigate(Number($route.query.page)-1, Number(max.page))">Previous</button>
            <button  @click="navigate(Number($route.query.page)+1, Number(max.page))">Next</button>
        </div>

    </div>
</template>

<script>
import DocumentItem from '@/components/DocumentItem';
import DocumentItemLabels from '@/components/DocumentItemLabels';
import {mapState} from 'vuex';

export default {
    name: "Documents",
    components: {
        DocumentItem,
        DocumentItemLabels
    },
    created() {
        if(this.$route.query.page < 1 || !this.$route.query.page) { //if page is out of bound or does not exist we give default
            this.$router.push({ query: {page: 1} })
            this.$store.dispatch("load_documents", 1)
        }
        if(this.$route.query.page && this.$route.query.search ) { //if page exist and search exist then we do query
            this.$store.dispatch("search_documents", [this.$route.query.search, this.$route.query.page])
        }
        else { //we get default data if page exists
            this.$store.dispatch("load_documents", this.$route.query.page);
        }
    },
    computed: {
        ...mapState(["loadedDocuments", "max"])
    },
    methods: {
        navigate(pag_num, max) {
            if(!pag_num || pag_num < 1 || pag_num > max) { //need to check so we don't go out of bounds as well
                console.log("out of bounds")
                return
            }
            
            if(this.$route.query.page && this.$route.query.search) {
                console.log("1")
                this.$router.push({ query: {page: pag_num, search: this.$route.query.search} })
                this.$store.dispatch("search_documents", [this.$route.query.search, pag_num])
            }

            if(pag_num != this.$route.query.page) {
                this.$store.dispatch("load_documents", pag_num)
                this.$router.push({ query: {page: pag_num} })
            }
        }
    }
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
