import Discord from "discord-rpc";

const clientId = "977791659007959060";

let client = null;
let interval = null;

let service = "";
let serivceName = "";

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

            const updated = await client.setActivity({
                details: `${serivceName}: ${rootState.service.stream.title}`,
                state: rootState.service.stream.game,
                largeImageKey: service,
                largeImageText: rootState.service.user.link,
                instance: false,

                buttons: [{
                    label: "Смотреть",
                    url: `https://${rootState.service.user.link}`
                }]
            }).catch(() => {
                client = null;
                return false;
            });
            
            return updated;
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