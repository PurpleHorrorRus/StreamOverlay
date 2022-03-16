<template>
    <div id="chat-block-messages">
        <div v-if="input" id="chat-block-messages-all">
            <Message v-for="message of messages" :key="message.id" :message="message" />
        </div>
        <transition-group v-else id="chat-block-messages-visible" name="fade" tag="div">
            <Message v-for="message of visibleMessages" :key="message.id" :message="message" />
        </transition-group>
    </div>
</template>

<script>
import Message from "~/components/Chat/Message";

import TwitchMixin from "~/mixins/twitch";

export default {
    components: {
        Message
    },

    mixins: [TwitchMixin],

    props: {
        input: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    
    computed: {
        visibleMessages() {
            return this.messages.filter(m => m.show);
        }
    }
};
</script>