<template>
    <div class="device">
        <Component :is="icon" class="icon" />
    </div>
</template>

<script>
export default {
    props: {
        icon: {
            type: Object,
            required: true
        }
    }
};
</script>

<style lang="scss">
.device {
    display: flex;
    justify-content: center;
    align-content: center;

    width: 30px;

    @include obs-item;

    &.disabled {
        border: 1px solid #740a0a;
    }
}
</style>