<template>
    <div id="menu-header-profile-info">
        <span id="menu-header-profile-info-name" v-text="user.nickname" />
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
    mixins: [CoreMixin]
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
        font-weight: bold;
    }
}
</style>