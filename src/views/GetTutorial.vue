<template>
  <div class="get-tutorial">
    <Header v-bind:title="'Get Tutorial'" v-bind:showBackButton="true" v-bind:showTutorialButton="false"/>
    <div class="content">
        <div class="general-info">
            <ul class="gi-list">
                <li><h3>All emails MUST be sent to: gobeavdms@gmail.com</h3></li>
                <li><h3>Get operations: <a href="#get-doc">GET DOCUMENT</a>, <a href="#get-proj">GET PROJECT</a>, <a href="#get-grp">GET GROUP</a>  </h3></li>
                <li><h3>See the <router-link :to="{ name: 'save' }">SAVE </router-link> and <router-link :to="{ name: 'update' }">UPDATE </router-link> tutorial pages for detail on other operations.</h3></li>
                <li><h3>Only fields displayed as bold in the images below are required, all other fields are optional. (You do not need to bold anything in the emails.)</h3></li>
                <li><h3>When including multiple items in a field, use a double backslash '\\' to separate the items.</h3></li>
                <li><h3>Use a comma ',' to separate items within double backslash '\\' deliminators.</h3></li>
                <li><h3>Documents are saved to the DMS with the year and a unique code (these are shown on the website). To get existing documents, reference them by their year and code. Ex: 2021-0001, 2021-0002, 2021-0003</h3></li>
                <li><h3>Projects are saved to the DMS with a unique code (these are shown on the website). To get an existing project, reference it by its name and code. Ex: BeaverProject#0001, MyProject#0002</h3></li>
            </ul>
        </div>
        <div class="steps" id="get-doc">
            <br>
            <h2>
                Document
            </h2>
            <br>
            <b-img src="https://snipboard.io/1UXA9P.jpg" fluid alt="Fluid image" class="image"></b-img>
            <br>
        </div>
        <div class="steps" id="get-proj">
            <h2>
                Project
            </h2>
            <br>
            <b-img src="https://snipboard.io/FpsYZW.jpg" fluid alt="Fluid image" class="image"></b-img>
            <br>
        </div>
        <div class="steps" id="get-grp">
            <h2>
                Group
            </h2>
            <br>
            <b-img src="https://snipboard.io/8aUkhK.jpg" fluid alt="Fluid image" class="image"></b-img>
            <br>
        </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header';

export default {
  name: "get-tutorial",
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