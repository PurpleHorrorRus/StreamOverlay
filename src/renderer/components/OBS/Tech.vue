<template>
    <span id="obs-tech" v-text="text" />
</template>

<script>
import OBSMixin from "~/mixins/obs";

export default {
    mixins: [OBSMixin],

    computed: {
        text() {
            const bitrate = (this.status.tech.bitrate / 1024).toFixed(1);
            return `${this.status.tech.fps} FPS, ${bitrate} MB/s`;
        }
    }
};
</script>

<style lang="scss">
#obs-content.mini #obs-tech {
    min-width: 135px;
}

#obs-tech {
    @include obs-item;

    display: flex;
    align-items: center;

    font-size: 12px;
}
</style>