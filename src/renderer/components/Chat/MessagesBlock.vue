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

import Message from "~/components/Chat/Message";

import CoreMixin from "~/mixins/core";

export default {
    components: {
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
    
    computed: {
        ...mapState({
            twitchMessages: state => state.twitch.service.messages,
            trovoMessages: state => state.trovo.service.messages
        }),

        messages() {
            switch(this.settings.service) {
                case this.services.twitch: return this.twitchMessages;
                case this.services.trovo: return this.trovoMessages;
            }

            return this.twitchMessages;
        },

        visibleMessages() {
            return this.messages.filter(message => {
                return message.show;
            });
        }
    }
};
</script>