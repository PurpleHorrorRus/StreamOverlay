<template>
    <div class="modal-content">
        <div class="modal-title">
            <span class="modal-title-text">Настройка Twitch</span>
        </div>
        <div class="modal-body">
            <div class="modal-item-tip">
                <span 
                    class="modal-item-tip-text" 
                    v-text="'Для того, чтобы включить и отключить фокус на оверлее, нажмите комбинацию клавиш Alt + A'"
                />
            </div>
            <div class="modal-item">
                <div class="modal-item-tip">
                    <span class="modal-item-tip-text">Имя пользователя Twitch</span>
                </div>
                <input v-model="username" type="text" placeholder="Имя пользователя Twitch">
            </div>
            <div class="modal-item">
                <div class="modal-item-tip">
                    <span class="modal-item-tip-text">
                        Access Token - нужен для того, чтобы менять название стрима и игру через оверлей
                        (<strong class="link" @click="getToken" v-text="'Получить'" />)
                    </span>
                </div>
                <input v-model="access_token" type="text" placeholder="Access Token">
            </div>
            <div class="modal-item">
                <div class="modal-item-tip">
                    <span class="modal-item-tip-text">
                        OAuth Token - нужен для того, чтобы получать сообщения из чата
                        (<strong class="link" @click="getOAuth" v-text="'Получить'" />)
                    </span>
                </div>
                <input v-model="oauth_token" type="text" placeholder="OAuth Token ">
            </div>
            <div v-if="error.length" class="modal-item-tip">
                <span style="color: red" class="modal-item-tip-text">Ошибка: {{ error }}</span>
            </div>
            <next :loading="validating" @click.native="goNext" />
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import { ipcRenderer } from "electron-better-ipc";

import express from "express";
import Helix from "simple-helix-api";
import { encode } from "querystring";

import next from "~/components/settings/next";
import other from "~/mixins/other";

let app = undefined;

const client_id = "zmin05a65f74rln2g94iv935w58nyq";
let helix;

export default {
    components: { next },
    mixins: [other],
    layout: "modal",
    data: () => ({
        username: "",
        access_token: "",
        oauth_token: "",
        error: "",
        validating: false
    }),
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
        ipcRenderer.send("enableMouse");
        const { twitch } = await ipcRenderer.callMain("config");
        if (twitch.username) {
            this.username = twitch.username;
            this.access_token = twitch.access_token;
            this.oauth_token = twitch.oauth_token;
        }
    },
    methods: {
        ...mapActions({
            saveSettings: "settings/saveSettings"
        }),
        async goNext () {
            this.validating = true;
            this.error = "";

            if (!this.username.length || !this.access_token.length || !this.oauth_token.length) {
                this.validating = false;
                return this.error = "Необходимо заполнить все поля";
            } 
            if (~this.access_token.indexOf("http://")) {
                this.access_token = this.access_token.match(/access_token=(.*?)&/)[1];
            }

            const valid = await this.validate().catch(e => { 
                this.validating = false; 
                return this.error = e.error; 
            });

            if (!valid.success) { 
                return this.validating = false;
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

            ipcRenderer.send("disableMouse");

            this.validating = false;
            this.$router.replace("/");
            
        },
        validate () {
            return new Promise(async (resolve, reject) => {
                helix = new Helix({ 
                    client_id, 
                    access_token: this.access_token,
                    increaseRate: true
                });

                console.log(helix);

                const user = await helix.getUser(this.username)
                    .catch(() => reject({ success: false, error: "Пользователь с таким ником не найден" }));

                console.log(user);

                const data = await helix.getChannel(user.id);
                const title = data.status,
                    game = data.game;

                const { success } = await helix.updateStream(user.id, "test overlay", "League of Legends")
                    .catch(() => reject({ success: false, error: "Неверный Access Token" }));

                console.log(success);
                if (success) {
                    helix.updateStream(user.id, title, game);
                    return resolve({ success: true });
                } else {
                    return reject({ success: false, error: "Неверный Access Token" });
                }
            });
        },
        getToken () {
            const params = {
                client_id,
                redirect_uri: "http://localhost:3000/token",
                response_type: "token",
                scope: "channel_editor chat_login openid"
            };

            const query = encode(params);

            const url = `https://id.twitch.tv/oauth2/authorize?${query}`;
            if (app) {
                return this.openLink(url);
            }

            app = express();

            app.get("/token", (req, res) => 
                res.send("Ваш Access Token находится в ссылке. Просто скопируйте её и вставьте в поле"));

            app.listen(3000);
            this.openLink(url);
        },
        getOAuth () { 
            this.openLink("https://twitchapps.com/tmi/"); 
        }
    }
};
</script>

<style>
html, body, #__nuxt, #__layout {
    width: 100%;
    height: 100%;
}
</style>