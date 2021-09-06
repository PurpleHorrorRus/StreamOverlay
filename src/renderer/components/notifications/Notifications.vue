<template>
    <div id="notifications">
        <transition-group id="notifications-common" name="fade" tag="div">
            <Notification v-for="notification of notifications" :key="notification.text" :notification="notification" />
        </transition-group>

        <LowBitrate v-if="showLowBitrate" />
        <LowFPS v-if="showLowFPS" />
        <Update v-if="update.show" :release="update.release" />
        <Notification v-if="showChatDisconnect" :notification="solidNotifications.CHAT_DISCONNECT" />
        <Notification v-if="!online" :notification="solidNotifications.NO_CONNECTION" />
    </div>
</template>

<script>
import { mapState } from "vuex";

import Notification from "~/components/notifications/notification";
import LowBitrate from "~/components/notifications/lowbitrate";
import LowFPS from "~/components/notifications/lowfps";
import Update from "~/components/notifications/update";

export default {
    components: {
        Notification,
        LowBitrate,
        LowFPS,
        Update
    },
    computed: {
        ...mapState({
            online: state => state.twitch.online,
            notifications: state => state.notifications.notifications,
            showLowBitrate: state => state.notifications.lowbitrate,
            showLowFPS: state => state.notifications.lowfps,
            showChatDisconnect: state => state.notifications.chatdisconnect,
            update: state => state.notifications.update
        }),
        error() {
            return {
                color: "#ff0000"
            };
        },
        solidNotifications() {
            return {
                LOW: this.error,
                NO_CONNECTION: {
                    ...this.error,
                    text: "Нет соединения с Twitch..."
                },
                CHAT_DISCONNECT: {
                    ...this.error,
                    text: "Чат отключен"
                }
            };
        }
    }
};
</script>

<style>
#notifications {
    position: absolute;
    bottom: 25px;
    right: 15px;

    width: 300px;
    height: auto;
}
</style>