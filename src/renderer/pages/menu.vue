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
        <MenuItem :text="'Настройки OBS'" :icon="['fas', 'wrench']" @click="openOBS" />
        <MenuItem :text="'Настройки Twitch'" :icon="['fab', 'twitch']" @click="openTwitch" />
        <MenuItem :text="'Настройки чата'" :icon="['fas', 'comment']" @click="openChat" />
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
        openOBS () { 
            this.$router.replace("/settings/obs").catch(() => {}); 
        },
        openTwitch () { 
            this.$router.replace("/settings/twitch").catch(() => {});
        },
        openChat () { 
            this.$router.replace("/settings/chat").catch(() => {});
        }
    }
};
</script>