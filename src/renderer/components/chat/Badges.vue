<template>
    <div class="badges">
        <img 
            v-for="badge of badges" 
            :key="badge" 
            class="badge" 
            :style="badgeStyle"
            :src="badgeImage(badge)"
        >
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    props: {
        badges: {
            type: Array,
            required: false,
            default: () => []
        }
    },
    computed: {
        ...mapGetters({
            settings: "settings/getSettings"
        }),
        badgeStyle () {
            return { 
                width: `${this.settings.chat.font}pt` 
            };
        }
    },
    methods: {
        badgeImage (badge) {
            try {
                return require(`~/images/${badge}.png`).default;
            } catch (e) {
                return "";
            }
        },
    }
};
</script>

<style lang="scss">
.badges {
    display: inline;
    vertical-align: middle;
    
    .badge {
        margin-right: 2px;
        margin-left: 2px;

        vertical-align: middle;
    }
}
</style>