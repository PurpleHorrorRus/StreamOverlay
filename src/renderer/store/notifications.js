export default {
    namespaced: true,

    state: () => ({
        notifications: [],
        lowbitrate: false,
        lowfps: false,
        chatdisconnect: false,
        update: {
            show: false,
            release: {}
        }
    }),

    actions: {
        ADD: ({ state }, notification) => {
            setTimeout(() => {
                const index = state.notifications.findIndex(n => {
                    return n.id === notification.id;
                });

                state.notifications.splice(index, 1);
            }, notification.handle ? notification.handle * 1000 : 4 * 1000);

            state.notifications.push(notification);
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
            state.lowfps = sequence;
            return true;
        },

        TURN_LOWBITRATE: ({ state }, sequence) => {
            state.lowbitrate = sequence;
            return true;
        },

        TURN_UPDATE: ({ state }, release) => {
            console.log(release);
            state.update.release = release;
            state.update.show = true;
            return true;
        }
    }
};