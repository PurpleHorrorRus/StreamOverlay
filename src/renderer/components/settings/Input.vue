<template>
    <div class="modal-item-input">
        <div v-if="text.length > 0" class="modal-item-tip">
            <span class="modal-item-tip-text" v-text="text" />
        </div>

        <input 
            v-model="mutated" 
            type="text"
            :placeholder="placeholder || text"
            @input="$emit('input', mutated)"
            @change="$emit('input', mutated)"
        >

        <div v-if="tip.length > 0" class="modal-item-tip">
            <span class="modal-item-tip-text" v-text="tip" />
        </div>
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
        value (newVal) {
            this.mutated = newVal;
        }
    },
    created () {
        this.mutated = this.value;
    }
};
</script>

<style lang="scss">
.modal-item-input {
    width: 100%;
    margin-bottom: 5px;

    input {
        width: 100%;
        padding: 10px;

        background: none;
        border: none;
        border-bottom: 1px solid $outline;
        border-radius: 0px;
        
        color: $text;
        
        outline: none;
    }
}
</style>