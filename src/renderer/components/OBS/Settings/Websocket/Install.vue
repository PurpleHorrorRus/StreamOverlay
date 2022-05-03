<template>
    <div class="modal-item">
        <MenuError v-if="error" :error="error" />

        <span class="modal-item-tip">
            Необходимо выбрать корневую папку с OBS Studio. Перед началом
            установки закройте OBS Studio. После установки обязательно отключите
            авторизацию по паролю в конфигурации OBS Websocket в OBS Studio.
        </span>

        <SolidButton :label="'Установить OBS Websocket'" @clicked="install" />
    </div>
</template>

<script>
import { ipcRenderer } from "electron";
import { mapActions, mapState } from "vuex";

export default {
    components: {
        MenuError: () => import("~/components/Menu/Notifications/Error")
    },

    computed: {
        ...mapState({
            error: state => state.websocketInstaller.error
        })
    },

    methods: {
        ...mapActions({
            installWebsocket: "websocketInstaller/INSTALL"
        }),
    
        async install() {
            this.$router.replace("/").catch(() => {});

            const path = await ipcRenderer.invoke("select", {
                properties: ["openDirectory"]
            });

            this.$router.replace("/settings/obs").catch(() => {});

            if (path[0]) {
                await this.installWebsocket(path[0]).catch(() => {});
            }
        }
    }
};
</script>