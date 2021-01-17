<template>
   <div class="document-item">
        <div class="field-value">
            <h3>{{doc.DocID}}</h3>
        </div>
        <div class="field-value">
            <h3>{{doc.Name}}</h3>
        </div>
        <div class="field-value">
            <h3>{{doc.Project}}</h3>
        </div>
        <div class="field-value">
            <h6>{{doc.DateAdded.toLocaleString()}}</h6>
        </div>
        <div class="field-value">
            <router-link :to="{name: 'docs', params: {DocID: doc.DocID}}">
                <b-button class="view-button" size="lg">
                    <b-icon-file-earmark-medical-fill variant="secondary"></b-icon-file-earmark-medical-fill>
                </b-button>
            </router-link>
        </div>
       
    </div> 
</template>

<script>
export default {
    name: "DocumentItem",
    props: ["doc"],

}
</script>

<style scoped>
    .document-item {
        border-bottom: 1px solid black;
        padding: 20px;
        display: flex;
        justify-content: space-around;
    }
    .view-button {
        padding: 5px;
        color: orange;
        background-color: black;
        margin-right: 20px;
    }
    .field-value {
        color: #444;
    }
</style>
