<template>
    <Movable
        ref="OBSStatus"
        :source="source"
        :name="''"
        :resizable="false"
        @onDrag="onDrag"
    >
        <div id="obs" :class="OBSClass">
            <div v-if="connected" id="obs-panel">
                <Status v-if="settings.time" />
                <Devices />
            </div>
        </div>
    </Movable>
</template>

<script>
import Movable from "~/components/Movable";

import Devices from "~/components/OBS/Devices";
import Status from "~/components/OBS/Status";

import OBSMixin from "~/mixins/obs";

export default {
    components: { 
        Movable,
        Devices, 
        Status 
    },
    mixins: [OBSMixin],
    computed: {
        source () {
            return {
                ...this.settings.OBSStatus,
                width: 175,
                height: 35
            };
        }
    },
    methods: {
        onDrag (x, y) {
            this.settings.OBSStatus.x = x;
            this.settings.OBSStatus.y = y;
            this.save();
        }
    }
};
</script>

<style lang="scss">
$borderWidth: 2px;

$connected: lightgreen;
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