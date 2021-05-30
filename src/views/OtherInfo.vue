<template>
    <div class="other-info">
        <Header v-bind:title="'Permissions & Other Info'" v-bind:showBackButton="true" v-bind:showTutorialButton="false"/>
        <div class="item">
            <h1><b>Permission Levels</b></h1>
        </div>
        <div class="item">
                <h1>Read:</h1>
                <h4>Grants access to view and download a document, projects or group. Anyone who is listed in the "read" field has these permissions.</h4>
        </div>
        <div class="item">
                <h1>Change:</h1>
                <h4>Grants access to update information about an existing document, project or group. Anyone who is listed in the "change" 
                    field has these permissions. Read permissions are included</h4>
        </div>
        <div class="item">
                <h1>Manage:</h1>
                <h4>Grants a user the authority to give other users permissions to a document, project or group. May also 
                    remove or modify their permissions. Anyone who is listed in the "manage" field has these permissions. Read and change permissions are included</h4>
        </div>

        <div class="item">
            <h1><b>General Info</b></h1>
        </div>
        <div class="item">
                <h1>Link:</h1>
                <h4>A link to other resources relating to a document or project. E.g. Github link, website link, etc.</h4>
        </div>

        <div class="item">
                <h1>Tag:</h1>
                <h4>Represents keywords for your document. When searching for tags attached to your document, your document will show up.</h4>
        </div>

        <div class="item">
            <h3>- Keep files under 25MB to avoid long load times and other issues.</h3>
            <h3>- You can add multiple documents to a project.</h3>
            <h3>- You can add multiple projects with the same name, each will be automatically assigned a unique identifier.</h3>
            <h3>- Users need change or manage permissions to a project to be able to add documents to it.</h3>
            <h3>- When saving a document, if names are not given to the files in the "name" field, the document will by default be named the original file name. If multiple 
                files are specified, a separate document will be created for each file.
            </h3>
            <h3>- Groups are a collection of email addresses which allow a user to easily grant permissions to sets of users.</h3>
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
