<template>
    <div class="message-body">
        <Component
            :is="renderComponent(item)" 
            v-for="(item, index) of items" 
            :key="index"
            class="item"
            :data="item.content"
        />
    </div>
</template>

<script>
const TextItem = () => import("~/components/Chat/Body/Text");
const LinkItem = () => import("~/components/Chat/Body/Link");
const EmoteItem = () => import("~/components/Chat/Body/Emote");

import MessageMixin from "~/components/Chat/Mixin";

export default {
    mixins: [MessageMixin],

    props: {
        items: {
            type: Array,
            required: true
        }
    },

    methods: {
        renderComponent(item) {
            switch(item.type) {
                case "text": return TextItem;
                case "link": return LinkItem;
                case "emote": return EmoteItem;
            }
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

        &.text {
            font-family: "Roboto Condensed";
            font-weight: bold;
        }
    }
}
</style>