<template>
   <div class="document-item">
       <h3>{{doc.Name}}</h3>
       <router-link :to="{name: 'docs', params: {DocID: doc.DocID}}">
            <button class="view-button">
                <font-awesome-icon icon="file-alt"></font-awesome-icon>
            </button>
       </router-link>
    </div> 
</template>

<script>
export default {
    name: "DocumentItem",
    props: ["doc"]
}
</script>

<style scoped>
    .document-item {
        border-bottom: 1px solid black;
        padding: 20px;
        display: flex;
        justify-content: space-between
    }
    .view-button {
        padding: 5px;
        color: orange;
        background-color: black;
    }
</style>
