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
import { mapActions, mapState } from "vuex";

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
        ...mapState({
            settings: state => state.settings.settings
        }),
        messageStyle () {
            return { 
                background: `rgba(0, 0, 0, ${this.settings.chat.opacity / 100})`
            };
        },
        pictureStyle () {
            return { 
                width: `${this.settings.chat.font - 1}px`
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
            setTimeout(() => this.removeMessage(this.message.id), 
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
    display: inline-block;

    width: 100%;
    padding: 5px;

    .avatar, .nickname {
        display: inline;
    }

    .avatar {
        vertical-align: middle;
        border-radius: 100px;
    }

    .nickname {
        pointer-events: all;

        font-family: "Roboto Condensed", sans-serif;
        font-weight: 700;

        &:hover {
            cursor: pointer;
            text-decoration: underline;
        }
    }
}
</style>