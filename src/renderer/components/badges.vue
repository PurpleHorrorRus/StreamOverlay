<template>
    <div class="badges">
        <img 
            v-for="badge of badges" 
            :key="badge" 
            :style="badgeStyle"
            class="badge" 
            :src="image(badge)"
        >
    </div>
</template>

<script>
import { mapGetters } from "vuex";

import broadcaster from "~/images/broadcaster.png";
import moderator from "~/images/moderator.png";
import premium from "~/images/premium.png";
import subscriber from "~/images/subscriber.png";
import vip from "~/images/vip.png";
import vk from "~/images/vk.png";

export default {
    props: {
        badges: {
            required: false,
            default: () => [],
            type: Array
        }
    },
    computed: {
        ...mapGetters({
            settings: "settings/getSettings"
        }),
        badgeStyle () {
            return { 
                width: `${this.settings.chat.font}px` 
            };
        }
    },
    methods: {
        image(badge) {
            switch(badge) {
            case "broadcaster": return broadcaster;
            case "moderator": return moderator;
            case "premium": return premium;
            case "subscriber": return subscriber;
            case "vip": return vip;
            case "vk": return vk;
            }
        }
    }
};
</script>

<style>
.badges {
    display: inline-block;
    width: max-content;
}

.badge { margin-right: 2px; }
</style>