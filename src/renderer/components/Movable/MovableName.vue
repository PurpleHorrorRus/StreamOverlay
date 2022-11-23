<template>
    <div class="movable-title" :class="movableTitleClass">
        <div v-if="isVisible" class="movable-title-visible" @click="turnVisible">
            <EyeIcon v-if="$parent.$parent.visible" class="icon" />
            <EyeCrossedIcon v-else class="icon" />
        </div>

        <span class="movable-title-name nowrap" v-text="$parent.$parent.name" />
    </div>
</template>

<script>
import EyeIcon from "~icons/eye.svg";
import EyeCrossedIcon from "~icons/eye-crossed.svg";

export default {
    components: {
        EyeIcon,
        EyeCrossedIcon
    },
    computed: {
        isVisible() {
            return this.$parent.$parent.visible !== undefined;
        },
        movableTitleClass() {
            return {
                widget: this.isVisible
            };
        }
    },
    methods: {
        turnVisible() {
            this.$parent.$parent.$emit("turnVisible");
        }
    }
};
</script>

<style lang="scss">
.movable-title {
    position: absolute;
    top: 0px;

    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    column-gap: 5px;

    width: 100%;

    padding: 2px;

    background: var(--secondary);

    border-radius: 4px 4px 0px 0px;

    z-index: 99;

    &.widget {
        grid-template-columns: max-content 1fr;
    }

    .icon:hover {
        cursor: pointer;
    }

    &-visible {
        display: flex;
        align-items: center;

        padding-right: 5px;

        border-right: 1px solid #000000;

        .icon {
            width: 24px;
        }
    }

    &-name {
        justify-self: center;
    }
}
</style>