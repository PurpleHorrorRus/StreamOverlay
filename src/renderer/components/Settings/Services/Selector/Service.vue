<template>
    <div class="service clickable">
        <div class="service-information">
            <CheckIcon v-if="service.active" class="icon" />
            <img :src="`/images/${service.id}.png`" class="service-information-image">
            <span class="service-information-name" v-text="service.name" />
        </div>
        
        <SettingsIcon 
            v-if="!settings.first"
            v-tooltip="tooltip" 
            class="icon clickable"
            @click.stop="open"
        />
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    components: {
        CheckIcon: () => import("~/assets/icons/check.svg"),
        SettingsIcon: () => import("~/assets/icons/settings.svg")
    },

    mixins: [CoreMixin],

    props: {
        service: {
            type: Object,
            required: true
        }
    },

    computed: {
        tooltip() {
            return `Настройки ${this.service.name}`;
        }
    },

    methods: {
        open() {
            this.$router.replace(`/services/${this.service.id}`);
        }
    }
};
</script>

<style lang="scss">
.service {
    display: flex;
    justify-content: space-between;
    align-content: center;

    padding: 10px;

    &-information {
        display: flex;
        align-items: center;
        column-gap: 10px;
        
        &-image {
            width: 36px;
            height: 36px;
        }
    }
}
</style>