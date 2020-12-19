<template>
    <div class="setting-item">
        <span class="setting-item-name" v-text="text" />

        <VueToggleButton 
            ref="toggle-button"
            :value="checked" 
            :height="25"
            @change="$emit('change')" 
        />

        <div v-if="tip.length > 0" class="modal-item-tip">
            <span class="modal-item-tip-text" v-text="tip" />
        </div>
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

    margin-bottom: 10px;
}
</style>