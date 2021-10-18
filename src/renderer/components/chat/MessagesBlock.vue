<template>
    <div id="chat-block-messages">
        <div v-if="input" id="chat-block-messages-all">
            <Message v-for="(message, index) of messages" :key="message.id" :data-index="index" :message="message" />
        </div>
        <transition-group v-else id="chat-block-messages-visible" name="fade" tag="div">
            <Message
                v-for="(message, index) of messages.filter(m => m.show)"
                :key="message.id"
                :data-index="index"
                :message="message"
            />
        </transition-group>
    </div>
</template>

<script>
import { mapState } from "vuex";

import Message from "~/components/chat/Message";

export default {
    components: {
        Message
    },
    props: {
        input: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        ...mapState({
            messages: state => state.twitch.messages
        })
    }
};
</script>