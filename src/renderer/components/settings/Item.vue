<template>
   <div class="setting-item">
        <span v-if="type == 'checkbox'" class="setting-name" v-text="text" />
        <input v-if="type == 'checkbox'" type="checkbox" :id="`scb${id}`" :checked="checked" @change="$emit('checked')">
        <label v-if="type == 'checkbox'" :for="`scb${id}`" class="setting-tumbler"> <div class="tick"></div> </label><br /><br />
        <button v-if="type == 'chooseFile'" @click="$emit('chooseFile')">Выбрать файл</button> 
        <span v-if="type == 'chooseFile'" id="choosed-file" v-text="settings.chat.sound_file"></span>
        <Tip v-if="tip" :text="tipText" />
    </div>
</template>

<script>
import Tip from "~/components/settings/Tip";
import { mapGetters } from 'vuex';

export default {
    props: {
        type: {
            type: String,
            required: true,
            default: "text"
        },
        id: {
            type: Number,
            required: false,
            default: 0
        },
        text: {
            type: String,
            required: true,
            default: "Не задано"
        },
        checked: {
            type: Boolean,
            required: false,
            default: false
        },
        chooseFile: {
            type: Boolean,
            required: false,
            default: false
        },
        tip: {
            type: Boolean,
            required: false,
            default: false
        },
        tipText: {
            type: String,
            required: false,
            default: "Не задано"
        }
    },
    components: { Tip },
    computed: {
        ...mapGetters({
            strings: "strings/getStrings"
        })
    }
}
</script>

<style>

</style>