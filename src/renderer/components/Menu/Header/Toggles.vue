<template>
    <div id="menu-header-toggles">
        <ToggleButton 
            text="Чат только для фолловеров" 
            :checked="tags['followers-only'] !== '-1'" 
            @change="turnFollwoersOnly" 
        />

        <div id="menu-header-actions-ad">
            <ActionsAd />
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
    components: {
        ActionsAd: () => import("~/components/Menu/Header/ActionsAd")
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

    display: flex;
    flex-direction: column;
    row-gap: 10px;

    padding: 10px;

    border-left: 1px solid $outline;

    .setting-item-block-name {
        font-size: 12px;
    }

    .setting-item {
        margin-bottom: 0px;
    }

    #menu-header-actions-ad {
        display: flex;
        flex-wrap: wrap;

        .solid-button {
            width: 120px;
        }
    }
}
</style>