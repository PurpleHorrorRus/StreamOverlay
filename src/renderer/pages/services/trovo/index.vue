<template>
    <div class="modal-content">
        <Title title="Настройки Trovo" />
        
        <div class="modal-body">
            <MenuError v-if="error" :error="error" />

            <TrovoSettingsAccessToken @input="access_token = $event" />

            <SolidButton
                :label="'Продолжить'"
                :disabled="disabled"
                :load="validating"
                @clicked="next"
            />
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import { TrovoAPI } from "simple-trovo-api";

import MenuError from "~/components/Menu/Notifications/Error";

import TrovoSettingsAccessToken from "~/components/Settings/Trovo/AccessToken";

import Title from "~/components/Menu/Title";
import SolidButton from "~/components/SolidButton";

import CoreMixin from "~/mixins/core";
import other from "~/mixins/other";

const accessTokenRegex = /access_token=(.*?)&/;
const checkingTitle = "Stream Overlay Validating";

let TrovoClient = null;

export default {
    components: {
        MenuError,

        TrovoSettingsAccessToken,
        
        Title,
        SolidButton
    },

    mixins: [CoreMixin, other],

    layout: "modal",

    data: () => ({
        access_token: "",
        error: "",
        validating: false
    }),

    computed: {
        disabled() {
            return this.access_token.length === 0;
        }
    },

    watch: {
        access_token(access_token) {
            if (accessTokenRegex.test(access_token)) {
                this.access_token = access_token.match(accessTokenRegex)[1];
            }
        }
    },

    async created() {
        if (this.config.trovo.access_token) {
            this.access_token = this.config.trovo.access_token;
        }
    },

    methods: {
        ...mapActions({
            initTrovo: "trovo/INIT",
            connectChat: "trovo/CONNECT"
        }),

        async next() {
            this.validating = true;
            this.error = "";

            const success = await this.validate().catch(e => {
                this.reset();
                this.error = e.error;
                return false;
            });

            if (success) {
                this.saveSettings({
                    type: "trovo",
                    content: {
                        access_token: this.access_token
                    }
                });

                await this.initTrovo(this.access_token);
                await this.connectChat();

                this.$router.replace("/");
            }
        },

        async validate() {
            TrovoClient = new TrovoAPI({
                // eslint-disable-next-line no-undef
                client_id: process.env.client_id,
                access_token: this.access_token
            });

            const user = await TrovoClient.users.getUserInfo();
            const user_id = Number(user.userId);

            const response = await TrovoClient.categories.search("League of Legends");
            const game = response.category_info[0];
            await TrovoClient.channel.edit(user_id, checkingTitle, game.id);

            const channel = await TrovoClient.channels.get(user_id);
            return channel.live_title === checkingTitle;
        },

        handleError(error) {
            return {
                success: false,
                error
            };
        },

        reset() {
            TrovoClient = null;
            this.validating = false;
        }
    }
};
</script>

<style lang="scss">
.trovo-settings {
    &-form {
        display: flex;

        gap: 10px;

        .solid-button {
            min-width: 85px;
        }
    }
}
</style>