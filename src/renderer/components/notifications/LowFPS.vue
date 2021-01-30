<template>
    <div :style="{ border: `2px solid ${notification.color}` }" class="notification">
        <div class="notification-content">
            <span class="notification-text">
                Обнаружен нестабильный FPS: {{ status.tech.fps.toFixed(0) }}
            </span>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    props: {
        notification: {
            required: true,
            type: Object
        }
    },
    computed: {
        ...mapState({
            status: state => state.obs.status
        })
    }
};
</script>