<template>
    <div class="modal-content">
        <ModalTitle :text="'Прочие настройки'" />
        <div class="modal-body">
            <Item :text="'Статистика Twitch'" :checked="settings.TwitchInfo.enable" @change="turnTwitch('enable')" />
            <Item
                v-if="settings.TwitchInfo.enable"
                :text="'Показать фолловеров'"
                :checked="settings.TwitchInfo.enableFollowers"
                @change="turnTwitch('enableFollowers')"
            />

            <Item
                :text="'Включить техническую статистику OBS'"
                :checked="settings.TechInfo.enable"
                @change="turnTech"
            />

            <Item :text="'Включить время трансляции/записи'" :checked="settings.time" @change="turn('time')" />

            <Item
                :text="'Включить Content Protection'"
                :checked="settings.contentProtection"
                @change="turn('contentProtection')"
            />

            <Item
                :text="'Включить очистку ОЗУ'"
                :tip="
                    'Выполняет очистку памяти приложения каждые 70 секунд.\
                    Отключите эту опцию, если приложение вылетает'
                "
                :checked="settings.RAMClean"
                @change="turn('RAMClean')"
            />
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

import ModalTitle from "~/components/ModalTitle";
import Item from "~/components/settings/Item";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        ModalTitle,
        Item
    },
    mixins: [CoreMixin],
    layout: "modal",
    computed: {
        ...mapState({
            settings: state => state.settings.settings
        })
    },
    methods: {
        ...mapActions({
            saveSettings: "settings/SAVE"
        }),
        turn(option) {
            this.settings[option] = !this.settings[option];
            this.save();
        },
        turnTwitch(option) {
            this.settings.TwitchInfo[option] = !this.settings.TwitchInfo[option];
            this.save();
        },
        turnTech() {
            this.settings.TechInfo.enable = !this.settings.TechInfo.enable;
            this.save();
        }
    }
};
</script>