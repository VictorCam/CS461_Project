<template>
  <div class="tutorial">
    <Header v-bind:title="'Tutorial'"/>
    <div class="content">
        <div class="steps">
            <h2>
                1. Send an email to go beavdms@gmail.com
            </h2>
        </div>
        <div class="steps">
            <h2>
                2. Include content in the header of the email
            </h2>
        </div>
        <div class="steps">
            <h2>
                3. Optionally include any desired attachments
            </h2>
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
    margin: 30px;
}
</style>