<template>
    <div id="modal-obs-content" class="modal-content">
        <Title
            id="modal-obs-content-title"
            :title="$strings.MENU.OBS.TITLE"
        />

        <div class="modal-body">
            <ToggleButton
                :text="$strings.MENU.OBS.AUTORECONNECT"
                :checked="config.obs.autoreconnect"
                @change="deepChange(config.obs, 'autoreconnect', 'obs')"
            />

            <ToggleButton
                :text="$strings.MENU.OBS.NOTIFICATIONS.LOWFPS"
                :checked="settings.notifications.lowfps"
                @change="deepChange(settings.notifications, 'lowfps')"
            />

            <ToggleButton
                :text="$strings.MENU.OBS.NOTIFICATIONS.LOWBITRATE"
                :checked="settings.notifications.lowbitrate"
                @change="deepChange(settings.notifications, 'lowbitrate')"
            />

            <ToggleButton
                :text="$strings.MENU.OBS.NOTIFICATIONS.MUTEDMIC.TITLE"
                :checked="config.obs.meters.mic.enable"
                @change="changeMicMeter('enable', !config.obs.meters.mic.enable)"
            />

            <ModalCategory
                v-if="config.obs.meters.mic.enable"
                :name="$strings.MENU.OBS.NOTIFICATIONS.MUTEDMIC.METER.TITLE"
            >
                <Range
                    :text="$strings.MENU.OBS.NOTIFICATIONS.MUTEDMIC.METER.LIMIT"
                    :value="config.obs.meters.mic.limit"
                    :max="0"
                    :min="-80"
                    @select="changeMicMeter('limit', Number($event))"
                />

                <Range
                    :text="$strings.MENU.OBS.NOTIFICATIONS.MUTEDMIC.METER.TIMEOUT.TITLE"
                    :tip="$strings.MENU.OBS.NOTIFICATIONS.MUTEDMIC.METER.TIMEOUT.TIP"
                    :value="config.obs.meters.mic.timeout"
                    :max="1000"
                    :min="50"
                    @select="changeMicMeter('timeout', Number($event))"
                />
            </ModalCategory>

            <Input
                :text="$strings.MENU.OBS.ADDRESS"
                :value="address"
                @input="address = $event"
            />

            <Input
                :text="$strings.MENU.OBS.PORT"
                :value="port"
                @input="port = $event"
            />

            <Input
                :text="$strings.MENU.OBS.WEBCAM.TITLE"
                :value="camera"
                :tip="$strings.MENU.OBS.WEBCAM.TIP"
                @input="camera = $event"
            />

            <SolidButton
                :label="$strings.CONTINUE"
                :disabled="disabled"
                @click.native="next"
            />
        </div>
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";
import OtherMixin from "~/mixins/other";

export default {
    mixins: [CoreMixin, OtherMixin],

    layout: "modal",

    data: () => ({
        load: false,
        address: "127.0.0.1",
        port: 4455,
        password: "",
        camera: ""
    }),

    computed: {
        disabled() {
            return this.address.length === 0
                || this.port.length === 0;
        }
    },

    async created() {
        if (this.config.obs) {
            if (typeof this.config.obs.camera === "string") {
                this.config.obs.camera = [this.config.obs.camera];
            }

            this.address = this.config.obs.address;
            this.port = this.config.obs.port;
            this.password = this.config.obs.password;
            this.camera = this.config.obs.camera?.join(", ") || "";
        }
    },

    methods: {
        async next() {
            this.load = true;

            this.config.obs.address = this.address;
            this.config.obs.port = this.port;

            const webcamMapped = this.camera.split(",").map(c => c.trim());
            const webcamSet = new Set(webcamMapped);
            this.config.obs.camera = Array.from(webcamSet);

            this.saveSettings({
                type: "obs",
                content: this.config.obs
            });

            this.$router.replace("/");
        },

        changeMicMeter(field, value) {
            this.config.obs.meters.mic[field] = value;
            this.saveSettings({
                type: "obs",
                content: this.config.obs
            });
        }
    }
};
</script>

<style lang="scss">
#modal-obs-content {
    &-install {
        margin: 10px 0px;
    }
}
</style>