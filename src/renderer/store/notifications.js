export default {
    namespaced: true,
    state: () => ({
        notifications: [],
        lowbitrate: false,
        lowfps: false,
        chatdisconnect: false
    }),
    actions: {
        ADD: ({ state }, notification) => {
            setTimeout(
                () => state.notifications.splice(state.notifications.indexOf(notification), 1),
                notification.handle ? notification.handle * 1000 : 4 * 1000
            );

            state.notifications = [...state.notifications, notification];
        },
        TURN: ({ state }, data) => {
            if (state[data.name] === data.show) {
                return;
            }

            state[data.name] = data.show;
        }
    }
};
