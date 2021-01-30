<template>
    <div v-if="settings" id="content">
        <EditMode v-if="active" />
        <Notifications />
        <OBS />
        <TwitchInfo />
        <TechInfo v-if="settings.TechInfo.enable && connected && status.tech !== null" />
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
import { mapActions } from "vuex";
import { ipcRenderer as IPC } from "electron";
import { ipcRenderer } from "electron-better-ipc";

import EditMode from "~/components/EditMode";

import OBS from "~/components/OBS";
import TwitchInfo from "~/components/obs/TwitchInfo";
import TechInfo from "~/components/obs/TechInfo";

import Notifications from "~/components/Notifications/Notifications";
import Chat from "~/components/Chat";
import ViewersList from "~/components/ViewersList";
import Widget from "~/components/Widget";

import OBSMixin from "~/mixins/obs";
import TwitchMixin from "~/mixins/twitch";
import WidgetsMixin from "~/mixins/widgets";
import other from "~/mixins/other";

import BeepSound from "~/static/beep.mp3";

let beep = null;

export default {
    components: { 
        EditMode,
        OBS, 
        TwitchInfo,
        TechInfo,
        Notifications, 
        Chat, 
        ViewersList,
        Widget
    },
    mixins: [OBSMixin, TwitchMixin, WidgetsMixin, other],
    computed: {
        connected () { 
            return this.obs._connected;
        }
    },
    beforeMount () {
        ipcRenderer.on("update-available", () => this.turnUpdate(true));
    },
    async mounted () {
        const config = await ipcRenderer.callMain("config");
        const { settings, overlays, OBS, twitch } = config;
        this.setConfig(config);
        this.setWidgets(overlays);

        if (!OBS.address || !OBS.port) {
            this.registerIPC();
            this.setSettings(settings); 
            this.$router.replace("/settings/obs").catch(() => {});
            return;
        }

        if (!twitch.id || !twitch.username || !twitch.access_token || !twitch.oauth_token) {
            this.registerIPC();
            this.setSettings(settings); 
            this.$router.replace("/settings/twitch").catch(() => {});
            return;
        }

        if (settings.first) {
            settings.first = false;
            this.saveSettings({
                type: "settings",
                content: settings
            });
        } else {
            this.setSettings(settings); 
        }

        if (!this.helix) {
            this.connectOBS(OBS);
            this.createHelix(twitch);
            
            this.registerIPC();
            this.createChatBot();
            this.runInterval();
        }
    },
    methods: {
        ...mapActions({
            setConfig: "SET_CONFIG",
            
            turnLock: "ipc/turnLock",
            turnUpdate: "notifications/turnUpdate"
        }),
        registerIPC () { 
            IPC.on("beep", () => {
                if (beep === null) {
                    beep = new Audio(BeepSound);
                    beep.volume = 0.05;
                }
                
                beep.setSinkId(this.settings.outputDeviceId);
                beep.play();
            });

            IPC.on("menu", (_event, sequence) => {
                this.$router.replace(sequence ? "/menu" : "/").catch(() => {});
                this.active = false;
            });

            IPC.on("lock", (_event, mouse) => this.turnLock(mouse));
            IPC.on("viewers_list", () => {
                this.settings.viewers_list.enable = !this.settings.viewers_list.enable;
                this.saveSettings({
                    type: "settings",
                    content: this.settings
                });
            });
        },
        openFullEdit () {
            this.$router.replace("/edit").catch(() => {});
            this.active = false;
        },
        exitEdit () {
            this.$router.replace("/menu").catch(() => {});
            this.active = false;
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