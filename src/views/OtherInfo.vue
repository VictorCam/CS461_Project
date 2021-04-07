<template>
    <div class="other-info">
        <Header v-bind:title="'Permissions'" v-bind:showBackButton="true" v-bind:showTutorialButton="false"/>
        <div class="item">
                <h1>Read:</h1>
                <h4>Grants access to view a document or project.</h4>
        </div>
        <div class="item">
                <h1>Change:</h1>
                <h4>Grants access to update information about an existing document or project</h4>
        </div>
        <div class="item">
                <h1>Manage:</h1>
                <h4>Grants a user the authority to give other users permissions to a document or project. May also remove or modify their permissions.</h4>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header';

export default {
    name: 'other-info',
    components: {
        Header
    }
}
</script>

<style scoped>
    .other-info {
    display: flex;
    flex-direction: column;
    }

    .item {
        align-self: flex-start;
        margin: 30px;
    }

    .perm-title {
        text-align: center;
    }
</style>
