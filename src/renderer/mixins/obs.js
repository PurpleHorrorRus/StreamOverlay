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
        
        connected() {
            return this.obs._connected;
        },

        streaming() {
            return this.connected && this.status.stream;
        },

        recording() {
            return this.connected && this.status.record;
        },

        isLeft() {
            return this.settings.OBSStatus.x < window.innerWidth / 2;
        },

        isRight() {
            return !this.isLeft;
        },

        OBSClass() {
            return {
                connected: this.connected && !this.streaming && !this.recording,
                disconnected: !this.connected,
                streaming: this.streaming,
                recording: this.recording,
                left: this.isLeft,
                right: this.isRight
            };
        }
    },
    methods: {
        ...mapActions({
            connectOBS: "obs/CONNECT"
        })
    }
};