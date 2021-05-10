<template>
    <div class="modal-content">
        <div class="modal-title">
            <span class="modal-title-text" v-text="'Настройка Twitch'" />
        </div>
        <div class="modal-body">
            <!-- <Tip
                text="Для того, чтобы включить и отключить фокус на оверлее, нажмите комбинацию клавиш Alt + A"
            /> -->
            <Input
                text="Имя пользователя Twitch"
                :value="username"
                @input="changeUsername"
            />

            <div class="modal-item-tip">
                <span class="modal-item-tip-text">
                    Access Token - нужен для того, чтобы менять название стрима и игру через оверлей
                    (<span class="link" @click="getToken" v-text="'Получить'" />)
                </span>
            </div>
            <Input
                :value="access_token"
                @input="changeAccessToken"
            />

            <div class="modal-item-tip">
                <span class="modal-item-tip-text">
                    OAuth Token - нужен для того, чтобы получать сообщения из чата
                    (<span class="link" @click="getOAuth" v-text="'Получить'" />)
                </span>
            </div>
            <Input
                :value="oauth_token"
                @input="changeOAuth"
            />

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
import express from "express";
import Helix from "simple-helix-api";

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
        disabled () {
            return this.username.length === 0 ||
                    this.access_token.length === 0 ||
                    this.oauth_token.length === 0;
        }
    },
    watch: {
        access_token (newVal) {
            if (~newVal.indexOf("http://")) {
                this.access_token = newVal.match(/access_token=(.*?)&/)[1];
            }
        },
        oauth_token (newVal) {
            if (!newVal.length) {
                this.oauth_token = "oauth:";
                return;
            }
            if (!~newVal.indexOf("oauth:")) {
                this.oauth_token = `oauth:${this.oauth_token}`;
            }
        }
    },
    async created () {
        if (this.config.twitch.username) {
            this.username = this.config.twitch.username;
            this.access_token = this.config.twitch.access_token;
            this.oauth_token = this.config.twitch.oauth_token;
        }
    },
    methods: {
        changeUsername (value) {
            this.username = value;
        },
        changeAccessToken (value) {
            this.access_token = value;
        },
        changeOAuth (value) {
            this.oauth_token = value;
        },
        async next () {
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

            const user = await helix.getUser(this.username);
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
        async validate () {
            helix = new Helix({ 
                client_id, 
                access_token: this.access_token,
                increaseRate: true
            });

            const user = await helix.getUser(this.username)
                .catch(() => ({ 
                    success: false, 
                    error: "Пользователь с таким ником не найден" 
                }));

            const data = await helix.getChannel(user.id);
            const title = data.status,
                game = data.game;

            const { success } = await helix.updateStream(user.id, "test overlay", "League of Legends")
                .catch(() => ({ success: false, error: "Неверный Access Token" }));

            if (success) {
                helix.updateStream(user.id, title, game);
                return { success: true };
            } else {
                return { 
                    success: false, 
                    error: "Неверный Access Token" 
                };
            }
        },
        getToken () {
            let tempHelix = new Helix({
                client_id,
                redirect_uri: "http://localhost:3000/token",
                disableWarns: true
            });

            const url = tempHelix.getAuthLink();
            tempHelix = null;

            if (app) {
                this.openLink(url);
                return;
            }

            app = express();

            app.get("/token", (req, res) => 
                res.send("Ваш Access Token находится в ссылке. Просто скопируйте её и вставьте в поле"));

            app.listen(3002);
            this.openLink(url);
        },
        getOAuth () { 
            this.openLink("https://twitchapps.com/tmi/"); 
        }
    }
};
</script>

<style lang="scss">
.link {
    &:hover {
        cursor: pointer;
        color: $secondary;
        text-decoration: underline;
    }
}
</style>