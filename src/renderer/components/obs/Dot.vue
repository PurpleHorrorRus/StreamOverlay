<template>
    <div id="obs-dot-status" :class="{ streaming, recording }" />
</template>

<script>
import OBSMixin from "~/mixins/obs";

export default {
    mixins: [OBSMixin]
};
</script>

<style lang="scss">
#obs-dot-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    column-gap: 5px;

    width: 6px;
    height: 6px;

    border-radius: 100px;

    background: #8eff5a;

    &.streaming {
        background: #6441A4;
    }

    &.recording {
        background: #ff0000;
    }
}
</style>