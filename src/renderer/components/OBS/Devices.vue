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

import MicrophoneIcon from "~icons/microphone.svg";
import MicrophoneMutedIcon from "~icons/microphone-muted.svg";

import SoundIcon from "~icons/sound.svg";
import SoundMutedIcon from "~icons/sound-muted.svg";

import CameraIcon from "~icons/camera.svg";
import CameraDisabledIcon from "~icons/camera-disabled.svg";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Device: () => import("./Devices/Device.vue")
    },

    mixins: [CoreMixin],

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
                highlight: this.meters.mic.volume > this.config.obs.meters.mic.limit
            };
        },

        micTooltip() {
            return {
                content: this.$strings.NOTIFICATIONS.MICMUTED,
                show: this.config.obs.meters.mic.enable && !this.devices.mic && this.micClass.highlight,
                placement: "top-end",
                trigger: "manual",
                offset: 5
            };
        }
    }
};
</script>

<style lang="scss">
#obs-content.mini #devices {
    column-gap: 5px;
}

#devices {
    display: flex;
    column-gap: 5px;
}
</style>