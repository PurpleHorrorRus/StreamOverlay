<template>
    <div id="menu-header-toggles">
        <ToggleButton
            :text="$strings.HEADER.TWITCH.FOLLOWERS_ONLY"
            :checked="followersOnly"
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
        ActionsAd: () => import("./ActionsAd.vue")
    },

    computed: {
        ...mapState({
            tags: state => state.twitch.tags
        }),

        followersOnly() {
            return this.tags["followers-only"] !== -1;
        }
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

    border-left: 1px solid var(--outline);

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