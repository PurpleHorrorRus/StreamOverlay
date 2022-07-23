<template>
    <div 
        class="message" 
        :style="messageStyle" 
        :class="messageClass"
    >
        <span
            v-if="$parent.input"
            class="message-time"
            :style="textStyle"
            v-text="`[${message.time}]`"
        />
        <img
            v-if="showAvatar"
            v-lazy-load
            :style="avatarStyle"
            :src="message.avatar"
            class="message-avatar"
        />

        <Badges v-if="showBadges" :badges="message.badges" />

        <span
            v-if="message.nickname"
            v-tooltip="nicknameTooltip"
            :style="nicknameStyle"
            class="message-nickname stroke"
            :class="{ clickable: canBan }"
            @click="ban"
            v-text="message.nickname"
        />

        <MessageBody v-if="!message.banned" :items="message.formatted" />
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
import MessageBody from "~/components/Chat/Body";

import CoreMixin from "~/mixins/core";
import MessageMixin from "~/components/Chat/Mixin";

export default {
    components: {
        Badges,
        MessageBody
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
                this.message.avatar?.length > 0
            );
        },

        canBan() {
            return this.message.nickname !== this.user.nickname;
        },

        nicknameTooltip() {
            return this.canBan
                ? "Быстрый бан"
                : null;
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
        },

        avatarStyle() {
            return {
                width: `${this.settings.chat.font + 14}px`
            };
        },
        
        messageClass() {
            return { 
                system: this.message.system 
            };
        }
    },

    methods: {
        ban() {
            if (!this.canBan) {
                return false;
            }

            this.serviceDispatch("BAN", {
                nickname: this.message.nickname,
                timeout: 0,
                reason: "бан стримером"
            });

            return true;
        }
    }
};
</script>

<style lang="scss">
.message {
    display: inline-block;

    width: max-content;
    max-width: 100%;

    padding: 5px 10px;

    &.system {
        span {
            font-size: 11px;
        }

        .message-body span {
            color: #b3b3b3;
        }
    }

    &-time,
    &-avatar,
    &-nickname,
    &-banned {
        display: inline;
    }

    &-avatar {
        border-radius: 100%;

        vertical-align: middle;
    }

    &-nickname {
        position: relative;
        top: 2px;

        pointer-events: all;

        font-family: Roboto;
        font-weight: bold;

        &.clickable:hover {
            cursor: pointer;
            text-decoration: underline;
        }
    }

    &-time,
    &-banned {
        position: relative;
        top: 2px;

        color: var(--small-text);
        font-family: "Roboto Condensed";
    }
}
</style>