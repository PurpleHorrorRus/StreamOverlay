<template>
    <div v-if="settings" id="content">
        <EditMode v-if="edit" />
        <Notifications />
        <OBS />
        <Chat v-if="settings.chat.enable" />
        <ViewersList v-if="settings.viewers_list.enable" />

        <Widget
            v-for="widget of widgets" 
            :key="widget.id"
            :widget="widget"
        />
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
import Widget from "~/components/Widget";

import other from "~/mixins/other";

export default {
    components: { 
        EditMode,
        OBS, 
        Notifications, 
        Chat, 
        ViewersList,
        Widget
    },
    mixins: [other],
    computed: {
        ...mapGetters({
            settings: "settings/getSettings",

            widgets: "widgets/getWidgets",
            edit: "widgets/getEdit",

            obs: "obs/getOBS",
            status: "obs/getStatus",

            helix: "twitch/getHelix"
        }),
        connected () { 
            return this.obs._connected;
        }
    },
    async mounted () {
        const config = await ipcRenderer.callMain("config");
        const { settings, overlays, OBS, twitch } = config;
        this.setConfig(config);
        this.setWidgets(overlays);

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
                this.connectMeridius();
                this.createHelix(twitch);
                this.createChatBot();
                this.runInterval();

                this.$nuxtSocket({
                    channel: "/chat",
                    persist: "chat",
                    reconnection: true,
                    query: {
                        type: "overlay"
                    }
                });
            }
        }
    },
    methods: {
        ...mapActions({
            setConfig: "SET_CONFIG",

            setSettings: "settings/setSettings",
            saveSettings: "settings/saveSettings",

            setWidgets: "widgets/setWidgets",
            enableEdit: "widgets/enableEdit",
            
            turnLock: "ipc/turnLock",

            connectOBS: "obs/connectOBS",

            createHelix: "twitch/createHelix",
            createChatBot: "twitch/createChatBot",
            runInterval: "twitch/runInterval",

            connectMeridius: "meridius/CONNECT"
        }),
        registerIPC () { 
            IPC.on("beep", () => {
                if (beep === null) {
                    beep = new Audio(BeepSound);
                }
                
                beep.play();
            });
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