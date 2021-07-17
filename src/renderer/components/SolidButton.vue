<template>
    <div class="solid-button" :class="{ disabled }" @click.stop="click">
        <div v-if="!load" class="solid-button-text">
            <FontAwesomeIcon v-if="icon.length > 0" class="solid-button-text-icon" :icon="icon" />
            <span class="solid-button-text-label" v-text="label" />
        </div>

        <FontAwesomeIcon v-else icon="circle-notch" spin />
    </div>
</template>

<script>
export default {
    props: {
        load: {
            type: Boolean,
            required: false,
            default: false
        },
        icon: {
            type: Array,
            required: false,
            default: () => []
        },
        label: {
            type: String,
            required: true
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    methods: {
        click() {
            if (!this.load && !this.disabled) {
                this.$emit("clicked");
            }
        }
    }
};
</script>

<style lang="scss">
.solid-button {
    display: block;
    min-width: 60px;
    width: max-content;
    max-width: 400px;
    height: 30px;

    padding: 8px;

    background: $secondary;
    border-radius: 5px;

    font-size: 9pt;
    text-align: center;

    transition: all 0.5s ease;

    &.disabled {
        cursor: not-allowed;
        background: $disabled;

        * {
            &:hover {
                cursor: not-allowed;
            }
        }
    }

    &:not(.disabled) {
        span {
            cursor: pointer;
        }

        &:hover {
            cursor: pointer;
            background: $secondary-hover;
        }
    }

    &-text {
        &-icon, &-label {
            display: inline-block;
            color: $text;
        }
    }
}
</style>