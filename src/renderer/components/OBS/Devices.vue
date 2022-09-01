<template>
    <div id="devices">
        <Device
            :icon="icons.mic"
            :disabled="!devices.mic"
        />

        <Device
            :icon="icons.sound"
            :disabled="!devices.sound"
        />

        <Device 
            v-if="devices.camera !== null"
            :icon="icons.camera"
            :disabled="!devices.camera"
        />
    </div>
</template>

<script>
import { mapState } from "vuex";

import MicrophoneIcon from "~/assets/icons/microphone.svg";
import MicrophoneMutedIcon from "~/assets/icons/microphone-muted.svg";

import SoundIcon from "~/assets/icons/sound.svg";
import SoundMutedIcon from "~/assets/icons/sound-muted.svg";

import CameraIcon from "~/assets/icons/camera.svg";
import CameraDisabledIcon from "~/assets/icons/camera-disabled.svg";

export default {
    components: {
        Device: () => import("~/components/OBS/Devices/Device")
    },

    computed: {
        ...mapState({
            devices: state => state.obs.devices.list
        }),

        icons() {
            return {
                mic: this.devices.mic ? MicrophoneIcon : MicrophoneMutedIcon,
                sound: this.devices.sound ? SoundIcon : SoundMutedIcon,
                camera: this.devices.camera ? CameraIcon : CameraDisabledIcon
            };
        }
    }
};
</script>

<style lang="scss">
#devices {
    display: flex;
    column-gap: 5px;
}
</style>