<template>
    <div class="modal-content">
        <div class="modal-title">
            <span class="modal-title-text" v-text="'Настройка чата'" />
        </div>
        <div class="modal-body">
            <Item :text="'Включить чат'" :checked="settings.chat.enable" @change="turn('enable')" />
            <Item
                v-if="settings.chat.enable"
                :text="'Включить аватарки'"
                :checked="settings.chat.avatar"
                @change="turn('avatar')"
            />
            <Item
                v-if="settings.chat.enable"
                :text="'Включить бейджики'"
                :checked="settings.chat.badges"
                @change="turn('badges')"
            />
            <Range
                text="Время сообщения в чате (в секундах)"
                :value="Number(settings.chat.timeout)"
                :max="600"
                :tip="'Установив 0, сообщения не будут удаляться'"
                @select="changeTimeout"
            />
            <Range
                text="Непрозрачность фона сообщений"
                :value="Number(settings.chat.opacity)"
                @select="changeOpactiy"
            />
            <Range
                text="Размер текста сообщений"
                :value="Number(settings.chat.font)"
                :min="8"
                :max="16"
                @select="changeFont"
            />
        </div>
    </div>
</template>

<script>
import Item from "~/components/settings/Item";
import Range from "~/components/settings/Range";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Item,
        Range
    },
    mixins: [CoreMixin],
    layout: "modal",
    methods: {
        turn(field) {
            this.settings.chat[field] = !this.settings.chat[field];
            this.save();
        },
        changeTimeout(value) {
            this.settings.chat.timeout = Number(value);
            this.save();
        },
        changeOpactiy(value) {
            this.settings.chat.opacity = Number(value);
            this.save();
        },
        changeFont(value) {
            this.settings.chat.font = Number(value);
            this.save();
        }
    }
};
</script>