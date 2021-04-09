<template>
    <div class="document-detail">
        <div v-if="doc">
            <Header v-bind:title="doc.Dname" v-bind:showBackButton="true" v-bind:showTutorialButton="true"/>
            <b-container fluid class="my-3" v-if="doc">
                <b-row class="my-5 field">
                    <b-col>
                        <h1><b>ID:</b> {{doc.Year}}-{{doc.Serial.toString().padStart(4, '0')}}</h1>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h3><b>Document Name:</b> {{doc.Dname}}</h3>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h3><b>Owner:</b> {{doc.Owner}}</h3>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h4><b>Date Added:</b> {{doc.DateAdded.substring(0, 24)}}</h4>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h4 v-if="doc.Description"><b>Description:</b> {{doc.Description}}</h4>
                        <h4 v-else><b>No Description</b> - Contact {{doc.Owner}} for more information.</h4>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h4 v-if="doc.Permissions == 1"><b>Permissions:</b> Read</h4>
                        <h4 v-else-if="doc.Permissions == 2"><b>Permissions:</b> Change</h4>
                        <h4 v-else-if="doc.Permissions == 4"><b>Permissions:</b> Manage</h4>
                        <h4 v-else><b>No Permissions</b> - Contact {{doc.Owner}} for more information.</h4>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h4 v-if="doc.Link"><b>Link:</b> {{doc.Link}}</h4>
                        <h4 v-else><b>No Link</b> - Contact {{doc.Owner}} for more information.</h4>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h4 v-if="doc.Note"><b>Notes:</b> {{doc.Note}}</h4>
                        <h4 v-else><b>No Notes</b> - Contact {{doc.Owner}} for more information.</h4>
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
    .field {
        border-bottom: 1px solid #222;
    }
</style>
