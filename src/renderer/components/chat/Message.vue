<template>
    <div class="message" :style="messageStyle">
        <img 
            :style="pictureStyle" 
            :src="message.avatar"
            class="avatar"
        >
        <Badges :badges="message.badges" />
        <span 
            :style="textStyle" 
            class="nickname" 
            @click="ban(message.nickname)" 
            v-text="message.nickname" 
        />
        <div 
            v-for="(item, index) of formatMessage"
            :key="index"
            class="item"
        >
            <span v-if="item.type === 'text'" class="body" v-text="item.content" />
            <img v-else-if="item.type === 'emoji'" class="emoticon" :style="emoticionStyle" :src="item.content">
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import Badges from "~/components/chat/Badges";

export default {
    components: { 
        Badges 
    },
    props: {
        message: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters({
            settings: "settings/getSettings",
            betterTTV: "twitch/getBetterTTV",

            FrankerFaceZ: "twitch/getFrankerFaceZ"
        }),
        formatMessage () {
            const { text, emotes } = this.message;

            let ready = [];
            let emojiWords = [];

            const addEmoji = url => {
                ready = [...ready, {
                    type: "emoji",
                    content: url
                }];
            };
            
            if (emotes) {
                const positions = Object.values(emotes)
                    .map(([position]) => 
                        position.split("-")
                            .map(Number));

                const ids = Object.keys(emotes);

                emojiWords = positions.map(([start, end], index) => {
                    return {
                        id: ids[index],
                        word: text.substring(start, end + 1)
                    };
                });
            }

            const betterTTVMap = this.betterTTV.map(e => e.code),
                FrankerFaceZMap = this.FrankerFaceZ.map(e => e.code);

            let txt = "";

            const splitted = text.split(" ");
            for (const wordIndex in splitted) {
                const word = splitted[wordIndex];

                const index = emotes 
                    ? word.indexOf(emojiWords.map(({ word }) => word))
                    : -1;

                const betterTTVIndex = betterTTVMap.indexOf(word);
                const FrankerFaceZIndex = FrankerFaceZMap.indexOf(word);
                
                if (~index) {
                    addEmoji(`http://static-cdn.jtvnw.net/emoticons/v1/${emojiWords[index].id}/3.0`);
                    continue;
                } else if (~betterTTVIndex) {
                    addEmoji(this.betterTTV[betterTTVIndex].url);
                    continue;
                } else if (~FrankerFaceZIndex) {
                    addEmoji(this.FrankerFaceZ[FrankerFaceZIndex].url);
                    continue;
                } else {
                    txt += word;
                }

                ready = [...ready, {
                    type: "text",
                    content: txt
                }];

                txt = "";
            }
            
            return ready;
        },
        messageStyle () {
            return { 
                background: `rgba(0, 0, 0, ${this.settings.chat.opacity / 100})`
            };
        },
        pictureStyle () {
            return { 
                width: `${this.settings.chat.font}px`
            };
        },
        emoticionStyle () {
            return { 
                width: `${this.settings.chat.font + 10}px`
            }; 
        },
        textStyle () {
            return { 
                fontSize: `${this.settings.chat.font}pt` 
            };
        }
    },
    created () { 
        if (this.settings.chat.timeout !== 0) {
            setTimeout(() => this.removeMessage(this.message), 
                this.settings.chat.timeout * 1000); 
        }
    },
    methods: {
        ...mapActions({
            ban: "twitch/ban",
            removeMessage: "twitch/removeMessage"
        })
    }
};
</script>

<style lang="scss">
.message {
    display: block;
    width: 100%;
    padding: 5px;

    .avatar, .nickname, .body, .badges, .emoticon {
        display: inline;
    }

    .avatar {
        border-radius: 100px;
    }

    .nickname {
        font-weight: 600;
        pointer-events: all;

        &:hover {
            cursor: pointer;
            text-decoration: underline;
        }
    }

    .item {
        display: inline;
        margin-left: 2px;
    }

    .nickname, .body {
        text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
    }
    
    .body, .emoticon {
        vertical-align: middle;
    }
}
</style>