<template>
    <div :style="{ border: `2px solid ${notification.color}` }" class="notification">
        <div class="notification-content">
            <span class="notification-text">Обнаружен низкий битрейт: {{ bitrate }}</span>
            <div id="bitrate-line" :style="{ width: `${percent}%` }" class="enter-active" />
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    props: {
        notification: {
            required: true,
            type: Object
        }
    },
    computed: {
        ...mapGetters({
            status: "obs/getStatus"
        }),
        bitrate () { 
            return this.status.bitrate; 
        },
        percent () {
            return (this.bitrate / 5500) * 100;
        }
    }
};
</script>

<style>
#bitrate-line {
    background: rgba(255, 255, 255, .8);
    height: 3px;
    margin-top: 10px;
}

#bitrate-line.enter-active {
  transition: all 0.5s linear;
}
</style>