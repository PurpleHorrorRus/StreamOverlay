import { mapState } from "vuex";

export default {
    computed: {
        ...mapState({
            settings: state => state.settings.settings
        }),

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
                width: `${this.settings.chat.font}pt`
            };
        }
    }
};