<template>
    <div v-if="settings" id="content">
        <div v-if="edit" id="editNotification">
            <span 
                id="editText"
                v-text="'Режим редактирования'"
            />
            <button 
                @click="openFullEdit"
                v-text="'Ред.'" 
            />
            <button 
                @click="exitEdit"
                v-text="'Выйти'"
            />
        </div>
        <div id="overlays">
            <overlay v-for="(overlay, index) of overlays" :key="index" :overlay="overlay" />
        </div>
        <notifications />
        <obs />
        <chat />
        <viewerslist v-if="settings.viewers_list.enable" />
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { ipcRenderer } from "electron-better-ipc";

import obs from "~/components/obs";
import notifications from "~/components/notifications/notifications";
import chat from "~/components/chat";
import overlay from "~/components/overlay";
import viewerslist from "~/components/ViewersList";

import other from "~/mixins/other";

export default {
    components: { 
        obs, 
        notifications, 
        chat, 
        overlay, 
        viewerslist
    },
    mixins: [other],
    computed: {
        ...mapGetters({
            obs: "obs/getOBS",
            helix: "twitch/getHelix",
            overlays: "overlays/getOverlays",
            edit: "overlays/getEdit",
            settings: "settings/getSettings"
        }),
        connected () { 
            return this.obs._connected;
        }
    },
    async mounted () {
        if (this.edit) {
            ipcRenderer.send("enableMouse");
            return;
        }

        this.registerIPC();

        const { settings, overlays, OBS, twitch } = await ipcRenderer.callMain("config");

        if (!OBS.address || !OBS.port) {
            ipcRenderer.send("enableMouse");
            this.$router.replace("/settings/obs").catch(() => {});
            return;
        }

        if (!twitch.id || !twitch.username || !twitch.access_token || !twitch.oauth_token) {
            ipcRenderer.send("enableMouse");
            this.$router.replace("/settings/twitch").catch(() => {});
            return;
        }

        if (!this.connected) {
            this.setSettings(settings);
            this.setOverlays(overlays);
            this.connectOBS(OBS);
        } else {
            if (!this.helix) {
                this.createHelix();
                this.createChatBot();
                this.runInterval();
            }
        }
    },
    methods: {
        ...mapActions({
            setSettings: "settings/setSettings",
            setOverlays: "overlays/setOverlays",
            enableEdit: "overlays/enableEdit",
            saveSettings: "settings/saveSettings",
            turnLock: "ipc/turnLock",

            connectOBS: "obs/connectOBS",
            createHelix: "twitch/createHelix",
            createChatBot: "twitch/createChatBot",
            runInterval: "twitch/runInterval"
        }),
        registerIPC () { 
            ipcRenderer.on("menu", () => this.$router.replace("/menu").catch(() => {}));
            ipcRenderer.on("lock", (event, mouse) => this.turnLock(mouse));
            ipcRenderer.on("viewers_list", () => {
                const { enable } = this.settings.viewers_list;
                this.settings.viewers_list.enable = !enable;
                this.saveSettings({
                    type: "settings",
                    content: this.settings
                });
            });
        },
        openFullEdit () {
            this.$router.replace("/edit").catch(() => {});
            this.enableEdit(false);
        },
        exitEdit () {
            this.$router.replace("/menu").catch(() => {});
            this.enableEdit(false);
        }
    }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');
html, body, #__nuxt, #__layout, #content {
    width: 100%;
    height: 100%;
	overflow: hidden;
}

div, span, input, button {
	font-family: -apple-system, BlinkMacSystemFont, 
        'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 
        'Open Sans', 'Helvetica Neue', sans-serif;
        
	color: #fff;
}

button {
	background: none;
	border: 1px solid #ccc;
	padding: 5px;
	margin-right: 3px;
	outline: none;
}

button:hover {
	cursor: pointer;
	border: 1px solid rgb(117, 117, 252);
}

input {
	background: none;
	border: none;
	border-bottom: 1px solid #ccc;
	border-radius: 0px;
	padding: 10px;
	color: white;
	width: 100%;
	outline: none;
}


.link { color: rgb(117, 117, 252); }

.link:hover {
	color: red;
	text-decoration: underline;
	cursor: pointer;
}

#overlays {
    position: absolute;
	width: 100%;
	height: 100%;
}

#editNotification {
	position: absolute;
	top: 0px;
	left: 45%;
	width: 200px;
	height: 60px;
    background: rgba(0, 0, 0, 0.4);
	text-align: center;
	border-bottom-left-radius: 10px;
	border-bottom-right-radius: 10px;
    z-index: 9;
}

#editText {
	display: inline-block;
	margin-bottom: 5px;
}
</style>