<template>
    <span id="obs-tech" v-text="text" />
</template>

<script>
import OBSMixin from "~/mixins/obs";

export default {
    mixins: [OBSMixin],

    computed: {
        text() {
            const bitrate = (this.status.bitrate / 1024).toFixed(1);
            const fps = this.status.tech.fps.toFixed(0);
            return `${bitrate} Mbps, ${fps} FPS`;
        }
    }
};
</script>

<style lang="scss">
#obs-tech {
    @include obs-item;

    display: flex;
    align-items: center;

    font-size: 12px;
}
</style>