<template>
    <span
        :style="$parent.textStyle"
        class="text stroke"
        v-text="data"
    />
</template>

<script>
export default {
    props: {
        data: {
            type: String,
            required: true
        }
    }
};
</script>