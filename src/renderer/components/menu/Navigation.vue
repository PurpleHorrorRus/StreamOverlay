<template>
    <div id="modal-container-items">
        <div v-for="item of items" :key="item.link" v-tooltip="item.text" class="menu-item">
            <nuxt-link :to="item.link" active-class="active" class="menu-item-link">
                <FontAwesomeIcon :icon="item.icon" />
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
                icon: ["fas", "signal"]
            },
            {
                text: "Редактирование виджетов",
                icon: ["fas", "pen"],
                link: "/?edit=true"
            },
            {
                text: "Настройки OBS",
                icon: ["fas", "wrench"],
                link: "/settings/obs"
            },
            {
                text: "Настройки Twitch",
                icon: ["fab", "twitch"],
                link: "/settings/twitch"
            },
            {
                text: "Настройки чата",
                icon: ["fas", "comment"],
                link: "/settings/chat"
            },
            {
                text: "Прочие настройки",
                icon: ["fas", "tools"],
                link: "/settings/other"
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

            &.active {
                background: $secondary;
            }

            &:not(.active) {
                &:hover {
                    background: #ffffff40;
                }
            }

            svg {
                color: #fff;
            }
        }
    }
}
</style>