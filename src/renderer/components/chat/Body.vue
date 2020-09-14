<template>
    <div class="items">
        <div v-for="(item, index) of items" :key="index" class="item">
            <span v-if="item.type === 'text'" class="text stroke" v-text="item.content" />
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
        emoticionStyle () {
            return { 
                width: `${this.settings.chat.font + 10}px`
            }; 
        },
    }
};
</script>

<style lang="scss">
.message {
    .items {
        display: inline;
        
        .item {
            display: inline;
            margin-left: 2px;

            .text, .emoticon {
                display: inline;
                vertical-align: middle;
            }
        }
    }
}
</style>