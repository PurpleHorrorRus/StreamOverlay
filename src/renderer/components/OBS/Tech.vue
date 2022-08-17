<template>
    <span id="obs-tech" v-text="text" />
</template>

<script>
import OBSMixin from "~/mixins/obs";

export default {
    mixins: [OBSMixin],

    computed: {
        text() {
            return `${this.status.tech.fps} FPS`;
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