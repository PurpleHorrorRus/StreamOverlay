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
        camera: ""
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
        if (this.config.obs) {
            if (typeof this.config.obs.camera === "string") {
                this.config.obs.camera = [this.config.obs.camera];
            }

            this.address = this.config.obs.address;
            this.port = this.config.obs.port;
            this.password = this.config.obs.password;
            this.camera = this.config.obs.camera?.join(", ") || "";
        }
    },

    methods: {
        async next() {
            this.load = true;

            const webcamMapped = this.camera.split(",").map(c => c.trim());
            const webcamSet = new Set(webcamMapped);
            const webcamsCollection = Array.from(webcamSet);

            this.saveSettings({
                type: "obs",
                content: {
                    address: this.address,
                    port: this.port,
                    password: this.password,
                    camera: webcamsCollection
                }
            });

            this.$router.replace("/");
        }
    }
};
</script>