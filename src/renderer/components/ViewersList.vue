<template>
    <Movable class="viewers-list" :source="vl_settings" name="Список зрителей" @onDrag="onDrag" @onResize="onResize">
        <div v-if="!loading" id="viewers-container">
            <div v-for="category of categories" :key="category" class="category">
                <span 
                    v-if="chatters[category].length" 
                    class="category-title" 
                    :style="{ color: colors[category] }" 
                    v-text="`${category} (${chatters[category].length})`" 
                />
                <span 
                    v-for="viewer of chatters[category]" 
                    :key="viewer" 
                    class="viewer-name" v-text="viewer" 
                />
            </div>
        </div>
        <div v-else id="loading-block">
            <font-awesome-icon id="loading-icon" class="fa-spin" :icon="['fas', 'circle-notch']" />
        </div>
    </Movable>
</template>

<script>
import _ from "lodash";
import fetch from "node-fetch";
import Promise from "bluebird";

import Movable from "~/components/Movable";

import TwitchMixin from "~/mixins/twitch";

fetch.Promise = Promise;

export default {
    components: { Movable },
    mixins: [TwitchMixin],
    data: () => ({
        loading: true,
        updateInterval: null,
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
    computed: {
        vl_settings () { 
            return this.settings.viewers_list; 
        },
        categories () { 
            return Object.keys(this.chatters); 
        }
    },
    async created () {
        this.loading = true;
        this.chatters = await this.get();
        this.updateInterval = setInterval(async () => this.chatters = await this.get(), 4 * 1000);
        this.loading = false;
    },
    destroyed () {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },
    methods: {
        async get () {
            const botsRequest = await fetch("https://api.twitchinsights.net/v1/bots/online");

            const { bots } = await botsRequest.json();
            const { chatters } = await this.helix.getViewers(this.user.username);

            if (!bots || !chatters) {
                return this.chatters;
            }

            for (const category in chatters) {
                chatters[category] = _.without(
                    chatters[category], 
                    ...bots.map(([name]) => name)
                );
            }

            return chatters;
        },
        onResize  (x, y, width, height) {
            this.settings.viewers_list.width = width;
            this.settings.viewers_list.height = height;
            this.onDrag(x, y);
        },
        onDrag (x, y) {
            this.settings.viewers_list.x = x;
            this.settings.viewers_list.y = y;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        }
    }
};
</script>

<style lang="scss">
.viewers-list {
    position: absolute;

    width: 100%;
    height: 100%;

    background: rgba(0, 0, 0, .4) !important;
    border-radius: 5px;
    z-index: 50;

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