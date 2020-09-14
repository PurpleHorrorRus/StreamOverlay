<template>
    <div class="modal-content">
        <div class="modal-title">
            <span 
                class="modal-title-text"
                v-text="'Настройка чата'" 
            />
        </div>
        <div class="modal-body">
            <Input
                text="Время сообщения в чате (в секундах)"
                :value="Number(settings.chat.timeout)"
                @input="changeTimeout"
            />
            <Input
                text="Непрозрачность фона сообщений (в процентах от 0 до 100)"
                :value="Number(settings.chat.opacity)"
                @input="changeOpactiy"
            />
            <Input
                text="Размер текста сообщений (в пунктах от 10 до 18)"
                :value="Number(settings.chat.font)"
                @input="changeFont"
            />
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import Input from "~/components/settings/Input";

export default {
    components: {
        Input
    },
    layout: "modal",
    computed: {
        ...mapGetters({
            settings: "settings/getSettings"
        })
    },
    methods: {
        ...mapActions({
            saveSettings: "settings/saveSettings"
        }),
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

            return Number(value);
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