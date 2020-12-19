<template>
    <Movable
        :source="settings.TwitchInfo"
        :name="''"
        :resizable="false"
        @onDrag="onDrag"
    >
        <div id="twitch-info">
            <div id="twitch-info-viewers">
                <EyeIcon class="feather shadow-box" />
                <span v-if="viewers > -1" id="viewers_count" class="shadow" v-text="viewers" />
                <font-awesome-icon 
                    v-else 
                    id="viewers_count" 
                    :icon="['fa', 'circle-notch']" 
                    class="fa-spin" 
                />
            </div>
            
            <div id="twitch-info-followers">
                <HeartIcon class="feather shadow-box" />
                <span v-if="followers > -1" id="followers_count" class="shadow" v-text="followers" />
                <font-awesome-icon 
                    v-else id="viewers_count" 
                    :icon="['fas', 'circle-notch']" 
                    class="fa-spin" 
                />
            </div>
        </div>
    </Movable>
</template>

<script>
import { EyeIcon, HeartIcon } from "vue-feather-icons";

import Movable from "~/components/Movable";

import TwitchMixin from "~/mixins/twitch";

export default {
    components: {
        Movable,
        EyeIcon,
        HeartIcon
    },
    mixins: [TwitchMixin],
    methods: {
        onDrag (x, y) {
            this.settings.TwitchInfo.x = x;
            this.settings.TwitchInfo.y = y;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        }
    }
};
</script>

<style lang="scss">
#twitch-info {
    display: flex;
    justify-content: space-evenly;
    align-items: center;

    background: #00000080;

    &-viewers {
        span {
            color: red;
        }
        
        .feather {
            stroke: red;
        }
    }

    span {
        font-family: "Roboto Condensed", sans-serif;
        font-weight: 300;
    }

    svg, span {
        vertical-align: middle;
        font-weight: 300;

        font-size: 9pt;
    }

    .feather {
        width: 12px;
    }
}
</style>