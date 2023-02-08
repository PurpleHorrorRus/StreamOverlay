<template>
    <img
        v-tooltip="data.name"
        class="emoticon"
        :style="emoticionStyle"
        :src="data.url"
    />
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
            required: true
        }
    },

    computed: {
        emoticionStyle() {
            return {
                height: `${this.$parent.config.settings.chat.font + 16}px`
            };
        }
    }
};
</script>

<style lang="scss">
.emoticon {
    position: relative;
    bottom: 1px;

    display: inline;

    vertical-align: middle;

    cursor: default;
}
</style>