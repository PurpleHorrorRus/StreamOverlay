<template>
    <Movable v-if="settings" class="chat" :source="settings.chat" name="Чат" @onResize="onResize" @onDrag="onDrag">
        <div id="chat-block" :class="{ input }">
            <div id="chat-block-messages">
                <div v-if="input" id="chat-block-messages-all">
                    <Message v-for="(message, index) of messages" :key="message.id + index" :message="message" />
                </div>
                <div v-else id="chat-block-messages-visible">
                    <Message
                        v-for="(message, index) of messages.filter(m => m.show)"
                        :key="message.id + index"
                        :message="message"
                    />
                </div>
            </div>
            <div v-if="input" id="chat-block-input">
                <input
                    id="chat-block-input-field"
                    ref="input-field"
                    v-model="text"
                    type="text"
                    :placeholder="connected ? 'Введите сообщение...' : 'Подключение...'"
                    :disabled="!connected"
                    @keyup.enter="send"
                >
            </div>
        </div>
    </Movable>
</template>

<script>
import { mapActions, mapState } from "vuex";

import Movable from "~/components/Movable";
import Message from "~/components/chat/Message";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Movable,
        Message
    },
    mixins: [CoreMixin],
    props: {
        input: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data: () => ({
        text: ""
    }),
    computed: {
        ...mapState({
            messages: state => state.twitch.messages,
            connected: state => state.twitch.connected
        })
    },
    methods: {
        ...mapActions({
            say: "twitch/SAY"
        }),
        send() {
            if (this.text.trim().length > 0 && this.connected) {
                this.say(this.text.trim());
                this.text = "";
            }
        },
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
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 30px;
    grid-template-areas:
        "messages"
        "input";

    height: 100%;

    border-radius: 5px;

    overflow: hidden;

    &.input {
        background: $primary;

        box-shadow: 0 3px 6px rgba(0, 0, 0, .16), 0 3px 6px rgba(0, 0, 0, .23);

        user-select: text;

        * {
            user-select: text;
        }

        #chat-block-messages {
            overflow-x: hidden;
            overflow-y: auto;

            .message {
                background: none !important;

                cursor: text;
            }
        }
    }

    &:not(.input) {
        #chat-block-messages {
            .message:first-child {
                border-top-right-radius: 5px;
                border-top-left-radius: 5px;
            }

            .message:last-child {
                border-bottom-right-radius: 5px;
                border-bottom-left-radius: 5px;
            }
        }
    }

    &-messages {
        grid-area: messages;
    }

    &-input {
        grid-area: input;

        &-field {
            width: 100%;
            height: 100%;

            padding: 10px;

            background: $primary;
            border: none;
            border-top: 1px solid $secondary;
            outline: none;
        }
    }
}
</style>