<template>
    <div id="menu-header-profile-expand-expanded">
        <Toggles />
        <Actions />
    </div>
</template>

<script>
export default {
    components: {
        Toggles: () => import("~/components/Menu/Header/Toggles"),
        Actions: () => import("~/components/Menu/Header/Actions")
    }
};
</script>

<style lang="scss">
#menu-header-profile-expand-expanded {
    grid-area: expand;

    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: "toggles actions";
}
</style>