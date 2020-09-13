<template>
    <div class="modal-item">
        <div class="modal-item-tip">
            <span class="modal-item-tip-text" v-text="text" />
        </div>
        <input 
            v-model="mutated" 
            type="text"
            :placeholder="text"
            @input="$emit('input', mutated)"
        >
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
            required: true
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
    mounted () {
        this.mutated = this.value;
    }
};
</script>