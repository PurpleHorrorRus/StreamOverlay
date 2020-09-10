<template>
    <div class="modal-title">
        <span class="modal-title-text" v-text="text" />
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
}
</script>

<style>

</style>