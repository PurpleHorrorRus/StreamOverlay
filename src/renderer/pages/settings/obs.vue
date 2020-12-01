<template>
    <div class="modal-content">
        <div class="modal-title">
            <span 
                class="modal-title-text" 
                v-text="'Настройка OBS'" 
            />
        </div>
        <div class="modal-body">
            <Tip
                text="Для того, чтобы включить и отключить фокус на оверлее, нажмите комбинацию клавиш Alt + A"
            />
            <Input
                text="Адрес подключения"
                :value="address"
                @input="changeAddress"
            />
            <Input
                text="Порт подключения"
                :value="port"
                @input="changePort"
            />
            <Input
                text="Пароль"
                :value="password"
                @input="changePassword"
            />
            <Input
                text="Название источника с веб-камерой"
                :value="camera"
                @input="changeCamera"
            />
            <Tip
                text="Если у вас нет веб-камеры или вы не палите лицо на стриме, оставьте это поле пустым"
            />
            <Item 
                :id="0" 
                :type="'checkbox'" 
                :text="'Включить техническую статистику'" 
                :checked="settings.TechInfo.enable" 
                @checked="turnTech" 
            />
            <div class="modal-item-tip">
                <span class="modal-item-tip-text">
                    Для дальнейшей работы 
                    <strong style="color: red" v-text="'ОБЯЗАТЕЛЬНО'" />
                    установите 
                    <strong 
                        class="link" 
                        @click="install"
                        v-text="'OBS Websocket'"
                    />
                </span>
            </div>
            <div v-if="error.length" class="modal-item-tip">
                <span style="color: red" class="modal-item-tip-text">Ошибка: {{ error }}</span>
            </div>
            <Next @click.native="goNext" />
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { ipcRenderer } from "electron-better-ipc";

import Input from "~/components/settings/Input";
import Tip from "~/components/settings/Tip";
import Item from "~/components/settings/Item";
import Next from "~/components/settings/Next";

import other from "~/mixins/other";

export default {
    components: { 
        Input,
        Tip,
        Item,
        Next 
    },
    mixins: [other],
    layout: "modal",
    data: () => ({
        address: "localhost",
        port: 4444,
        password: "",
        camera: "",
        error: ""
    }),
    computed: {
        ...mapGetters({
            config: "GET_CONFIG",

            settings: "settings/getSettings"
        })
    },
    async created () {
        if (this.config.OBS.address) {
            this.address = this.config.OBS.address;
            this.port = this.config.OBS.port;
            this.password = this.config.OBS.password;
            this.camera = this.config.OBS.camera;
        }
    },
    methods: {
        ...mapActions({
            saveSettings: "settings/saveSettings"
        }),
        changeAddress (value) {
            this.address = value;
        },
        changePort (value) {
            this.port = value;
        },
        changePassword (value) {
            this.password = value;
        },
        changeCamera (value) {
            this.camera = value;
        },
        turnTech () {
            this.settings.TechInfo.enable = !this.settings.TechInfo.enable;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        },
        async goNext () {
            this.error = "";
            const connection = await this.checkConnection();
            if (!connection.success) {
                this.error = "Ошибка подключения. Пожалуйста, убедитесь, \
                что вы правильно установили OBS Websocket, запустили (перезапустили) \
                OBS Studio и корректно ввели данные";

                return;
            }

            this.saveSettings({
                type: "OBS",
                content: { 
                    address: this.address, 
                    port: this.port, 
                    password: this.password, 
                    camera: this.camera 
                }
            });

            this.$router.replace("/settings/twitch").catch(() => {});
        },
        install () { 
            // eslint-disable-next-line max-len
            this.openLink("https://obsproject.com/forum/resources/obs-websocket-remote-control-of-obs-studio-made-easy.466/"); 
        }
    }
};
</script>