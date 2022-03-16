<template>
    <nuxt-link class="menu-header-action menu-header-actions-link clickable" :to="item.to">
        <span class="menu-header-actions-link-title" v-text="item.title" />
    </nuxt-link>
</template>

<script>
export default {
    props: {
        item: {
            type: Object,
            required: true
        }
    }
};
</script>

<style lang="scss">
.menu-header-actions-link {
    display: block;

    width: 100%;
    height: 30px;

    padding: 5px;

    border-radius: 2px;

    text-decoration: none;
    transition: 0.3s all;
}
</style>