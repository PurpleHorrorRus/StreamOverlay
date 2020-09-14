<template>
    <div id="modal-container" @click.self="exit">
        <Chat />
        <div id="modal-lock">
            <font-awesome-icon v-if="locked" :icon="['fa', 'lock']" style="color: lightgreen" />
            <font-awesome-icon v-else :icon="['fa', 'unlock']" style="color: red" />
        </div>
        <div v-show="locked" id="modal">
            <nuxt />
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from "electron";
import { mapGetters } from "vuex";

import Chat from "~/components/Chat";

export default {
    components: { Chat },
    computed: {
        ...mapGetters({
            settings: "settings/getSettings",
            locked: "ipc/getLock"
        })
    },
    created () {
        ipcRenderer.send("minimizeWidgets");
    },
    beforeDestroy () {
        ipcRenderer.send("restoreWidgets");
    },
    mounted () { 
        ipcRenderer.send("enableMouse"); 
    },
    methods: {
        exit () {
            if (!this.settings.first) {
                ipcRenderer.send("disableMouse");
                this.$router.replace("/").catch(() => {});
            } 
        }
    }
};
</script>

<style lang="scss">
#modal-container { 
    background: none;

    #modal-lock {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 15pt;
    }

    #modal {
        position: absolute;
        left: 35%;
        top: 10%;

        width: 600px;
        height: auto;

        padding: 15px;
        
        background: #141414;
    }

    .modal-title { 
        border-bottom: 2px solid $text;

        &-text {
            font-size: 18pt;
            font-weight: 600;
        } 
    }

    
    .modal-item-tip {
        display: block;

        margin-bottom: 2px;

        &-text {
            position: relative;
            top: 5px;
            color: $secondary;
            font-size: 8pt;
        }
    }

    .setting-item { 
        padding: 5px;

        select {
            width: 200px;

            padding: 5px;

            background: none;
            outline: none;
            
            color: $text;
            border: 1px solid $outline;
            border-radius: 10px;

            option {
                margin: 40px;
                background: $secondary;
                color: $text;
            }
        }

        .setting-name {
            font-size: 12pt;
        }
    }
}

.settings-category-name {
    padding: 5px;
    font-size: 15pt;
}

.setting-item .setting-tumbler { float: right; }

label.setting-tumbler { padding: 8px; }

label.setting-tumbler .tick {
    width: 10px;
    left: -5px;
}

#settings-main-container {
    width: 87%;
    padding-left: 3%;
    overflow-y: auto;
}

#settings-go-back {
    position: absolute;
    right: 3%;
    top: 58px;
    border: 2px solid #ccc;
    border-radius: 48px;
    width: 35px;
    height: 35px;
}

#settings-go-back:hover {
    cursor: pointer;
    background: rgba(255, 255, 255, 0.2);
}

#settings-icon-back {
    margin-left: 10px;
    margin-top: 8px;
}
</style>