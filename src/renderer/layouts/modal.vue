<template>
    <div id="modal">
        <Chat v-if="!settings.first && locked" :input="true" />
        <div id="modal-lock">
            <span id="modal-lock-tip" v-text="'Alt+A'" />
            <FontAwesomeIcon v-if="locked" :icon="['fa', 'lock']" style="color: lightgreen" />
            <FontAwesomeIcon v-else :icon="['fa', 'unlock']" style="color: red" />
        </div>
        <div v-show="locked" id="modal-container">
            <div v-show="!settings.first" id="modal-container-items">
                <div v-for="item of items" :key="item.link" v-tooltip="item.text" class="menu-item">
                    <nuxt-link :to="item.link" active-class="active" class="menu-item-link">
                        <FontAwesomeIcon :icon="item.icon" />
                    </nuxt-link>
                </div>
            </div>
            <div id="modal-container-page">
                <nuxt />
            </div>
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from "electron";
import { mapState } from "vuex";

import Chat from "~/components/Chat";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Chat
    },
    mixins: [CoreMixin],
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
    }),
    computed: {
        ...mapState({
            locked: state => state.ipc.locked
        })
    },
    mounted() {
        ipcRenderer.send("turnMouse", true);
    },
    methods: {
        exit() {
            if (!this.settings.first) {
                this.$router.replace("/").catch(() => {});
            }
        }
    }
};
</script>

<style lang="scss">
#modal {
    display: flex;
    justify-content: center;
    align-items: flex-start;

    height: 100%;

    margin-top: 5%;

    background: none;

    &-lock {
        position: absolute;
        top: 10px;
        right: 10px;

        font-size: 15pt;

        &-tip {
            padding: 5px;

            border-radius: 5px;
            background: rgba(0, 0, 0, 0.7);

            font-size: 10pt;
            font-weight: 600;
        }
    }

    &-container {
        display: grid;
        grid-template-columns: 50px 900px;
        grid-template-rows: max-content;
        grid-template-areas: "items page";

        grid-gap: 20px 10px;

        min-width: 600px;

        background: #141414;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

        &-items {
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

        &-page {
            grid-area: page;
            width: 98%;
        }
    }

    .modal-content {
        width: 100%;

        .modal-title {
            padding: 5px;

            font-size: 14pt;
            font-weight: bold;

            border-bottom: 1px solid #ccc;
        }

        .modal-body {
            padding: 5px;

            .modal-item-tip {
                padding: 10px;

                &-text {
                    display: block;
                    max-width: 600px;

                    color: #ccc;
                    font-size: 9pt;
                }
            }
        }
    }
}
</style>