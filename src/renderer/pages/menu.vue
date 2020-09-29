<template>
    <div class="modal-content">
        <ModalTitle :text="'Меню'" />
        <MenuItem 
            :text="'Трансляция'" 
            :icon="['fas', 'signal']"
            :load="loadingStream"
            @method="openStream" 
        />
        <MenuItem :text="'Редактирование виджетов'" :icon="['fas', 'pen']" @method="enableEdit" />
        <MenuItem :text="'Настройки OBS'" :icon="['fas', 'wrench']" @method="openOBS" />
        <MenuItem :text="'Настройки Twitch'" :icon="['fab', 'twitch']" @method="openTwitch" />
        <MenuItem :text="'Настройки чата'" :icon="['fas', 'comment']" @method="openChat" />
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import ModalTitle from "~/components/ModalTitle";
import MenuItem from "~/components/MenuItem";

export default {
    layout: "modal",
    components: { 
        ModalTitle, 
        MenuItem
    },
    data: () => ({ 
        loadingStream: false 
    }),
    computed: {
        ...mapGetters({
            strings: "strings/getStrings"
        })
    },
    mounted () { 
        this._enableEdit(false);
    },
    methods: {
        ...mapActions({
            _enableEdit: "overlays/enableEdit"
        }),
        openStream() { 
            this.loadingStream = true; 
            this.$router.replace("/stream"); 
        },
        enableEdit() {
            this._enableEdit(true);
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