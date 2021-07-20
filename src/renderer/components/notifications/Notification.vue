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
};
</script>

<style lang="scss">
.notification {
    display: block;
    width: 300px;
    height: auto;

    margin-bottom: 10px;
    padding: 15px;

    background: $backdrop;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    border-radius: 3px;
}
</style>