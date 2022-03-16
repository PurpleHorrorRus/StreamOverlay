<template>
    <div id="meta-info-followers">
        <FollowersIcon class="icon" />
        <span id="meta-info-followers-count" v-text="count" />
    </div>
</template>

<script>
import MetaInfoMixin from "~/components/OBS/Information/Mixin";

export default {
    components: {
        FollowersIcon: () => import("~/assets/icons/followers.svg")
    },

    mixins: [MetaInfoMixin],

    methods: {
        async update() {
            switch(this.settings.service) {
                case this.services.twitch: {
                    const follows = await this.helix.users.follows(this.user.id);
                    this.count = follows?.total ?? 0;
                    break;
                }

                case this.services.trovo: {
                    const followers = await this.trovo.channel.followers(this.user.userId);
                    this.count = followers?.count ?? 0;
                    break;
                }
            }
        }
    }
};
</script>