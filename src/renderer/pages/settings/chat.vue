<template>
    <div class="modal-content">
        <Title id="modal-chat-content-title" title="Настройка чата" />
        <div class="modal-body">
            <Item 
                :text="'Включить чат'" 
                :checked="settings.chat.enable" 
                @change="deepChange(settings.chat, 'enable')" 
            />

            <div v-if="settings.chat.enable" id="modal-caht-content-settings">
                <div id="modal-chat-content-appearance">
                    <Item 
                        :text="'Включить аватарки'" 
                        :checked="settings.chat.avatar" 
                        @change="deepChange(settings.chat, 'avatar')" 
                    />

                    <Item 
                        :text="'Включить бейджики (Twitch)'" 
                        :checked="settings.chat.badges"
                        @change="deepChange(settings.chat, 'badges')" 
                    />
                </div>

                <div id="modal-chat-content-notifications">
                    <Item
                        :text="'Звуковое оповещение о сообщении в чате'"
                        :checked="settings.chat.sound"
                        @change="deepChange(settings.chat, 'sound')"
                    />

                    <Item
                        :text="'Зачитывать текст сообщения'"
                        :checked="settings.chat.tts.enable"
                        @change="deepChange(settings.chat.tts, 'enable')"
                    />

                    <Item
                        v-if="settings.chat.tts.enable"
                        :text="'Зачитывать имя пользователя сообщения'"
                        :checked="settings.chat.tts.readName"
                        @change="deepChange(settings.chat.tts, 'readName')"
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
    </div>
</template>

<script>
import Title from "~/components/Menu/Title";
import Item from "~/components/Settings/Item";
import Range from "~/components/Settings/Range";

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