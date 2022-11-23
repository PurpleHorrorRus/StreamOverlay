<template>
    <div id="twitch-settings-access-token" class="twitch-settings">
        <div class="modal-item-tip">
            <span
                class="modal-item-tip-text"
                v-text="$strings.MENU.SERVICES.TWITCH.ACCESS_TOKEN"
            />
        </div>

        <div class="input-form">
            <Input
                :value="$parent.access_token"
                @input="$emit('input', $event)"
            />

            <SolidButton :label="$strings.GET" @click.native="getToken" />
        </div>
    </div>
</template>

<script>
import Helix from "simple-helix-api";

import OtherMixin from "~/mixins/other";

export default {
    mixins: [OtherMixin],

    methods: {
        async getToken() {
            const url = await new Helix({
                // eslint-disable-next-line no-undef
                client_id: process.env.twitch_client_id
            }).getAuthLink([], "https://purplehorrorrus.github.io/token");

            this.openLink(url);
        }
    }
};
</script>