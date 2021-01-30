<template>
  <div class="tutorial">
    <Header v-bind:title="'Tutorial'" v-bind:showBackButton="true"/>
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
                2. In the subject field, type "save".
            </h2>
            <br>
            <b-img src="https://snipboard.io/wrYZL2.jpg" fluid alt="Fluid image" class="image"></b-img>
        </div>
        <div class="steps">
            <h2>
                3. In the body of the email, add a project name.
                <br><br>
                <h4>Follow the format shown below:</h4>
                <h5>project: Project Name 1</h5>
            </h2>
            <br>
            <b-img src="https://snipboard.io/Pa7Jf2.jpg" fluid alt="Fluid image" class="image"></b-img>
        </div>
        <div class="steps">
            <h2>
                4. In the body of the email include permissions. The permissions are "read", "change", and "manage".
                <br> <br>
                <h4>Follow the format shown below:</h4>
                <h5>Permission: OSU Email Address, OSU Email Address, OSU Email Address</h5>
                <h5>Permission: OSU Email Address, OSU Email Address, OSU Email Address</h5>
                <h5>Permission: OSU Email Address, OSU Email Address, OSU Email Address</h5>
                <h5>...</h5>
                <br>
            </h2>
            <b-img src="https://snipboard.io/u7xmY8.jpg" fluid alt="Fluid image" class="image"></b-img>
        </div>
        <div class="steps">
            <h2>
                5. Below the permissions in the body, optionally add a names field to name the attached documents in the file system.
                Make sure there are the same number of names as PDF files attached to the email
                <br> <br>
                <h4>Follow the format shown below:</h4>
                <h4>names: Doc 1 Name, Doc 2 Name, Doc 3 Name</h4>
                <br>
            </h2>
            <b-img src="https://snipboard.io/gQAV4c.jpg" fluid alt="Fluid image" class="image"></b-img>
        </div>
        <div class="steps">
            <h2>
                6. Include any necessary attachments to the email The attachments must be PDF files.
            </h2>
            <br>
            <b-img src="https://snipboard.io/XUv4Lg.jpg" fluid alt="Fluid image" class="image"></b-img>
        </div>
        <div class="steps">
            <h2>
                7. Send the email, check your inbox for a confirmation message.
                If confirmed, your document should show up on the www.beavdms.com website.
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
.image {
    justify-content: center;
}
</style>