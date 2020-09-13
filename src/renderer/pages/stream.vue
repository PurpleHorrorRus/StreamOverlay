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
                    text="Название трансляции" 
                    @input="changeLocal('title')" 
                    @keypress.enter.native="updateStream"
                />
                <Input 
                    :value="local.game" 
                    text="Название игры" 
                    @input="changeGame" 
                    @keypress.enter.native="updateStream"
                />
                <button id="rename-stream" @click="updateStream">
                    <div v-if="!loading">
                        <span
                            v-if="success || reset"
                            v-text="'Обновить'"
                        />
                        <font-awesome-icon
                            v-else 
                            :icon="['fas', 'times']" style="color: red"
                        />
                    </div>
                    <font-awesome-icon
                        v-else 
                        :icon="['fas', 'circle-notch']" class="fa-spin" 
                    />
                </button>
            </div>
        </div>
        <div v-show="show_autocomplete" id="autocomplete-container">
            <Game 
                v-for="_game of filtered_top_games" 
                :key="_game.id" 
                :game="_game" 
                @click.native="select(_game)" 
            />
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import Input from "~/components/settings/Input";
import Game from "~/components/Game";

export default {
    layout: "modal",
    components: { 
        Game,
        Input
    },
    async asyncData ({ store }) {
        const helix = store.getters["twitch/getHelix"];
        const stream = store.getters["twitch/getStream"];
        const game = await helix.getGame(stream.game);
        const top_games = await helix.getTopGames();

        const art_size = {
            width: 90,
            height: 115
        };

        const art = game 
            ? game.box_art_url.replace("{width}", art_size.width).replace("{height}", art_size.height) 
            : "https://static-cdn.jtvnw.net/ttv-static/404_boxart-75x115.jpg";

        return { 
            art_size,
            local: { 
                title: stream.title, 
                game: stream.game 
            },
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
        ...mapGetters({
            user: "twitch/getUser",
            helix: "twitch/getHelix"
        }),
        filtered_top_games () {
            if (!this.local.game.length) {
                return this.top_games;
            }

            return this.top_games.filter(r => 
                ~r.name.toLowerCase()
                    .indexOf(this.local.game.toLowerCase()));
        }
    },
    watch: {
        "local.game": async function (newVal) {
            // eslint-disable-next-line max-len
            this.art = `https://static-cdn.jtvnw.net/ttv-static/404_boxart-${this.art_size.width}x${this.art_size.height}.jpg`;

            if (this.input_delay) {
                clearTimeout(this.input_delay);
                this.input_delay = null;
            }

            if (!this.show_autocomplete) {
                this.show_autocomplete = true;
            }

            if (newVal.length === 0) {
                this.top_games = await this.helix.getTopGames();
                return;
            }

            this.input_delay = setTimeout(async () => {
                const { data: games } = await this.helix.searchCategories(newVal);
                if (games && games.length) {
                    this.top_games = games;
                    const index = this.top_games.map(g => g.name).indexOf(this.local.game);
                    if (~index) {
                        const game = this.top_games[index];
                        this.show_autocomplete = false;
                        this.art = game.box_art_url
                            .replace("{width}", this.art_size.width)
                            .replace("{height}", this.art_size.height)
                            .replace("52x72", `${this.art_size.width}x${this.art_size.height}`);
                    }
                }
            }, 200);
        }
    },
    methods: {
        ...mapActions({ 
            _updateStream: "twitch/updateStream" 
        }),
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
        async updateStream () {
            this.reset = false;
            this.loading = true;
            this.error = "";
            
            if (!this.local.title.length || !this.local.game.length) {
                this.loading = false;
                this.error = "Необходимо заполнить все поля";
                return;
            }

            this.success = await this._updateStream({ 
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
        grid-template-areas: 
            "content"
            "games";

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

            padding-left: 10px;
            padding-right: 10px;

            #rename-stream {
                margin-top: 10px;
                margin-right: 10px;

                float: right;
            }
        }
    }

    #autocomplete-container {
        grid-area: games;

        max-height: 300px;

        margin-top: 10px;

        overflow-y: auto;
    }
}
</style>