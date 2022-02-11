<template>
    <div id="modal-container-items">
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
        items: [
            {
                text: "Трансляция",
                link: "/stream",
                icon: () => import("~/assets/icons/broadcast.svg")
            },
            {
                text: "Режим редактирования",
                link: "/?edit=true",
                icon: () => import("~/assets/icons/pencil.svg")
            },
            {
                text: "Настройки OBS",
                link: "/settings/obs",
                icon: () => import("~/assets/icons/wrench.svg")
            },
            {
                text: "Настройки Twitch",
                link: "/settings/twitch",
                icon: () => import("~/assets/icons/twitch.svg")
            },
            {
                text: "Настройки чата",
                link: "/settings/chat",
                icon: () => import("~/assets/icons/chat.svg")
            },
            {
                text: "Прочие настройки",
                link: "/settings/other",
                icon: () => import("~/assets/icons/settings.svg")
            }
        ]
    })
};
</script>

<style lang="scss">
#modal-container-items {
    grid-area: items;

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