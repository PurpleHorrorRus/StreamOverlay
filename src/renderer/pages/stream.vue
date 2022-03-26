<template>
    <div v-if="!firstLoad" id="modal-stream-container">
        <div id="modal-stream-content" class="modal-content">
            <Title id="modal-stream-content-title" title="Трансляция" />

            <img id="modal-stream-content-art-image" :src="game.icon" />
            <Edit />

            <Recent 
                v-show="recent.length > 0" 
                :recent="recent" 
            />

            <Search 
                v-if="search.length > 0" 
                :search="search"
                @select="select"
            />
        </div>
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
        Title: () => import("~/components/Menu/Title"),
        
        Edit: () => import("~/components/Menu/EditPage/Edit"),
        Recent: () => import("~/components/Recent"),
        Search: () => import("~/components/Menu/EditPage/Search"),

        LoaderIcon: () => import("~/assets/icons/loader.svg")
    },

    mixins: [CoreMixin],

    layout: "modal",

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
            switch (this.settings.service) {
                case this.services.twitch: {
                    const channel = await this.client.channel.get(this.user.id);
                    this.local.title = channel.title;
                    this.local.game = channel.game_name;
                    break;   
                }

                case this.services.trovo: {
                    const channel = await this.client.channels.get(this.user.nickName);
                    this.local.title = channel.live_title;
                    this.local.game = channel.category_name;
                    break;
                }
            }

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
        },
        
        async updateSearchResults(query) {
            this.search = await this.searchGame(query);

            const gameInSearch = this.search.find(game => {
                return game.name === query;
            });

            if (gameInSearch) {
                this.select(gameInSearch);
            }
        },

        async searchGame(query) {
            let games = [];

            switch(this.settings.service) {
                case this.services.twitch: {
                    games = await this.client.search.categories(query);
                    games = games.data || [games];
                    break;
                }

                case this.services.trovo: {
                    const response = await this.client.categories.search(query);
                    games = response.category_info;
                    break;
                }
            }

            return await Promise.map(games, async game => {
                return await this.serviceDispatch("FORMAT_GAME", game);
            });
        }
    }
};
</script>

<style lang="scss">
#modal-stream-content {
    display: grid;
    grid-template-columns: 100px 1fr 220px;
    grid-template-rows: 30px 130px 300px;
    grid-template-areas:
        "title title title"
        "art edit recent"
        "games games games";
    grid-gap: 10px;

    &-title {
        grid-area: title;
    }

    &-art {
        grid-area: art;

        &-image {
            width: 100%;
            height: 100%;
        }
    }

    &-games {
        grid-area: games;

        padding: 10px;

        margin-top: 10px;
        margin-bottom: 10px;

        overflow-x: hidden;
        overflow-y: auto;
    }
}
</style>