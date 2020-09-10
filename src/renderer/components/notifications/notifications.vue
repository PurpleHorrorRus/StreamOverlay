<template>
    <div id="notifications">
        <Notification v-for="(notification, index) of notifications" :key="index" :notification="notification" />
        <LowBitrate v-if="showLowBitrate" :notification="{ color: 'red' }" />
        <LowFPS v-if="showLowFPS" :notification="{ color: 'red' }" />
        <Notification 
            v-if="showUpdate" 
            :notification="{ text: 'Доступно новое обновление. Скачивание...', 
                             color: '#171717' }" 
        />
        <Notification v-if="showChatDisconnect" :notification="{ text: 'Чат отключен', color: 'red' }" />
    </div>
</template>

<script>
import { mapGetters } from "vuex";

import Notification from "~/components/notifications/notification";
import LowBitrate from "~/components/notifications/lowbitrate";
import LowFPS from "~/components/notifications/lowfps";

export default {
    components: { 
        Notification, 
        LowBitrate, 
        LowFPS
    },
    computed: {
        ...mapGetters({
            notifications: "notifications/getNotifications",
            showLowBitrate: "notifications/getLowBitrate",
            showLowFPS: "notifications/getLowFPS",
            showUpdate: "notifications/getShowUpdate",
            showChatDisconnect: "notifications/getChatDisconnect"
        })
    }
};
</script>

<style>
#notifications {
	display: block;
	position: absolute;
	bottom: 25px;
	right: 5px;
	width: 300px;
	height: auto;
}

.notification {
    display: block;
    width: 300px;
    height: auto;

    margin-bottom: 10px;
    padding: 15px;
    
	background: rgba(0, 0, 0, 0.4);
}

.error { color: red; }
</style>