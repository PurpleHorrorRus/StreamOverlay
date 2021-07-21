<template>
    <div class="modal-content">
        <Title id="modal-chat-content-title" title="Настройка чата" />
        <div class="modal-body">
            <div id="modal-chat-content-appearance">
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
                <Item
                    :text="'Звуковое оповещение о сообщении в чате'"
                    :checked="settings.chat.sound"
                    @change="turn('sound')"
                />
            </div>

            <div id="modal-chat-content-notifications">
                <Item
                    :text="'Зачитывать текст сообщения'"
                    :checked="settings.chat.tts.enable"
                    tip="Если не работает, установите пакет русского языка для диктора Windows в параметрах системы"
                    @change="turnTTS('enable')"
                />
                <Item
                    v-if="settings.chat.tts.enable"
                    :text="'Зачитывать имя пользователя сообщения'"
                    :checked="settings.chat.tts.readName"
                    @change="turnTTS('readName')"
                />
            </div>

            <div id="modal-chat-content-ranges">
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
    </div>
</template>

<script>
import Title from "~/components/menu/Title";
import Item from "~/components/settings/Item";
import Range from "~/components/settings/Range";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Title,
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
        },
        turnTTS(field) {
            this.settings.chat.tts[field] = !this.settings.chat.tts[field];
            this.save();
        }
    }
};
</script>