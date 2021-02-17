<template>
    <div class="modal-content">
        <ModalTitle :text="'Меню'" />
        <MenuItem 
            :text="'Трансляция'" 
            :icon="['fas', 'signal']"
            :load="loadingStream"
            @click="openStream" 
        />
        <MenuItem :text="'Редактирование виджетов'" :icon="['fas', 'pen']" @click="enterEdit" />
        <MenuItem :text="'Настройки OBS'" :icon="['fas', 'wrench']" @click="open('/settings/obs')" />
        <MenuItem :text="'Настройки Twitch'" :icon="['fab', 'twitch']" @click="open('/settings/twitch')" />
        <MenuItem :text="'Настройки чата'" :icon="['fas', 'comment']" @click="open('/settings/chat')" />
        <MenuItem :text="'Прочие настройки'" :icon="['fas', 'tools']" @click="open('/settings/other')" />
    </div>
</template>

<script>
import ModalTitle from "~/components/ModalTitle";
import MenuItem from "~/components/MenuItem";

import WidgetsMixin from "~/mixins/widgets";

export default {
    components: { 
        ModalTitle, 
        MenuItem
    },
    mixins: [WidgetsMixin],
    layout: "modal",
    data: () => ({ 
        loadingStream: false 
    }),
    methods: {
        openStream() { 
            this.loadingStream = true; 
            this.open("/stream");
        },
        enterEdit() {
            this.active = true;
            this.open("/");
        },
        open (link) {
            this.$router.replace(link).catch(() => {}); 
        }
    }
};
</script>