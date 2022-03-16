<template>
    <div id="trovo-settings-access-token" class="trovo-settings">
        <div class="modal-item-tip">
            <span class="modal-item-tip-text">
                Access Token - нужен для того, чтобы менять название стрима и игру через оверлей,
                а так же получать сообщения из чата
            </span>
        </div>

        <div class="trovo-settings-form">
            <Input
                :value="$parent.access_token"
                @input="$emit('input', $event)"
            />
            
            <SolidButton :label="'Получить'" @clicked="getToken" />
        </div>
    </div>
</template>

<script>
import { TrovoAPI } from "simple-trovo-api";

import Input from "~/components/Settings/Input";
import SolidButton from "~/components/SolidButton";

import OtherMixin from "~/mixins/other";

export default {
    components: {
        Input,
        SolidButton
    },
    
    mixins: [OtherMixin],

    methods: {
        async getToken() {
            const url = new TrovoAPI({ 
                // eslint-disable-next-line no-undef
                client_id: process.env.client_id 
            }).getAuthLink([], "https://purplehorrorrus.github.io/token");

            this.openLink(url);
        }
    }
};
</script>