<template>
    <div class="modal-content">
        <Title title="Прочие настройки" />
        <div class="modal-body">
            <ToggleButton
                :text="$strings.MENU.OTHER.VIEWERS"
                :checked="config.settings.OBSStatus.ServiceInfo.enable"
                @change="deepChange('settings', config.settings.OBSStatus.ServiceInfo, 'enable')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.FOLLOWERS"
                :checked="config.settings.OBSStatus.ServiceInfo.followers"
                @change="deepChange('settings', config.settings.OBSStatus.ServiceInfo, 'followers')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.OBSTECH"
                :checked="config.settings.OBSStatus.tech"
                @change="deepChange('settings', config.settings.OBSStatus, 'tech')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.STREAM_RECORD_TIME"
                :checked="config.settings.OBSStatus.time"
                @change="deepChange('settings', config.settings.OBSStatus, 'time')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.DISCORD"
                :checked="config.settings.discord"
                @change="turnDiscord"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.HARDWARE_ACCELERATION.TITLE"
                :checked="config.settings.hardwareAcceleration"
                :tip="$strings.MENU.OTHER.HARDWARE_ACCELERATION.TIP"
                @change="deepChange('settings', config.settings, 'hardwareAcceleration')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.CONTENT_PROTECTION.TITLE"
                :checked="config.settings.contentProtection"
                :tip="$strings.MENU.OTHER.CONTENT_PROTECTION.TIP"
                @change="deepChange('settings', config.settings, 'contentProtection')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.RESTRICTION"
                :checked="config.settings.restriction"
                @change="deepChange('settings', config.settings, 'restriction')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.DEVTOOLS"
                :checked="config.settings.devtools"
                @change="turnDevtools"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.RAMCLEAN.TITLE"
                :tip="$strings.MENU.OTHER.RAMCLEAN.TIP"
                :checked="config.settings.RAMClean"
                @change="deepChange('settings', config.settings, 'RAMClean')"
            />
        </div>
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    layout: "modal",

    methods: {
        turnDiscord() {
            this.deepChange("settings", this.config.settings, "discord");

            return this.config.settings.discord
                ? this.setActivity()
                : this.clearActivity();
        },

        turnDevtools() {
            this.deepChange("settings", this.config.settings, "devtools");
            return this.$ipc.send("devTools", this.config.settings.devtools);
        }
    }
};
</script>