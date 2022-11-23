export default {
    namespaced: true,

    state: () => ({
        notifications: {
            regular: [],
            presense: []
        },

        lowfps: false,
        lowbitrate: false,
        chatdisconnect: false,

        update: {
            show: false,
            release: {}
        }
    }),

    actions: {
        ADD: ({ state }, notification) => {
            const collection = !notification.presense
                ? state.notifications.regular
                : state.notifications.presense;

            const timeout = notification.handle
                ? notification.handle * 1000
                : 4 * 1000;

            setTimeout(() => {
                const index = collection.findIndex(n => {
                    return n.id === notification.id;
                });

                collection.splice(index, 1);
            }, timeout);

            collection.push(notification);
            return true;
        },

        TURN: ({ state }, data) => {
            if (state[data.name] === data.show) {
                return false;
            }

            state[data.name] = data.show;
            return true;
        },

        TURN_LOWFPS: ({ state }, sequence) => {
            if (state.lowfps === sequence) {
                return false;
            }

            state.lowfps = sequence;
            return true;
        },

        TURN_LOWBITRATE: ({ state }, sequence) => {
            if (state.lowbitrate === sequence) {
                return false;
            }

            state.lowbitrate = sequence;
            return true;
        },
        
        TURN_UPDATE: ({ state }, release) => {
            state.update.release = release;
            state.update.show = true;
            return true;
        }
    }
};