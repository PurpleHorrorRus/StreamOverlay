<template>
    <div v-if="!firstLoad" id="modal-stream-container">
        <div id="modal-stream-content" class="modal-content">
            <div id="modal-stream-content-title" class="modal-title">
                <span class="modal-title-text" v-text="'Трансляция'" />
            </div>
            <div id="modal-stream-content-art">
                <img id="modal-stream-content-art-image" :src="art">
            </div>
            <div id="modal-stream-content-edit">
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
                <SolidButton :label="'Обновить'" :disabled="disabled" :load="loading" @clicked="update" />
            </div>
            <Recent v-show="recent.length > 0" :recent="recent" />
            <div id="modal-stream-content-games">
                <div id="modal-stream-content-games-filtered">
                    <Game v-for="game of filteredTopGames" :key="game.id" :game="game" @click.native="select(game)" />
                </div>
                <div v-if="search.length > 0" id="modal-stream-content-games-search">
                    <Game v-for="game of search" :key="game.id" :game="game" @click.native="select(game)" />
                </div>
            </div>
        </div>
    </div>
    <FontAwesomeIcon v-else id="modal-stream-load" icon="circle-notch" spin />
</template>

<script>
import { mapActions, mapState } from "vuex";

import Input from "~/components/settings/Input";
import Game from "~/components/Game";
import SolidButton from "~/components/SolidButton";

import Recent from "~/components/Recent";

const noArt = "https://static-cdn.jtvnw.net/ttv-static/404_boxart-{width}x{height}.jpg";
const artSize = {
    width: 250,
    height: 320
};

let inputDelay = null;

export default {
    components: {
        Game,
        Input,
        SolidButton,

        Recent
    },
    layout: "modal",
    data: () => ({
        firstLoad: true,
        local: {
            title: "",
            game: ""
        },
        games: [],
        search: [],
        art: "",
        topGames: [],
        reset: true,
        loading: false,
        success: false,
        error: ""
    }),
    computed: {
        ...mapState({
            user: state => state.twitch.user,
            helix: state => state.twitch.helix,
            stream: state => state.twitch.stream,
            recent: state => state.config.recent
        }),
        filteredTopGames() {
            if (!this.local.game.length) {
                return this.topGames;
            }

            return this.topGames.filter(r => ~r.name.toLowerCase().indexOf(this.local.game.toLowerCase()));
        },
        disabled() {
            return this.local.title.length === 0 || this.local.game.length === 0;
        }
    },
    watch: {
        art: function(newVal) {
            this.art = this.resizeArt(newVal);
        },
        "local.game": async function(newVal) {
            // eslint-disable-next-line max-len
            this.art = this.resizeArt(noArt);

            if (inputDelay) {
                clearTimeout(inputDelay);
                inputDelay = null;
            }

            if (newVal.length === 0) {
                this.search = [];
                return;
            } else if (this.findCache(this.games, this.local.game) || this.findCache(this.search, this.local.game)) {
                return;
            }

            inputDelay = setTimeout(async () => {
                const { data: games } = await this.helix.searchCategories(newVal);
                if (games && games.length) {
                    this.search = games;
                    this.findCache(this.search, this.local.game);
                }
            }, 200);
        }
    },
    async created() {
        const channel = await this.helix.getChannel(this.user.id);
        this.local = {
            title: channel.status,
            game: channel.game
        };

        const game = await this.helix.getGame(this.stream.game);
        this.topGames = await this.helix.getTopGames();

        this.art = this.resizeArt(game?.box_art_url || noArt);
        this.firstLoad = false;
    },
    methods: {
        ...mapActions({
            updateStream: "twitch/UPDATE",
            saveSettings: "settings/SAVE"
        }),
        findCache(array, game) {
            const index = array.map(g => g.name).indexOf(game);
            if (~index) {
                this.art = array[index].box_art_url;
            }

            return index !== -1;
        },
        resizeArt(art) {
            return art
                .replace("{width}", artSize.width)
                .replace("{height}", artSize.height)
                .replace("52x72", `${artSize.width}x${artSize.height}`);
        },
        changeTitle(value) {
            this.local.title = value;
        },
        changeGame(value) {
            this.local.game = value;
        },
        select(game) {
            this.local.game = game.name;
        },
        async update() {
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
#modal-stream-load {
    position: relative;
    top: 50%;
    left: 50%;
}

#modal-stream-content {
    display: grid;
    grid-template-columns: 100px 1fr 220px;
    grid-template-rows: 30px 130px 300px;
    grid-template-areas:
        "title title title"
        "art edit recent"
        "games games games";
    grid-gap: 5px;

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

    &-edit {
        grid-area: edit;

        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
    }

    &-games {
        grid-area: games;

        margin-top: 10px;
        margin-bottom: 10px;

        overflow-x: hidden;
        overflow-y: auto;

        &-search {
            border-top: 2px solid $outline;
        }
    }
}
</style>