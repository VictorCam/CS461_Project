<template>
    <div class="project-detail">
        <Header v-bind:title="project.Pname" v-bind:showBackButton="true" v-bind:showTutorialButton="true"/>
        <b-container fluid class="mx-3 my-3" v-if="project">
            <b-row class="my-4">
                <b-col>
                    <h3>Project Name: {{project.Pname}}</h3>
                </b-col>
            </b-row>
        </b-container> 
    </div>
</template>

<script>
import Header from './layout/Header';

export default {
    name: "ProjectDetail",
    created() {
        this.$store.dispatch("set_current_project", {year: this.$route.params.year, projID: this.$route.params.projID});
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
