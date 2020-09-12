<template>
    <div class="badges">
        <img 
            v-for="badge of badges" 
            :key="badge" 
            class="badge" 
            :style="badgeStyle"
            :src="require(`~/images/${badge}.png`).default"
        >
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    props: {
        badges: {
            required: false,
            default: () => [],
            type: Array
        }
    },
    computed: {
        ...mapGetters({
            settings: "settings/getSettings"
        }),
        badgeStyle () {
            return { 
                width: `${this.settings.chat.font}px` 
            };
        }
    }
};
</script>

<style lang="scss">
.badges {
    display: inline-block;
    width: max-content;

    .badge {
        margin-right: 3px;
    }
}
</style>