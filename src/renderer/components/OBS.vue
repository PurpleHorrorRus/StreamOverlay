<template>
    <Movable
        id="obs"
        ref="OBSStatus"
        :class="OBSClass"
        :source="source"
        :resizable="false"
    >
        <Status v-if="connected" />
        <ServiceInfo v-if="chatConnected" />
        <Devices v-if="connected && showDevices" />
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
        Status
    },

    mixins: [OBSMixin],

    data: () => ({
        width: 125,
        height: 25
    }),

    computed: {
        ...mapState({
            chatConnected: state => state.service.connected
        }),

        showDevices() {
            return !this.devices.mic || !this.devices.sound || this.devices.camera !== null;
        },

        source() {
            return {
                ...this.settings.OBSStatus,
                width: this.width,
                height: this.height
            };
        }
    },
    
    watch: {
        devices: {
            deep: true,
            handler: function() {
                this.adaptive();
            }
        }
    },
    
    mounted() {
        this.adaptive();
    },

    methods: {
        adaptive() {
            if (this.$refs.OBSStatus) {
                this.width = this.$refs.OBSStatus.$el.clientWidth;
                this.height = this.$refs.OBSStatus.$el.clientHeight;
            }
        },
        
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
    column-gap: 10px;

    justify-content: flex-start;

    width: max-content !important;
    height: 26px;

    padding: 10px;

    background: #000000bb;

    &.right {
        flex-direction: row-reverse;

        #status {
            flex-direction: row-reverse;
        }
    }

    .icon {
        width: 16px;
    }
}
</style>