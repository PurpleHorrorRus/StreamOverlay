<template>
    <Movable
        id="viewers-list"
        :source="settings.ViewersList"
        name="Список зрителей"
        @onDrag="onDrag"
        @onResize="onResize"
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
import Movable from "~/components/Movable";
import ViewersListCategory from "~/components/ViewersList/Category";
import LoaderIcon from "~/assets/icons/loader.svg";

import CoreMixin from "~/mixins/core";

let interval = null;

export default {
    components: { 
        Movable,
        ViewersListCategory,
        LoaderIcon
    },
    
    mixins: [CoreMixin],

    data: () => ({
        loading: true,
        chatters: {}
    }),

    async created() {
        this.loading = true;
        await this.get();
        interval = setInterval(() => this.get(), 15 * 1000);
        this.loading = false;
    },

    beforeDestroy() {
        this.exit();
    },
    
    destroyed() {
        this.exit();
    },

    methods: {
        async get() {
            let chatters = await this.serviceDispatch("CHATTERS");

            Object.keys(chatters).forEach(category => {
                if (chatters[category].length === 0) {
                    delete chatters[category];
                }
            });
            
            this.chatters = chatters;
        },

        onResize(x, y, width, height) {
            this.settings.ViewersList.width = width;
            this.settings.ViewersList.height = height;
            this.onDrag(x, y);
        },

        onDrag(x, y) {
            this.settings.ViewersList.x = x;
            this.settings.ViewersList.y = y;
            this.save();
        },

        exit() {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }
    }
};
</script>

<style lang="scss">
#viewers-list {
    position: absolute;

    width: 100%;
    height: 100%;

    background: $backdrop !important;
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