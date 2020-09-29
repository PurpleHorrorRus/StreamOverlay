<template>
    <div v-if="settings" id="content">
        <EditMode v-if="edit" />
        <Notifications />
        <OBS />
        <Chat />
        <ViewersList v-if="settings.viewers_list.enable" />
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { ipcRenderer as IPC } from "electron";
import { ipcRenderer } from "electron-better-ipc";

import EditMode from "~/components/EditMode";
import OBS from "~/components/OBS";
import Notifications from "~/components/Notifications/Notifications";
import Chat from "~/components/Chat";
import ViewersList from "~/components/ViewersList";

import other from "~/mixins/other";

export default {
    components: { 
        EditMode,
        OBS, 
        Notifications, 
        Chat, 
        ViewersList
    },
    mixins: [other],
    data: () => ({
        widgets: []
    }),
    computed: {
        ...mapGetters({
            settings: "settings/getSettings",

            edit: "overlays/getEdit",

            obs: "obs/getOBS",
            helix: "twitch/getHelix"
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
        const config = await ipcRenderer.callMain("config");
        const { settings, overlays, OBS, twitch } = config;

        this.setConfig(config);
        this.widgets = overlays;

        if (this.edit) {
            ipcRenderer.send("enableMouse");
            return;
        }

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

            this.connectOBS(OBS);

            if (!this.helix) {
                this.registerIPC();
                this.createHelix(twitch);
                this.createChatBot();
                this.runInterval();
            }
        }
    },
    methods: {
        ...mapActions({
            setConfig: "SET_CONFIG",

            setSettings: "settings/setSettings",
            saveSettings: "settings/saveSettings",

            enableEdit: "overlays/enableEdit",
            
            turnLock: "ipc/turnLock",
            turnUpdate: "notifications/turnUpdate",

            connectOBS: "obs/connectOBS",

            createHelix: "twitch/createHelix",
            createChatBot: "twitch/createChatBot",
            runInterval: "twitch/runInterval"
        }),
        registerIPC () { 
            IPC.on("menu", (event, sequence) => this.$router.replace(sequence ? "/menu" : "/").catch(() => {}));
            IPC.on("lock", (event, mouse) => this.turnLock(mouse));
            IPC.on("viewers_list", () => {
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