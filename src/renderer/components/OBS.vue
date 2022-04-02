<template>
    <Movable
        id="obs"
        ref="OBSStatus"
        :class="OBSClass"
        :source="source"
        :resizable="false"
        @onDrag="onDrag"
    >
        <div id="obs-main">
            <Devices v-if="connected && showDevices" />
            <Status v-if="connected && showStatus" />
            <OBSTech v-if="showTech" />
        </div>

        <ServiceInfo v-if="chatConnected" />
    </Movable>
</template>

<script>
import { mapState } from "vuex";

import Movable from "~/components/Movable";

import Devices from "~/components/OBS/Devices";
import ServiceInfo from "~/components/OBS/ServiceInfo";
import Status from "~/components/OBS/Status";

import OBSMixin from "~/mixins/obs";

export default {
    components: {
        Movable,

        Devices,
        ServiceInfo,
        Status,
        OBSTech: () => import("~/components/OBS/Tech")
    },

    mixins: [OBSMixin],

    data: () => ({
        width: 125,
        height: 80
    }),

    computed: {
        ...mapState({
            chatConnected: state => state.service.connected
        }),

        showStatus() {
            return this.status.stream || this.status.record;
        },

        showDevices() {
            return !this.devices.mic || !this.devices.sound || this.devices.camera !== null;
        },

        showTech() {
            return this.settings.OBSStatus.tech
                && this.connected;
        },

        source() {
            return {
                ...this.settings.OBSStatus,
                width: this.width,
                height: this.height
            };
        }
    },

    methods: {
        onDrag(x, y) {
            this.settings.OBSStatus.x = x;
            this.settings.OBSStatus.y = y;
            this.save();
        }
    }
};
</script>

<style lang="scss">
#obs {
    position: absolute;
    bottom: 0px;
    right: 0px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-content: center;
    row-gap: 5px;

    width: max-content !important;
    height: 140px;

    padding: 5px;

    .icon {
        height: 20px;

        g, path {
            fill: #ffffff;
        }
    }

    &-main {
        display: flex;
        justify-content: center;
        align-items: center;
        align-content: center;
        column-gap: 5px;

        * {
            align-items: center;
        }

        > * {
            align-content: center;
        }
        span {
            color: #ffffff;
            font-size: 12px;
        }
    }
}
</style>