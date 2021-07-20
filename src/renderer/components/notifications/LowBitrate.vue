<template>
    <div :style="{ border: `2px solid ${notification.color}` }" class="notification">
        <div class="notification-content">
            <span class="notification-text">Обнаружен низкий битрейт: {{ status.bitrate }}</span>
            <div id="bitrate-line" :style="{ width: `${percent}%` }" class="enter-active" />
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
        }),
        percent() {
            return (this.status.bitrate / 5500) * 100;
        }
    }
};
</script>

<style>
#bitrate-line {
    background: #ffffffcc;
    height: 3px;
    margin-top: 10px;
}
</style>