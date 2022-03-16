<template>
    <div id="menu-header-profile-info">
        <span id="menu-header-profile-info-name" v-text="user.display_name" />
        <span
            v-if="user.description"
            id="menu-header-profile-info-description"
            v-text="user.description"
        />
    </div>
</template>

<script>
import TwitchMixin from "~/mixins/twitch";

export default {
    mixins: [TwitchMixin]
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