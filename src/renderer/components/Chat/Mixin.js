import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    computed: {
        nicknameStyle() {
            return {
                color: this.message.color,
                ...this.textStyle
            };
        },

        textStyle() {
            return {
                fontSize: `${this.settings.chat.font}pt`
            };
        },

        pictureStyle() {
            return {
                width: `${this.settings.chat.font + 14}px`
            };
        }
    }
};