<template>
    <div v-if="!firstLoad" id="modal-stream-content-container">
        <img id="modal-stream-content-container-art-image" :src="game.icon" />
        <Edit />
        <Recent v-show="recent.length > 0" :recent="recent" />
        <Search
            v-if="search.length > 0"
            :search="search"
            @select="select"
        />
    </div>

    <LoaderIcon v-else class="modal-load icon spin" />
</template>

<script>
import { mapState } from "vuex";
import { debounce } from "lodash";

import CoreMixin from "~/mixins/core";

let updateSearchResultsDebounce = null;

export default {
    components: {
        Edit: () => import("./Edit.vue"),
        Recent: () => import("~/components/Recent"),
        Search: () => import("./Search.vue")
    },

    mixins: [CoreMixin],

    data: () => ({
        firstLoad: true,
        loading: false,

        game: null,
        search: [],

        local: {
            title: "",
            game: ""
        }
    }),

    computed: {
        ...mapState({
            recent: state => state.config.recent
        }),

        disabled() {
            return this.local.title.length === 0
                || this.local.game.length === 0
                || this.loading;
        }
    },

    watch: {
        "local.game": function(game) {
            if (!this.firstLoad && game !== this.game.name) {
                if (game.length === 0) {
                    this.search = [];
                    return this.select(null);
                }

                updateSearchResultsDebounce(game);
            }
        }
    },

    async created() {
        await this.fetch();

        updateSearchResultsDebounce = debounce(game => {
            return this.updateSearchResults(game);
        }, 200);

        this.firstLoad = false;
    },

    methods: {
        async fetch() {
            this.local = await this.serviceDispatch("GET_STREAM");
            return await this.updateSearchResults(this.local.game);
        },

        async update() {
            this.loading = true;
            await this.serviceDispatch("UPDATE", this.local);
            this.loading = false;
        },

        select(game) {
            game = game || {
                icon: "https://static-cdn.jtvnw.net/ttv-boxart/66082-100x130.jpg",
                name: this.local.game
            };

            this.game = game;
            this.local.game = game.name;

            return true;
        },

        async updateSearchResults(query) {
            const categories = await this.serviceDispatch("SEARCH_GAME", query);

            this.select(categories.game);
            this.search = categories.list;

            return Boolean(this.game);
        }
    }
};
</script>

<style lang="scss">
#modal-stream-content-container {
    display: grid;
    grid-template-columns: 100px 1fr 220px;
    grid-template-rows: 130px 300px;
    grid-template-areas:
        "art edit recent"
        "games games games";
    gap: 10px;

    &-art {
        grid-area: art;

        &-image {
            width: 100%;
            height: 100%;
        }
    }
}
</style>