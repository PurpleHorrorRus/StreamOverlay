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