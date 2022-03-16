<template>
    <div class="modal-content">
        <Title title="Настройки Twitch" />
        <div class="modal-body">
            <MenuError v-if="error" :error="error" />

            <Input
                text="Имя пользователя Twitch"
                :value="username"
                @input="username = $event"
            />

            <TwitchSettingsAccessToken @input="access_token = $event" />
            <TwitchSettingsOAuthToken @input="oauth_token = $event" />

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
import Helix from "simple-helix-api";

import MenuError from "~/components/Menu/Notifications/Error";

import TwitchSettingsAccessToken from "~/components/settings/twitch/AccessToken";
import TwitchSettingsOAuthToken from "~/components/settings/twitch/OAuthToken";

import Title from "~/components/Menu/Title";
import Input from "~/components/Settings/Input";
import SolidButton from "~/components/SolidButton";

import CoreMixin from "~/mixins/core";
import other from "~/mixins/other";

const accessTokenRegex = /access_token=(.*?)&/;
const oauthRegex = /oauth:/;

let helix = null;

export default {
    components: {
        MenuError,

        TwitchSettingsAccessToken,
        TwitchSettingsOAuthToken,
        
        Title,
        Input,
        SolidButton
    },
    mixins: [CoreMixin, other],
    layout: "modal",
    data: () => ({
        username: "",
        access_token: "",
        oauth_token: "",
        error: "",
        validating: false
    }),
    computed: {
        disabled() {
            return (
                this.username.length === 0 ||
                this.access_token.length === 0 ||
                this.oauth_token.length === 0
            );
        }
    },
    watch: {
        access_token(access_token) {
            if (accessTokenRegex.test(access_token)) {
                this.access_token = access_token.match(accessTokenRegex)[1];
            }
        },
        oauth_token(oauth_token) {
            if (oauth_token.length === 0) {
                this.oauth_token = "oauth:";
                return;
            }
            
            if (!oauthRegex.test(oauth_token)) {
                this.oauth_token = `oauth:${oauth_token}`;
            }
        }
    },
    async created() {
        if (this.config.twitch.username) {
            this.username = this.config.twitch.username;
            this.access_token = this.config.twitch.access_token;
            this.oauth_token = this.config.twitch.oauth_token;
        }
    },
    methods: {
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
                    type: "twitch",
                    content: {
                        username: this.username,
                        access_token: this.access_token,
                        oauth_token: this.oauth_token
                    }
                });

                this.$router.replace("/");
            }
        },
        async validate() {
            helix = new Helix({
                // eslint-disable-next-line no-undef
                client_id: process.env.client_id,
                access_token: this.access_token
            });

            const user = await helix.users.getByLogin(this.username.toLowerCase())
                .catch(() => {
                    throw this.handleError("Неверный Access Token");
                });

            if (user.length === 0) {
                throw this.handleError("Пользователь с таким именем не найден");
            }

            const data = await helix.channel.get(user.id);
            return await helix.updateStream(user.id, data.title, data.game_name);
        },
        handleError(error) {
            return {
                success: false,
                error
            };
        },
        reset() {
            helix = null;
            this.validating = false;
        }
    }
};
</script>

<style lang="scss">
.twitch-settings {
    &-form {
        display: flex;

        gap: 10px;

        .solid-button {
            min-width: 85px;
        }
    }
}
</style>