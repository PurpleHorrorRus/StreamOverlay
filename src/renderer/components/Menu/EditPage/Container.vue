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
import Promise from "bluebird";

import CoreMixin from "~/mixins/core";

let updateSearchResultsDebounce = null;

export default {
    components: {
        Edit: () => import("~/components/Menu/EditPage/Edit"),
        Recent: () => import("~/components/Recent"),
        Search: () => import("~/components/Menu/EditPage/Search")
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
            return this.local.title.length === 0 || this.local.game.length === 0;
        }
    },

    watch: {
        "local.game": function(game) {
            if (!this.firstLoad && game !== this.game.name) {
                if (game.length === 0) {
                    this.search = [];
                    return;
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
            this.game = game;
            this.local.game = game.name;
            return true;
        },
        
        async updateSearchResults(query) {
            this.search = await this.searchGame(query);

            const gameInSearch = this.search.find(game => {
                return game.name === query;
            });

            return gameInSearch
                ? this.select(gameInSearch)
                : false;
        },

        async searchGame(query) {
            const games = await this.serviceDispatch("SEARCH_GAME", query);

            return await Promise.map(games, async game => {
                return await this.serviceDispatch("FORMAT_GAME", game);
            });
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