<template>
    <div class="message" :style="messageStyle">
        <span
            v-if="$parent.input"
            class="message-time"
            :style="textStyle"
            v-text="`[${message.time}]`"
        />
        <img
            v-if="
                settings.chat.avatar &&
                    message.avatar &&
                    message.avatar.length > 0
            "
            :style="pictureStyle"
            :src="message.avatar"
            class="avatar"
        />
        <Badges
            v-if="
                settings.chat.badges &&
                    message.badges &&
                    message.badges.length > 0
            "
            :badges="message.badges"
        />
        <span
            v-tooltip="'Забанить'"
            :style="nicknameStyle"
            class="nickname stroke"
            @click="banUser"
            v-text="message.nickname"
        />
        <Body v-if="!message.banned" :items="message.formatted" />
        <span
            v-else
            class="message-banned stroke"
            :style="textStyle"
            v-text="'Сообщение удалено'"
        />
    </div>
</template>

<script>
import { mapActions } from "vuex";

import Badges from "~/components/chat/Badges";
import Body from "~/components/chat/Body";

import MessageMixin from "~/components/chat/mixin";

export default {
    components: {
        Badges,
        Body
    },
    mixins: [MessageMixin],
    props: {
        message: {
            type: Object,
            required: true
        }
    },
    computed: {
        messageStyle() {
            return {
                background: `rgba(20, 20, 19, ${this.settings.chat.opacity / 100})`,
                lineHeight: `${this.settings.chat.font + 2}pt`
            };
        }
    },
    methods: {
        ...mapActions({
            ban: "twitch/BAN"
        }),
        banUser() {
            this.ban({
                nickname: this.message.nickname,
                reason: "бан стримером"
            });
        }
    }
};
</script>

<style lang="scss">
.message {
    display: inline-block;

    width: 100%;

    padding: 5px 10px 5px 10px;

    &-time,
    .avatar,
    .nickname,
    &-banned {
        display: inline;
    }

    .avatar {
        border-radius: 100px;

        vertical-align: middle;
    }

    .nickname {
        position: relative;
        top: 2px;

        pointer-events: all;

        font-family: Roboto;
        font-weight: bold;

        &:hover {
            cursor: pointer;
            text-decoration: underline;
        }
    }

    &-time,
    &-banned {
        position: relative;
        top: 2px;

        color: $small-text;
        font-family: "Roboto Condensed";
    }
}
</style>