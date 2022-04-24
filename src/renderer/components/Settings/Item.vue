<template>
    <div class="setting-item" :class="{ checked, unchecked: !checked }">
        <div class="setting-item-block">
            <span class="setting-item-block-name" v-text="text" />

            <VueToggleButton ref="toggle-button" :value="checked" :height="25" @change="$emit('change')" />
        </div>

        <span 
            v-if="tip.length > 0" 
            class="modal-item-tip" 
            v-text="tip" 
        />
    </div>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            required: true,
            default: "Не задано"
        },

        checked: {
            type: Boolean,
            required: false,
            default: false
        },

        tip: {
            type: String,
            required: false,
            default: ""
        }
    }
};
</script>

<style lang="scss">
.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-content: center;
    flex-wrap: wrap;

    margin-bottom: 10px;

    &-block {
        display: flex;
        justify-content: space-between;

        width: 100%;
    }

    &.checked {
        .v-switch-core {
            background-color: $secondary !important;
        }
    }

    &.unchecked {
        .v-switch-core {
            background-color: #242424 !important;
        }
    }
}
</style>