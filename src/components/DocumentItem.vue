<template>
   <div class="document-item">
       <b-container fluid>
           <b-row class="text-center align-items-center">
               <b-col class="field-value text-left">
                    <h3>{{doc.Year}}-{{doc.Serial.toString().padStart(4, '0')}}</h3>
               </b-col>
                <b-col class="field-value text-left">
                    <router-link :to="{name: 'docs', params: {year: doc.Year, docID: doc.DocID}}" class="text-dark">
                        <h3 v-if="doc.Dname">{{doc.Dname}}</h3>
                    </router-link>
                </b-col>
               <b-col class="field-value text-left">
                   <router-link :to="{name: 'projects', params: {year: doc.Year, projID: doc.ProjID}}" class="text-dark">
                        <h3 v-if="doc.Pname">{{doc.Pname}}</h3>
                    </router-link>
               </b-col>
               <b-col class="field-value text-left">
                   <h4>{{doc.DateAdded.substring(0, 24)}}</h4>
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
