<template>
    <div id="chat-block-messages">
        <div v-if="input" id="chat-block-messages-all">
            <Message 
                v-for="message of messages" 
                :key="message.id" 
                :message="message" 
            />
        </div>

        <transition-group v-else id="chat-block-messages-visible" name="fade" tag="div">
            <Message 
                v-for="message of visibleMessages" 
                :key="message.id" 
                :message="message" 
            />
        </transition-group>
    </div>
</template>

<script>
import { mapState } from "vuex";

import Message from "~/components/Chat/Message";

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
            messages: state => state.service.messages
        }),

        visibleMessages() {
            return this.messages.filter(message => {
                return message.show;
            });
        }
    }
};
</script>

<style lang="scss">
#chat-block-messages {
    &-all, &-visible {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }
}
</style>