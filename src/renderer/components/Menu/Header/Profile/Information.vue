<template>
    <div id="menu-header-profile-info">
        <span id="menu-header-profile-info-name" v-text="name" />
        <span
            v-if="description"
            id="menu-header-profile-info-description"
            v-text="description"
        />
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    computed: {
        name() {
            switch(this.settings.service) {
                case this.services.twitch: return this.twitchUser.display_name;
                case this.services.trovo: return this.trovoUser.nickName;
            }

            return "";
        },

        description() {
            switch(this.settings.service) {
                case this.services.twitch: return this.twitchUser.description;
                case this.services.trovo: return this.trovoUser.info;
            }

            return "";
        }
    }
};
</script>

<style lang="scss">
#menu-header-profile-info {
    grid-area: info;

    display: flex;
    align-content: center;
    flex-wrap: wrap;

    width: 98%;

    span {
        width: 100%;
    }

    &-name {
        font-size: 26px;
    }

    &-description {
        font-size: 12px;
    }
}
</style>