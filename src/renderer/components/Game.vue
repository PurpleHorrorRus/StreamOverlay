<template>
    <div class="game clickable">
        <img class="game-image" :src="box_art_url" />
        <span class="game-name nowrap" v-text="game.name" />
    </div>
</template>

<script>
const artSize = { width: 90, height: 130 };

export default {
    props: {
        game: {
            required: true,
            type: Object
        }
    },
    computed: {
        box_art_url() {
            return this.$parent.resizeArt(this.game.box_art_url, artSize);
        }
    }
};
</script>

<style lang="scss">
.game {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    column-gap: 10px;

    width: 100%;
    height: 60px;

    padding: 10px;

    &-image {
        height: 40px;
    }
}
</style>