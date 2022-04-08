<template>
    <div class="badges">
        <img 
            v-for="badge of badges" 
            :key="badge" 
            class="badge" 
            :style="badgeStyle" 
            :src="badge"
        >
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    props: {
        badges: {
            type: Array,
            required: false,
            default: () => []
        }
    },

    computed: {
        badgeStyle() {
            return {
                width: `${this.settings.chat.font + 4}px`
            };
        }
    }
};
</script>

<style lang="scss">
.badges {
    display: inline;

    vertical-align: middle;

    .badge {
        &:not(:last-child) {
            margin-right: 2px;
        }

        margin-left: 2px;

        border-radius: 3px;

        vertical-align: middle;
    }
}
</style>