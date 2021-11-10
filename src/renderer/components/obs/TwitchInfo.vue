<template>
    <div id="twitch-info">
        <div
            v-if="settings.OBSStatus.TwitchInfo.enable"
            id="twitch-info-viewers"
        >
            <EyeIcon class="icon" />
            <span
                id="twitch-info-viewers-count"
                class="shadow"
                v-text="viewersCount"
            />
        </div>

        <div
            v-if="settings.OBSStatus.TwitchInfo.enableFollowers"
            id="twitch-info-followers"
        >
            <FollowersIcon class="icon" />
            <span id="followers_count" class="shadow" v-text="followersCount" />
        </div>
    </div>
</template>

<script>
import EyeIcon from "~/assets/icons/eye.svg";
import FollowersIcon from "~/assets/icons/followers.svg";

import TwitchMixin from "~/mixins/twitch";

let interval = null;

export default {
    components: {
        EyeIcon,
        FollowersIcon
    },
    mixins: [TwitchMixin],
    data: () => ({
        viewers: null,
        followers: null
    }),
    computed: {
        viewersCount() {
            return this.viewers ?? "-";
        },
        followersCount() {
            return this.followers ?? "-";
        }
    },
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
    }
}
</style>