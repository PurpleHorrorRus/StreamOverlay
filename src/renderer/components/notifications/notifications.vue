<template>
    <div id="notifications">
        <notification v-for="(notification, index) of notifications" :key="index" :notification="notification" />
        <lowbitrate v-if="showLowBitrate" :notification="{ color: 'red' }" />
        <lowfps v-if="showLowFPS" :notification="{ color: 'red' }" />
        <notification v-if="showChatDisconnect" :notification="{ text: 'Чат отключен', color: 'red' }" />
    </div>
</template>

<script>
import notification from "~/components/notifications/notification";
import lowbitrate from "~/components/notifications/lowbitrate";
import lowfps from "~/components/notifications/lowfps";
import { mapGetters } from "vuex";

export default {
    components: { notification, lowbitrate, lowfps },
    computed: {
        ...mapGetters({
            notifications: "notifications/getNotifications",
            showLowBitrate: "notifications/getLowBitrate",
            showLowFPS: "notifications/getLowFPS",
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
    padding: 15px;
	margin-bottom: 10px;
	background: rgba(0, 0, 0, 0.4);
}

.error { color: red; }
</style>