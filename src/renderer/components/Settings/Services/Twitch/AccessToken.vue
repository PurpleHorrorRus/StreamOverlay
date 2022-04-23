<template>
    <div id="twitch-settings-access-token" class="twitch-settings">
        <div class="modal-item-tip">
            <span class="modal-item-tip-text">
                Access Token - нужен для того, чтобы менять название стрима и игру через оверлей
            </span>
        </div>

        <div class="twitch-settings-form">
            <Input
                :value="$parent.access_token"
                @input="$emit('input', $event)"
            />
            
            <SolidButton :label="'Получить'" @clicked="getToken" />
        </div>
    </div>
</template>

<script>
import Helix from "simple-helix-api";

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
            const url = new Helix({
                // eslint-disable-next-line no-undef
                client_id: process.env.twitch_client_id,
                redirect_uri: "https://purplehorrorrus.github.io/token"
            }).getAuthLink();

            this.openLink(url);
        }
    }
};
</script>