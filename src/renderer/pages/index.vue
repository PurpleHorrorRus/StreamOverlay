<template>
    <div v-if="settings" id="content">
        <EditMode v-if="active" />

        <div id="content-valid">
            <Notifications />
            <OBS v-if="showOBS" />
            <TechInfo v-if="showTech" />
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
import TechInfo from "~/components/obs/TechInfo";

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
        TechInfo,
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

        showTech() {
            return this.settings?.TechInfo.enable 
                && this.connected 
                && this.status.tech !== null;
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

        if (!this.validateServices()) {
            this.config.settings.first = true;
            this.setConfig(this.config);

            this.registerLock();
            this.turnLock(true);
            return;
        }

        if (this.config.obs && !this.connected) {
            this.connectOBS(this.config.obs);
        }

        if (this.config.settings.first) {
            this.config.settings.first = false;
            this.save(this.config.settings);
        }

        if (this.widgets.length === 0 && this.config.widgets.length > 0) {
            this.setWidgets(this.config.widgets);
        }

        switch(this.config.settings.service) {
            case this.services.twitch: {
                // eslint-disable-next-line no-undef
                if (!process.env.twitch_client_id) {
                    console.warn("[Trovo] There is no secrets for Twitch client");
                    return;
                }

                if (this.helix) return;
                await this.createHelix(this.config.twitch);
                break;
            }

            case this.services.trovo: {
                // eslint-disable-next-line no-undef
                if (!process.env.trovo_client_id || !process.env.trovo_client_secret) {
                    console.warn("[Trovo] There is no secrets for Trovo client");
                    return;
                }

                if (this.trovo) return;
                await this.createTrovo(this.config.trovo);
                break;
            }
        }

        this.addNotification(notifications.controls);
        this.registerIPC();
        ipcRenderer.send("finish-load");
    },
    methods: {
        ...mapActions({
            turnLock: "ipc/TURN_LOCK",

            connectOBS: "obs/CONNECT",

            addNotification: "notifications/ADD",
            turnUpdate: "notifications/TURN_UPDATE"
        }),

        validateServices() {
            switch (this.config.settings.service) {
                case this.services.twitch: {
                    // eslint-disable-next-line max-len
                    if (!this.config.twitch.username || !this.config.twitch.access_token || !this.config.twitch.oauth_token) {
                        this.$router.replace("/services/twitch").catch(() => {});
                        return false;
                    }

                    return true;
                }

                case this.services.trovo: {
                    if (!this.config.trovo.access_token) {
                        this.$router.replace("/services/trovo").catch(() => {});
                        return false;
                    }

                    return true;
                }
            }

            return true;
        },

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
                this.deepChange(this.settings.ViewersList, "enable");
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