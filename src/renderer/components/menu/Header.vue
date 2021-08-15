<template>
    <div id="menu-header" :class="{ stream: streaming, expanded }">
        <div id="menu-header-profile">
            <div id="menu-header-profile-avatar">
                <img id="menu-header-profile-avatar-image" :src="user.profile_image_url">
                <span v-if="streaming" id="menu-header-profile-avatar-stream" v-text="'В ЭФИРЕ'" />
            </div>
            <div id="menu-header-profile-info">
                <span id="menu-header-profile-info-name" v-text="user.display_name" />
                <span v-if="user.description" id="menu-header-profile-info-description" v-text="user.description" />
            </div>

            <FontAwesomeIcon
                v-if="connected && tags"
                id="menu-header-profile-expand-icon"
                v-tooltip="'Действия'"
                class="icon clickable"
                :icon="['fas', !expanded ? 'angle-left' : 'angle-right']"
                @click="expanded = !expanded"
            />
        </div>

        <div v-if="expanded" id="menu-header-expand">
            <Toggles />
            <Actions />
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

import TwitchMixin from "~/mixins/twitch";
import OBSMixin from "~/mixins/obs";

import Toggles from "~/components/menu/header/Toggles";
import Actions from "~/components/menu/header/Actions";

export default {
    components: {
        Actions,
        Toggles
    },
    mixins: [TwitchMixin, OBSMixin],
    data: () => ({
        expanded: false
    }),
    computed: {
        ...mapState({
            connected: state => state.twitch.connected,
            tags: state => state.twitch.tags
        })
    },
    watch: {
        connected(newVal) {
            if (!newVal && this.expanded) {
                this.expanded = false;
            }
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

    background: $primary;
    border-top: 2px solid $secondary;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

    &.expanded {
        grid-template-columns: 1fr 450px;
        grid-template-areas: "profile expand";

        #menu-header-expand {
            grid-area: expand;

            display: grid;
            grid-template-columns: 2fr 1fr;
            grid-template-rows: 1fr;
            grid-template-areas: "toggles actions";
        }
    }

    &.stream {
        #menu-header-profile-avatar-image {
            border: 2px solid $secondary;
        }
    }

    &-profile {
        grid-area: profile;

        display: grid;
        grid-template-columns: 150px 1fr;
        grid-template-rows: 1fr;
        grid-template-areas: "avatar info";

        position: relative;

        &-avatar {
            grid-area: avatar;

            position: relative;

            display: flex;
            justify-content: center;
            align-content: center;
            align-items: center;

            &-image {
                width: 100px;
                height: 100px;

                border-radius: 100px;
            }

            &-stream {
                position: absolute;
                bottom: 30px;
                left: 45px;

                padding: 5px;

                border-radius: 5px;

                background: $secondary;

                font-size: 9pt;
            }
        }

        &-info {
            grid-area: info;

            display: flex;
            align-content: center;
            flex-wrap: wrap;

            width: 98%;

            span {
                width: 100%;
            }

            &-name {
                font-size: 18pt;
            }

            &-description {
                font-size: 9pt;
            }
        }

        &-expand-icon {
            position: absolute;
            top: 15px;
            right: 15px;
        }
    }
}
</style>