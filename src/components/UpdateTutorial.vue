<template>
  <div class="update-tutorial">
    <Header v-bind:title="'Update Tutorial'" v-bind:showBackButton="true" v-bind:showTutorialButton="false"/>
    <div class="content">
        <div class="steps">
            <br>
            <h2>
                1. Open an email message, include gobeavdms@gmail.com as the recipient. Make 
                sure you are logged into you Oregon State email, otherwise the process will not work.
            </h2>
            <br>
            <b-img src="https://snipboard.io/lhNGY1.jpg" fluid alt="Fluid image" class="image"></b-img>
        </div>
        <div class="steps">
            <h2>
                2. In the subject field, type "update".
            </h2>
            <br>
            <b-img src="https://snipboard.io/wrYZL2.jpg" fluid alt="Fluid image" class="image"></b-img>
        </div>
        <div class="steps">
            <h2>
                3. Send the email, check your inbox for a confirmation message.
                If confirmed, your document should show up on the www.beavdms.com website.
            </h2>
        </div>
    </div>
  </div>
</template>

<script>
import Header from './layout/Header';

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
}
.image {
    justify-content: center;
}
</style>