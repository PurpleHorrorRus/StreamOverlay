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

        <Badges
            v-if="showBadges"
            :badges="message.badges"
        />

        <span
            v-if="message.nickname"
            v-tooltip="nicknameTooltip"
            :style="nicknameStyle"
            class="message-nickname stroke"
            :class="{ clickable: canBan }"
            @click="ban"
            v-text="message.nickname"
        />

        <MessageReward v-if="message.reward" />

        <MessageBody
            v-if="!message.banned"
            :items="message.formatted"
        />

        <span
            v-else
            class="message-banned stroke"
            :style="textStyle"
            v-text="'Сообщение удалено'"
        />
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";
import MessageMixin from "~/components/Chat/Mixin";

export default {
    components: {
        Badges: () => import("./Badges.vue"),
        MessageReward: () => import("./Reward.vue"),
        MessageBody: () => import("./Body.vue")
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
                this.config.settings.chat.avatar &&
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
                this.config.settings.chat.badges &&
                !this.message.system &&
                this.message.badges?.length > 0
            );
        },

        messageStyle() {
            return {
                background: `rgba(20, 20, 19, ${this.config.settings.chat.opacity / 100})`,
                lineHeight: `${this.config.settings.chat.font + 2}pt`
            };
        },

        avatarStyle() {
            return {
                width: `${this.config.settings.chat.font + 14}px`
            };
        },

        messageClass() {
            return {
                system: this.message.system,
                highlight: this.message.type === "highlighted-message"
            };
        }
    },

    methods: {
        ban() {
            if (!this.canBan) {
                return false;
            }

            this.serviceDispatch("BAN", {
                user_id: this.message.user_id,
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

    &.highlight {
        border: 2px solid var(--secondary);
        border-radius: 5px;
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

        font-weight: 700;

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
    }
}
</style>