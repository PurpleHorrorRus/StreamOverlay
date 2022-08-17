<template>
    <div class="device" :class="deviceClass">
        <Component :is="icon" class="icon" />
    </div>
</template>

<script>
export default {
    props: {
        icon: {
            type: Object,
            required: true
        },

        disabled: {
            type: Boolean,
            required: true
        }
    },

    computed: {
        deviceClass() {
            return {
                disabled: this.disabled
            };
        }
    }
};
</script>

<style lang="scss">
.device {
    display: flex;
    justify-content: center;
    align-content: center;

    width: 35px;
    height: 35px !important;

    @include obs-item;

    transition: border .1s ease-in-out;

    &.disabled {
        border: 1px solid #740a0a;
    }

    .icon {
        width: auto;
        height: 75%;
    }
}
</style>