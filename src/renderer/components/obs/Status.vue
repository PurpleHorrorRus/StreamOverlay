<template>
    <div id="status">
        <Dot />
        <span v-if="settings.OBSStatus.time" id="status-time" v-text="formatTime" />
    </div>
</template>

<script>
import { mapState } from "vuex";

import Dot from "~/components/obs/Dot";

import misc from "~/plugins/misc";

export default {
    components: {
        Dot
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

    width: max-content;

    &-time {
        font-size: 11px;
        font-weight: 400;
    }
}
</style>