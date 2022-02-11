<template>
    <div id="twitch-settings-oauth" class="twitch-settings">
        <div class="modal-item-tip">
            <span class="modal-item-tip-text">
                OAuth Token - нужен для того, чтобы получать сообщения из чата
            </span>
        </div>

        <div class="twitch-settings-form">
            <Input
                :value="$parent.oauth_token"
                @input="$emit('input', $event)"
            />

            <SolidButton :label="'Получить'" @clicked="getOAuth" />
        </div>
    </div>
</template>

<script>
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
        getOAuth() {
            this.openLink("https://twitchapps.com/tmi/");
        }
    }
};
</script>