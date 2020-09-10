<template>
    <div class="next-button">
        <span v-if="!loading" class="next-button-icon">Далее</span>
        <font-awesome-icon v-else id="viewers_count" :icon="['fas', 'circle-notch']" class="fa-spin" />
    </div>
</template>

<script>
export default {
    props: {
        loading: {
            type: Boolean,
            required: false,
            default: false
        }
    }
};
</script>

<style lang="scss">
.next-button {
    border: 1px solid white;
    border-radius: 5px;
    padding: 10px;
    float: right;
    position: relative;
    top: 10px;
    right: 0%;

    &:hover {
        cursor: pointer;
        border: 1px solid $outline;
    }
}
</style>