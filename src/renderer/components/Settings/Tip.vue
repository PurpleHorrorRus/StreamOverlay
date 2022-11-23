<template>
    <div class="modal-item-tip">
        <span class="modal-item-tip-text" v-text="text" />
    </div>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            required: true,
            default: "Не задано"
        }
    }
};
</script>