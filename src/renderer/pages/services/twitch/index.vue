<template>
    <div class="modal-content">
        <Title :title="$strings.MENU.SERVICES.TWITCH.TITLE" />

        <div id="twitch-settings" class="modal-body">
            <MenuError
                v-if="error"
                :error="error"
            />

            <MenuLink
                v-if="!config.settings.first"
                :text="$strings.MENU.SERVICES.TWITCH.NOTIFICATIONS_SETTINGS"
                :link="'/services/twitch/notifications'"
            />

            <ToggleButton
                :text="$strings.MENU.SERVICES.TWITCH.CHAT_SECURE"
                :checked="config.twitch.chatSecure"
                @change="deepChange('twitch', config.twitch, 'chatSecure')"
            />

            <ToggleButton
                :text="$strings.MENU.SERVICES.TWITCH.DEBUG_CHAT"
                :checked="config.twitch.chatDebug"
                @change="deepChange('twitch', config.twitch, 'chatDebug')"
            />

            <ToggleButton
                :text="$strings.MENU.SERVICES.TWITCH.DEBUG_EVENTSUB"
                :checked="config.twitch.eventsubDebug"
                @change="deepChange('twitch', config.twitch, 'eventsubDebug')"
            />

            <ToggleButton
                v-if="!config.settings.first"
                :text="$strings.MENU.SERVICES.TWITCH.BADGES"
                :checked="config.settings.chat.badges"
                @change="deepChange('settings', config.settings.chat, 'badges')"
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
                this.username.length === 0 
                || this.access_token.length === 0
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
                this.config.settings.first = true;
                this.access_token = "";
                this.error = this.$strings.MENU.SERVICES.TWITCH.ERROR.OUTDATED;
            }
        }
    },

    methods: {
        async next() {
			this.validating = true;
			this.error = "";

			const success = await this.validate().catch(() => {
				this.reset();
				return false;
			});

			if (!success) {
				this.validating = false;
				return false;
			}

			this.config.twitch.save({
				...this.config.twitch,
				username: this.username,
				access_token: this.access_token,
				version: this.version
			});

			return this.$router.replace("/")
				.catch(() => (false));
		},

        async validate() {
            helix = new Helix({
                // eslint-disable-next-line no-undef
                client_id: process.env.twitch_client_id,
                access_token: this.access_token.trim()
            });

            const user = (await helix.users.getByLogin(this.username.toLowerCase()).catch(() => {
                this.error = this.$strings.MENU.SERVICES.TWITCH.ERROR.INVALID;
                throw this.error;
            }))?.data[0];

            if (!user) {
                this.error = this.$strings.MENU.SERVICES.TWITCH.ERROR.NOT_FOUND;
                throw this.error;
            }

            const data = (await helix.channel.get(user.id))?.data[0];
            return await helix.updateStream(user.id, data.title, data.game_name);
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