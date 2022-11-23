<template>
    <div class="modal-content">
        <Title title="Настройки оповещений Twitch" />

        <div class="modal-body">
            <ToggleButton
                v-for="notification of notifications"
                :key="notification.type"
                :text="notification.name"
                :checked="config.twitch.notifications[notification.type]"
                @change="deepChange(config.twitch.notifications, notification.type)"
            />
        </div>
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {

    mixins: [CoreMixin],
    layout: "modal",

    data: () => ({
        notifications: []
    }),

    created() {
        this.notifications = [{
            name: this.$strings.MENU.SERVICES.TWITCH.NOTIFICATIONS.NEW_FOLLOWER,
            type: "channel.follow"
        }, {
            name: this.$strings.MENU.SERVICES.TWITCH.NOTIFICATIONS.NEW_SUBSCRIBER,
            type: "channel.subscribe"
        }, {
            name: this.$strings.MENU.SERVICES.TWITCH.NOTIFICATIONS.UPDATE_STREAM,
            type: "channel.update"
        }, {
            name: this.$strings.MENU.SERVICES.TWITCH.NOTIFICATIONS.BAN,
            type: "channel.ban"
        }, {
            name: this.$strings.MENU.SERVICES.TWITCH.NOTIFICATIONS.STREAM_START,
            type: "stream.online"
        }];
    }
};
</script>