<template>
    <div :style="{ border: `2px solid ${notification.color}` }" class="notification">
        <div class="notification-content">
            <span class="notification-text" v-text="'Обнаружен нестабильный FPS'" />
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