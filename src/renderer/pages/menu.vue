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
    </div>
</template>

<script>
import ModalTitle from "~/components/ModalTitle";
import MenuItem from "~/components/MenuItem";

import WidgetsMixin from "~/mixins/widgets";

export default {
    layout: "modal",
    components: { 
        ModalTitle, 
        MenuItem
    },
    mixins: [WidgetsMixin],
    data: () => ({ 
        loadingStream: false 
    }),
    methods: {
        openStream() { 
            this.loadingStream = true; 
            this.$router.replace("/stream"); 
        },
        enterEdit() {
            this.active = true;
            this.$router.replace("/").catch(() => {});
        },
        open (link) {
            this.$router.replace(link).catch(() => {}); 
        }
    }
};
</script>