<template>
    <Movable
        :source="source"
        :name="''"
        :resizable="false"
        @onDrag="onDrag"
    >
        <div id="twitch-info">
            <div id="twitch-info-viewers">
                <EyeIcon class="feather shadow-box" />
                <span id="viewers_count" class="shadow" v-text="viewers" />
            </div>
            
            <div v-if="settings.TwitchInfo.enableFollowers" id="twitch-info-followers">
                <HeartIcon class="feather shadow-box" />
                <span v-if="followers > -1" id="followers_count" class="shadow" v-text="followers" />
            </div>
        </div>
    </Movable>
</template>

<script>
import { mapState } from "vuex";

import Promise from "bluebird";

import { EyeIcon, HeartIcon } from "vue-feather-icons";

import Movable from "~/components/Movable";

import TwitchMixin from "~/mixins/twitch";

let interval = null;

export default {
    components: {
        Movable,
        EyeIcon,
        HeartIcon
    },
    mixins: [TwitchMixin],
    data: () => ({
        viewers: 0,
        followers: -1
    }),
    computed: {
        ...mapState({
            streaming: state => state.obs.status.stream
        }),
        source () {
            return {
                ...this.settings.TwitchInfo,
                width: this.settings.TwitchInfo.enableFollowers ? 110 : 55,
                height: 25
            };
        }
    },
    async created () {
        this.get();
        interval = setInterval(() => this.get(), 20000);
    },
    destroyed () {
        clearInterval(interval);
        interval = null;
    },
    methods: {
        async get () {
            const [viewers, followers] = await Promise.all([this.getViewersCount(), this.getFollowersCount()]);
            this.viewers = viewers;
            this.followers = followers;
        },
        async getViewersCount() {
            if (!this.streaming) return 0;
            const { viewer_count } = await this.helix.stream.streams({ user_id: this.user.id });
            return viewer_count || 0;
        },
        async getFollowersCount () {
            if (this.settings.TwitchInfo.enableFollowers) {
                const { total } = await this.helix.users.follows(this.user.id);
                return total || -1;
            }

            return -1;
        },
        onDrag (x, y) {
            this.settings.TwitchInfo.x = x;
            this.settings.TwitchInfo.y = y;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        },
        onResize (width, height, x, y) {
            this.settings.TwitchInfo.width = width;
            this.settings.TwitchInfo.height = height;
            this.onDrag(x, y);
        }
    }
};
</script>

<style lang="scss">
#twitch-info {
    $infoSize: 12pt;
    $viewersColor: #ff3838;

    display: flex;
    justify-content: flex-start;
    align-items: center;
    column-gap: 10px;

    // background: #00000098;

    border-radius: 2px;

    &-viewers {
        span {
            color: $viewersColor;
        }

        .feather {
            stroke: $viewersColor;
        }
    }

    span {
        font-family: "Roboto Condensed", sans-serif;
        font-weight: 800;

        // text-shadow: 1px 1px 1px rgb(0, 0, 0);
    }

    svg,
    span {
        vertical-align: middle;

        font-size: $infoSize;
        filter: drop-shadow(1px 1px 0px rgba(0,0,0,.7));
    }

    .feather {
        width: $infoSize;
    }
}
</style>