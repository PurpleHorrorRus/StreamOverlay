<template>
    <div class="modal-content">
        <div class="modal-title">
            <span class="modal-title-text" v-text="'Настройка Twitch'" />
        </div>
        <div class="modal-body">
            <!-- <Tip
                text="Для того, чтобы включить и отключить фокус на оверлее, нажмите комбинацию клавиш Alt + A"
            /> -->
            <Input text="Имя пользователя Twitch" :value="username" @input="changeUsername" />

            <div id="twitch-settings-access-token" class="twitch-settings">
                <div class="modal-item-tip">
                    <span
                        class="modal-item-tip-text"
                        v-text="'Access Token - нужен для того, чтобы менять название стрима и игру через оверлей'"
                    />
                </div>

                <div class="twitch-settings-form">
                    <Input :value="access_token" @input="changeAccessToken" />
                    <SolidButton :label="'Получить'" @clicked="getToken" />
                </div>
            </div>

            <div id="twitch-settings-oauth" class="twitch-settings">
                <div class="modal-item-tip">
                    <span
                        class="modal-item-tip-text"
                        v-text="'OAuth Token - нужен для того, чтобы получать сообщения из чата'"
                    />
                </div>

                <div class="twitch-settings-form">
                    <Input :value="oauth_token" @input="changeOAuth" />
                    <SolidButton :label="'Получить'" @clicked="getOAuth" />
                </div>
            </div>

            <div v-if="error.length" class="modal-item-tip">
                <span style="color: red" class="modal-item-tip-text">Ошибка: {{ error }}</span>
            </div>

            <SolidButton :label="'Продолжить'" :disabled="disabled" :load="validating" @clicked="next" />
        </div>
    </div>
</template>

<script>
import Helix from "simple-helix-api";
import express from "express";

import Input from "~/components/settings/Input";
import SolidButton from "~/components/SolidButton";

import CoreMixin from "~/mixins/core";
import other from "~/mixins/other";

let app = undefined;

const client_id = "zmin05a65f74rln2g94iv935w58nyq";
let helix;

export default {
    components: {
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
            return this.username.length === 0 || this.access_token.length === 0 || this.oauth_token.length === 0;
        }
    },
    watch: {
        access_token(newVal) {
            if (~newVal.indexOf("http://")) {
                this.access_token = newVal.match(/access_token=(.*?)&/)[1];
            }
        },
        oauth_token(newVal) {
            if (!newVal.length) {
                this.oauth_token = "oauth:";
                return;
            }
            if (!~newVal.indexOf("oauth:")) {
                this.oauth_token = `oauth:${this.oauth_token}`;
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
        changeUsername(value) {
            this.username = value;
        },
        changeAccessToken(value) {
            this.access_token = value;
        },
        changeOAuth(value) {
            this.oauth_token = value;
        },
        async next() {
            this.validating = true;
            this.error = "";

            if (~this.access_token.indexOf("http://")) {
                this.access_token = this.access_token.match(/access_token=(.*?)&/)[1];
            }

            const valid = await this.validate().catch(e => {
                this.validating = false;
                this.error = e.error;
                return;
            });

            if (!valid.success) {
                this.validating = false;
                return;
            }

            const user = await helix.users.get({ login: this.username });
            this.saveSettings({
                type: "twitch",
                content: {
                    id: user.id,
                    username: user.display_name,
                    access_token: this.access_token,
                    oauth_token: this.oauth_token
                }
            });

            this.validating = false;
            this.$router.replace("/");
        },
        async validate() {
            helix = new Helix({
                client_id,
                access_token: this.access_token
            });

            const user = await helix.users.get({ login: this.username }).catch(() => ({
                success: false,
                error: "Пользователь с таким ником не найден"
            }));

            const data = await helix.channel.get(user.id);
            const success = await helix.updateStream(user.id, data.title, data.game_name)
                .catch(() => ({ success: false, error: "Неверный Access Token" }));

            return { success };
        },
        getToken() {
            const url = new Helix({
                client_id,
                redirect_uri: "http://localhost:3000/token"
            }).getAuthLink();

            if (app) {
                return this.openLink(url);
            }

            app = express();

            app.get("/token", (req, res) =>
                res.send("Ваш Access Token находится в ссылке. Просто скопируйте её и вставьте в поле")
            );

            const server = app.listen(3000);
            this.openLink(url);

            setTimeout(() => server.close(), 10000);
        },
        getOAuth() {
            this.openLink("https://twitchapps.com/tmi/");
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