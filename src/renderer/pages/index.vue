<template>
    <div id="content">
        <EditMode v-if="edit" />

        <div v-if="inited" id="content-valid">
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

import OBSMixin from "~/mixins/obs";
import WidgetsMixin from "~/mixins/widgets";

const notifications = {
    controls: {
        text: "Управление:<br/>\
            Alt + R - меню<br/>\
            Alt + K - список зрителей",

        color: "#343a40",
        icon: () => import("~/assets/icons/keyboard.svg"),
        handle: 10
    }
};

export default {
    components: {
        EditMode: () => import("~/components/EditMode.vue"),
        OBS: () => import("~/components/OBS.vue"),
        Notifications: () => import("~/components/Notifications/Notifications.vue"),
        Chat: () => import("~/components/Chat.vue"),
        Widget: () => import("~/components/Widget.vue"),
        ViewersList: () => import("~/components/ViewersList.vue")
    },

    mixins: [OBSMixin, WidgetsMixin],
    
    data: () => ({
        inited: false
    }),

    computed: {
        showOBS() {
            return this.connected
                && (this.settings.OBSStatus.ServiceInfo.enable
                || this.settings.OBSStatus.ServiceInfo.followers);
        },

        showViewersList() {
            return this.connected
                && this.settings.ViewersList.enable;
        }
    },

    async mounted() {
        this.edit = Boolean(this.$route.query.edit);
        if (this.edit) {
            return false;
        }

        if (!this.config) {
            const config = await ipcRenderer.invoke("config");
            await this.setConfig(config);
            await this.loadLanguage("ru");
        }

        if (this.widgets.length === 0 && this.config.widgets.length > 0) {
            this.setWidgets(this.config.widgets);
        }

        if (await this.authService()) {
            if (this.settings.first) {
                this.settings.first = false;
                this.save();
            }

            this.inited = true;

            this.initService();
            this.connectOBS();
            this.registerIPC();

            await this.startFollowers();
            this.setActivity();
            this.addNotification(notifications.controls);
        }

        return ipcRenderer.send("dom-ready");
    },
    methods: {
        ...mapActions({
            loadLanguage: "strings/LOAD",

            initService: "service/INIT",

            startFollowers: "followers/START",

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
                this.edit = false;
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