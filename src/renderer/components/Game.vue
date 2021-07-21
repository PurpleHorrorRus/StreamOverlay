<template>
    <div class="game clickable">
        <img class="game-image" :src="box_art_url">
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
    },
    computed: {
        box_art_url() {
            return this.game.box_art_url.replace("{width}", 90).replace("{height}", 130);
        }
    }
};
</script>

<style lang="scss">
.game {
    display: flex;
    justify-content: start;
    align-items: center;

    width: 100%;
    height: 60px;

    padding: 10px;

    &:hover {
        cursor: pointer;
        background: $secondary;
    }

    &-image {
        display: inline-block;
        width: 30px;

        vertical-align: middle;
    }

    &-name {
        display: inline-block;
        width: 85%;

        margin-left: 10px;
        margin-right: 10px;
    }
}
</style>