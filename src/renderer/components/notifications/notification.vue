<template>
    <div :style="{ background: notification.color }" class="notification">
        <div class="notification-content">
            <span class="notification-text" v-html="notification.text" />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        notification: {
            required: true,
            type: Object
        }
    }
}
</script>

<style>
.notification {
    display: block;
    width: max-content;
    float: right;
    max-width: 300px;
    height: auto;
    padding: 15px;
}
</style>