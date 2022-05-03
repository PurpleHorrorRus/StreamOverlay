<template>
    <div id="content">
        <EditMode v-if="active" />

        <div v-if="settings" id="content-valid">
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
import WidgetsMixin from "~/mixins/widgets";
import OtherMixin from "~/mixins/other";

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

    mixins: [OBSMixin, WidgetsMixin, OtherMixin],

    computed: {
        showOBS() {
            const ServiceInfo = this.settings.OBSStatus.ServiceInfo;
            return this.connected && (ServiceInfo.enable || ServiceInfo.followers);
        },

        showViewersList() {
            return this.connected 
                && this.settings.ViewersList.enable;
        }
    },
    
    async mounted() {
        this.active = Boolean(this.$route.query.edit);

        if (this.active) {
            return false;
        }

        if (!this.config) {
            const config = await ipcRenderer.invoke("config");
            this.setConfig(config);
        }

        if (this.config.obs && !this.OBSConnected) {
            this.connectOBS(this.config.obs);
        }

        if (this.widgets.length === 0 && this.config.widgets.length > 0) {
            this.setWidgets(this.config.widgets);
        }

        if (await this.authService()) {
            this.addNotification(notifications.controls);
            this.registerIPC();
            ipcRenderer.send("dom-ready");

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

            return await this.serviceDispatch("AUTH");
        },

        registerIPC() {
            ipcRenderer.once("update-available", (_, release) => {
                return this.turnUpdate(release);
            });

            ipcRenderer.on("turnMenu", (_event, sequence) => {
                if (!this.connected || this.settings.first) {
                    return false;
                }

                this.$router.push(sequence ? "/stream" : "/");
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
</style>