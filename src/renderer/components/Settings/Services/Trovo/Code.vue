<template>
    <div id="trovo-settings-access-token" class="trovo-settings">
        <div class="modal-item-tip">
            <span class="modal-item-tip-text">
                На этой странице необходимо получить одноразовый код доступа к
                Trovo, который в последствии в автоматическом режиме будет изменён
                на Access Token и Refresh Token для доступа к Trovo API и чату.
                Из-за особенностей Trovo код необходимо разменивать повторно каждые 30 дней
            </span>
        </div>

        <div class="trovo-settings-form">
            <Input @input="$emit('input', $event)" />
            <SolidButton :label="'Получить'" @clicked="getCode" />
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
        async getCode() {
            const url = new TrovoAPI({ 
                // eslint-disable-next-line no-undef
                client_id: process.env.trovo_client_id,
                // eslint-disable-next-line no-undef
                client_secret: process.env.trovo_client_secret,
                redirect_uri: "https://purplehorrorrus.github.io/token"
            }).getAuthLink([], "code");

            this.openLink(url);
        }
    }
};
</script>