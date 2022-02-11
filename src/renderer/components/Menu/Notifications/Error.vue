<template>
    <span class="modal-item-notification modal-item-error" v-text="error" />
</template>

<script>
export default {
    props: {
        error: {
            type: [String, Error],
            required: true
        }
    }
};
</script>

<style lang="scss">
.modal-item-error {
    background: #d30505;

    color: #ffffff;
}
</style>