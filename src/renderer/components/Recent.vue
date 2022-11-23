<template>
    <div id="recent-streams">
        <div
            v-for="(item, index) of recent"
            :key="item.title + '' + item.game"
            class="recent-streams-item clickable"
            @click="select(index)"
        >
            <span class="recent-streams-item-title" v-text="item.title" />
            <span class="recent-streams-item-game small-text" v-text="item.game" />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        recent: {
            type: Array,
            required: true
        }
    },

    methods: {
        select(index) {
            this.$parent.local.title = this.recent[index].title;
            this.$parent.local.game = this.recent[index].game;
            this.$parent.update();
        }
    }
};
</script>

<style lang="scss">
#recent-streams {
    grid-area: recent;

    padding: 5px;

    overflow-y: auto;

    .recent-streams-item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        row-gap: 5px;

        height: max-content;

        padding: 5px;

        margin-bottom: 2px;

        &-title, &-game {
            width: 100%;
        }

        &-title {
            font-size: 12px;
        }
    }
}
</style>