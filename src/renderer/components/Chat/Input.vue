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
import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    data: () => ({
        text: ""
    }),

    methods: {
        send() {
            this.text = this.text.trim();
            
            if (this.text.length > 0 && this.connected) {
                this.serviceDispatch("SAY", this.text);
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