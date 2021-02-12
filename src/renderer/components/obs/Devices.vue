<template>
    <div id="devices">
        <MicOffIcon v-if="!devices.mic" class="device disabled feather shadow-box" />
        <HeadphonesIcon v-if="!devices.sound" class="device disabled feather shadow-box" />
        <CameraIcon v-if="devices.camera !== null" :class="cameraClass" class="device feather shadow-box" />
    </div>
</template>

<script>
import { MicOffIcon, HeadphonesIcon, CameraIcon } from "vue-feather-icons";

import OBSMixin from "~/mixins/obs";

export default {
    components: {
        MicOffIcon,
        HeadphonesIcon,
        CameraIcon
    },
    mixins: [OBSMixin],
    computed: {
        classes () {
            return {
                mic: this.devices.mic,
                sound: this.devices.sound,
                camera: this.devices.camera
            };
        },
        cameraClass () {
            return {
                disabled: this.devices.camera === false
            };
        }
    }
};
</script>

<style lang="scss">
#devices {
    display: inline-block;
    width: 80px;

	vertical-align: middle;

    .device {
        margin-left: 5px;
        width: 15px;
        stroke-width: 0px;

        &.disabled {
            stroke: red;
        }
    }
}
</style>