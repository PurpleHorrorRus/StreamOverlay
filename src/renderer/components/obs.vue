<template>
    <div id="obs" :class="OBSClass">
        <twitchInfo />
        <div v-if="connected" id="obs-panel">
            <devices />
            <status />
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

import other from "~/mixins/other";
import twitchInfo from "~/components/obs/twitch-info";
import devices from "~/components/obs/devices";
import status from "~/components/obs/status";

export default {
    components: { 
        devices, 
        twitchInfo, 
        status 
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

<style>
#obs {
	position: absolute;
	bottom: 0px;
	right: 0px;
	max-width: 400px;
	height: 30px;
	background: rgba(0, 0, 0, 0.4);
}

#obs #obs-panel { display: inline-block; }

#obs.connected { 
    border-left: 4px solid lightgreen; 
    min-width: 170px;
}
#obs.disconnected { 
    border-left: 4px solid #ccc; 
    min-width: 4px;
}
#obs.streaming { border-left: 4px solid purple; }
#obs.recording { border-left: 4px solid red; }
</style>