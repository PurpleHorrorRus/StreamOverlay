import Discord from "discord-rpc";

const clientId = "977791659007959060";

let client = null;
let interval = null;

let service = "";
let serivceName = "";

let latestActivity = "";

export default {
    namespaced: true,

    actions: {
        AUTH: async ({ dispatch, rootState }) => {
            if (!interval) {
                service = rootState.settings.settings.service;
                serivceName = service.charAt(0).toUpperCase() + service.slice(1);

                interval = setInterval(() => {
                    return dispatch(client ? "SET_ACTIVITY" : "AUTH");
                }, 20 * 1000);
            }

            client = new Discord.Client({ transport: "ipc" });
            await client.login({ clientId });
            return await dispatch("SET_ACTIVITY");
        },

        SET_ACTIVITY: async ({ dispatch, rootState }) => {
            if (!rootState.settings.settings.discord) {
                return false;
            }

            if (!client) {
                return await dispatch("AUTH");
            }

            const activity = rootState.service.stream.game;
            if (activity !== latestActivity) {
                const [category] = await dispatch("SERVICE_DISPATCH", {
                    action: "SEARCH_GAME",
                    data: rootState.service.stream.game
                }, { root: true });
    
                const updated = await client.setActivity({
                    details: rootState.service.stream.title,
                    state: rootState.service.stream.game,
                    largeImageKey: category.icon_url,
                    largeImageText: rootState.service.user.link,
                    smallImageKey: service,
                    smallImageText: serivceName,
                    instance: false,
    
                    buttons: [{
                        label: "Смотреть",
                        url: `https://${rootState.service.user.link}`
                    }]
                }).catch(() => {
                    client = null;
                    return false;
                });

                latestActivity = updated ? activity : "";
                return updated;
            }

            return false;
        },

        CLEAR_ACTIVITY: () => {
            client.clearActivity();

            clearInterval(interval);
            interval = null;
            client = null;

            return true;
        }
    }
};