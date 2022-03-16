<template>
    <div class="items">
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
                @click="openLink(item)"
                v-text="linkText(item)"
            />

            <img
                v-else-if="item.type === 'emoji'"
                class="emoticon"
                :style="emoticionStyle"
                :src="item.content"
            >
        </div>
    </div>
</template>

<script>
import { shell } from "electron";

import MessageMixin from "~/components/Chat/Mixin";

// eslint-disable-next-line max-len
const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/;

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
                height: `${this.settings.chat.font + 2}pt`
            };
        }
    },
    methods: {
        linkText(item) {
            return item.content.replace(linkRegex, `[${item.content.match(domainRegex)[1]}]`);
        },
        openLink(item) {
            shell.openExternal(item.content);
        }
    }
};
</script>

<style lang="scss">
.message {
    .items {
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
}
</style>