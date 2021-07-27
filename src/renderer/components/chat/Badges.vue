<template>
    <div class="badges">
        <img v-for="badge of badges" :key="badge" class="badge" :style="badgeStyle" :src="badge">
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    props: {
        badges: {
            type: Array,
            required: false,
            default: () => []
        }
    },
    computed: {
        ...mapState({
            settings: state => state.settings.settings
        }),
        badgeStyle() {
            return {
                width: `${this.settings.chat.font}pt`
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