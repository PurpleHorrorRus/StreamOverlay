<template>
    <div id="devices">
        <Device
            v-tooltip="micTooltip"
            :icon="icons.mic"
            :disabled="!devices.mic"
            :class="micClass"
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
        Device: () => import("./Devices/Device.vue")
    },

    computed: {
        ...mapState({
            meters: state => state.obs.meters,
            devices: state => state.obs.devices.list
        }),

        icons() {
            return {
                mic: this.devices.mic ? MicrophoneIcon : MicrophoneMutedIcon,
                sound: this.devices.sound ? SoundIcon : SoundMutedIcon,
                camera: this.devices.camera ? CameraIcon : CameraDisabledIcon
            };
        },

        micClass() {
            return {
                highlight: this.meters.mic.volume > -80
            };
        },

        micTooltip() {
            return {
                content: "Похоже, что вы говорите<br/>с выключенным микрофоном!",
                show: !this.devices.mic && this.meters.mic.volume > -60,
                placement: "top-end",
                offset: 5
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