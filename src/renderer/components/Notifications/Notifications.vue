<template>
    <div id="notifications">
        <transition-group id="notifications-common" name="fade" tag="div">
            <Notification 
                v-for="notification of notifications" 
                :key="notification.text" 
                :notification="notification" 
            />
        </transition-group>

        <LowBitrate v-show="showLowBitrate" />
        <LowFPS v-show="showLowFPS" />
        <Update v-if="update.show" :release="update.release" />

        <Notification 
            v-show="showChatDisconnect" 
            :notification="solidNotifications.CHAT_DISCONNECT" 
        />
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    components: {
        Notification: () => import("~/components/Notifications/Notification"),
        LowBitrate: () => import("~/components/Notifications/LowBitrate"),
        LowFPS: () => import("~/components/Notifications/LowFPS"),
        Update: () => import("~/components/Notifications/Update")
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