<template>
   <div class="document-item">
       <b-container fluid>
           <b-row class="text-center align-items-center">
               <b-col class="field-value">
                    <h3>{{doc.DocID}}</h3>
               </b-col>
               <b-col class="field-value">
                   <h3>{{doc.Dname}}</h3>
               </b-col>
               <b-col class="field-value">
                   <h3>{{doc.Pname}}</h3>
               </b-col>
               <b-col class="field-value">
                   <h6>{{doc.DateAdded.toLocaleString()}}</h6>
               </b-col>
               <b-col>
                   <router-link :to="{name: 'docs', params: {DocID: doc.DocID}}">
                        <b-button class="view-button" size="lg">
                            <b-icon-file-earmark-medical-fill variant="secondary"></b-icon-file-earmark-medical-fill>
                        </b-button>
                    </router-link>
               </b-col>
           </b-row>
       </b-container>
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
        color: #333;
    }
</style>
