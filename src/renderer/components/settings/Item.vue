<template>
    <div class="setting-item">
        <span v-if="type == 'checkbox'" class="setting-name" v-text="text" />
        <input v-if="type == 'checkbox'" :id="`scb${id}`" type="checkbox" :checked="checked" @change="$emit('checked')">
        <label 
            v-if="type == 'checkbox'" 
            :for="`scb${id}`" 
            class="setting-tumbler"
        > 
            <div class="tick" /> 
        </label>
        <span v-if="type == 'chooseFile'" id="choosed-file" v-text="settings.chat.sound_file" />
        <Tip v-if="tip" :text="tipText" />
    </div>
</template>

<script>
import Tip from "~/components/settings/Tip";

export default {
    components: { Tip },
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
    }
};
</script>