<template>
    <div class="modal-content">
        <Title title="Настройки Twitch" />
        <div class="modal-body">
            <!-- <Tip
                text="Для того, чтобы включить и отключить фокус на оверлее, нажмите комбинацию клавиш Alt + A"
            /> -->
            <Input
                text="Имя пользователя Twitch"
                :value="username"
                @input="username = $event"
            />

            <div id="twitch-settings-access-token" class="twitch-settings">
                <div class="modal-item-tip">
                    <span
                        class="modal-item-tip-text"
                        v-text="
                            'Access Token - нужен для того, чтобы менять название стрима и игру через оверлей'
                        "
                    />
                </div>

                <div class="twitch-settings-form">
                    <Input
                        :value="access_token"
                        @input="access_token = $event"
                    />
                    <SolidButton :label="'Получить'" @clicked="getToken" />
                </div>
            </div>

            <div id="twitch-settings-oauth" class="twitch-settings">
                <div class="modal-item-tip">
                    <span
                        class="modal-item-tip-text"
                        v-text="
                            'OAuth Token - нужен для того, чтобы получать сообщения из чата'
                        "
                    />
                </div>

                <div class="twitch-settings-form">
                    <Input :value="oauth_token" @input="oauth_token = $event" />
                    <SolidButton :label="'Получить'" @clicked="getOAuth" />
                </div>
            </div>

            <div v-if="error.length" class="modal-item-tip">
                <span style="color: red" class="modal-item-tip-text">Ошибка: {{ error }}</span>
            </div>

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
import { mapActions, mapState } from "vuex";

import Helix from "simple-helix-api";

import Title from "~/components/menu/Title";
import Input from "~/components/settings/Input";
import SolidButton from "~/components/SolidButton";

import CoreMixin from "~/mixins/core";
import other from "~/mixins/other";

const client_id = "zmin05a65f74rln2g94iv935w58nyq";
let helix;

export default {
    components: {
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
        ...mapState({
            server: state => state.twitch.token.fastify
        }),
        disabled() {
            return (
                !this.username.length ||
                !this.access_token.length ||
                !this.oauth_token.length
            );
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
        ...mapActions({
            startServer: "twitch/token/START_SERVER"
        }),
        async next() {
            this.validating = true;
            this.error = "";

            if (~this.access_token.indexOf("http://")) {
                this.access_token =
                    this.access_token.match(/access_token=(.*?)&/)[1];
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

            const user = await helix.users.getByLogin(this.username);
            this.saveSettings({
                type: "twitch",
                content: {
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

            const user = await helix.users
                .getByLogin(this.username)
                .catch(() => ({
                    success: false,
                    error: "Пользователь с таким ником не найден"
                }));

            const data = await helix.channel.get(user.id);
            const success = await helix
                .updateStream(user.id, data.title, data.game_name)
                .catch(() => ({
                    success: false,
                    error: "Неверный Access Token"
                }));

            return { success };
        },
        async getToken() {
            const url = new Helix({
                client_id,
                redirect_uri: "http://localhost:3000/token"
            }).getAuthLink();

            if (!this.server) {
                await this.startServer();
            }

            this.openLink(url);
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