<template>
    <div id="devices">
        <MicOffIcon v-if="!devices.mic" class="device disabled icon shadow-box" />
        <HeadphonesIcon v-if="!devices.sound" class="device disabled icon shadow-box" />
        <CameraIcon
            v-if="devices.camera !== null"
            :class="{ disabled: devices.camera === false }"
            class="device icon shadow-box"
        />
    </div>
</template>

<script>
import { mapState } from "vuex";

import { MicOffIcon, HeadphonesIcon, CameraIcon } from "vue-feather-icons";

export default {
    components: {
        MicOffIcon,
        HeadphonesIcon,
        CameraIcon
    },
    computed: {
        ...mapState({
            devices: state => state.obs.devices
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
    position: relative;
    top: 1px;

    display: flex;
    justify-content: space-between;
    column-gap: 5px;

    .device {
        width: 13px;

        &.disabled {
            stroke: #ff0000;
        }
    }
}
</style>