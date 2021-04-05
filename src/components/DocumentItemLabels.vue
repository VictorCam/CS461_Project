<template>
    <div class="labels">
        <b-container fluid>
        <b-row class="text-center align-items-center document-item-fields">
            <b-col class="field text-left">
                <h3><strong>DocID</strong></h3>
            </b-col>
            <b-col class="field text-left">
                <h3><strong>Document Name</strong></h3>
            </b-col>
            <b-col class="field text-left">
                <h3><strong>Project Name</strong></h3>
            </b-col>
            <b-col class="field text-left">
                <h3><strong>Date Added</strong></h3>
            </b-col>
        </b-row>
    </b-container>
    </div>
</template>

<script>
export default {

}
</script>

<style>
    .document-item-fields {
        border-bottom: 2px solid black;
        padding: 20px;
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-around;
    }
</style>