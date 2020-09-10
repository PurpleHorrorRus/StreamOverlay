<template>
    <div class="modal-content">
        <ModalTitle :text="strings.VK_LABEL" />
        <div class="modal-body">
            <Item 
                :id="0" 
                :type="'checkbox'" 
                :text="'Включить чатлог'" 
                :checked="settings.vk_chatlog.enable" 
                @checked="turn" 
            />
            <span v-text="'ID чатлога'" />
            <input
                id="vk_chatlog_to" 
                v-model="to"
            >
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import ModalTitle from "~/components/ModalTitle";
import Item from "~/components/settings/Item";

export default {
    layout: "modal",
    components: { ModalTitle, Item },
    data: () => ({
        to: 0
    }),
    computed: {
        ...mapGetters({
            strings: "strings/getStrings",
            settings: "settings/getSettings"
        })
    },
    watch: {
        to (newVal) {
            this.settings.vk_chatlog.to = newVal;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        }
    },
    mounted () {
        this.to = this.settings.vk_chatlog.to;
    },
    methods: {
        ...mapActions({
            saveSettings: "settings/saveSettings"
        }),
        turn () {
            const { enable } = this.settings.vk_chatlog;
            this.settings.vk_chatlog.enable = !enable;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        }
    }
};
</script>

<style>
#vk_chatlog_to {
    display: block;
}
</style>