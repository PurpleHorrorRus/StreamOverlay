<template>
    <div id="settings-trovo" class="modal-content">
        <Title :title="$strings.MENU.SERVICES.TROVO.TITLE" />

        <div class="modal-body">
            <MenuError v-if="error" :error="error" />

            <div v-if="!settings.first" id="settings-trovo-notifications">
                <ToggleButton
                    :text="$strings.MENU.SERVICES.TROVO.JOIN"
                    :checked="config.trovo.notifications.welcome"
                    @change="deepChange(config.trovo.notifications, 'welcome', null, 'trovo')"
                />

                <ToggleButton
                    :text="$strings.MENU.SERVICES.TROVO.PAST.TITLE"
                    :checked="settings.trovo.past"
                    :tip="$strings.MENU.SERVICES.TROVO.PAST.TIP"
                    @change="deepChange(config.trovo, 'past', null, 'trovo')"
                />
            </div>

            <TrovoSettinsCode @input="code = $event" />

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
import { TrovoAPI } from "simple-trovo-api";

import CoreMixin from "~/mixins/core";
import OtherMixin from "~/mixins/other";

const accessTokenRegex = /code=(.*?)&/;

let TrovoClient = null;

export default {
    components: {
        MenuError: () => import("~/components/Menu/Notifications/Error.vue"),
        TrovoSettinsCode: () => import("~/components/Settings/Services/Trovo/Code.vue")
    },

    mixins: [CoreMixin, OtherMixin],

    layout: "modal",

    data: () => ({
        code: "",
        error: "",
        validating: false
    }),

    computed: {
        ...mapState({
            paths: state => state.config.paths
        }),

        disabled() {
            return this.code.length === 0;
        }
    },

    watch: {
        code(code) {
            if (accessTokenRegex.test(code)) {
                this.code = code.match(accessTokenRegex)[1];
            }
        }
    },

    async created() {
        if (this.config.trovo.code) {
            this.code = this.config.trovo.code;
        }
    },

    methods: {
        async next() {
            this.validating = true;
            this.error = "";

            const credits = await this.validate().catch(e => {
                this.reset();
                this.error = e;
                return false;
            });

            if (credits) {
                this.config.trovo = credits;
                this.setConfig(this.config);
                this.$router.replace("/");
            }
        },

        async validate() {
            if (!TrovoClient) {
                TrovoClient = new TrovoAPI({
                    // eslint-disable-next-line no-undef
                    client_id: process.env.trovo_client_id,
                    // eslint-disable-next-line no-undef
                    client_secret: process.env.trovo_client_secret,
                    redirect_uri: "https://purplehorrorrus.github.io/token",
                    credits: this.paths.trovo
                });
            }

            return await TrovoClient.exchange(this.code);
        },

        handleError(error) {
            return {
                success: false,
                error
            };
        },

        reset() {
            TrovoClient = null;
            this.validating = false;
        }
    }
};
</script>

<style lang="scss">
.trovo-settings {
    &-form {
        display: flex;

        gap: 10px;

        .solid-button {
            min-width: 85px;
        }
    }
}
</style>