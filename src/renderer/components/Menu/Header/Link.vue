<template>
    <nuxt-link class="menu-header-action menu-header-actions-link" :to="item.to">
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
    border-radius: 2px;

    transition: 0.3s all;
}
</style>