<template>
    <div class="modal-body-category">
        <span class="modal-body-category-label" v-text="name" />
        <slot />
    </div>
</template>

<script>
export default {
    props: {
        name: {
            type: String,
            required: true
        }
    }
};
</script>

<style lang="scss">
.modal-body-category {
    display: block;

    margin: 0px 0px 20px 0px;
    padding: 10px;

    background: #101010;
    border-radius: 4px;

    &-label {
        display: block;

        padding: 0px 10px 10px 0px;

        font-size: 16px;
    }
}
</style>