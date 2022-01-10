<template>
    <div class="modal-content">
        <Title title="Прочие настройки" />
        <div class="modal-body">
            <Item
                :text="'Показывать количество зрителей'"
                :checked="settings.OBSStatus.TwitchInfo.enable"
                @change="turnTwitch('enable')"
            />
            <Item
                :text="'Показать количество фолловеров'"
                :checked="settings.OBSStatus.TwitchInfo.enableFollowers"
                @change="turnTwitch('enableFollowers')"
            />

            <Item
                :text="'Включить техническую статистику OBS'"
                :checked="settings.TechInfo.enable"
                @change="turnTech"
            />

            <Item
                :text="'Включить время трансляции/записи'"
                :checked="settings.OBSStatus.time"
                @change="turnOBS('time')"
            />

            <Item
                :text="'Включить аппаратное ускорение'"
                :checked="settings.hardwareAcceleration"
                tip="Необходима перезагрузка приложения"
                @change="turn('hardwareAcceleration')"
            />

            <Item
                :text="'Включить оповещение о низком FPS'"
                :checked="settings.notifications.lowfps"
                @change="turnNotification('lowfps')"
            />

            <Item
                :text="'Включить оповещение о низком битрейте'"
                :checked="settings.notifications.lowbitrate"
                @change="turnNotification('lowbitrate')"
            />

            <Item
                :text="'Включить инструменты разработчика'"
                :checked="settings.devtools"
                @change="turnDevtools"
            />

            <Item
                :text="'Включить очистку ОЗУ'"
                :tip="'Выполняет очистку памяти приложения каждые 70 секунд.\
                    Отключите эту опцию, если приложение вылетает'"
                :checked="settings.RAMClean"
                @change="turn('RAMClean')"
            />
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from "electron";

import Title from "~/components/menu/Title";
import Item from "~/components/settings/Item";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Title,
        Item
    },
    mixins: [CoreMixin],
    layout: "modal",
    methods: {
        turn(option) {
            this.settings[option] = !this.settings[option];
            this.save();
        },
        turnOBS(option) {
            this.settings.OBSStatus[option] = !this.settings.OBSStatus[option];
            this.save();
        },
        turnTwitch(option) {
            this.settings.OBSStatus.TwitchInfo[option] =
                !this.settings.OBSStatus.TwitchInfo[option];
            this.save();
        },
        turnTech() {
            this.settings.TechInfo.enable = !this.settings.TechInfo.enable;
            this.save();
        },
        turnNotification(option) {
            this.settings.notifications[option] = !this.settings.notifications[option];
            this.save();
        },
        turnDevtools() {
            this.settings.devtools = !this.settings.devtools;
            ipcRenderer.send("devTools", this.settings.devtools);
            this.save();
        }
    }
};
</script>