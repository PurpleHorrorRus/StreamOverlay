<template>
    <div class="modal-title">
        <span class="modal-title-text" v-text="title" />
    </div>
</template>
a
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
    grid-area: title;

    display: flex;
    align-items: center;

    font-size: 18px;
    font-weight: bold;

    border-bottom: 1px solid $secondary;
}
</style>