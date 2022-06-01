<template>
    <div id="menu-header-actions">
        <HeaderLink v-for="item of items" :key="item.to" :item="item" />
        <div id="menu-header-actions-other">
            <SolidButton
                v-tooltip="'Создать клип на 15 секунд'"
                :load="loadClip"
                label="Клип"
                @click.native="createClip"
            />
        </div>
    </div>
</template>

<script>
import OBSMixin from "~/mixins/obs";

export default {
    components: {
        HeaderLink: () => import("~/components/Menu/Header/Link")
    },

    mixins: [OBSMixin],

    data: () => ({
        items: [
            {
                title: "Голосование",
                to: "/services/twitch/polls"
            },

            {
                title: "Предсказание",
                to: "/services/twitch/predictions"
            }
        ],
        loadAd: false,
        loadClip: false
    }),

    computed: {
        isPartner() {
            return this.user.broadcaster_type.length > 0;
        }
    },

    created() {
        if (!this.isPartner) {
            this.items.splice(1, 1);
        }
    },

    methods: {
        async createClip() {
            this.loadClip = true;
            await this.client.clips.create(this.user.id);

            this.addNotification({
                text: "Клип успешно создан",
                color: "#28a745",
                handle: 5
            });

            this.loadClip = false;
        }
    }
};
</script>

<style lang="scss">
#menu-header-actions {
    grid-area: actions;

    padding: 10px;

    border-left: 1px solid $outline;

    &-other {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 5px;

        margin-top: 5px;

        .solid-button {
            width: 65px;
        }
    }
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