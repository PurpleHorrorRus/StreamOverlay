<template>
    <Movable
        ref="OBSStatus"
        :source="settings.OBSStatus"
        :name="''"
        :resizable="false"
        @onDrag="onDrag"
    >
        <div id="obs" :class="OBSClass">
            <div v-if="connected" id="obs-panel">
                <Status />
                <Devices />
            </div>
        </div>
    </Movable>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import Movable from "~/components/Movable";

import Devices from "~/components/OBS/Devices";
import Status from "~/components/OBS/Status";

import other from "~/mixins/other";

export default {
    components: { 
        Movable,
        Devices, 
        Status 
    },
    mixins: [other],
    computed: {
        ...mapGetters({
            settings: "settings/getSettings",

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
        isLeft () {
            return this.settings.OBSStatus.x < window.innerWidth / 2;
        },
        isRight () {
            return !this.isLeft;
        },
        OBSClass () {
            return {
                connected: this.connected,
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
            saveSettings: "settings/saveSettings"
        }),
        onDrag (x, y) {
            this.settings.OBSStatus.x = x;
            this.settings.OBSStatus.y = y;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        }
    }
};
</script>

<style lang="scss">
$borderWidth: 2px;

$connected: lightgreen;
$disconnected: #ccc;
$streaming: purple;
$recording: red;

#obs {
	position: absolute;
	bottom: 0px;
    right: 0px;

    display: flex;
    align-items: center;
    
	width: 174px;
    height: 25px;
    
    &.left {
        background: -webkit-gradient(
            linear, left top, right bottom, from(rgb(0 0 0 / 100%)),
            to(rgb(80 80 80 / 0%)), color-stop(.6, #33333300)
        );
    }

    &.right {
        justify-content: flex-end;

        background: -webkit-gradient(
            linear, right top, left bottom, from(rgb(0 0 0 / 100%)),
            to(rgb(80 80 80 / 0%)), color-stop(.8, #33333300)
        );

        #obs-panel {
            flex-direction: row-reverse;
        }
    }
    
    &-panel {
        display: flex;

        justify-content: center;
        align-items: center;
    }

    &.connected {
        min-width: 135px;

        &.left {
            border-left: $borderWidth solid $connected;
        }

        &.right {
            border-right: $borderWidth solid $connected;
        }
    }

    &.disconnected { 
        min-width: 135px;

        &.left {
            border-left: $borderWidth solid $disconnected;
        }

        &.right {
            border-right: $borderWidth solid $disconnected;
        }
    }

    &.streaming {
         &.left {
            border-left: $borderWidth solid $streaming;
        }

        &.right {
            border-right: $borderWidth solid $streaming;
        }
    }

    &.recording {
        &.left {
            border-left: $borderWidth solid $recording;
        }

        &.right {
            border-right: $borderWidth solid $recording;
        }
    }
}
</style>