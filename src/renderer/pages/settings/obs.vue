<template>
    <div class="modal-content">
        <Title id="modal-stream-content-title" title="Настройка OBS" />
        <div class="modal-body">
            <Install v-if="!installActive" />
            <Installation v-else />

            <Input text="Адрес подключения" :value="address" @input="address = $event" />
            <Input text="Порт подключения" :value="port" @input="port = $event" />
            <Input text="Пароль" :value="password" @input="password = $event" />
            <Input
                text="Название источника с веб-камерой"
                :value="camera"
                :tip="
                    'Впишите сюда названия источников с веб-камерой.\
                Если у вас веб-камера находтися в группе, то впишите название группы.\
                Если у вас нет веб-камеры или вы не палите лицо на стриме, оставьте это поле пустым.\
                Если у вас несколько источников или групп с камерой в OBS, то впишите их названия через запятую.'
                "
                @input="camera = $event"
            />

            <div v-if="error.length" class="modal-item-tip">
                <span style="color: red" class="modal-item-tip-text">Ошибка: {{ error }}</span>
            </div>

            <SolidButton :label="'Продолжить'" :disabled="disabled" @clicked="next" />
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

import Title from "~/components/Menu/Title";
import Input from "~/components/Settings/Input";
import SolidButton from "~/components/SolidButton";

import Install from "~/components/OBS/Settings/Websocket/Install";
import Installation from "~/components/OBS/Settings/Websocket/Installation";

import CoreMixin from "~/mixins/core";
import other from "~/mixins/other";

export default {
    components: {
        Title,
        Input,
        SolidButton,

        Install,
        Installation
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
        ...mapState({
            installActive: state => state.websocketInstaller.active
        }),
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
        }
    }
};
</script>