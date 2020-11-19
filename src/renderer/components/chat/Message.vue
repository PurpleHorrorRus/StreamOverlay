<template>
    <div class="message" :style="messageStyle">
        <img 
            :style="pictureStyle" 
            :src="message.avatar"
            class="avatar"
        >
        <Badges :badges="message.badges" />
        <span 
            :style="nicknameStyle" 
            class="nickname stroke" 
            @click="ban(message.nickname)" 
            v-text="message.nickname" 
        />
        <Body :items="message.formatted" />
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import Badges from "~/components/chat/Badges";
import Body from "~/components/chat/Body";

export default {
    components: { 
        Badges,
        Body
    },
    props: {
        message: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters({
            settings: "settings/getSettings",
            betterTTV: "twitch/getBetterTTV",

            FrankerFaceZ: "twitch/getFrankerFaceZ"
        }),
        messageStyle () {
            return { 
                background: `rgba(0, 0, 0, ${this.settings.chat.opacity / 100})`
            };
        },
        pictureStyle () {
            return { 
                width: `${this.settings.chat.font}px`
            };
        },
        nicknameStyle () {
            return {
                color: this.message.color,
                ...this.textStyle
            };
        },
        textStyle () {
            return { 
                fontSize: `${this.settings.chat.font}pt` 
            };
        }
    },
    created () { 
        if (this.settings.chat.timeout !== 0) {
            setTimeout(() => this.removeMessage(this.message), 
                this.settings.chat.timeout * 1000); 
        }
    },
    methods: {
        ...mapActions({
            ban: "twitch/ban",
            removeMessage: "twitch/removeMessage"
        })
    }
};
</script>

<style lang="scss">
.message {
    display: block;
    width: 100%;
    padding: 5px;

    .avatar, .nickname {
        display: inline;
    }

    .avatar {
        border-radius: 100px;
    }

    .nickname {
        font-weight: 600;
        pointer-events: all;

        &:hover {
            cursor: pointer;
            text-decoration: underline;
        }
    }
}
</style>