<template>
    <div class="header">
        <h1 class="title">
            OSU Student File System 
            <button class="add-btn">Add Document</button>
        </h1>
         
    </div>
</template>

<script>
export default {
    name: "Header"
}
</script>

<style scoped>
    .title {
        background-color: #de953c;
        color: black;
        text-align: center;
        width: 100%;
        padding: 15px;
    }
    .add-btn {
        float: right;
        padding: 3px;
    }
</style>
