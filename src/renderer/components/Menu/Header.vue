<template>
    <div id="menu-header" :class="{ stream: streaming, expanded }">
        <Profile />
        <Expand v-if="showExpand" />
    </div>
</template>

<script>
import { mapState } from "vuex";

import TwitchMixin from "~/mixins/twitch";
import OBSMixin from "~/mixins/obs";

export default {
    components: {
        Profile: () => import("~/components/Menu/Header/Profile"),
        Expand: () => import("~/components/Menu/Header/Expand")
    },

    mixins: [TwitchMixin, OBSMixin],

    data: () => ({
        expanded: false
    }),

    computed: {
        ...mapState({
            connected: state => state.twitch.service.connected,
            tags: state => state.twitch.tags
        }),

        showExpand() {
            return this.connected && this.tags !== null;
        }
    }
};
</script>

<style lang="scss">
#menu-header {
    grid-area: header;

    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: "profile";

    position: relative;

    background: $primary;
    border-top: 2px solid $secondary;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

    z-index: 100;

    &.expanded {
        grid-template-columns: 1fr 450px;
        grid-template-areas: "profile expand";
    }

    &.stream {
        #menu-header-profile-avatar-image {
            border: 2px solid $secondary;
        }
    }
}
</style>