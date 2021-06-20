<template>
    <div v-if="settings" id="content">
        <EditMode v-if="active" />
        <Notifications />
        <div v-if="!settings.first" id="content-valid">
            <OBS v-if="connected" />
            <TwitchInfo />
            <TechInfo v-if="settings.TechInfo.enable && connected && status.tech !== null" />
            <Chat v-if="settings.chat.enable" />
            <ViewersList v-if="settings.viewers_list.enable" />
            <Widget v-for="widget of widgets" :key="widget.id" :widget="widget" />
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import { ipcRenderer } from "electron";

import EditMode from "~/components/EditMode";

import OBS from "~/components/OBS";
import TwitchInfo from "~/components/TwitchInfo";
import TechInfo from "~/components/obs/TechInfo";

import Notifications from "~/components/Notifications/Notifications";
import Chat from "~/components/Chat";
import ViewersList from "~/components/ViewersList";
import Widget from "~/components/Widget";

import OBSMixin from "~/mixins/obs";
import TwitchMixin from "~/mixins/twitch";
import WidgetsMixin from "~/mixins/widgets";
import other from "~/mixins/other";

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
        connected() {
            return this.obs._connected;
        }
    },
    beforeMount() {
        ipcRenderer.on("lock", (_event, mouse) => this.turnLock(mouse));
        ipcRenderer.on("update-available", () =>
            this.turnNotification({
                name: "update",
                show: true
            })
        );
    },
    async mounted() {
        const config = await ipcRenderer.invoke("config");
        this.setConfig(config);

        const { settings, OBS, twitch } = config;
        if (this.$route.query?.edit) {
            this.setWidgets(config.overlays);
            this.active = true;
            return;
        }

        if (!OBS.address || !OBS.port) {
            this.turnLock(true);
            this.$router.replace("/settings/obs").catch(() => {});
            return;
        }

        if (!twitch.id || !twitch.username || !twitch.access_token || !twitch.oauth_token) {
            this.turnLock(true);
            this.$router.replace("/settings/twitch").catch(() => {});
            return;
        }

        this.setWidgets(config.overlays);

        if (!this.connected) {
            if (settings.first) {
                settings.first = false;
                this.saveSettings({
                    type: "settings",
                    content: settings
                });
            }

            this.connectOBS(OBS);

            if (!this.helix) {
                this.addNotification({
                    text: "Управление:<br/>\
                        Alt + R - меню<br/>\
                        Alt + K - список зрителей",
                    
                    color: "#343a40",
                    handle: 10
                });

                this.registerIPC();
                this.createHelix(twitch);
                this.createChatBot();
            }
        }
    },
    methods: {
        ...mapActions({
            setConfig: "SET_CONFIG",

            turnLock: "ipc/TURN_LOCK",

            addNotification: "notifications/ADD",
            turnNotification: "notifications/TURN"
        }),
        registerIPC() {
            ipcRenderer.on("menu", (_event, sequence) => {
                this.$router.replace(sequence ? "/stream" : "/").catch(() => {});
                this.active = false;
            });

            ipcRenderer.on("viewers_list", () => {
                this.settings.viewers_list.enable = !this.settings.viewers_list.enable;
                this.saveSettings({
                    type: "settings",
                    content: this.settings
                });
            });
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