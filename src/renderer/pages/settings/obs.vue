<template>
    <div class="modal-content">
        <div class="modal-title">
            <span 
                class="modal-title-text" 
                v-text="'Настройка OBS'" 
            />
        </div>
        <div class="modal-body">
            <div class="modal-item-tip">
                <span 
                    class="modal-item-tip-text"
                    v-text="'Для того, чтобы включить и отключить фокус на оверлее, нажмите комбинацию клавиш Alt + A'"
                />
            </div>
            <div class="modal-item">
                <div class="modal-item-tip">
                    <span 
                        class="modal-item-tip-text"
                        v-text="'Адрес подключения'"
                    />
                </div>
                <input v-model="address" type="text" placeholder="Адрес подключения">
            </div>
            <div class="modal-item">
                <div class="modal-item-tip">
                    <span 
                        class="modal-item-tip-text" 
                        v-text="'Порт'" 
                    />
                </div>
                <input v-model="port" type="text" placeholder="Порт подключения">
            </div>
            <div class="modal-item">
                <div class="modal-item-tip">
                    <span 
                        class="modal-item-tip-text" 
                        v-text="'Пароль'"
                    />
                </div>
                <input v-model="password" type="text" placeholder="Пароль">
            </div>
            <div class="modal-item">
                <div class="modal-item-tip">
                    <span 
                        class="modal-item-tip-text"
                        v-text="'Название источника с веб-камерой'"
                    />
                    <span 
                        class="modal-item-tip-text"
                        v-text="'Если у вас нет веб-камеры или вы не палите лицо на стриме, оставьте это поле пустым'" 
                    />
                </div>
                <input v-model="camera" type="text" placeholder="Название источника с веб-камерой">
            </div>
            <div class="modal-item-tip">
                <span 
                    class="modal-item-tip-text"
                    v-text="'Если вы ничего не меняли или не знаете, что вводить, то оставьте всё, как есть'"
                />
            </div>
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
            <next @click.native="goNext" />
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import { ipcRenderer } from "electron-better-ipc";

import next from "~/components/settings/next";
import other from "~/mixins/other";

export default {
    components: { 
        next 
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
    async created () {
        ipcRenderer.send("enableMouse");
        const { OBS } = await ipcRenderer.callMain("config");
        if (OBS.address) {
            this.address = OBS.address;
            this.port = OBS.port;
            this.password = OBS.password;
            this.camera = OBS.camera;
        }
    },
    methods: {
        ...mapActions({
            saveSettings: "settings/saveSettings"
        }),
        async goNext () {
            this.error = "";
            const connection = await this.checkConnection();
            if (!connection.success) {
                return this.error = "Ошибка подключения. Пожалуйста, убедитесь, \
                что вы правильно установили OBS Websocket, запустили (перезапустили) \
                OBS Studio и корректно ввели данные";
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

            ipcRenderer.send("disableMouse");
            this.$router.replace("/").catch(() => {});
        },
        install () { 
            // eslint-disable-next-line max-len
            this.openLink("https://obsproject.com/forum/resources/obs-websocket-remote-control-of-obs-studio-made-easy.466/"); 
        }
    }
};
</script>