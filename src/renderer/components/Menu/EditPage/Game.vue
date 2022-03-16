<template>
    <div class="game clickable">
        <img class="game-image" :src="game.icon" />
        <span class="game-name nowrap" v-text="game.name" />
    </div>
</template>

<script>
export default {
    props: {
        game: {
            required: true,
            type: Object
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