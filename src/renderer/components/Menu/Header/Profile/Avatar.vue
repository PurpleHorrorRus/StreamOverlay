<template>
    <div id="menu-header-profile-avatar">
        <img
            id="menu-header-profile-avatar-image"
            :src="avatar"
        />

        <span
            v-if="streaming"
            id="menu-header-profile-avatar-stream"
            v-text="'В ЭФИРЕ'"
        />
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";
import OBSMixin from "~/mixins/obs";

export default {
    mixins: [CoreMixin, OBSMixin],

    computed: {
        avatar() {
            switch(this.settings.service) {
                case this.services.twitch: return this.twitchUser.profile_image_url;
                case this.services.trovo: return this.trovoUser.profilePic;
            }

            return "";
        }
    }
};
</script>

<style lang="scss">
#menu-header-profile-avatar {
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

        font-size: 12px
    }
}
</style>