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

            <!-- {{max}} -->

        <div class="paginate_buttons">
            <button @click="navigate(Number(max.page)-1, max)">Previous</button>
            <!-- <template v-for="pagination in max.max">
            <button :key="pagination.show" @click="navigate(pagination, max)">{{pagination}}</button>
            </template> -->
            <button  @click="navigate(Number(max.page)+1, max)">Next</button>
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
        this.$store.dispatch("load_documents", this.$route.query.page);
    },
    computed: {
        ...mapState(["loadedDocuments", "max"])
    },
    methods: {
        navigate(pag_num, max) {
            if(pag_num > max.max || pag_num < 1) {
                console.log("out of bounds")
                //do stuff
                return
            }
            console.log(max.max)

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
