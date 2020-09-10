<template>
    <div class="action-button" @click="$emit('action')">
        <font-awesome-icon class="action-button-icon" :icon="icon" />
        <span class="action-button-label" v-text="label" />
    </div>
</template>

<script>
export default {
    props: {
        icon: {
            type: Array,
            required: true
        },
        label: {
            type: String,
            required: true
        }
    }
}
</script>

<style>
.action-button {
    display: inline-block;
    width: 100px;
    height: 50px;
    user-select: none;
    text-align: center;
    padding: 5px;
    margin-right: 5px;
    font-size: 12pt;
}

.action-button:hover {
    cursor: pointer;
    background: rgb(24, 24, 24);
}

.action-button-label {
    display: block;
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
</style>