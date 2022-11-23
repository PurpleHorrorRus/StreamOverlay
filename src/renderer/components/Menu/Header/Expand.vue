<template>
    <div id="menu-header-profile-expand">
        <ChevronLeft
            v-if="!$parent.expanded"
            id="menu-header-profile-expand-icon"
            class="icon feather clickable"
            @click="$parent.expanded = true"
        />

        <ChevronRight
            v-else
            id="menu-header-profile-expand-icon"
            class="icon feather clickable"
            @click="$parent.expanded = false"
        />

        <Expanded v-if="$parent.expanded" />
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    components: {
        ChevronLeft: () => import("~icons/chevron-left.svg"),
        ChevronRight: () => import("~icons/chevron-right.svg"),

        Expanded: () => import("~/components/Menu/Header/Expanded")
    },

    computed: {
        ...mapState({
            connected: state => state.service.connected
        })
    },

    watch: {
        connected(connected) {
            if (!connected && this.expanded) {
                this.expanded = false;
            }
        }
    }
};
</script>

<style lang="scss">
#menu-header-profile-expand {
    &-icon {
        position: absolute;
        top: 15px;
        right: 15px;

        height: 100%;
    }
}
</style>