<template>
    <div class="notification lowbitrate">
        <div class="notification-content">
            <span class="notification-text" v-text="text" />
            <div id="bitrate-line" :style="line" />
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    computed: {
        ...mapState({
            status: state => state.obs.status
        }),
        text() {
            return `Обнаружен низкий битрейт: ${this.status.bitrate}`;
        },
        line() {
            return {
                width: `${(this.status.bitrate / 5500) * 100}%`
            };
        }
    }
};
</script>

<style>
.lowbitrate {
    border: 2px solid #ff0000;
}

#bitrate-line {
    height: 3px;

    margin-top: 10px;

    background: #ffffffcc;

    transition: 0.2s all ease-in;
}
</style>