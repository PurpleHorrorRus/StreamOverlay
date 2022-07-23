<template>
    <div class="modal-content">
        <Title id="modal-chat-content-title" title="Настройка чата" />
        <div class="modal-body">
            <ToggleButton 
                :text="'Включить чат'" 
                :checked="settings.chat.enable" 
                @change="deepChange(settings.chat, 'enable')" 
            />

            <div v-if="settings.chat.enable" id="modal-caht-content-settings">
                <div id="modal-chat-content-appearance">
                    <ToggleButton 
                        :text="'Включить аватарки'" 
                        :checked="settings.chat.avatar" 
                        @change="deepChange(settings.chat, 'avatar')" 
                    />
                </div>

                <div id="modal-chat-content-notifications">
                    <ToggleButton
                        :text="'Звуковое оповещение о сообщении в чате'"
                        :checked="settings.chat.sound"
                        @change="deepChange(settings.chat, 'sound')"
                    />

                    <ToggleButton
                        :text="'Зачитывать текст сообщения'"
                        :checked="settings.chat.tts.enable"
                        @change="deepChange(settings.chat.tts, 'enable')"
                    />

                    <ToggleButton
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
import CoreMixin from "~/mixins/core";

export default {
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