<template>
    <div class="service clickable">
        <CheckIcon v-if="service.active" class="icon" />
        <img :src="service.image" class="service-image">
        <span class="service-name" v-text="service.name" />
    </div>
</template>

<script>
export default {
    components: {
        CheckIcon: () => import("~/assets/icons/check.svg")
    },
    props: {
        service: {
            type: Object,
            required: true
        }
    }
};
</script>

<style lang="scss">
.service {
    display: flex;
    align-content: center;
    align-items: center;
    column-gap: 10px;

    padding: 10px;

    &-image {
        width: 36px;
        height: 36px;
    }
}
</style>