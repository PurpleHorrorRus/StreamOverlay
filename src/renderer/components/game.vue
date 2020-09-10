<template>
    <div class="game">
        <img class="game-image" :src="box_art_url">
        <span class="game-name" v-text="game.name" />
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

<style>
.game {
    display: block;
    width: 100%;
    height: 60px;
    padding: 10px;
}

.game:hover {
    background: rgba(255, 255, 255, .1);
    cursor: pointer;
}

.game-image {
    display: inline-block;
    vertical-align: middle;
    width: 30px;
}

.game-name {
    display: inline-block;
    width: 85%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    vertical-align: middle;
    margin-left: 10px;
    margin-right: 10px;
}
</style>