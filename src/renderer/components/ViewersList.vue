<template>
    <Movable
        class="viewers-list"
        :source="settings.viewers_list"
        name="Список зрителей"
        @onDrag="onDrag"
        @onResize="onResize"
    >
        <div v-if="!loading" id="viewers-container">
            <div v-for="category of Object.keys(chatters)" :key="category" class="category">
                <span
                    v-if="chatters[category].length"
                    class="category-title"
                    :style="{ color: colors[category] }"
                    v-text="`${category} (${chatters[category].length})`"
                />
                <span v-for="viewer of chatters[category]" :key="viewer" class="viewer-name" v-text="viewer" />
            </div>
        </div>
        <div v-else id="loading-block">
            <FontAwesomeIcon id="loading-icon" icon="circle-notch" spin />
        </div>
    </Movable>
</template>

<script>
import { mapActions } from "vuex";

import _ from "lodash";
import fetch from "node-fetch";

import Movable from "~/components/Movable";

import TwitchMixin from "~/mixins/twitch";

let interval = null;

export default {
    components: { Movable },
    mixins: [TwitchMixin],
    data: () => ({
        loading: true,
        chatters: {},
        colors: {
            admins: "#7C1F7C",
            broadcaster: "#FFCF40",
            global_mods: "#7C1F7C",
            moderators: "#00b454",
            staff: "#7C1F7C",
            viewers: "#0084ff",
            vips: "#6900ba"
        }
    }),
    async created() {
        this.loading = true;
        this.chatters = await this.get();
        interval = setInterval(async () => (this.chatters = await this.get()), 4 * 1000);
        this.loading = false;
    },
    beforeDestroy() {
        this.exit();
    },
    destroyed() {
        this.exit();
    },
    methods: {
        ...mapActions({
            getChatters: "twitch/CHATTERS"
        }),
        async get() {
            const botsRequest = await fetch("https://api.twitchinsights.net/v1/bots/online");

            const { bots } = botsRequest.ok ? await botsRequest.json() : { bots: [] };
            const { chatters } = await this.getChatters();

            if (!bots || !chatters) {
                return this.chatters;
            }

            for (const category in chatters) {
                chatters[category] = _.without(chatters[category], ...bots.map(([name]) => name));
            }

            return chatters;
        },
        onResize(x, y, width, height) {
            this.settings.viewers_list.width = width;
            this.settings.viewers_list.height = height;
            this.onDrag(x, y);
        },
        onDrag(x, y) {
            this.settings.viewers_list.x = x;
            this.settings.viewers_list.y = y;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        },
        exit() {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }
    }
};
</script>

<style lang="scss">
.viewers-list {
    position: absolute;

    width: 100%;
    height: 100%;

    border-radius: 5px;
    z-index: 50;

    &:not(.vdr.active) {
        background: rgba(0, 0, 0, 0.4) !important;
    }

    span {
        display: block;

        color: #fff;
        font-family: Roboto;
        font-size: 11pt;
        text-align: center;
    }

    #viewers-container {
        width: 100%;
        height: 100%;

        padding: 5px;

        overflow-x: hidden;
        overflow-y: auto;

        .category {
            margin-bottom: 5px;

            &-title {
                font-weight: 600;
            }
        }
    }

    #loading-block {
        display: flex;
        align-content: center;
        justify-content: center;
        margin-top: 20px;
    }
}
</style>