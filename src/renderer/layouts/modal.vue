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
            locked: "ipc/getLock"
        })
    },
    mounted () { 
        ipcRenderer.send("enableMouse"); 
    },
    methods: {
        exit () {
            ipcRenderer.send("disableMouse");
            this.$router.replace("/").catch(() => {});
        }
    }
};
</script>

<style>
#modal-container { background: rgba(0, 0, 0, 0.0); }

#modal {
    position: absolute;
    width: 600px;
    height: auto;
    padding: 15px;
    background: #141414;
    left: 35%;
    top: 10%;
}

#modal-lock {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 15pt;
}

.modal-title { border-bottom: 2px solid #fff; }

.modal-title-text {
    font-size: 18pt;
    font-weight: 600;
}

.modal-item-tip {
    display: block;
    margin-bottom: 2px;
}

.modal-item-tip-text {
    position: relative;
    top: 5px;
    color: #ccc;
    font-size: 8pt;
}

h1 {
    color: var(--checkbox-color);
    font-size: 3rem;
    margin: 50px 0;
}

.settings-category-name {
    padding: 5px;
    font-size: 15pt;
}

.setting-item { padding: 5px;}
.setting-item .setting-name { font-size: 12pt; }

.setting-item select {
    outline: none;
    width: 200px;
    background: none;
    color: white;
    padding: 5px;
    border: 1px solid #4f4f4f;
    border-radius: 10px;
}

.setting-item select option {
    margin: 40px;
    background: #4f4f4f;
    color: #fff;
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