<template>
    <div class="project-detail">
        <div v-if="project">
            <Header v-bind:title="project.Pname" v-bind:showBackButton="true" v-bind:showTutorialButton="true"/>
            <b-container fluid class="my-3" v-if="project">
                <b-row class="my-5 field">
                    <b-col>
                        <h3><b>Project Name:</b>  {{project.proj[0].Pname}}</h3>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <div v-if="project.projDocs.length > 0">
                            <h4><b>Documents: </b></h4>
                            <ul class="mx-4">
                                <li v-for="doc in project.projDocs" :key="doc.DocID">
                                    <h4> {{doc.Dname}}</h4>
                                </li>
                            </ul>
                        </div>
                        <div v-else>
                            <h4><b>No Documents</b> - Contact the project maintainers for more information.</h4>
                        </div>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <h4 v-if="project.proj[0].Description"><b>Description:</b> {{project.proj[0].Description}}</h4>
                        <h4 v-else><b>No Description</b> - Contact the project maintainers for more information.</h4>
                    </b-col>
                </b-row>
                <b-row class="my-5 field">
                    <b-col>
                        <div v-if="project.projLinks.length > 0">
                            <h4><b>Links: </b></h4>
                            <ul class="mx-4">
                                <li v-for="link in project.projLinks" :key="link.LinkID">
                                    <h4> {{link.Link}}</h4>
                                </li>
                            </ul>
                        </div>
                        <div v-else>
                            <h4><b>No Link</b> - Contact the project maintainers for more information.</h4>
                        </div>
                    </b-col>
                </b-row>
            </b-container> 
        </div>
        <div v-else>
            ...loading
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header';

export default {
    name: "ProjectDetail",
    created() {
        this.$store.dispatch("set_current_project", {projID: this.$route.params.projID});
    },
    computed: {
        project() {
            console.log(this.$store.state.currentProject);
            return this.$store.state.currentProject;
        }
    },
    components: {
        Header
    }
}
</script>

<style scoped>
    
</style>
