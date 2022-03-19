<template>
    <div id="devices">
        <MicrophoneMutedIcon
            v-if="!devices.mic"
            id="devices-microphone-muted"
            class="icon disabled"
        />

        <SoundMutedIcon v-if="!devices.sound" class="icon disabled" />

        <div v-if="devices.camera !== null" id="devices-camera">
            <CameraIcon v-if="devices.camera" class="icon" />
            <CameraDisabledIcon v-else class="icon disabled" />
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

import MicrophoneMutedIcon from "~/assets/icons/microphone-muted.svg";
import SoundMutedIcon from "~/assets/icons/sound-muted.svg";
import CameraIcon from "~/assets/icons/camera.svg";
import CameraDisabledIcon from "~/assets/icons/camera-disabled.svg";

export default {
    components: {
        MicrophoneMutedIcon,
        SoundMutedIcon,
        CameraIcon,
        CameraDisabledIcon
    },
    computed: {
        ...mapState({
            devices: state => state.obs.devices.list
        }),

        classes() {
            return {
                mic: this.devices.mic,
                sound: this.devices.sound,
                camera: this.devices.camera
            };
        }
    }
};
</script>

<style lang="scss">
#devices {
    display: flex;
    justify-content: space-between;
    align-items: center;
    column-gap: 5px;

    &-camera {
        display: flex;
        align-items: center;

        height: 100%;
    }

    .icon.disabled {
        fill: #ff0000;
    }
}
</style>