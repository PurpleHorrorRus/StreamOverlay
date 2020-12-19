<template>
    <div class="modal-content">
        <div class="modal-title">
            <span 
                class="modal-title-text"
                v-text="'Настройка чата'" 
            />
        </div>
        <div class="modal-body">
            <Item 
                :id="0" 
                :type="'checkbox'" 
                :text="'Включить чат'" 
                :checked="settings.chat.enable"
                @checked="turnChat" 
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
        turnChat () {
            this.settings.chat.enable = !this.settings.chat.enable;
            this.save();
        },
        save () {
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        },
        validateValue (value, min, max = 0) {
            if (isNaN(value)) {
                return min;
            }

            if (value < min) {
                return min;
            } else if (value > max && max !== 0) {
                return max;
            }

            return Math.abs(Number(value));
        },
        changeTimeout (value) {
            this.settings.chat.timeout = this.validateValue(value, 0);
            this.save();
        },
        changeOpactiy (value) {
            this.settings.chat.opacity = this.validateValue(value, 0, 100);
            this.save();
        },
        changeFont (value) {
            this.settings.chat.font = this.validateValue(value, 10, 18);
            this.save();
        }
    }
};
</script>