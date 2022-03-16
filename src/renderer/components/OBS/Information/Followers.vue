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
                    const follows = await this.client.users.follows(this.user.id);
                    this.count = follows?.total ?? 0;
                    break;
                }

                case this.services.trovo: {
                    const follows = await this.client.channel.followers(this.user.id);
                    this.count = Number(follows?.total) || 0;
                    break;
                }
            }
        }
    }
};
</script>