<template>
    <div id="status">
        <div id="status-icon">
            <img v-if="streaming" id="status-icon-streaming" :src="user.avatar">
            <DotIcon v-if="recording" id="status-icon-recording" class="icon" />
        </div>

        <div id="status-information">
            <span
                id="status-information-label"
                v-text="label"
            />

            <span
                v-if="settings.OBSStatus.time"
                id="status-information-time"
                v-text="formatTime"
            />
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

import misc from "~/plugins/misc";

import OBSMixin from "~/mixins/obs";

export default {
    components: {
        DotIcon: () => import("~icons/dot.svg")
    },

    mixins: [OBSMixin],

    computed: {
        ...mapState({
            time: state => state.obs.time
        }),

        label() {
            if (this.streaming && this.recording) return "LIVE/REC";
            else if (this.streaming) return "LIVE";
            else if (this.recording) return "REC";
            return "";
        },

        formatTime() {
            return misc.formatTime(this.time);
        }
    }
};
</script>

<style lang="scss">
#status {
    display: flex;
    align-items: center;
    column-gap: 8px;

    width: max-content;

    @include obs-item;

    &-information {
        display: flex;
        align-items: center;
        column-gap: 5px;

        span {
            font-weight: 500;
        }
    }

    &-icon {
        display: flex;
        align-items: center;
        column-gap: 10px;

        &-streaming {
            width: 20px;

            border-radius: 100%;
        }

        &-recording {
            position: relative;
            top: 1px;

            width: 10px !important;

            g, path {
                fill: #ff0000 !important;
            }
        }
    }
}
</style>