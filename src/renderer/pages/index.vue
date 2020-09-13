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
        <Notifications />
        <OBS />
        <Chat />
        <ViewersList v-if="settings.viewers_list.enable" />
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { ipcRenderer } from "electron-better-ipc";

import OBS from "~/components/OBS";
import Notifications from "~/components/Notifications/Notifications";
import Chat from "~/components/Chat";
import Overlay from "~/components/Overlay";
import ViewersList from "~/components/ViewersList";

import other from "~/mixins/other";

export default {
    components: { 
        OBS, 
        Notifications, 
        Chat, 
        Overlay, 
        ViewersList
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
    beforeMount () {
        ipcRenderer.on("update-available", () => {
            this.turnUpdate(true);
        });
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
            if (settings.first) {
                settings.first = false;
                this.saveSettings({
                    type: "settings",
                    content: settings
                });
            } else {
                this.setSettings(settings); 
            }

            this.setOverlays(overlays);
            this.connectOBS(OBS);

            if (!this.helix) {
                this.createHelix(twitch);
                this.createChatBot();
                this.runInterval();
            }
        }
    },
    methods: {
        ...mapActions({
            setSettings: "settings/setSettings",
            saveSettings: "settings/saveSettings",

            setOverlays: "overlays/setOverlays",
            enableEdit: "overlays/enableEdit",
            
            turnLock: "ipc/turnLock",
            turnUpdate: "notifications/turnUpdate",

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

<style lang="scss">
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