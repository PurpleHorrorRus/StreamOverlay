<template>
    <div id="obs" :class="OBSClass">
        <TwitchInfo />
        <div v-if="connected" id="obs-panel">
            <Devices />
            <Status />
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

import Devices from "~/components/OBS/Devices";
import TwitchInfo from "~/components/OBS/TwitchInfo";
import Status from "~/components/OBS/Status";

import other from "~/mixins/other";

export default {
    components: { 
        Devices, 
        TwitchInfo, 
        Status 
    },
    mixins: [other],
    computed: {
        ...mapGetters({
            obs: "obs/getOBS",
            status: "obs/getStatus",
            devices: "obs/getDevices"
        }),
        connected () { 
            return this.obs._connected;
        },
        streaming () { 
            return this.connected && this.status.stream; 
        },
        recording () { 
            return this.connected && this.status.recording; 
        },
        OBSClass () {
            return {
                connected: this.connected,
                disconnected: !this.connected,
                streaming: this.streaming,
                recording: this.recording
            };
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
    align-items: center;
    
	max-width: 400px;
    height: 30px;
    
    background: rgba(0, 0, 0, 0.4);
    
    &-panel {
        display: inline-block;
    }

    &.connected {
        border-left: 4px solid lightgreen; 
        min-width: 170px;
    }

    &.disconnected { 
        border-left: 4px solid #ccc; 
        min-width: 4px;
    }

    &.streaming {
         border-left: 4px solid purple;
    }

    &.recording {
        border-left: 4px solid red;
    }
}
</style>