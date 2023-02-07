<template>
    <Movable
        :source="config.settings.chat"
        :name="$strings.MENU.EDIT.ELEMENTS.CHAT"
        :canBringTop="true"
    >
        <div id="chat-block" class="movable-slot" :class="{ input }">
            <MessagesBlock :input="input" />
            <ChatInput v-if="input" />
        </div>
    </Movable>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    components: {
        MessagesBlock: () => import("./Chat/MessagesBlock.vue"),
        ChatInput: () => import("./Chat/Input.vue")
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
            this.config.settings.chat.width = width;
            this.config.settings.chat.height = height;
            this.onDrag(x, y);
        },

        onDrag(x, y) {
            this.config.settings.chat.x = x;
            this.config.settings.chat.y = y;
            return this.config.settings.save();
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

    z-index: 1;

    &.input {
        grid-template-rows: 1fr 40px;

        background: var(--primary);

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