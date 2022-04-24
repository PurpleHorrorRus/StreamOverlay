<template>
    <div v-if="settings" id="content">
        <EditMode v-if="active" />

        <div id="content-valid">
            <Notifications />
            <OBS v-if="showOBS" />
            <Chat v-if="settings.chat.enable" />
            <Widget v-for="widget of widgets" :key="widget.id" :widget="widget" />
            <ViewersList v-if="showViewersList" />
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import { ipcRenderer } from "electron";

import EditMode from "~/components/EditMode";

import OBS from "~/components/OBS";

import Notifications from "~/components/Notifications/Notifications";
import Chat from "~/components/Chat";
import ViewersList from "~/components/ViewersList";
import Widget from "~/components/Widget";

import OBSMixin from "~/mixins/obs";
import TwitchMixin from "~/mixins/twitch";
import TrovoMixin from "~/mixins/trovo";
import WidgetsMixin from "~/mixins/widgets";
import other from "~/mixins/other";

const notifications = {
    controls: {
        text:
                        "Управление:<br/>\
                        Alt + R - меню<br/>\
                        Alt + K - список зрителей",

        color: "#343a40",
        icon: () => import("~/assets/icons/keyboard.svg"),
        handle: 10
    }
};

export default {
    components: {
        EditMode,
        OBS,
        Notifications,
        Chat,
        ViewersList,
        Widget
    },

    mixins: [OBSMixin, TwitchMixin, TrovoMixin, WidgetsMixin, other],

    computed: {
        showOBS() {
            const ServiceInfoEnabled = this.settings.OBSStatus.ServiceInfo 
                || this.settings.OBSStatus.ServiceInfo.enableFollowers;
                
            return this.connected && ServiceInfoEnabled;
        },

        showViewersList() {
            return this.user 
                && this.settings.ViewersList.enable;
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
            const config = await ipcRenderer.invoke("config");
            this.setConfig(config);
        }

        if (this.config.obs && !this.connected) {
            this.connectOBS(this.config.obs);
        }

        if (this.widgets.length === 0 && this.config.widgets.length > 0) {
            this.setWidgets(this.config.widgets);
        }

        if (await this.authService()) {
            this.addNotification(notifications.controls);
            this.registerIPC();
            ipcRenderer.send("finish-load");

            if (this.settings.first) {
                this.settings.first = false;
                this.save();
            }

            return true;
        }
        
        return false;
    },
    methods: {
        ...mapActions({
            turnLock: "ipc/TURN_LOCK",

            connectOBS: "obs/CONNECT",

            addNotification: "notifications/ADD",
            turnUpdate: "notifications/TURN_UPDATE"
        }),
    
        async authService() {
            if (this.settings.service === "none") {
                this.$router.replace("/services").catch(() => {});
                this.settings.first = true;
                return false;
            }

            const auth = await this.serviceDispatch("AUTH");
            if (!auth) {
                return false;
            }

            if (auth.error) {
                return await this.serviceDispatch("LOGIN_ERROR");
            }

            return true;
        },

        registerIPC() {
            ipcRenderer.once("update-available", (_, release) => {
                return this.turnUpdate(release);
            });

            ipcRenderer.on("turnMenu", (_event, sequence) => {
                if (!this.user || this.settings.first) {
                    return;
                }

                this.$router.replace(sequence ? "/stream" : "/").catch(() => {});
                this.active = false;
            });

            ipcRenderer.on("turnViewersList", () => {
                this.deepChange(this.settings.ViewersList, "enable");
            });
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