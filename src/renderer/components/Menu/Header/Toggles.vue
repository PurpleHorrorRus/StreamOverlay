<template>
    <div id="menu-header-toggles">
        <Item text="Чат только для фолловеров" :checked="tags['followers-only'] !== '-1'" @change="turnFollwoersOnly" />
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

import Item from "~/components/Settings/Item";

export default {
    components: {
        Item
    },
    computed: {
        ...mapState({
            tags: state => state.twitch.tags
        })
    },
    methods: {
        ...mapActions({
            turnFollwoersOnly: "twitch/TURN_FOLLOWERS_ONLY"
        })
    }
};
</script>

<style lang="scss">
#menu-header-toggles {
    grid-area: toggles;

    padding: 10px;

    border-left: 1px solid $outline;

    .setting-item-block-name {
        font-size: 10pt;
    }
}
</style>