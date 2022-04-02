<template>
    <div id="status">
        <DotIcon id="status-icon" class="icon" />

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

import DotIcon from "~/assets/icons/dot.svg";

import misc from "~/plugins/misc";

export default {
    components: {
        DotIcon
    },

    computed: {
        ...mapState({
            status: state => state.obs.status,
            time: state => state.obs.time,
            settings: state => state.settings.settings
        }),

        label() {
            if (this.status.stream && this.status.record) return "LIVE/REC";
            else if (this.status.stream) return "LIVE";
            else if (this.status.record) return "REC";
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
    column-gap: 5px;

    width: max-content;

    @include obs-item;

    .icon {
        width: 13px !important;
    }

    &-information {
        display: flex;
        align-items: center;
        column-gap: 5px;
    }
}
</style>