<template>
    <div v-if="settings" id="content">
        <EditMode v-if="active" />

        <div id="content-valid">
            <Notifications />
            <OBS v-if="showOBS" />
            <TechInfo v-if="settings.TechInfo.enable && connected && status.tech !== null" />
            <Chat v-if="settings.chat.enable" />
            <ViewersList v-if="settings.ViewersList.enable" />
            <Widget v-for="widget of widgets" :key="widget.id" :widget="widget" />
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import { ipcRenderer } from "electron";

import EditMode from "~/components/EditMode";

import OBS from "~/components/OBS";
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
        TechInfo,
        Notifications,
        Chat,
        ViewersList,
        Widget
    },
    mixins: [OBSMixin, TwitchMixin, WidgetsMixin, other],
    computed: {
        showOBS() {
            return this.user 
                && (this.connected 
                    || this.settings.OBSStatus.TwitchInfo.enable 
                    || this.settings.OBSStatus.TwitchInfo.enableFollowers);
        }
    },
    async created() {
        if (this.$route.query?.edit) {
            this.active = true;
            ipcRenderer.send("turnMouse", true);
        }
    },
    async mounted() {
        if (this.active) {
            return;
        }

        if (!this.config) {
            this.setConfig(await ipcRenderer.invoke("config"));
        }

        if (!this.config.OBS.address || !this.config.OBS.port) {
            this.config.settings.first = true;
            this.setConfig(this.config);

            this.registerLock();
            this.turnLock(true);
            this.$router.replace("/settings/obs").catch(() => {});
            return;
        }

        if (!this.config.twitch.username || !this.config.twitch.access_token || !this.config.twitch.oauth_token) {
            this.config.settings.first = true;
            this.setConfig(this.config);

            this.registerLock();
            this.turnLock(true);
            this.$router.replace("/services/twitch").catch(() => {});
            return;
        }

        this.setWidgets(this.config.widgets);

        if (!this.obs._connected) {
            if (this.config.settings.first) {
                this.config.settings.first = false;
                this.save(this.config.settings);
            }

            if (!this.helix) {
                this.connectOBS(OBS);
                this.registerIPC();

                ipcRenderer.send("finish-load");

                this.addNotification({
                    text:
                        "Управление:<br/>\
                        Alt + R - меню<br/>\
                        Alt + K - список зрителей",

                    color: "#343a40",
                    icon: () => import("~/assets/icons/keyboard.svg"),
                    handle: 10
                });

                await this.createHelix(this.config.twitch);
            }
        }
    },
    methods: {
        ...mapActions({
            setConfig: "SET_CONFIG",

            turnLock: "ipc/TURN_LOCK",

            connectOBS: "obs/CONNECT",

            addNotification: "notifications/ADD",
            turnUpdate: "notifications/TURN_UPDATE"
        }),
        registerIPC() {
            this.registerLock();
            ipcRenderer.on("update-available", (_, release) => this.turnUpdate(release));

            ipcRenderer.on("turnMenu", (_event, sequence) => {
                if (!this.user) {
                    return;
                }

                this.turnLock(sequence);
                this.$router.replace(sequence ? "/stream" : "/").catch(() => {});

                this.active = false;
            });

            ipcRenderer.on("turnViewersList", () => {
                this.settings.ViewersList.enable = !this.settings.ViewersList.enable;
                this.save();
            });
        },
        registerLock() {
            ipcRenderer.on("turnLock", (_event, mouse) => this.turnLock(mouse));
        }
    }
};
</script>

<style lang="scss">
#content {
    &-valid {
        width: 100%;
        height: 100%;
    }
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