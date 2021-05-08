<template>
  <div class="update-tutorial">
    <Header v-bind:title="'Update Tutorial'" v-bind:showBackButton="true" v-bind:showTutorialButton="false"/>
    
    <div class="content">
        <div class="general-info">
            <ul class="gi-list">
                <li><h3>All emails MUST be sent to: gobeavdms@gmail.com</h3></li>
                <li><h3>Update operations: <a href="#update-doc">UPDATE DOCUMENT</a>, <a href="#update-proj">UPDATE PROJECT</a>, <a href="#update-grp">UPDATE GROUP</a>  </h3></li>
                <li><h3>See the <router-link :to="{ name: 'save' }">SAVE </router-link> and <router-link :to="{ name: 'get' }">GET </router-link> tutorial pages for detail on other operations.</h3></li>
                <li><h3>Only fields displayed as bold in the images below are required, all other fields are optional. (You do not need to bold anything in the emails.)</h3></li>
                <li><h3>When including multiple items in a field, use a double backslash '\\' to separate the items.</h3></li>
                <li><h3>Use a comma ',' to separate items within double backslash '\\' deliminators.</h3></li>
                <li><h3>Update operations are additive, items included will be added to the existing array of items in their field. Except when you are changing
                    the name of a project or group.
                </h3></li>
                <li><h3>Refer to the <router-link :to="{ name: 'get' }">GET </router-link> tutorial for how to correctly reference existing documents and projects in you email</h3></li>
                <li><h3>To update documents, reference the docs by their year-code and make the necessary changes in the other fields.</h3></li>
                <!-- <li><h3>To update projects, you must specify the old project name and code along with a '\\' deliminator and a new project name. Ex: BeaverProj#0001 \\ NewBeavProj</h3></li> -->
            </ul>
        </div>
        <div class="steps" id="update-doc">
            <br>
            <h2>
                Document
            </h2>
            <br>
            <img src="@/assets/update_document.png" fluid alt="Fluid image" class="image"/>
            <br>
        </div>
        <div class="steps" id="update-proj">
            <h2>
                Project
            </h2>
            <br>
            <img src="@/assets/update_project.png" fluid alt="Fluid image" class="image"/>
            <br>
        </div>
        <div class="steps" id="update-grp">
            <h2>
                Group
            </h2>
            <br>
            <img src="@/assets/update_group.png" fluid alt="Fluid image" class="image"/>
            <br>
        </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header';

export default {
  name: "update-tutorial",
  components: {
      Header
  }
};
</script>

<style scoped>
.content {
    display: flex;
    flex-direction: column;
}
.steps {
    align-self: flex-start;
    margin-left: 40px;
    margin-right: 40px;
    margin-bottom: 100px;
    text-align: center;
}
.image {
    justify-content: center;
}
.general-info {
    margin: 20px;
    align-self: flex-start;
}
.gi-list {
    margin: 40px;
}
</style>