<template>
    <div id="status">
        <BroadcastIcon
            v-if="status.stream"
            id="status-stream-icon"
            class="icon"
        />
        <RecordIcon
            v-else-if="status.record"
            id="status-record-icon"
            class="icon"
        />
        <DotIcon v-else id="status-ready-icon" class="icon" />

        <span
            v-if="settings.OBSStatus.time"
            id="status-time"
            v-text="formatTime"
        />
    </div>
</template>

<script>
import { mapState } from "vuex";

import BroadcastIcon from "~/assets/icons/broadcast.svg";
import RecordIcon from "~/assets/icons/record.svg";
import DotIcon from "~/assets/icons/dot.svg";

import misc from "~/plugins/misc";

export default {
    components: {
        BroadcastIcon,
        RecordIcon,
        DotIcon
    },
    computed: {
        ...mapState({
            status: state => state.obs.status,
            settings: state => state.settings.settings
        }),
        formatTime() {
            return misc.formatTime(this.status.time);
        }
    }
};
</script>

<style lang="scss">
#status {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    column-gap: 5px;

    .icon {
        width: 20px;
    }

    &-stream-icon {
        fill: #8c00ff;
    }

    &-record-icon path {
        fill: #ff0000;
    }

    &-ready-icon circle {
        fill: #90ee90;
    }

    &-time {
        font-size: 11px;
        font-weight: 400;
    }
}
</style>