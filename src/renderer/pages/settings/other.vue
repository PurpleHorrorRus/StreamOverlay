<template>
    <div class="modal-content">
        <Title title="Прочие настройки" />
        <div class="modal-body">
            <Item
                :text="'Показывать количество зрителей'"
                :checked="settings.OBSStatus.ServiceInfo.enable"
                @change="deepChange(settings.OBSStatus.ServiceInfo, 'enable')"
            />
            <Item
                :text="'Показать количество фолловеров'"
                :checked="settings.OBSStatus.ServiceInfo.enableFollowers"
                @change="deepChange(settings.OBSStatus.ServiceInfo, 'enableFollowers')"
            />

            <Item
                :text="'Включить техническую статистику OBS'"
                :checked="settings.TechInfo.enable"
                @change="deepChange(settings.TechInfo, 'enable')"
            />

            <Item
                :text="'Включить время трансляции/записи'"
                :checked="settings.OBSStatus.time"
                @change="deepChange(settings.OBSStatus, 'time')"
            />

            <Item
                :text="'Включить аппаратное ускорение'"
                :checked="settings.hardwareAcceleration"
                tip="Необходима перезагрузка приложения"
                @change="deepChange(settings, 'hardwareAcceleration')"
            />

            <Item
                :text="'Включить Content Protection'"
                :checked="settings.contentProtection"
                tip="Content Protection - защита от отображения в OBS и других приложениях для захвата рабочего стола"
                @change="deepChange(settings, 'contentProtection')"
            />

            <Item
                :text="'Включить оповещение о низком FPS'"
                :checked="settings.notifications.lowfps"
                @change="deepChange(settings.notifications, 'lowfps')"
            />

            <Item
                :text="'Включить оповещение о низком битрейте'"
                :checked="settings.notifications.lowbitrate"
                @change="deepChange(settings.notifications, 'lowbitrate')"
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
                @change="deepChange(settings, 'RAMClean')"
            />
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from "electron";

import Title from "~/components/Menu/Title";
import Item from "~/components/Settings/Item";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Title,
        Item
    },
    
    mixins: [CoreMixin],

    layout: "modal",

    methods: {
        turnDevtools() {
            this.deepChange(this.settings, "devtools");
            ipcRenderer.send("devTools", this.settings.devtools);
        }
    }
};
</script>