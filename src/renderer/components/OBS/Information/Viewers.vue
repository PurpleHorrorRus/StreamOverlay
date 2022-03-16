<template>
    <div id="meta-info-viewers">
        <EyeIcon class="icon" />
        <span id="meta-info-viewers-count" v-text="count" />
    </div>
</template>

<script>
import MetaInfoMixin from "~/components/OBS/Information/Mixin";

export default {
    components: {
        EyeIcon: () => import("~/assets/icons/eye.svg")
    },

    mixins: [MetaInfoMixin],

    methods: {
        async update() {
            switch(this.settings.service) {
                case this.services.twitch: {
                    const stream = await this.helix.stream.streams({ user_id: this.user.id });
                    this.count = stream.viewer_count ?? 0;
                    break;
                }

                case this.services.trovo: {
                    const channel = await this.trovo.channels.get(this.user.nickName);
                    this.count = channel.current_viewers ?? 0;
                    break;
                }
            }
        }
    }
};
</script>