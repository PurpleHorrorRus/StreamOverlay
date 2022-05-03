<template>
    <div 
        :style="{ background: notification.color }" 
        class="notification"
        :class="{ icon: Boolean(notification.icon) }"
    >
        <Component
            :is="notification.icon"
            v-if="notification.icon"
            class="icon"
            :class="{ spin: Boolean(notification.spin) }"
        />

        <span 
            class="notification-text" 
            v-html="notification.text" 
        />
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
    display: grid;
    align-items: center;
    column-gap: 5px;

    width: 300px;

    margin-bottom: 10px;
    padding: 15px;

    background: $backdrop;
    box-shadow: 0 3px 6px #00000029, 0 3px 6px #00000003;
    border-radius: 4px;

    &.icon {
        grid-template-columns: 30px 1fr;
    }

    .icon {
        height: 100%;
    }
}
</style>