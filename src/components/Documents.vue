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

            <p>Page: {{this.$route.query.page}} / {{max.page}}</p>

        <div class="paginate_buttons">
            <button @click="navigate(Number($route.query.page)-1, Number(max.page))">Previous</button>
            <!-- <template v-for="pagination in max.max">
            <button :key="pagination.show" @click="navigate(pagination, max)">{{pagination}}</button>
            </template> -->
            <button  @click="navigate(Number($route.query.page)+1, Number(max.page))">Next</button>
        </div>

    </div>
</template>

<script>
import DocumentItem from './DocumentItem';
import {mapState} from 'vuex';

export default {
    name: "Documents",
    components: {
        DocumentItem
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
            if(!pag_num || pag_num < 1 || pag_num >= max) { //need to check so we don't go out of bounds as well
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
