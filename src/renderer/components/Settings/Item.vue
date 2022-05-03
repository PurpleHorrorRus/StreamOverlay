<template>
    <div class="setting-item" :class="toggleButtonClass">
        <div class="setting-item-block">
            <span 
                class="setting-item-block-name" 
                v-text="text" 
            />

            <ToggleButton 
                :value="checked" 
                :height="25" 
                @change="$emit('change')" 
            />
        </div>

        <span 
            v-if="tip.length > 0" 
            class="modal-item-tip" 
            v-text="tip" 
        />
    </div>
</template>

<script>
import { ToggleButton } from "vue-js-toggle-button";

export default {
    components: {
        ToggleButton
    },

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
    },

    computed: {
        toggleButtonClass() {
            return { 
                checked: this.checked
            };
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

    &:not(.checked) {
        .v-switch-core {
            background-color: #242424 !important;
        }
    }
}
</style>