<template>
    <div id="chat-block-input">
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
</template>

<script>
import { mapActions, mapState } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    data: () => ({
        text: ""
    }),

    computed: {
        ...mapState({
            twitchConnected: state => state.twitch.service.connected,
            trovoConnected: state => state.trovo.service.connected
        }),

        connected() {
            switch(this.settings.service) {
                case this.services.twitch: return this.twitchConnected;
                case this.services.trovo: return this.trovoConnected;
            }
            
            return false;
        }
    },
    methods: {
        ...mapActions({
            say: "twitch/SAY"
        }),

        send() {
            this.text = this.text.trim();
            
            if (this.text.length > 0 && this.connected) {
                this.say(this.text);
                this.text = "";
            }
        }
    }
};
</script>

<style lang="scss">
#chat-block-input {
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
</style>