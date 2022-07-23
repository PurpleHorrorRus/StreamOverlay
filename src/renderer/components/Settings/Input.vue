<template>
    <div class="modal-item-input" :class="{ disabled }">
        <input
            v-model="mutated"
            class="modal-item-input-field"
            type="text"
            :placeholder="placeholder || text"
            :disabled="disabled"
            :maxlength="maxLength"
            @input="$emit('input', mutated)"
            @change="$emit('input', mutated)"
        >

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
        value: {
            type: [String, Number],
            required: false,
            default: ""
        },

        text: {
            type: String,
            required: false,
            default: ""
        },

        placeholder: {
            type: String,
            required: false,
            default: ""
        },

        disabled: {
            type: Boolean,
            required: false,
            default: false
        },

        maxLength: {
            type: Number,
            required: false,
            default: Infinity
        },

        tip: {
            type: String,
            required: false,
            default: ""
        }
    },

    data: () => ({
        mutated: ""
    }),

    watch: {
        value(newVal) {
            this.mutated = newVal;
        }
    },

    created() {
        this.mutated = this.value;
    }
};
</script>

<style lang="scss">
.modal-item-input {
    width: 100%;
    margin-bottom: 5px;

    &-field {
        width: 100%;
        padding: 10px;

        background: #212121;
        border: none;
        border-bottom: 2px solid #212121;
        
        border-radius: 4px;

        color: var(--text);

        outline: none;

        &:focus {
            border-bottom: 2px solid var(--secondary);
        }
    }
}
</style>