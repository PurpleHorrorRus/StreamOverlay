<template>
    <div id="modal-container-navigation">
        <div
            v-for="item of items"
            :key="item.link"
            v-tooltip="item.text"
            class="menu-item clickable"
        >
            <nuxt-link
                :to="item.link"
                active-class="active"
                class="menu-item-link"
            >
                <Component :is="item.icon" class="icon" />
            </nuxt-link>
        </div>
    </div>
</template>

<script>
export default {
    data: () => ({
        items: []
    }),

    created() {
        this.items = [{
            text: this.$strings.MENU.NAVIGATION.STREAM,
            link: "/stream",
            icon: () => import("~icons/broadcast.svg")
        },

        {
            text: this.$strings.MENU.NAVIGATION.EDIT,
            link: "/?edit=true",
            icon: () => import("~icons/pencil.svg")
        },

        {
            text: this.$strings.MENU.NAVIGATION.OBS,
            link: "/settings/obs",
            icon: () => import("~icons/wrench.svg")
        },

        {
            text: this.$strings.MENU.NAVIGATION.SERVICES,
            link: "/services",
            icon: () => import("~icons/twitch.svg")
        },

        {
            text: this.$strings.MENU.NAVIGATION.CHAT,
            link: "/settings/chat",
            icon: () => import("~icons/chat.svg")
        },

        {
            text: this.$strings.MENU.NAVIGATION.APPEARANCE,
            link: "/settings/appearance",
            icon: () => import("~icons/brush.svg")
        },

        {
            text: this.$strings.MENU.NAVIGATION.OTHER,
            link: "/settings/other",
            icon: () => import("~icons/settings.svg")
        }];
    }
};
</script>

<style lang="scss">
#modal-container-navigation {
    grid-area: navigation;

    .menu-item {
        width: 50px;
        height: 50px;

        &-link {
            display: flex;
            justify-content: center;
            align-items: center;

            width: 100%;
            height: 100%;
        }
    }
}
</style>