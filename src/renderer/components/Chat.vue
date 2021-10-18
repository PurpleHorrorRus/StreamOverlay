<template>
    <Movable v-if="settings" class="chat" :source="settings.chat" name="Чат" @onResize="onResize" @onDrag="onDrag">
        <div id="chat-block" :class="{ input }">
            <MessagesBlock :input="input" />
            <ChatInput v-if="input" />
        </div>
    </Movable>
</template>

<script>
import Movable from "~/components/Movable";
import MessagesBlock from "~/components/chat/MessagesBlock";
import ChatInput from "~/components/chat/Input";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Movable,
        MessagesBlock,
        ChatInput
    },
    mixins: [CoreMixin],
    props: {
        input: {
            type: Boolean,
            required: false,
            default: false
        }
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
            this.save();
        }
    }
};
</script>

<style lang="scss">
#chat-block {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 1fr;

    height: 100%;

    border-radius: 5px;

    overflow: hidden;

    &.input {
        grid-template-rows: 1fr 30px;

        background: $primary;

        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

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
}
</style>