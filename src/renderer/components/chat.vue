<template>
    <movable v-if="settings" :source="settings.chat" name="Чат" @onResize="onResize" @onDrag="onDrag">
        <div id="chat-block">
            <message 
                v-for="(message, index) of messages" 
                :key="message.id + index" 
                :message="message" 
            />
        </div>
    </movable>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import movable from "~/components/movable";
import message from "~/components/message";

export default {
    components: { movable, message },
    computed: {
        ...mapGetters({
            active: "overlays/getEdit",
            settings: "settings/getSettings",
            messages: "twitch/getMessages"
        })
    },
    methods: {
        ...mapActions({
            saveSettings: "settings/saveSettings"
        }),
        onResize (x, y, width, height) {
            this.settings.chat.width = width;
            this.settings.chat.height = height;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        },
        onDrag (x, y) {
            this.settings.chat.x = x;
            this.settings.chat.y = y;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        }
    }
};
</script>

<style>
#chat-block { 
    position: absolute; 
    width: 100%; 
    height: 100%; 
    overflow: hidden;
}
</style>