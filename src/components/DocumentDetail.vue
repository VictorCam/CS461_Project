<template>
    <div class="document-detail">
        <div v-if="doc">
            <Header v-bind:title="doc.Dname" v-bind:showBackButton="true" v-bind:showTutorialButton="true"/>
            <b-container fluid class="my-3" v-if="doc">
                <b-row class="my-5 field">
                    <b-col>
                        <h1><b>ID:</b> {{doc.userDoc[0].Year}}-{{doc.userDoc[0].Serial.toString().padStart(4, '0')}}</h1>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h3><b>Document Name:</b> {{doc.userDoc[0].Dname}}</h3>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h3><b>Owner:</b> {{doc.userDoc[0].Owner}}</h3>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h4><b>Date Added:</b> {{doc.userDoc[0].DateAdded.substring(0, 24)}}</h4>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h4 v-if="doc.Description"><b>Description:</b> {{doc.userDoc[0].Description}}</h4>
                        <h4 v-else><b>No Description</b> - Contact {{doc.userDoc[0].Owner}} for more information.</h4>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <div v-if="doc.docLinks">
                            <b>Links: </b>
                            <ul>
                                <li v-for="link in doc.docLinks" :key="link.LinkID">
                                    <h4> {{link.Link}}</h4>
                                </li>
                            </ul>
                        </div>
                        <div v-else>
                            <h4><b>No Link</b> - Contact {{doc.userDoc[0].Owner}} for more information.</h4>
                        </div>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <div v-if="doc.notes">
                            <b>Notes: </b>
                            <ul>
                                <li v-for="note in doc.notes" :key="note.NoteID">
                                    <h4> {{note.Note}}</h4>
                                </li>
                            </ul>
                        </div>
                        <div v-else>
                            <h4><b>No Notes</b> - Contact {{doc.userDoc[0].Owner}} for more information.</h4>
                        </div>
                    </b-col>
                </b-row>
            </b-container>
        </div>
        <div v-else>
            ..loading
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header';

export default {
    name: "DocumentDetail",
    created() {
        this.$store.dispatch("set_current_doc", {docID: this.$route.params.docID});
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
    .field:hover {
        background-color: #ddd;
    }
</style>
