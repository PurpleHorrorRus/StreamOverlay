<template>
    <div id="recent-streams">
        <div 
            v-for="(item, index) of recent" 
            :key="item.title + '' + item.game" 
            class="recent-streams-item" 
            @click="select(index)"
        >
            <span class="recent-streams-item-title" v-text="item.title" />
            <span class="recent-streams-item-game" v-text="item.game" />
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

    overflow-y: auto;

    .recent-streams-item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;

        height: max-content;

        padding: 5px;

        margin-bottom: 2px;

        &:hover, *:hover {
            cursor: pointer;
        }

        &:hover {
            background: $secondary;
        }

        &-title {
            width: 100%;

            font-size: 10pt;
        }

        &-game {
            width: 100%;
            margin-top: 5px;

            font-size: 9pt;
            color: #ccc;
        }
    }
}
</style>