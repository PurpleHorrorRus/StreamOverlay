import { mapActions, mapState } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    computed: {
        ...mapState({
            obs: state => state.obs.obs,
            status: state => state.obs.status,
            devices: state => state.obs.devices
        }),
        
        OBSConnected() {
            return this.obs._connected;
        },

        streaming() {
            return this.OBSConnected && this.status.stream;
        },

        recording() {
            return this.OBSConnected && this.status.record;
        },

        OBSClass() {
            return {
                connected: this.OBSConnected && !this.streaming && !this.recording,
                disconnected: !this.OBSConnected,
                streaming: this.streaming,
                recording: this.recording
            };
        }
    },
    methods: {
        ...mapActions({
            connectOBS: "obs/CONNECT"
        })
    }
};