<template>
    <div id="menu-header-profile">
        <Avatar />
        <Information />
    </div>
</template>

<script>
export default {
    components: {
        Avatar: () => import("./Profile/Avatar.vue"),
        Information: () => import("./Profile/Information")
    }
};
</script>

<style lang="scss">
#menu-header-profile {
    grid-area: profile;

    display: grid;
    grid-template-columns: 150px 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: "avatar info";

    padding-right: 30px;
}
</style>