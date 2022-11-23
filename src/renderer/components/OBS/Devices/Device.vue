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
#obs-content.mini .device {
    border: none;

    width: 35px;
    height: 35px !important;

    padding: 0px;

    background: none;

    &.disabled .icon path {
        fill: #be1414;
    }

    &.highlight:not(.disabled) .icon path {
        fill: #84ff84;
    }

    .icon {
        height: 65%;
    }
}

.device {
    display: flex;
    justify-content: center;
    align-content: center;

    width: 35px;
    height: 35px !important;

    @include obs-item;

    border-width: 1px;
    border-style: solid;

    transition: border-color .1s ease-in-out;

    &.disabled {
        border-color: #740a0a;
    }

    &.highlight:not(.disabled) {
        border-color: #84ff84;
    }

    .icon {
        width: auto;
        height: 75%;
    }
}
</style>