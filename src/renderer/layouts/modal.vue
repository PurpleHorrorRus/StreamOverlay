<template>
    <div id="modal-container" @click.self="exit">
        <chat />
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

import chat from "~/components/chat";

export default {
    components: { chat },
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
@import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');
html, body, #__nuxt, #__layout, #modal-container {
    width: 100%;
    height: 100%;
}
#modal-container{ background: rgba(0, 0, 0, 0.0); }

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

::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
  background: #0e0e0e;
  border-radius: 20px;
}
::-webkit-scrollbar-thumb {
  background: rgb(46, 46, 46);
  border-radius: 20px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgb(37, 37, 37);
}

:root {
    --checkbox-size: 10px;
    --checkbox-color: #FFFFFF;
    --hover-color: #ffffff;
    --tick-color: rgb(117, 117, 252);
}

h1 {
    color: var(--checkbox-color);
    font-size: 3rem;
    margin: 50px 0;
}

label {
    display: inline-block;
    margin: 0 calc(var(--checkbox-size) * 0.25);
    width: var(--checkbox-size);
    height: var(--checkbox-size);
    border: calc(var(--checkbox-size) * 0.125) solid var(--checkbox-color);
    border-radius: 12.5%;
    transition: 400ms 100ms ease-out;
}

label:hover {
    border-color: var(--hover-color);
}

input[type="checkbox"] {
    position: absolute;
    left: -1000px;
}

.tick {
    position: relative;
    right: 6px;
    top: -5.5px;
    width: calc(var(--checkbox-size) * 0.25);
    height: calc(var(--checkbox-size) * 0.75);
    border-right: calc(var(--checkbox-size) * 0.25) solid var(--tick-color);
    border-bottom: calc(var(--checkbox-size) * 0.25) solid var(--tick-color);
    -webkit-transform: rotate(45deg) scale(0);
        -ms-transform: rotate(45deg) scale(0);
            transform: rotate(45deg) scale(0);
    opacity: 0;
    -webkit-transition: all 600ms cubic-bezier(0.175, 0.885, 0.32, 1.5);
    -o-transition: all 600ms cubic-bezier(0.175, 0.885, 0.32, 1.5);
    transition: all 600ms cubic-bezier(0.175, 0.885, 0.32, 1.5);
}

.tick:before {
    content: '';
    position: absolute;
    left: calc(var(--checkbox-size) * -0.125);
    bottom: calc(var(--checkbox-size) * -0.25);
    border: calc(var(--checkbox-size) * 0.125) solid var(--tick-color);
    border-radius: 50%;
}

.tick:after {
    content: '';
    position: absolute;
    right: calc(var(--checkbox-size) * -0.25);
    top: calc(var(--checkbox-size) * -0.125);
    border: calc(var(--checkbox-size) * 0.125) solid var(--tick-color);
    border-radius: 50%;
}

input[type="checkbox"]:checked + label .tick {
    opacity: 1;
    -webkit-transform: rotate(45deg) scale(1);
        -ms-transform: rotate(45deg) scale(1);
            transform: rotate(45deg) scale(1);
}

input[type="checkbox"]:focus + label {
    -webkit-animation-name: cb-pop;
            animation-name: cb-pop;
    -webkit-animation-duration: 400ms;
            animation-duration: 400ms;
    -webkit-animation-iteration-count: 1;
            animation-iteration-count: 1;
    -webkit-animation-timing-function: linear;
            animation-timing-function: linear;
}

@-webkit-keyframes cb-pop {
    0% {
        -webkit-transform: scale(1);
                transform: scale(1);
    }
    33% {
        -webkit-transform: scale(0.9);
                transform: scale(0.9);
    }
    66% {
        -webkit-transform: scale(1.1);
                transform: scale(1.1);
    }
    100% {
        tranform: scale(1);
    }
}

@keyframes cb-pop {
    0% {
        -webkit-transform: scale(1);
                transform: scale(1);
    }
    33% {
        -webkit-transform: scale(0.9);
                transform: scale(0.9);
    }
    66% {
        -webkit-transform: scale(1.1);
                transform: scale(1.1);
    }
    100% {
        tranform: scale(1);
    }
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

input[type=range] {
  -webkit-appearance: none;
  margin: 18px 0;
  width: 100%;
}

input[type=range]:focus { outline: none; }

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  animate: 0.2s;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #3071a9;
  border-radius: 1.3px;
  border: 0.2px solid #010101;
}

input[type=range]::-webkit-slider-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -14px;
}

input[type=range]:focus::-webkit-slider-runnable-track { background: #367ebd; }

input[type=range]::-moz-range-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  animate: 0.2s;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #3071a9;
  border-radius: 1.3px;
  border: 0.2px solid #010101;
}

input[type=range]::-moz-range-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
}

input[type=range]::-ms-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  animate: 0.2s;
  background: transparent;
  border-color: transparent;
  border-width: 16px 0;
  color: transparent;
}

input[type=range]::-ms-fill-lower {
  background: #2a6495;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}

input[type=range]::-ms-fill-upper {
  background: #3071a9;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}

input[type=range]::-ms-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
}

input[type=range]:focus::-ms-fill-lower {
  background: #3071a9;
}

input[type=range]:focus::-ms-fill-upper {
  background: #367ebd;
}


</style>