<template>
   <div class="document-item">
       <p>{{doc.content}}</p>
    </div> 
</template>

<script>
export default {
    name: "DocumentItem",
    props: ["doc"]
}
</script>

<style scoped>

</style>
