<template>
    <div class="modal-content">
        <Title title="Прочие настройки" />
        <div class="modal-body">
            <ToggleButton
                :text="'Показывать количество зрителей'"
                :checked="settings.OBSStatus.ServiceInfo.enable"
                @change="deepChange(settings.OBSStatus.ServiceInfo, 'enable')"
            />
            <ToggleButton
                :text="'Показать количество фолловеров'"
                :checked="settings.OBSStatus.ServiceInfo.followers"
                @change="deepChange(settings.OBSStatus.ServiceInfo, 'followers')"
            />

            <ToggleButton
                :text="'Включить техническую статистику OBS'"
                :checked="settings.OBSStatus.tech"
                @change="deepChange(settings.OBSStatus, 'tech')"
            />

            <ToggleButton
                :text="'Включить время трансляции/записи'"
                :checked="settings.OBSStatus.time"
                @change="deepChange(settings.OBSStatus, 'time')"
            />

            <ToggleButton
                :text="'Включить аппаратное ускорение'"
                :checked="settings.hardwareAcceleration"
                tip="Необходима перезагрузка приложения"
                @change="deepChange(settings, 'hardwareAcceleration')"
            />

            <ToggleButton
                :text="'Включить Content Protection'"
                :checked="settings.contentProtection"
                tip="Content Protection - защита от отображения в OBS и других приложениях для захвата рабочего стола"
                @change="deepChange(settings, 'contentProtection')"
            />

            <ToggleButton
                :text="'Включить инструменты разработчика'"
                :checked="settings.devtools"
                @change="turnDevtools"
            />

            <ToggleButton
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

import CoreMixin from "~/mixins/core";

export default {

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