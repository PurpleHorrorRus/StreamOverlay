<template>
    <Movable v-if="settings" class="chat" :source="settings.chat" name="Чат" @onResize="onResize" @onDrag="onDrag">
        <div id="chat-block">
            <Message v-for="(message, index) of messages" :key="message.id + index" :message="message" />
        </div>
    </Movable>
</template>

<script>
import { mapState } from "vuex";

import Movable from "~/components/Movable";
import Message from "~/components/chat/Message";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Movable,
        Message
    },
    mixins: [CoreMixin],
    computed: {
        ...mapState({
            messages: state => state.twitch.messages
        })
    },
    methods: {
        onResize(x, y, width, height) {
            this.settings.chat.width = width;
            this.settings.chat.height = height;
            this.onDrag(x, y);
        },
        onDrag(x, y) {
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

<style lang="scss">
#chat-block {
    border-radius: 5px;

    overflow: hidden;

    .message:last-child {
        border-bottom-right-radius: 5px;
        border-bottom-left-radius: 5px;
    }
}
</style>