export default {
    namespaced: true,
    state: () => ({
        notifications: [],
        lowbitrate: false,
        lowfps: false,
        chatdisconnect: false
    }),
    mutations: {
        addNotification(state, notification) {
            const handle = notification.handle ? notification.handle * 1000 : 4 * 1000;
            setTimeout(() => {
                const index = state.notifications.indexOf(notification);
                state.notifications.splice(index, 1);
            }, handle);
            return state.notifications = [...state.notifications, notification];
        },
        turnLowBitrate(state, show) {
            if(state.lowbitrate === show) return;
            return state.lowbitrate = show; 
        },
        turnLowFPS(state, show) {
            if(state.lowfps === show) return;
            return state.lowfps = show;
        },
        turnChatDisconnect(state, show) {
            if(state.chatdisconnect === show) return;
            return state.chatdisconnect = show;
        }
    },
    actions: {
        addNotification({ commit }, notification) { 
            commit("addNotification", notification); 
        },
        turnLowBitrate({ commit }, show) { 
            commit("turnLowBitrate", show);
        },
        turnLowFPS({ commit }, show) { 
            commit("turnLowFPS", show); 
        },
        turnChatDisconnect({ commit }, show) { 
            commit("turnChatDisconnect", show); 
        }
    },
    getters: {
        getNotifications(state) { 
            return state.notifications; 
        },
        getLowBitrate(state) { 
            return state.lowbitrate; 
        },
        getLowFPS(state) { 
            return state.lowfps; 
        },
        getChatDisconnect(state) { 
            return state.chatdisconnect; 
        }
    }
};