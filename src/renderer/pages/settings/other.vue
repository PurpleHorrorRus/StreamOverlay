<template>
    <div class="modal-content">
        <Title title="Прочие настройки" />
        <div class="modal-body">
            <ToggleButton
                :text="$strings.MENU.OTHER.VIEWERS"
                :checked="settings.OBSStatus.ServiceInfo.enable"
                @change="deepChange(settings.OBSStatus.ServiceInfo, 'enable')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.FOLLOWERS"
                :checked="settings.OBSStatus.ServiceInfo.followers"
                @change="deepChange(settings.OBSStatus.ServiceInfo, 'followers')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.OBSTECH"
                :checked="settings.OBSStatus.tech"
                @change="deepChange(settings.OBSStatus, 'tech')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.STREAM_RECORD_TIME"
                :checked="settings.OBSStatus.time"
                @change="deepChange(settings.OBSStatus, 'time')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.DISCORD"
                :checked="settings.discord"
                @change="turnDiscord"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.HARDWARE_ACCELERATION.TITLE"
                :checked="settings.hardwareAcceleration"
                :tip="$strings.MENU.OTHER.HARDWARE_ACCELERATION.TIP"
                @change="deepChange(settings, 'hardwareAcceleration')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.CONTENT_PROTECTION.TITLE"
                :checked="settings.contentProtection"
                :tip="$strings.MENU.OTHER.CONTENT_PROTECTION.TIP"
                @change="deepChange(settings, 'contentProtection')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.RESTRICTION"
                :checked="settings.restriction"
                @change="deepChange(settings, 'restriction')"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.DEVTOOLS"
                :checked="settings.devtools"
                @change="turnDevtools"
            />

            <ToggleButton
                :text="$strings.MENU.OTHER.RAMCLEAN.TITLE"
                :tip="$strings.MENU.OTHER.RAMCLEAN.TIP"
                :checked="settings.RAMClean"
                @change="deepChange(settings, 'RAMClean')"
            />
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from "electron";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    layout: "modal",

    methods: {
        turnDiscord() {
            this.deepChange(this.settings, "discord");
            return this.settings.discord
                ? this.setActivity()
                : this.clearActivity();
        },

        turnDevtools() {
            this.deepChange(this.settings, "devtools");
            ipcRenderer.send("devTools", this.settings.devtools);
        }
    }
};
</script>