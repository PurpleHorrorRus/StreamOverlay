<template>
    <div id="menu-header-actions">
        <Link v-for="item of items" :key="item.to" :item="item" />
    </div>
</template>

<script>
import Link from "~/components/menu/header/Link";

import TwitchMixin from "~/mixins/twitch";

export default {
    components: {
        Link
    },
    mixins: [TwitchMixin],
    data: () => ({
        items: [
            {
                title: "Голосование",
                to: "/twitch/polls"
            },
            {
                title: "Предсказание",
                to: "/twitch/predictions"
            }
        ]
    }),
    created() {
        if (this.user.broadcaster_type.length === 0) {
            this.items.splice(1, 1);
        }
    }
};
</script>

<style lang="scss">
#menu-header-actions {
    grid-area: actions;

    border-left: 1px solid $secondary;
}

.menu-header-action {
    display: block;

    width: 100%;
    height: 30px;

    padding: 5px;

    text-decoration: none;

    * {
        &:hover {
            cursor: pointer;
        }
    }

    &:hover {
        background: $secondary;
        cursor: pointer;
    }

    span {
        font-size: 9pt;
    }
}
</style>