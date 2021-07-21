<template>
    <div id="notifications">
        <transition-group name="fade" tag="div">
            <Notification v-for="notification of notifications" :key="notification.text" :notification="notification" />
        </transition-group>

        <LowBitrate v-if="showLowBitrate" :notification="solidNotifications.LOW" />
        <LowFPS v-if="showLowFPS" :notification="solidNotifications.LOW" />
        <Update v-if="update.show" :release="update.release" />
        <Notification v-if="showChatDisconnect" :notification="solidNotifications.CHAT_DISCONNECT" />
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
            notifications: state => state.notifications.notifications,
            showLowBitrate: state => state.notifications.lowbitrate,
            showLowFPS: state => state.notifications.lowfps,
            showChatDisconnect: state => state.notifications.chatdisconnect,
            update: state => state.notifications.update
        }),
        solidNotifications() {
            return {
                LOW: {
                    color: "red"
                },
                CHAT_DISCONNECT: {
                    text: "Чат отключен",
                    color: "red"
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