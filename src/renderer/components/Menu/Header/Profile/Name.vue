<template>
    <div id="menu-header-profile-info-name">
        <img
            id="menu-header-profile-info-name-service"
            :src="`./images/${config.settings.service}.png`"
        >

        <span
            id="menu-header-profile-info-name-text"
            v-text="user.nickname"
        />
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin]
};
</script>

<style lang="scss">
#menu-header-profile-info-name {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    column-gap: 5px;

    &-service {
        height: 32px;
    }

    &-text {
        font-size: 22px;
        font-weight: bold;
    }
}
</style>