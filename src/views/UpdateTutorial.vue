<template>
  <div class="update-tutorial">
    <Header v-bind:title="'Update Tutorial'" v-bind:showBackButton="true" v-bind:showTutorialButton="false"/>
    
    <div class="content">
        <div class="general-info">
            <ul class="gi-list">
                <li><h3>Only fields displayed as bold in the images below are required, all other fields are optional. (You do not need to bold anything in the emails.)</h3></li>
                <li><h3>When including multiple items in a field, use a double backslash '\\' to separate the items.</h3></li>
                <li><h3>Use a comma ',' to separate items within double backslash '\\' deliminators.</h3></li>
                <li><h3>Update operations are additive, items included will be added to the existing array of items in their field. Except when you are changing
                    the name of a project or group.
                </h3></li>
            </ul>
        </div>
        <div class="steps">
            <br>
            <h2>
                Document
            </h2>
            <br>
            <b-img src="https://snipboard.io/uA5CFn.jpg" fluid alt="Fluid image" class="image"></b-img>
            <br>
        </div>
        <div class="steps">
            <h2>
                Project
            </h2>
            <br>
            <b-img src="https://snipboard.io/6lBypK.jpg" fluid alt="Fluid image" class="image"></b-img>
            <br>
        </div>
        <div class="steps">
            <h2>
                Group
            </h2>
            <br>
            <b-img src="https://snipboard.io/i2qjeV.jpg" fluid alt="Fluid image" class="image"></b-img>
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