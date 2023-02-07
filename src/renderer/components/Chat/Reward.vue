<template>
    <div class="message-reward">
        <img
            class="message-reward__image"
            :src="image"
        >

        <span
            class="message-reward__cost"
            v-text="`(${$parent.message.reward.cost})`"
        />

        <span
            class="message-reward__title"
            v-text="$parent.message.reward.title"
        />
    </div>
</template>

<script>
export default {
    computed: {
        image() {
            return this.$parent.message.reward.image?.url_1x
                || this.$parent.message.reward.default_image.url_1x;
        }
    }
};
</script>

<style lang="scss">
.message-reward {
    display: inline;

    vertical-align: middle;

    > * {
        vertical-align: middle;
    }
}
</style>