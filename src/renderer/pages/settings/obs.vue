<template>
    <div class="modal-content">
        <div class="modal-title">
            <span 
                class="modal-title-text" 
                v-text="'Настройка OBS'" 
            />
        </div>
        <div class="modal-body">
            <!-- <Tip
                text="Для того, чтобы включить и отключить фокус на оверлее, нажмите комбинацию клавиш Alt + A"
            /> -->
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
                :tip="'Если у вас нет веб-камеры или вы не палите лицо на стриме, оставьте это поле пустым'"
                @input="changeCamera"
            />
            <!-- <Tip
                text="Если у вас нет веб-камеры или вы не палите лицо на стриме, оставьте это поле пустым"
            /> -->
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
            
            <SolidButton 
                :label="'Продолжить'"
                :disabled="disabled"
                @clicked="next" 
            />
        </div>
    </div>
</template>

<script>
import Input from "~/components/settings/Input";
import SolidButton from "~/components/SolidButton";

import CoreMixin from "~/mixins/core";
import other from "~/mixins/other";

export default {
    components: { 
        Input,
        SolidButton
    },
    mixins: [CoreMixin, other],
    layout: "modal",
    data: () => ({
        load: false,
        address: "localhost",
        port: 4444,
        password: "",
        camera: "",
        error: ""
    }),
    computed: {
        disabled () {
            if (this.address) {
                return this.address.length === 0;
            }

            return true;
        }
    },
    async created () {
        if (this.config.OBS) {
            this.address = this.config.OBS.address;
            this.port = this.config.OBS.port;
            this.password = this.config.OBS.password;
            this.camera = this.config.OBS.camera;
        }
    },
    methods: {
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
        async next () {
            this.load = true;
            this.error = "";

            if (await this.checkConnection()) {
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
            }
        },
        install () { 
            // eslint-disable-next-line max-len
            this.openLink("https://obsproject.com/forum/resources/obs-websocket-remote-control-of-obs-studio-made-easy.466/"); 
        }
    }
};
</script>