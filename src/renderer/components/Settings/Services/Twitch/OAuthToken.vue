<template>
    <div id="twitch-settings-oauth" class="twitch-settings">
        <span class="modal-item-tip">
            OAuth Token - нужен для того, чтобы получать сообщения из чата
        </span>

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
import OtherMixin from "~/mixins/other";

export default {
    mixins: [OtherMixin],

    methods: {
        getOAuth() {
            this.openLink("https://twitchapps.com/tmi/");
        }
    }
};
</script>