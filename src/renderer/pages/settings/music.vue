<template>
    <div class="modal-content">
        <ModalTitle :text="strings.MUSIC_LABEL" />
        <div class="modal-body">
            <div class="modal-item">
                <div class="modal-item-tip">
                    <span class="modal-item-tip-text" v-text="'Порт Meridius'" />
                </div>
                <input v-model="meridius" type="text" placeholder="Порт Meridius">
            </div>
        </div>
        <button @click="save" v-text="'Сохранить'" />
    </div>
</template>

<script>
import ModalTitle from "~/components/ModalTitle";
import { mapGetters, mapActions } from "vuex";
export default {
    layout: "modal",
    components: { ModalTitle },
    data: () => ({
        meridius: ""
    }),
    computed: {
        ...mapGetters({
            strings: "strings/getStrings",
            settings: "settings/getSettings"
        })
    },
    mounted () {
        const { meridius } = this.settings.music;
        this.meridius = meridius;
    },
    methods: {
        ...mapActions({
            saveSettings: "settings/saveSettings"
        }),
        save () {
            this.settings.music.meridius = this.meridius;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        }
    }
};
</script>