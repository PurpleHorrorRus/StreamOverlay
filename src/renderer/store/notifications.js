export default {
    namespaced: true,
    state: () => ({
        notifications: [],
        lowbitrate: false,
        lowfps: false,
        chatdisconnect: false,
        update: false
    }),
    mutations: {
        addNotification (state, notification) {
            const handle = notification.handle ? notification.handle * 1000 : 4 * 1000;
            setTimeout(() => {
                const index = state.notifications.indexOf(notification);
                state.notifications.splice(index, 1);
            }, handle);

            state.notifications = [...state.notifications, notification];
        },
        turnLowBitrate (state, show) {
            if (state.lowbitrate === show) {
                return;
            }
            
            state.lowbitrate = show; 
        },
        turnLowFPS (state, show) {
            if (state.lowfps === show) {
                return;
            }
             
            state.lowfps = show;
        },
        turnChatDisconnect (state, show) {
            if(state.chatdisconnect === show) {
                return;
            }

            state.chatdisconnect = show;
        },
        turnUpdate (state, show) {
            if (state.update === show) {
                return;
            }

            state.update = show;
        }
    },
    actions: {
        addNotification: ({ commit }, notification) => commit("addNotification", notification),
        turnLowBitrate: ({ commit }, show) => commit("turnLowBitrate", show),
        turnLowFPS: ({ commit }, show) => commit("turnLowFPS", show),
        turnChatDisconnect: ({ commit }, show) => commit("turnChatDisconnect", show),
        turnUpdate: ({ commit }, show) => commit("turnUpdate", show)
    },
    getters: {}
};