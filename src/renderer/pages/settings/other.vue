<template>
    <div class="modal-content">
        <ModalTitle :text="'Прочие настройки'" />
        <div class="modal-body">
            <Item 
                :text="'Статистика Twitch'" 
                :checked="settings.TwitchInfo.enable" 
                @change="turnTwitch('enable')" 
            />
            <Item 
                v-if="settings.TwitchInfo.enable"
                :text="'Показать количество фолловеров'" 
                :checked="settings.TwitchInfo.enableFollowers" 
                @change="turnTwitch('enableFollowers')" 
            />

            <Item 
                :text="'Включить техническую статистику OBS'" 
                :checked="settings.TechInfo.enable" 
                @change="turnTech" 
            />
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

import ModalTitle from "~/components/ModalTitle";
import Item from "~/components/settings/Item";

export default {
    components: { 
        ModalTitle, 
        Item
    },
    layout: "modal",
    computed: {
        ...mapState({
            settings: state => state.settings.settings
        })
    },
    methods: {
        ...mapActions({
            saveSettings: "settings/saveSettings"
        }),
        turnTwitch (option) {
            this.settings.TwitchInfo[option] = !this.settings.TwitchInfo[option];
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        },
        turnTech () {
            this.settings.TechInfo.enable = !this.settings.TechInfo.enable;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        }
    }
};
</script>