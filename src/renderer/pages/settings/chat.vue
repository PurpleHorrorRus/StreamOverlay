<template>
    <div class="modal-content">
        <Title id="modal-chat-content-title" title="Настройка чата" />
        <div class="modal-body">
            <ToggleButton
                :text="$strings.MENU.CHAT.ENABLE"
                :checked="config.settings.chat.enable"
                @change="deepChange('settings', config.settings.chat, 'enable')"
            />

            <div v-if="config.settings.chat.enable" id="modal-caht-content-settings">
                <div id="modal-chat-content-appearance">
                    <ToggleButton
                        :text="$strings.MENU.CHAT.AVATAR"
                        :checked="config.settings.chat.avatar"
                        @change="deepChange('settings', config.settings.chat, 'avatar')"
                    />
                </div>

                <div id="modal-chat-content-notifications">
                    <ToggleButton
                        :text="$strings.MENU.CHAT.SOUND"
                        :checked="config.settings.chat.sound"
                        @change="deepChange('settings', config.settings.chat, 'sound')"
                    />

                    <ToggleButton
                        :text="$strings.MENU.CHAT.READ"
                        :checked="config.settings.chat.tts.enable"
                        @change="deepChange('settings', config.settings.chat.tts, 'enable')"
                    />

                    <ToggleButton
                        v-if="config.settings.chat.tts.enable"
                        :text="$strings.MENU.CHAT.READ_NAME"
                        :checked="config.settings.chat.tts.readName"
                        @change="deepChange('settings', config.settings.chat.tts, 'readName')"
                    />
                </div>

                <div id="modal-chat-content-ranges">
                    <Range
                        :text="$strings.MENU.CHAT.TIMEOUT.TITLE"
                        :value="config.settings.chat.timeout"
                        :max="600"
                        :tip="$strings.MENU.CHAT.TIMEOUT.TIP"
                        @select="deepChange('settings', config.settings.chat, 'timeout', $event)"
                    />

                    <Range
                        :text="$strings.MENU.CHAT.OPACITY"
                        :value="config.settings.chat.opacity"
                        @select="deepChange('settings', config.settings.chat, 'opacity', $event)"
                    />

                    <Range
                        :text="$strings.MENU.CHAT.FONT"
                        :value="config.settings.chat.font"
                        :min="8"
                        :max="16"
                        @select="deepChange('settings', config.settings.chat, 'font', $event)"
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

    layout: "modal"
};
</script>