<template>
    <Movable
        id="viewers-list"
        :source="settings.ViewersList"
        name="Список зрителей"
        class="movable-slot"
    >
        <div v-if="!loading" id="viewers-list-categories">
            <ViewersListCategory
                v-for="category of Object.keys(chatters)"
                :key="category"
                :name="category"
                :users="chatters[category]"
            />
        </div>

        <div v-else id="loading-block">
            <LoaderIcon class="icon spin" />
        </div>
    </Movable>
</template>

<script>

import CoreMixin from "~/mixins/core";

let interval = null;
let timeout = null;

export default {
    components: {
        ViewersListCategory: () => import("~/components/ViewersList/Category")
    },

    mixins: [CoreMixin],

    data: () => ({
        loading: true,
        chatters: {}
    }),

    async created() {
        interval = setInterval(() => this.get(), 15 * 1000);
    },

    mounted() {
        timeout = setTimeout(async () => {
            await this.get();
            this.loading = false;
        }, 1000);
    },

    beforeDestroy() {
        clearTimeout(timeout);
        clearInterval(interval);
        interval = null;
    },

    methods: {
        async get() {
            this.chatters = await this.serviceDispatch("CHATTERS");
        },

        onResize(x, y, width, height) {
            this.config.settings.ViewersList.width = width;
            this.config.settings.ViewersList.height = height;
            this.onDrag(x, y);
        },

        onDrag(x, y) {
            this.config.settings.ViewersList.x = x;
            this.config.settings.ViewersList.y = y;
            this.save();
        }
    }
};
</script>

<style lang="scss">
#viewers-list {
    position: absolute;

    width: 100%;
    height: 100%;

    background: var(--backdrop) !important;
    border-radius: 3px;
    z-index: 50;

    &-categories {
        width: 100%;
        height: 100%;

        padding: 5px;

        overflow-x: hidden;
        overflow-y: auto;
    }

    #loading-block {
        display: flex;
        align-content: center;
        justify-content: center;
        margin-top: 20px;
    }
}
</style>