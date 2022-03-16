<template>
    <div v-if="!firstLoad" id="modal-stream-container">
        <div id="modal-stream-content" class="modal-content">
            <Title id="modal-stream-content-title" title="Трансляция" />
            <img id="modal-stream-content-art-image" :src="game.icon_url" />

            <div id="modal-stream-content-edit">
                <Input
                    :value="local.title"
                    placeholder="Название трансляции"
                    @input="local.title = $event"
                    @keypress.enter.native="update"
                />

                <Input
                    :value="local.game"
                    :placeholder="'Название игры'"
                    @input="local.game = $event"
                    @keypress.enter.native="update"
                />

                <SolidButton
                    label="Обновить"
                    :disabled="disabled"
                    :load="loading"
                    @clicked="update"
                />
            </div>

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
import { mapActions, mapState } from "vuex";
import { debounce } from "lodash";

import Title from "~/components/Menu/Title";
import Input from "~/components/Settings/Input";
import SolidButton from "~/components/SolidButton";
import Recent from "~/components/Recent";

import Search from "~/components/Menu/EditPage/Search";

import LoaderIcon from "~/assets/icons/loader.svg";

import TrovoMixin from "~/mixins/trovo";

let updateSearchResultsDebounce = null;

export default {
    components: {
        Title,
        Input,

        SolidButton,
        Recent,

        Search,

        LoaderIcon
    },

    mixins: [TrovoMixin],

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
        const channel = await this.trovo.channels.get(this.user.nickName);
        this.local.title = channel.live_title;
        this.local.game = channel.category_name;

        const response = await this.trovo.categories.search(channel.category_name);
        this.game = response.category_info[0];
        this.search = response.category_info;
        
        updateSearchResultsDebounce = debounce(game => this.updateSearchResults(game), 200);

        this.firstLoad = false;
    },

    methods: {
        ...mapActions({
            updateStream: "trovo/UPDATE_STREAM"
        }),

        async update() {
            this.loading = true;
            await this.updateStream(this.local);
            this.loading = false;
        },

        select(game) {
            this.game = game;
            this.local.game = game.name;
        },
        
        async updateSearchResults(query) {
            if (this.game.name === query) {
                return;
            }

            const response = await this.trovo.categories.search(query);
            this.search = response.category_info;

            const gameInSearch = this.search.find(game => game.name === query);
            if (gameInSearch) this.select(gameInSearch);
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

    &-edit {
        grid-area: edit;

        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
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