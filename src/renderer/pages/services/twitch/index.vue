<template>
    <div class="modal-content">
        <Title :title="$strings.MENU.SERVICES.TWITCH.TITLE" />

        <div id="twitch-settings" class="modal-body">
            <MenuError v-if="error" :error="error" />

            <MenuLink
                v-if="!settings.first"
                :text="$strings.MENU.SERVICES.TWITCH.NOTIFICATIONS_SETTINGS"
                :link="'/services/twitch/notifications'"
            />

            <ToggleButton
                :text="$strings.MENU.SERVICES.TWITCH.CHAT_SECURE"
                :checked="config.twitch.chatSecure"
                @change="deepChange(config.twitch, 'chatSecure', 'twitch')"
            />

            <ToggleButton
                :text="$strings.MENU.SERVICES.TWITCH.DEBUG_CHAT"
                :checked="config.twitch.chatDebug"
                @change="deepChange(config.twitch, 'chatDebug', 'twitch')"
            />

            <ToggleButton
                :text="$strings.MENU.SERVICES.TWITCH.DEBUG_EVENTSUB"
                :checked="config.twitch.eventsubDebug"
                @change="deepChange(config.twitch, 'eventsubDebug', 'twitch')"
            />

            <ToggleButton
                v-if="!settings.first"
                :text="$strings.MENU.SERVICES.TWITCH.BADGES"
                :checked="settings.chat.badges"
                @change="deepChange(settings.chat, 'badges')"
            />

            <Input
                :text="$strings.MENU.SERVICES.TWITCH.USERNAME"
                :value="username"
                @input="username = $event"
            />

            <TwitchSettingsAccessToken @input="access_token = $event" />

            <SolidButton
                :label="$strings.CONTINUE"
                :disabled="disabled"
                :load="validating"
                @click.native="next"
            />
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

import Helix from "simple-helix-api";

import CoreMixin from "~/mixins/core";
import OtherMixin from "~/mixins/other";

const accessTokenRegex = /access_token=(.*?)&/;

let helix = null;

export default {
    components: {
        MenuError: () => import("~/components/Menu/Notifications/Error"),

        TwitchSettingsAccessToken: () => import("~/components/Settings/Services/Twitch/AccessToken.vue")
    },

    mixins: [CoreMixin, OtherMixin],

    layout: "modal",

    data: () => ({
        username: "",
        access_token: "",
        error: "",
        validating: false
    }),

    computed: {
        ...mapState({
            version: state => state.twitch.version
        }),

        disabled() {
            return (
                this.username.length === 0 ||
                this.access_token.length === 0
            );
        }
    },

    watch: {
        access_token(access_token) {
            if (accessTokenRegex.test(access_token)) {
                this.access_token = access_token.match(accessTokenRegex)[1];
            }
        }
    },

    async created() {
        if (this.config.twitch.username) {
            this.username = this.config.twitch.username;
            this.access_token = this.config.twitch.access_token;

            if (this.$route.query.outdated) {
                this.settings.first = true;
                this.access_token = "";
                this.error = this.$strings.MENU.SERVICES.TWITCH.ERROR.OUTDATED;
            }
        }
    },

    methods: {
        async next() {
            this.validating = true;
            this.error = "";

            const success = await this.validate().catch(e => {
                this.reset();
                this.error = e.error;
                return false;
            });

            if (success) {
                this.saveSettings({
                    type: "twitch",
                    content: {
                        ...this.config.twitch,
                        username: this.username,
                        access_token: this.access_token,
                        version: this.version
                    }
                });

                this.$router.replace("/");
            }
        },

        async validate() {
            helix = new Helix({
                // eslint-disable-next-line no-undef
                client_id: process.env.twitch_client_id,
                access_token: this.access_token
            });

            const user = await helix.users.getByLogin(this.username.toLowerCase())
                .catch(() => {
                    throw this.handleError(this.$strings.MENU.SERVICES.TWITCH.ERROR.INVALID);
                });

            if (user.length === 0) {
                throw this.handleError(this.$strings.MENU.SERVICES.TWITCH.ERROR.NOT_FOUND);
            }

            const data = await helix.channel.get(user.id);
            return await helix.updateStream(user.id, data.title, data.game_name);
        },

        handleError(error) {
            return {
                success: false,
                error
            };
        },

        reset() {
            helix = null;
            this.validating = false;
        }
    }
};
</script>

<style lang="scss">
#twitch-settings {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
}
</style>