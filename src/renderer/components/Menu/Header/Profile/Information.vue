<template>
    <div id="menu-header-profile-info">
        <HeaderProfileName />
        <span
            v-if="user.description"
            id="menu-header-profile-info-description"
            class="small-text"
            v-text="user.description"
        />
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    components: {
        HeaderProfileName: () => import("~/components/Menu/Header/Profile/Name")
    },

    mixins: [CoreMixin]
};
</script>

<style lang="scss">
#menu-header-profile-info {
    grid-area: info;

    display: flex;
    flex-direction: column;
    align-self: center;
    row-gap: 5px;
}
</style>