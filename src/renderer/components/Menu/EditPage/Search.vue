<template>
    <div id="modal-stream-content-container-games-search">
        <Game
            v-for="game of search"
            :key="game.id"
            :game="game"
            @click.native="$emit('select', game)"
        />
    </div>
</template>

<script>
import Game from "~/components/Menu/EditPage/Game";

export default {
    components: {
        Game
    },
    props: {
        search: {
            type: Array,
            required: true
        }
    }
};
</script>

<style lang="scss">
#modal-stream-content-container-games-search {
    grid-area: games;

    padding: 10px;

    margin-top: 10px;
    margin-bottom: 10px;

    overflow-x: hidden;
    overflow-y: auto;
}
</style>