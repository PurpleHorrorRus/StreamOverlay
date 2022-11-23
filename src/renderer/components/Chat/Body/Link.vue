<template>
    <span
        v-tooltip="'Нажмите, чтобы перейти по ссылке'"
        :style="$parent.textStyle"
        class="text link stroke"
        @click="openLink(data.link)"
        v-text="data.domain"
    />
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
            required: true
        }
    }
};
</script>

<style lang="scss">
.text.link {
    color: #0077ff;
    cursor: pointer;
}
</style>