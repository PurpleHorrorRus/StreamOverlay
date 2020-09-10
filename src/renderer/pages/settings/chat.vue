<template>
    <div class="modal-content">
        <div class="modal-title">
            <span 
                class="modal-title-text"
                v-text="'Настройка чата'" 
            />
        </div>
        <div class="modal-body">
            <div class="modal-item">
                <div class="modal-item-tip">
                    <span 
                        class="modal-item-tip-text" 
                        v-text="'Время сообщения в чате (в секундах)'" 
                    />
                </div>
                <input 
                    v-model.number="settings.chat.timeout" 
                    type="text" 
                    placeholder="Время сообщения в чате (в секундах)" 
                    @change="save"
                >
            </div>
            <div class="modal-item">
                <div class="modal-item-tip">
                    <span 
                        class="modal-item-tip-text" 
                        v-text="'Непрозрачность фона сообщений (в процентах от 0 до 100)'" 
                    />
                </div>
                <input 
                    v-model.number="settings.chat.opacity"
                    type="text" 
                    placeholder="Непрозрачность фона сообщений (в процентах от 0 до 100)" 
                    @change="changeOpactiy"
                >
            </div>
            <div class="modal-item">
                <div class="modal-item-tip">
                    <span 
                        class="modal-item-tip-text" 
                        v-text="'Размер текста сообщений (в пунктах от 4 до 18)'" 
                    />
                </div>
                <input 
                    v-model.number="settings.chat.font" 
                    type="text" 
                    placeholder="Размер текста сообщений (в пунктах от 4 до 18)" 
                    @change="changeFont"
                >
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
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
        changeOpactiy () {
            if (this.settings.chat.opacity < 0) {
                this.settings.chat.opacity = 0;
            }
            else if (this.settings.chat.opacity > 100) {
                this.settings.chat.opacity = 100;
            }

            this.save();
        },
        changeFont () {
            if (this.settings.chat.font < 4) {
                this.settings.chat.font = 4;
            }
            else if (this.settings.chat.font > 18) {
                this.settings.chat.font = 18;
            }
            
            this.save();
        }
    }
};
</script>

<style>
#sound-file {
    display: inline-block;
    width: 420px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    vertical-align: middle;
    margin-left: 10px;
}
</style>