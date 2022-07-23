<template>
    <div class="solid-button" :class="{ disabled }">
        <span v-if="!load" class="solid-button-text" v-text="label" />
        <LoaderIcon v-else class="icon spin" />
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

        label: {
            type: String,
            required: true
        },

        disabled: {
            type: Boolean,
            required: false,
            default: false
        }
    }
};
</script>

<style lang="scss">
.solid-button {
    display: flex;
    justify-content: center;
    align-items: center;

    min-width: 100px;
    width: max-content;
    max-width: 400px;
    height: 30px;

    padding: 0px 5px 0px 5px;

    background: var(--secondary);
    border-radius: 4px;

    font-size: 9pt;
    text-align: center;

    transition: all 0.5s ease;

    &.disabled {
        cursor: not-allowed;
        background: var(--disabled);

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
            background: var(--secondary-hover);
        }
    }

    &-text {
        display: inline-block;
        color: var(--text);
    }

    .icon {
        width: 16px;
    }
}
</style>