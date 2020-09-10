<template>
    <div class="modal-content">
        <ModalTitle :text="strings.MENU_LABEL" />
        <MenuItem 
            :text="strings.MENU_ITEMS.MENU_ITEM_STREAM" 
            :icon="['fas', 'signal']"
            :load="loadingStream"
            @method="openStream" 
        />
        <MenuItem :text="strings.MENU_ITEMS.MENU_ITEM_EDIT" :icon="['fas', 'pen']" @method="enableEdit" />
        <MenuItem :text="strings.MENU_ITEMS.MENU_ITEM_OBS" :icon="['fas', 'wrench']" @method="openObs" />
        <MenuItem :text="strings.MENU_ITEMS.MENU_ITEM_TWITCH" :icon="['fab', 'twitch']" @method="openTwitch" />
        <MenuItem :text="strings.MENU_ITEMS.MENU_ITEM_CHAT" :icon="['fas', 'comment']" @method="openChat" />
        <MenuItem :text="strings.MENU_ITEMS.MENU_ITEM_DATABASE" :icon="['fas', 'database']" @method="openDatabase" />
        <MenuItem :text="strings.MENU_ITEMS.MENU_ITEM_VK" :icon="['fab', 'vk']" @method="openVK" />
        <!-- <div id="menu-actions">
            <ActionItem :icon="['fab', 'discord']" :label="'Вкл. муз.бота'" @action="startBot" />
            <ActionItem :icon="['fab', 'discord']" :label="'Выкл муз.бота'" @action="leaveBot" />
        </div> -->
    </div>
</template>

<script>
import { ipcRenderer } from "electron";
import { mapActions, mapGetters } from "vuex";

import ModalTitle from "~/components/ModalTitle";
import MenuItem from "~/components/MenuItem";
// import ActionItem from "~/components/ActionItem";

export default {
    layout: "modal",
    components: { 
        ModalTitle, 
        MenuItem, 
        // ActionItem 
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
        ipcRenderer.on("menu", () => this.$router.replace("/").catch(() => {})); 
        this._enableEdit(false);
    },
    methods: {
        ...mapActions({
            _enableEdit: "overlays/enableEdit",
            startBot: "discord/start",
            leaveBot: "discord/leave"
        }),
        openStream() { 
            this.loadingStream = true; 
            return this.$router.replace("/stream"); 
        },
        enableEdit() {
            this._enableEdit(true);
            this.$router.replace("/").catch(() => {});
        },
        openObs () { 
            this.$router.replace("/settings/obs").catch(() => {}); 
        },
        openTwitch () { 
            this.$router.replace("/settings/twitch").catch(() => {});
        },
        openChat () { 
            this.$router.replace("/settings/chat").catch(() => {});
        },
        openDatabase () { 
            this.$router.replace("/settings/database/").catch(() => {});
        },
        openVK () { 
            this.$router.replace("/settings/vk").catch(() => {});
        }
    }
};
</script>

<style>
.modal-navigation-link {
    display: block;
    width: 100%;
    height: 40px;
    padding: 10px;
}

.modal-navigation-link:hover {
    cursor: pointer;
    background: rgba(255, 255, 255, 0.4);
}

.modal-navigation-text {
    display: inline-block;
    margin-left: 10px;
}

#menu-actions {
    border-top: 2px solid #fff;
    padding-top: 10px;
}
</style>