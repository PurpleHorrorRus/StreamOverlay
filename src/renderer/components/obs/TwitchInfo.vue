<template>
    <div id="twitch-info">
        <div v-if="settings.OBSStatus.TwitchInfo.enable" id="twitch-info-viewers">
            <EyeIcon class="icon shadow-box" />
            <span id="twitch-info-viewers-count" class="shadow" v-text="viewers" />
        </div>

        <div v-if="settings.OBSStatus.TwitchInfo.enableFollowers" id="twitch-info-followers">
            <HeartIcon class="icon shadow-box" />
            <span v-if="followers > -1" id="followers_count" class="shadow" v-text="followers" />
        </div>
    </div>
</template>

<script>
import { EyeIcon, HeartIcon } from "vue-feather-icons";

import TwitchMixin from "~/mixins/twitch";

let interval = null;

export default {
    components: {
        EyeIcon,
        HeartIcon
    },
    mixins: [TwitchMixin],
    data: () => ({
        viewers: 0,
        followers: -1
    }),
    async created() {
        await this.fetch();
        interval = setInterval(() => this.fetch(), 20000);
    },
    beforeDestroy() {
        clearInterval(interval);
        interval = null;
    },
    destroyed() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    },
    methods: {
        fetch() {
            this.getViewersCount().then(viewers => this.viewers = viewers);
            this.getFollowersCount().then(followers => this.followers = followers);
        },
        async getViewersCount() {
            if (this.settings.OBSStatus.TwitchInfo.enable) {
                const { viewer_count } = await this.helix.stream.streams({ user_id: this.user.id });
                return viewer_count || 0;
            }

            return 0;
        },
        async getFollowersCount() {
            const { total } = await this.helix.users.follows(this.user.id);
            return total || -1;
        }
    }
};
</script>

<style lang="scss">
#twitch-info {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    column-gap: 10px;

    border-radius: 2px;

    &-viewers,
    &-followers {
        display: flex;
        align-items: center;
        column-gap: 4px;

        span {
            color: #fff;
            font-size: 11px;
        }

        .icon {
            stroke: #fff;
            width: 13px;
        }
    }
}
</style>