<template>
    <div class="modal-content">
        <ModalTitle :text="'Настройки базы данных'" />
        <div id="database-config" class="modal-body">
            <Tip :text="'Хост'" />
            <input v-model="host" type="text" :placeholder="'Хост'">

            <next @click.native="saveDatabase" />
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import ModalTitle from "~/components/ModalTitle";
import Tip from "~/components/settings/Tip";
import next from "~/components/settings/next";

export default {
    layout: "modal",
    components: { 
        ModalTitle, 
        Tip, 
        next 
    },
    data: () => ({ 
        host: "" 
    }),
    computed: {
        ...mapGetters({
            strings: "strings/getStrings",
            settings: "settings/getSettings"
        })
    },
    mounted () {
        this.host = this.settings.database.host;
    },
    methods: {
        ...mapActions({
            saveSettings: "settings/saveSettings",
            check: "database/check",
            connect: "database/connect"
        }),
        async saveDatabase () {
            if (await this.check(this.host)) {
                this.settings.database.host = this.host;
                this.saveSettings({
                    type: "settings",
                    content: this.settings
                });
                this.connect();
                this.$router.replace("/menu").catch(() => {});
            }
        }
    }
};
</script>