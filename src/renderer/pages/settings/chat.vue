<template>
    <div class="modal-content">
        <Title id="modal-chat-content-title" title="Настройка чата" />
        <div class="modal-body">
            <ToggleButton
                :text="$strings.MENU.CHAT.ENABLE"
                :checked="settings.chat.enable"
                @change="deepChange(settings.chat, 'enable')"
            />

            <div v-if="settings.chat.enable" id="modal-caht-content-settings">
                <div id="modal-chat-content-appearance">
                    <ToggleButton
                        :text="$strings.MENU.CHAT.AVATAR"
                        :checked="settings.chat.avatar"
                        @change="deepChange(settings.chat, 'avatar')"
                    />
                </div>

                <div id="modal-chat-content-notifications">
                    <ToggleButton
                        :text="$strings.MENU.CHAT.SOUND"
                        :checked="settings.chat.sound"
                        @change="deepChange(settings.chat, 'sound')"
                    />

                    <ToggleButton
                        :text="$strings.MENU.CHAT.READ"
                        :checked="settings.chat.tts.enable"
                        @change="deepChange(settings.chat.tts, 'enable')"
                    />

                    <ToggleButton
                        v-if="settings.chat.tts.enable"
                        :text="$strings.MENU.CHAT.READ_NAME"
                        :checked="settings.chat.tts.readName"
                        @change="deepChange(settings.chat.tts, 'readName')"
                    />
                </div>

                <div id="modal-chat-content-ranges">
                    <Range
                        :text="$strings.MENU.CHAT.TIMEOUT.TITLE"
                        :value="settings.chat.timeout"
                        :max="600"
                        :tip="$strings.MENU.CHAT.TIMEOUT.TIP"
                        @select="deepChange(settings.chat, 'timeout', $event)"
                    />

                    <Range
                        :text="$strings.MENU.CHAT.OPACITY"
                        :value="settings.chat.opacity"
                        @select="deepChange(settings.chat, 'opacity', $event)"
                    />

                    <Range
                        :text="$strings.MENU.CHAT.FONT"
                        :value="settings.chat.font"
                        :min="8"
                        :max="16"
                        @select="deepChange(settings.chat, 'font', $event)"
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