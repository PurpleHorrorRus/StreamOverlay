export default {
    namespaced: true,
    
    actions: {
        MESSAGE: async ({ dispatch }, message) => {
            if (typeof message.content !== "object") {
                message.content = String(message.content);
            }

            message.formatted = await dispatch("trovo/FORMAT_MESSAGE", message.content, { root: true });
            message = await dispatch("service/ADD_MESSAGE", message, { root: true });

            if (message.system || message.past) {
                return message;
            }

            return message;
        },

        PAST_MESSAGES: async ({ dispatch, rootState }, messages) => {
            const events = rootState.service.chat.messages.ChatMessageEvents;

            for (let message of messages) {
                message = await dispatch("trovo/FORMAT", message, { root: true });
                message.past = true;

                const event = events[message.type] || "message";
                message = await dispatch(event.toUpperCase(), message);
            }

            return messages;
        },

        WELCOME: ({ dispatch }, user) => {
            user.content = "вошёл в чат";
            dispatch("service/ADD_SYSTEM_MESSAGE", user, { root: true });
            return user;
        },

        FOLLOW: ({ dispatch }, follow) => {
            follow.content = "зафолловил канал";
            dispatch("service/ADD_SYSTEM_MESSAGE", follow, { root: true });
            return follow;
        },

        SUBSCRIPTION: ({ dispatch }, subscriber) => {
            subscriber.content = "оформил платную подписку";
            dispatch("service/ADD_SYSTEM_MESSAGE", subscriber, { root: true });
            return subscriber;
        },

        GIFT_SUB: async ({ dispatch }, gift) => {
            const target = gift.content.split(",")[1];
            gift.content = `дарит платную подиску ${target}`;
            gift = await dispatch("trovo/FORMAT", gift, { root: true });

            dispatch("service/ADD_SYSTEM_MESSAGE", gift, { root: true });
            return gift;
        },

        GIFT_SUB_RANDOM: async ({ dispatch }, gift) => {
            gift.content = `дарит ${gift.content} платных подписки случайным зрителям`;
            gift = await dispatch("trovo/FORMAT", gift, { root: true });

            dispatch("service/ADD_SYSTEM_MESSAGE", gift, { root: true });
            return gift;
        },

        SPELLS: ({ dispatch }, message) => {
            const spell = message.content.gift;
            const count = message.content.num;
            const cost = message.content.gift_value;
            const value = message.content.value_type;
            message.content = `использует ${count}x${spell} за ${cost} ${value}`;
            
            dispatch("service/ADD_SYSTEM_MESSAGE", message, { root: true });
            return message;
        },

        RAID: async ({ dispatch }, raider) => {
            raider.content = raider.content.replace(raider.nick_name, "");
            raider = await dispatch("trovo/FORMAT", raider, { root: true });

            dispatch("service/ADD_SYSTEM_MESSAGE", raider, { root: true });
            return raider;
        },

        SUPER_CAP: ({ dispatch }, message) => {
            dispatch("MESSAGE", message);
            return message;
        },

        ACTIVITY: async ({ dispatch, rootState }, message) => {
            message.avatar = message.avatar || rootState.service.user.avatar;
            message.nick_name = message.nick_name || rootState.service.user.nickname;
            message.content = message.content.replace("{title}", "").trim();
            message = await dispatch("trovo/FORMAT", message, { root: true });

            dispatch("service/ADD_SYSTEM_MESSAGE", message, { root: true });
            return message;
        }
    }
};