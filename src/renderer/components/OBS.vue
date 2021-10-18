<template>
    <Movable :source="{ ...settings.OBSStatus, width, height }" :name="''" :resizable="false" @onDrag="onDrag">
        <div id="obs" ref="OBSStatus" :class="OBSClass">
            <Status v-if="connected" />
            <TwitchInfo v-if="showTwitch" />
            <Devices v-if="connected" />
        </div>
    </Movable>
</template>

<script>
import Movable from "~/components/Movable";

import Devices from "~/components/OBS/Devices";
import TwitchInfo from "~/components/OBS/TwitchInfo";
import Status from "~/components/OBS/Status";

import OBSMixin from "~/mixins/obs";
import TwitchMixin from "~/mixins/twitch";

export default {
    components: {
        Movable,
        TwitchInfo,
        Devices,
        Status
    },
    mixins: [OBSMixin, TwitchMixin],
    data: () => ({
        width: 125,
        height: 25
    }),
    computed: {
        showTwitch() {
            return this.user 
                && (this.settings.OBSStatus.TwitchInfo.enable || this.settings.OBSStatus.TwitchInfo.enableFollowers);
        }
    },
    mounted() {
        this.adaptive();
        if (this.isLeft) {
            new ResizeObserver(() => this.adaptive()).observe(this.$refs.OBSStatus);
        }
    },
    methods: {
        adaptive() {
            if (this.$refs.OBSStatus) {
                this.width = this.$refs.OBSStatus.clientWidth;
                this.height = this.$refs.OBSStatus.clientHeight;
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

    width: max-content;
    height: 26px;

    padding-left: 10px;
    padding-right: 10px;

    background: #000000bb;

    &.right {
        flex-direction: row-reverse;

        #status {
            flex-direction: row-reverse;
        }
    }
}
</style>