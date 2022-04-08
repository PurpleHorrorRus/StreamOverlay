<template>
    <div class="message-body">
        <div v-for="(item, index) of items" :key="index" class="item">
            <span
                v-if="item.type === 'text'"
                :style="textStyle"
                class="text stroke"
                v-text="item.content"
            />

            <span
                v-else-if="item.type === 'link'"
                v-tooltip="'Нажмите, чтобы перейти по ссылке'"
                :style="textStyle"
                class="text link stroke"
                @click="openLink(item.content.link)"
                v-text="item.content.domain"
            />

            <img
                v-else-if="item.type === 'emote'"
                class="emoticon"
                :style="emoticionStyle"
                :src="item.content"
            />
        </div>
    </div>
</template>

<script>
import { shell } from "electron";

import MessageMixin from "~/components/Chat/Mixin";

export default {
    mixins: [MessageMixin],

    props: {
        items: {
            type: Array,
            required: true
        }
    },

    computed: {
        emoticionStyle() {
            return {
                height: `${this.settings.chat.font + 16}px`
            };
        }
    },

    methods: {
        openLink(link) {
            shell.openExternal(link);
        }
    }
};
</script>

<style lang="scss">
.message-body {
    position: relative;
    top: 2px;

    display: inline;

    .item {
        display: inline;

        &:not(:first-child) {
            margin-left: 5px;
        }

        .text {
            font-family: "Roboto Condensed";
            font-weight: bold;

            &.link {
                color: #0077ff;
                cursor: pointer;
            }
        }

        .emoticon {
            position: relative;
            bottom: 1px;

            vertical-align: middle;
        }

        .text,
        .emoticon {
            display: inline;
        }
    }
}
</style>