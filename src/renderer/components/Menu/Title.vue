<template>
    <div class="modal-title">
        <span class="modal-title-text" v-text="title" />
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            required: true
        }
    }
};
</script>

<style lang="scss">
.modal-title {
    padding-top: 3px;

    font-size: 14pt;
    font-weight: bold;

    border-bottom: 1px solid $secondary;
}
</style>