<template>
    <div class="modal-content">
        <div class="modal-title">
            <span class="modal-title-text" v-text="'Трансляция'" />
        </div>
        <span v-if="error.length" class="error" v-text="error" />
        <img class="game-art" :src="art">
        <div class="modal-item">
            <div class="modal-item-tip">
                <span class="modal-item-tip-text" v-text="'Название трансляции'" />
            </div>
            <input v-model="local.title" type="text" placeholder="Название трансляции">
        </div>
        <div class="modal-item">
            <div class="modal-item-tip">
                <span class="modal-item-tip-text" v-text="'Название игры'" />
            </div>
            <input v-model="local.game" type="text" placeholder="Название игры">
        </div>
        <div v-if="show_autocomplete" id="autocomplete-container">
            <game 
                v-for="_game of filtered_top_games" 
                :key="_game.id" 
                :game="_game" 
                @click.native="select(_game)" 
            />
        </div>
        <button id="save" @click="updateStream">
            <div v-if="!loading">
                <font-awesome-icon 
                    v-if="success || reset"
                    :icon="['fas', 'check']" 
                    :style="{ color: success && !reset ? 'lightgreen' : '#fff' }"
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
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import game from "~/components/game";

export default {
    layout: "modal",
    components: { game },
    async asyncData ({ store }) {
        const helix = store.getters["twitch/getHelix"];
        const stream = store.getters["twitch/getStream"];
        const game = await helix.getGame(stream.game);

        const top_games = await helix.getTopGames();

        const art_size = {
            width: 85,
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
                if (games.length) {
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
                return this.error = "Необходимо заполнить все поля";
            }

            // this.success = true;
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

<style>
#autocomplete-container {
    position: absolute;
    left: 3%;
    top: 90%;
    background: #121212;
    overflow-x: hidden;
    overflow-y: auto;
    height: auto;
    max-height: 400px;
    width: 520px;
}

.game-art {
    float: left;
    padding: 10px;
}

.modal-item {
    width: 75%;
    display: inline-block;
}

#save { float: right; }
</style>