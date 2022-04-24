<template>
    <div id="menu-header-actions">
        <Link v-for="item of items" :key="item.to" :item="item" />
        <ActionsAd v-if="streaming && isPartner" />
        <div id="menu-header-actions-other">
            <Button
                v-if="streaming"
                :icon="['fas', 'film']"
                :load="loadClip"
                label="Клип"
                tooltip="Создать клип на 15 секунд"
                @clicked="createClip"
            />
        </div>
    </div>
</template>

<script>
import OBSMixin from "~/mixins/obs";
import TwitchMixin from "~/mixins/twitch";

export default {
    components: {
        Link: () => import("~/components/Menu/Header/Link"),
        ActionsAd: () => import("~/components/Menu/Header/ActionsAd"),
        Button: () => import("~/components/Menu/Header/Button")
    },

    mixins: [OBSMixin, TwitchMixin],

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