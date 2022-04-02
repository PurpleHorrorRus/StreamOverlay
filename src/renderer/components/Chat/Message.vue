<template>
    <div class="message" :style="messageStyle">
        <span
            v-if="$parent.input"
            class="message-time"
            :style="textStyle"
            v-text="`[${message.time}]`"
        />
        <img
            v-if="showAvatar"
            :style="pictureStyle"
            :src="message.avatar"
            class="message-avatar"
        />

        <Badges v-if="showBadges" :badges="message.badges" />

        <span
            v-if="!message.system"
            v-tooltip="'Быстрый бан'"
            :style="nicknameStyle"
            class="message-nickname stroke"
            @click="ban"
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
import Badges from "~/components/Chat/Badges";
import Body from "~/components/Chat/Body";

import CoreMixin from "~/mixins/core";
import MessageMixin from "~/components/Chat/Mixin";

export default {
    components: {
        Badges,
        Body
    },

    mixins: [CoreMixin, MessageMixin],

    props: {
        message: {
            type: Object,
            required: true
        }
    },

    computed: {
        showAvatar() {
            return (
                this.settings.chat.avatar &&
                !this.message.system &&
                this.message.avatar?.length > 0
            );
        },

        showBadges() {
            return (
                this.settings.chat.badges &&
                !this.message.system &&
                this.message.badges?.length > 0
            );
        },

        messageStyle() {
            return {
                background: `rgba(20, 20, 19, ${this.settings.chat.opacity / 100})`,
                lineHeight: `${this.settings.chat.font + 2}pt`
            };
        }
    },

    methods: {
        ban() {
            this.serviceDispatch("BAN", {
                nickname: this.message.nickname,
                timeout: 0,
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
    &-avatar,
    &-nickname,
    &-banned {
        display: inline;
    }

    &-avatar {
        border-radius: 100px;

        vertical-align: middle;
    }

    &-nickname {
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