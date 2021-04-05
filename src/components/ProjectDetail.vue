<template>
    <div class="project-detail">
        <div v-if="project">
            <Header v-bind:title="project.Pname" v-bind:showBackButton="true" v-bind:showTutorialButton="true"/>
            <b-container fluid class="mx-3 my-3" v-if="project">
                <b-row class="my-4">
                    <b-col>
                        <h3>Project Name: {{project.Pname}}</h3>
                    </b-col>
                </b-row>
                <b-row class="my-4">
                    <b-col>
                        <h4 v-if="project.Description">Description: {{project.Description}}</h4>
                        <h4 v-else>No Description - Contact the project maintainers for more information.</h4>
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
