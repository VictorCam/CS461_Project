<template>
    <div class="document-detail">
        <div v-if="doc">
            <Header v-bind:title="doc.userDoc[0].Dname" v-bind:showBackButton="true" v-bind:showTutorialButton="true"/>
            <b-container fluid class="my-3" v-if="doc">
                <b-row class="my-5 field">
                    <b-col>
                        <h4><b>ID:</b> {{doc.userDoc[0].Year}}-{{doc.userDoc[0].Serial.toString().padStart(4, '0')}}</h4>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h4><b>Owner:</b> {{doc.userDoc[0].Owner}}</h4>
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
                        <div v-if="doc.docLinks.length > 0">
                            <h4><b>Links: </b></h4>
                            <ul class="mx-4">
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
                        <div v-if="doc.notes.length > 0">
                            <h4><b>Notes: </b></h4>
                            <ul class="mx-4">
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
