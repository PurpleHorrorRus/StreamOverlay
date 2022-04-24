<template>
    <div id="menu-header-profile-info-name">
        <img id="menu-header-profile-info-name-service" :src="`/images/${service}.png`">
        <span id="menu-header-profile-info-name" v-text="user.nickname" />
    </div>
</template>

<script>
export default {

};
</script>

<style lang="scss">
#menu-header-profile-info-name {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    column-gap: 5px;

    &-service {
        width: 36px;
    }
}
</style>