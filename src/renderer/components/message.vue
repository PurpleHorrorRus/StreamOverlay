<template>
    <div class="message" :style="messageStyle">
        <img 
            :style="pictureStyle" 
            :src="message.avatar"
            class="avatar"
        >
        <badges :badges="message.badges" />
        <span 
            :style="nicknameStyle" 
            class="nickname" 
            @click="ban(message.nickname)" 
            v-text="message.nickname" 
        />
        <span :style="textStyle" class="body" v-html="formatMessage" />
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import badges from "~/components/badges";

export default {
    components: { badges },
    props: {
        message: {
            required: true,
            type: Object
        }
    },
    computed: {
        ...mapGetters({
            betterTTV: "twitch/getBetterTTV",
            FrankerFaceZ: "twitch/getFrankerFaceZ",
            settings: "settings/getSettings"
        }),
        formatMessage () {
            const { text, emotes } = this.message;
            let splitText = text.split("");

            for (const i in emotes) {
                const e = emotes[i];
                for (const j in e) {
                    let mote = e[j];
                    if (typeof mote == "string") {
                        mote = mote.split("-");
                        mote = [parseInt(mote[0]), parseInt(mote[1])];
                        const length =  mote[1] - mote[0],
                            empty = Array.apply(null, new Array(length + 1)).map(() => { return ""; });

                        splitText = splitText
                            .slice(0, mote[0])
                            .concat(empty)
                            .concat(splitText
                                .slice(mote[1] + 1, splitText.length));

                        splitText
                            .splice(
                                mote[0], 
                                1,
                                `<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/${i}/3.0">`
                            );
                    }
                }
            }

            const splitted = splitText.join("").split(" ");
            
            const betterTTVMap = this.betterTTV.map(e => e.code),
                FrankerFaceZMap = this.FrankerFaceZ.map(e => e.code);

            for (const wordIndex in splitted) {
                const word = splitted[wordIndex];
                const betterTTVIndex = betterTTVMap.indexOf(word);
                if (~betterTTVIndex) {
                    const { url } = this.betterTTV[betterTTVIndex];
                    splitted[wordIndex] = `<img class="emoticon" src="${url}">`;
                }

                const FrankerFaceZIndex = FrankerFaceZMap.indexOf(word);
                if (~FrankerFaceZIndex) {
                    const { url } = this.FrankerFaceZ[FrankerFaceZIndex];
                    splitted[wordIndex] = `<img class="emoticon" src="${url}">`;
                }
            }

            return splitted.join(" ");
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
        nicknameStyle () {
            return { 
                color: this.message.color, 
                fontSize: `${this.settings.chat.font}pt`
            };
        },
        textStyle () {
            return { 
                fontSize: `${this.settings.chat.font}pt` 
            };
        }
    },
    created () { 
        setTimeout(() => this.removeMessage(this.message), 
            this.settings.chat.timeout * 1000); 
    },
    methods: {
        ...mapActions({
            ban: "twitch/ban",
            removeMessage: "twitch/removeMessage"
        }),
        htmlEntities(html) {
            const it = () => {
                return html.map(n => {
                    if (n.length === 1) {
                        // eslint-disable-next-line no-useless-escape
                        return n.replace(/[\u00A0-\u9999<>\&]/gim, i => {
                            return `&#${i.charCodeAt(0)};`;
                        });
                    }
                    return n;
                });
            };
 
            const isArray = Array.isArray(html);
            if (!isArray) {
                html = html.split("");
            }

            html = it(html);

            if (!isArray) {
                html = html.join("");
            }

            return html;
        }
    }
};
</script>

<style>
.message {
    padding: 2%;
    width: 100%;
    height: max-content;
    margin-bottom: 0px;
    max-width: 100%;
}

.message  .avatar { border-radius: 100px; }
.message .nickname {
    display: inline-block;
    font-weight: 600;
    margin-right: 5px;
    pointer-events: all;
}

.message .body {
    display: inline;
}

.message .nickname, .message .body {
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

.message .nickname:hover {
	cursor: pointer;
	text-decoration: underline;
}

.message .message-span {
    word-break: break-word;
    display: inline-table;
}

.message .emoticon {
    width: 18px;
	vertical-align: middle;
}

</style>