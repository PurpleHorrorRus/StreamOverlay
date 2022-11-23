<template>
    <div id="notifications">
        <div id="notifications-common">
            <Notification
                v-for="notification of notifications.regular"
                :key="notification.id"
                :notification="notification"
            />

            <LowFPS v-show="showLowFPS" />
            <LowBitrate v-show="showLowBitrate" />
            <Update v-if="update.show" />

            <Notification
                v-if="showChatDisconnect"
                :notification="solidNotifications.CHAT_DISCONNECT"
            />
        </div>

        <transition-group id="notifications-presense" name="slide" tag="div">
            <PresenseNotification
                v-for="notification of notifications.presense"
                :key="notification.id"
                :notification="notification"
            />
        </transition-group>
    </div>
</template>

<script>
import { mapState } from "vuex";

import OBSMixin from "~/mixins/obs";

export default {
    components: {
        Notification: () => import("./Notification.vue"),
        PresenseNotification: () => import("./Presense.vue"),
        LowFPS: () => import("./LowFPS.vue"),
        LowBitrate: () => import("./LowBitrate.vue"),
        Update: () => import("./Update.vue")
    },

    mixins: [OBSMixin],

    computed: {
        ...mapState({
            notifications: state => state.notifications.notifications,
            lowfps: state => state.notifications.lowfps,
            lowbitrate: state => state.notifications.lowbitrate,
            showChatDisconnect: state => state.notifications.chatdisconnect,
            update: state => state.notifications.update
        }),

        showLowFPS() {
            return this.OBSConnected
                && this.lowfps;
        },

        showLowBitrate() {
            return this.OBSConnected
                && this.lowbitrate;
        },

        solidNotifications() {
            return {
                CHAT_DISCONNECT: {
                    color: "#ff0000",
                    text: this.$strings.NOTIFICATIONS.DISCONNECTED
                }
            };
        }
    }
};
</script>

<style lang="scss">
#notifications {
    position: absolute;
    right: 0px;

    display: flex;
    flex-direction: column;
    row-gap: 10px;

    width: 300px;
    height: 100%;

    &-common {
        position: absolute;
        bottom: 10px; right: 15px;

        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    &-presense {
        position: absolute;
        top: 20vh; right: 0px;

        display: flex;
        flex-direction: column;
        row-gap: 0px;
    }
}
</style>