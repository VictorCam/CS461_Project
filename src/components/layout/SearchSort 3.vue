<template>
    <div class="search-sort">
        <div class="search-bar">
            <input type="text" placeholder="Search...">
        </div>
    </div>
</template>

<script>
export default {
    name: "SearchSort"
};
</script>

<style scoped>
    .search-sort {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background-color: #ddd;
        flex-wrap: wrap;
    }
    
    .search-bar {
        position: relative;
    }
    
</style>