<template>
    <div id="trovo-settings-access-token" class="trovo-settings">
        <div class="modal-item-tip">
            <span
                class="modal-item-tip-text"
                v-text="$strings.MENU.SERVICES.TROVO.TIP"
            />
        </div>

        <div class="input-form">
            <Input @input="$emit('input', $event)" />
            <SolidButton
                :label="$strings.GET"
                @click.native="getCode"
            />
        </div>
    </div>
</template>

<script>
import { TrovoAPI } from "simple-trovo-api";

import OtherMixin from "~/mixins/other";

export default {
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