<template>
    <div class="items">
        <div v-for="(item, index) of items" :key="index" class="item">
            <span v-if="item.type === 'text'" :style="textStyle" class="text stroke" v-text="item.content" />
            <img v-else-if="item.type === 'emoji'" class="emoticon" :style="emoticionStyle" :src="item.content">
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    props: {
        items: {
            type: Array,
            required: true
        }
    },
    computed: {
        ...mapState({
            settings: state => state.settings.settings
        }),
        textStyle() {
            return {
                fontSize: `${this.settings.chat.font}pt`
            };
        },
        emoticionStyle() {
            return {
                height: `${this.settings.chat.font - 1}pt`
            };
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
            }

            .emoticon {
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