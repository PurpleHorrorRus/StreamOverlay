<template>
    <div id="modal-stream-content-games-search">
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
#modal-stream-content-games-search {
    grid-area: games;

    border-top: 1px solid $outline;

    overflow-y: auto;
}
</style>