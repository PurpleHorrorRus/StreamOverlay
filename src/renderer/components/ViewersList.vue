<template>
    <movable class="viewers-list" :source="vl_settings" name="Список зрителей" @onDrag="onDrag" @onResize="onResize">
        <div v-if="!loading" id="viewers-container">
            <div v-for="category of categories" :key="category" class="category">
                <span 
                    v-if="chatters[category].length" 
                    class="category-title" 
                    :style="{ color: color(category) }" 
                    v-text="`${category} (${chatters[category].length})`" 
                />
                <span 
                    v-for="viewer of chatters[category]" 
                    :key="viewer" 
                    class="viewer-name" v-text="viewer" 
                />
            </div>
        </div>
        <span v-else class="loading-title" v-text="'Загрузка...'" />
    </movable>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import fetch from "node-fetch";
import Promise from "bluebird";

import movable from "~/components/movable";

fetch.Promise = Promise;

export default {
    components: { movable },
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
        ...mapGetters({
            active: "overlays/getEdit",
            helix: "twitch/getHelix",
            settings: "settings/getSettings",
            user: "twitch/getUser"
        }),
        vl_settings () { 
            return this.settings.viewers_list; 
        },
        categories () { 
            return Object.keys(this.chatters); 
        }
    },
    async mounted () {
        this.loading = true;
        await this.get();
        this.updateInterval = setInterval(this.get, 4 * 1000);
        return this.loading = false;
    },
    destroyed () {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },
    methods: {
        ...mapActions({
            saveSettings: "settings/saveSettings"
        }),
        get () {
            return new Promise(resolve => {
                const botsPromise = new Promise(resolve => {
                    fetch("https://api.twitchinsights.net/v1/bots/online")
                        .then(response => response.json())
                        .then(({ bots }) => resolve(bots.map(([name]) => name)));
                });
            
                const viewersPromise = new Promise(resolve => {
                    this.helix.getViewers(this.user.username)
                        .then(({ chatters }) => resolve(chatters));
                });

                return Promise.all([botsPromise, viewersPromise])
                    .then(([bots, chatters]) => {
                        for (const category of Object.keys(chatters)) {
                            const users = chatters[category];
                            if (users.length) {
                                for (const user of users) {
                                    if (~bots.indexOf(user)) {
                                        chatters[category] = chatters[category].filter(c => c !== user);
                                    }
                                }
                            }
                        }

                        this.chatters = chatters;
                        return resolve(chatters);
                    });
            });
        },
        color (category) { 
            return this.colors[category]; 
        },
        onResize  (x, y, width, height) {
            this.settings.viewers_list.width = width;
            this.settings.viewers_list.height = height;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
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

<style>
.viewers-list {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .4);
    border-radius: 5px;
    z-index: 50;
}

#viewers-container {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    border: 1px solid #000;
    padding: 5px;
    border-radius: 5px;
}

.category { margin-bottom: 5px; }
.category .category-title { font-weight: 600; }

.viewers-list span {
    display: block;
    color: #fff;
    font-family: Roboto;
    font-size: 11pt;
    text-align: center;
}
</style>