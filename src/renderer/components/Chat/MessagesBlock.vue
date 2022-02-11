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
            messages: state => state.twitch.messages,
            helix: state => state.twitch.helix,
            user_id: state => state.twitch.user.id
        }),
        visibleMessages() {
            return this.messages.filter(m => m.show);
        }
    }
};
</script>