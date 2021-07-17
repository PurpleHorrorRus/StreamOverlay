<template>
    <div id="menu-header" :class="{ stream: streaming }">
        <div id="menu-header-avatar">
            <img id="menu-header-avatar-image" :src="user.profile_image_url">
            <span v-if="streaming" id="menu-header-avatar-stream" v-text="'В ЭФИРЕ'" />
        </div>
        <div id="menu-header-info">
            <span id="menu-header-info-name" v-text="user.display_name" />
            <span v-if="user.description" id="menu-header-info-description" v-text="user.description" />
        </div>
        <Actions />
    </div>
</template>

<script>
import TwitchMixin from "~/mixins/twitch";
import OBSMixin from "~/mixins/obs";

import Actions from "~/components/menu/header/Actions";

export default {
    components: {
        Actions
    },
    mixins: [TwitchMixin, OBSMixin]
};
</script>

<style lang="scss">
#menu-header {
    grid-area: header;

    display: grid;
    grid-template-columns: 150px 1fr 160px;
    grid-template-rows: 1fr;
    grid-template-areas: "avatar info actions";

    background: $primary;
    border-top: 2px solid $secondary;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

    &.stream {
        #menu-header-avatar-image {
            border: 2px solid $secondary;
        }
    }

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

        span {
            width: 100%;
        }

        &-name {
            font-size: 14pt;
        }

        &-description {
            font-size: 9pt;
        }
    }
}
</style>