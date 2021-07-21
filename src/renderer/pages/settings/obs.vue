<template>
    <div class="modal-content">
        <Title id="modal-obs-content-title" title="Настройка OBS" />
        <div class="modal-body">
            <div class="modal-item-tip">
                <span class="modal-item-tip-text">
                    Для дальнейшей работы
                    <strong style="color: red" v-text="'ОБЯЗАТЕЛЬНО'" />
                    установите OBS Websocket
                </span>

                <SolidButton :label="'Установить OBS Websocket'" @clicked="install" />
            </div>

            <Input text="Адрес подключения" :value="address" @input="changeAddress" />
            <Input text="Порт подключения" :value="port" @input="changePort" />
            <Input text="Пароль" :value="password" @input="changePassword" />
            <Input
                text="Название источника с веб-камерой"
                :value="camera"
                :tip="
                    'Впишите сюда названия источников с веб-камерой.\
                Если у вас веб-камера находтися в группе, то впишите название группы.\
                Если у вас нет веб-камеры или вы не палите лицо на стриме, оставьте это поле пустым.\
                Если у вас несколько источников или групп с камерой в OBS, то впишите их названия через запятую.'
                "
                @input="changeCamera"
            />

            <div v-if="error.length" class="modal-item-tip">
                <span style="color: red" class="modal-item-tip-text">Ошибка: {{ error }}</span>
            </div>

            <SolidButton :label="'Продолжить'" :disabled="disabled" @clicked="next" />
        </div>
    </div>
</template>

<script>
import Title from "~/components/menu/Title";
import Input from "~/components/settings/Input";
import SolidButton from "~/components/SolidButton";

import CoreMixin from "~/mixins/core";
import other from "~/mixins/other";

const OBSWebsocketInstallerURL =
    "https://github.com/Palakis/obs-websocket/releases/download/4.9.1/obs-websocket-4.9.1-Windows-Installer.exe";

export default {
    components: {
        Title,
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
        camera: [],
        error: ""
    }),
    computed: {
        disabled() {
            return this.address.length === 0 || this.port.length === 0;
        }
    },
    async created() {
        if (this.config.OBS) {
            if (typeof this.config.OBS.camera === "string") {
                this.config.OBS.camera = [this.config.OBS.camera];
            }

            this.address = this.config.OBS.address;
            this.port = this.config.OBS.port;
            this.password = this.config.OBS.password;
            this.camera = this.config.OBS.camera?.join(", ") || "";
        }
    },
    methods: {
        changeAddress(value) {
            this.address = value;
        },
        changePort(value) {
            this.port = value;
        },
        changePassword(value) {
            this.password = value;
        },
        changeCamera(value) {
            this.camera = value;
        },
        async next() {
            this.load = true;
            this.error = "";

            if (await this.checkConnection()) {
                this.saveSettings({
                    type: "OBS",
                    content: {
                        address: this.address,
                        port: this.port,
                        password: this.password,
                        camera: Array.from(new Set(this.camera.split(",").map(c => c.trim())))
                    }
                });

                this.$router.replace("/settings/twitch").catch(() => {});
            }
        },
        install() {
            this.openLink(OBSWebsocketInstallerURL);
        }
    }
};
</script>