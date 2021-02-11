<template>
    <div id="modal-stream-container">
        <div id="modal-stream-content">
            <div class="modal-title">
                <span class="modal-title-text" v-text="'Трансляция'" />
            </div>
            <div id="game-art">
                <img class="game-art-image" :src="art">
            </div>
            <div id="edit">
                <Input 
                    :value="local.title"
                    :placeholder="'Название трансляции'" 
                    @input="changeTitle" 
                    @keypress.enter.native="update"
                />
                <Input 
                    :value="local.game" 
                    :placeholder="'Название игры'" 
                    @input="changeGame" 
                    @keypress.enter.native="update"
                />
                <SolidButton
                    :label="'Обновить'"
                    :disabled="disabled"
                    :load="loading"
                    @clicked="update"
                />
            </div>
        </div>
        <div v-show="show_autocomplete" id="autocomplete-container">
            <div id="filtered-top">
                <Game 
                    v-for="game of filteredTopGames" 
                    :key="game.id" 
                    :game="game" 
                    @click.native="select(game)" 
                />
            </div>
            <div v-if="search.length > 0" id="search-categories">
                <Game 
                    v-for="game of search" 
                    :key="game.id" 
                    :game="game" 
                    @click.native="select(game)" 
                />
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

import Input from "~/components/settings/Input";
import Game from "~/components/Game";
import SolidButton from "~/components/SolidButton";

export default {
    layout: "modal",
    components: { 
        Game,
        Input,
        SolidButton
    },
    async asyncData ({ store }) {
        const { helix, stream } = store.state.twitch;
        const game = await helix.getGame(stream.game);
        const top_games = await helix.getTopGames();

        const art_size = {
            width: 90,
            height: 115
        };

        const art = game 
            ? game.box_art_url
            : "https://static-cdn.jtvnw.net/ttv-static/404_boxart-75x115.jpg";

        return { 
            art_size,
            local: { 
                title: stream.title, 
                game: stream.game 
            },
            games: top_games,
            search: [],
            input_delay: null,
            art,
            top_games, 
            show_autocomplete: false, 
            reset: true,
            loading: false, 
            success: false, 
            error: "" 
        };
    },
    computed: {
        ...mapState({
            user: state => state.twitch.user,
            helix: state => state.twitch.helix
        }),
        empty () {
            return this.resizeArt("https://static-cdn.jtvnw.net/ttv-static/404_boxart-{width}x{height}.jpg");
        },
        filteredTopGames () {
            if (!this.local.game.length) {
                return this.top_games;
            }

            return this.top_games.filter(r => 
                ~r.name.toLowerCase()
                    .indexOf(this.local.game.toLowerCase()));
        },
        disabled () {
            return this.local.title.length === 0 || this.local.game.length === 0;
        }
    },
    watch: {
        art: function (newVal) {
            this.art = this.resizeArt(newVal);
        },
        "local.game": async function (newVal) {
            // eslint-disable-next-line max-len
            this.art = this.empty;

            if (this.input_delay) {
                clearTimeout(this.input_delay);
                this.input_delay = null;
            }

            if (!this.show_autocomplete) {
                this.show_autocomplete = true;
            }

            if (newVal.length === 0) {
                this.search = [];
                this.top_games = this.games;
                return;
            } else if (
                this.findCache(this.games, this.local.game) || 
                this.findCache(this.search, this.local.game
                )) return;

            this.input_delay = setTimeout(async () => {
                const { data: games } = await this.helix.searchCategories(newVal);
                if (games && games.length) {
                    this.search = games;
                    this.findCache(this.search, this.local.game);
                }
            }, 200);
        }
    },
    mounted () {
        this.art = this.resizeArt(this.art);
    },
    methods: {
        ...mapActions({ 
            updateStream: "twitch/UPDATE" 
        }),
        findCache (array, game) {
            const index = array.map(g => g.name).indexOf(game);

            if (~index) {
                const game = array[index];
                this.show_autocomplete = false;
                this.art = game.box_art_url;
            }

            return index !== -1;
        },
        resizeArt (art) {
            return art.replace("{width}", this.art_size.width)
                .replace("{height}", this.art_size.height)
                .replace("52x72", `${this.art_size.width}x${this.art_size.height}`);
        },
        changeTitle (value) {
            this.local.title = value;
        },
        changeGame (value) {
            this.local.game = value;
        },
        select (game) {
            this.local.game = game.name;
            setTimeout(() => this.show_autocomplete = false, 300);
        },
        async update () {
            if (this.disabled) {
                return;
            }

            this.reset = false;
            this.loading = true;
            this.error = "";

            this.success = await this.updateStream({ 
                title: this.local.title, 
                game: this.local.game 
            });

            this.loading = false;
            setTimeout(() => {
                this.success = false;
                this.reset = true;
            }, 2 * 1000);
        }
    }
};
</script>

<style lang="scss">
#modal-stream-container {
    grid-template-columns: 1fr;
    grid-template-rows: 210px 300px;
    grid-template-areas: "content"
                        "games";

    width: 100%;

    #modal-stream-content {
        grid-area: content;
        display: grid;

        grid-template-columns: 110px 1fr;
        grid-template-rows: 1fr;
        grid-template-areas: 
            "title title"
            "art edit";

        .modal-title {
            grid-area: title;
        }

        #game-art {
            grid-area: art;

            padding: 10px;

            &-image {
                width: 100%;
                height: 100%;
            }
        }

        #edit {
            grid-area: edit;

            display: flex;
            justify-content: flex-end;
            align-content: center;
            flex-wrap: wrap;

            padding-left: 10px;
            padding-right: 10px;
        }
    }

    #autocomplete-container {
        grid-area: games;

        max-height: 300px;

        margin-top: 10px;

        overflow-y: auto;

        #search-categories {
            border-top: 1px solid rgb(41, 41, 41);
        }
    }
}
</style>