<template>
  <div class="tutorial">
    <Header v-bind:title="'Tutorial'"/>
    <div class="content">
        <div class="steps">
            <h2>
                1. Open an email message, include gobeavdms@gmail.com as the recipient
            </h2>
            <img src="https://www.spcdn.org/images/undisclosed-recipients-gmail.jpg" alt="">
        </div>
        <div class="steps">
            <h2>
                2. Include one of these keywords in the subject: HELP, SAVE, GET
                <h5>HELP: Get further information from the documentation</h5>
                <h5>SAVE: Saves a composed email to the file system</h5>
                <h5>GET: Retrieves a document from the file system</h5>
            </h2>
            <img src="https://www.wikihow.com/images/thumb/c/cf/Send-an-Email-Using-Gmail-Step-12-Version-2.jpg/v4-460px-Send-an-Email-Using-Gmail-Step-12-Version-2.jpg.webp" alt="">
        </div>
        <div class="steps">
            <h2>
                3. Optionally include any desired attachments
            </h2>
            <img src="https://acflory.files.wordpress.com/2015/07/picture-file-attach-icon.jpg" alt="">
        </div>
        <div class="steps">
            <h2>
                4. Once the email is sent, it will show up as an entry in the file system
            </h2>
        </div>
    </div>
  </div>
</template>

<script>
import Header from './layout/Header';

export default {
  name: "tutorial",
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
</style>