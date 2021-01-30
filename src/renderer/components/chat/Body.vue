<template>
    <div class="items">
        <div v-for="(item, index) of items" :key="index" class="item">
            <span v-if="item.type === 'text'" :style="textStyle" class="text stroke" v-text="item.content" />
            <img v-else-if="item.type === 'emoji'" class="emoticon" :style="emoticionStyle" :src="item.content">
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    props: {
        items: {
            type: Array,
            required: true
        }
    },
    computed: {
        ...mapGetters({
            settings: "settings/getSettings"
        }),
        textStyle () {
            return {
                fontSize: `${this.settings.chat.font}pt`
            };
        },
        emoticionStyle () {
            return { 
                width: `${this.settings.chat.font}pt`
            }; 
        },
    }
};
</script>

<style lang="scss">
.message {
    vertical-align: middle;

    .items {
        display: inline;
        align-items: center;
        vertical-align: middle;

        .item {
            display: inline;
            vertical-align: middle;

            &:not(:first-child) {
                margin-left: 5px;
            }

            .text {
                font-family: "Roboto Condensed", sans-serif;
                font-weight: 400;
            }

            .emoticon {
                vertical-align: middle;
            }

            .text, .emoticon {
                display: inline;
            }
        }
    }
}
</style>