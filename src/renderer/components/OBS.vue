<template>
    <Movable
        id="obs"
        class="movable-slot"
        :class="OBSClass"
        :source="settings.OBSStatus"
        :resizable="false"
    >
        <div v-if="OBSConnected" id="obs-main">
            <Devices />
            <Status v-if="showStatus" />
            <OBSTech v-if="showTech" />
        </div>

        <ServiceInfo v-if="chatConnected" />
    </Movable>
</template>

<script>
import { mapState } from "vuex";

import OBSMixin from "~/mixins/obs";

export default {
    components: {
        Devices: () => import("~/components/OBS/Devices"),
        ServiceInfo: () => import("~/components/OBS/ServiceInfo"),
        Status: () => import("~/components/OBS/Status"),
        OBSTech: () => import("~/components/OBS/Tech")
    },

    mixins: [OBSMixin],

    computed: {
        ...mapState({
            chatConnected: state => state.service.connected
        }),

        showStatus() {
            return this.status.stream 
                || this.status.record;
        },

        showTech() {
            return this.settings.OBSStatus.tech;
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
    height: max-content !important;

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