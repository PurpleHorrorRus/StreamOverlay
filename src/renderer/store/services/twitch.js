import Helix from "simple-helix-api";
import lodash from "lodash";
import Promise from "bluebird";

import formatter from "~/store/services/formatter";

import eventsub from "./twitch/eventsub";
import events from "./twitch/events";
import rewards from "./twitch/rewards";
import emotes from "./twitch/emotes";
import badges from "./twitch/badges";

import misc from "~/plugins/misc";

const profilesCacheMax = 50;
let profilesCacheSize = 0;
let profilesCache = {};

export default {
	namespaced: true,

	state: () => ({
		tags: null,
		version: 2
	}),

	mutations: {
		LOGIN_REDIRECT(_state, query = {}) {
			query = new URLSearchParams(query).toString();

			return this.$router.replace(`/services/twitch?${query}`)
				.catch(() => (false));
		}
	},

	actions: {
		AUTH: async ({ dispatch, state, rootState }) => {
			if (rootState.service.client) {
				return false;
			}

			// eslint-disable-next-line no-undef
			if (!process.env.twitch_client_id) {
				console.warn("[Twitch] There is no secrets for Twitch client");
				return false;
			}

			const config = rootState.config.twitch;
			if (!config.username || !config.access_token) {
				return await dispatch("LOGIN_ERROR");
			}

			if (config.version !== state.version) {
				return await dispatch("LOGIN_ERROR", {
					outdated: 1
				});
			}

			const response = await dispatch("INIT", config).catch(async () => {
				return await dispatch("LOGIN_ERROR");
			});

			return Boolean(response);
		},

		INIT: async ({ dispatch }, credits) => {
			const client = await dispatch("service/SET_CLIENT", new Helix({
				// eslint-disable-next-line no-undef
				client_id: process.env.twitch_client_id,
				access_token: credits.access_token,
				language: "ru"
			}), { root: true });

			let user = (await client.users.getByLogin(credits.username)).data[0];
			dispatch("CACHE_PROFILE", user);

			user = await dispatch("service/SET_USER", {
				...await dispatch("FORMAT_PROFILE", user),
				...user,
				id: Number(user.id),
				link: `twitch.tv/${user.display_name}`
			}, { root: true });

			const channel = (await client.channel.get(user.id)).data[0];
			await dispatch("service/SET_STREAM", {
				title: channel.title,
				game: channel.game_name
			}, { root: true });

			dispatch("CONNECT", credits);
			dispatch("eventsub/CONNECT");
			dispatch("rewards/LOAD");
			dispatch("badges/LOAD");
			dispatch("emotes/LOAD", {
				id: user.id,
				name: user.nickname
			});

			return client;
		},

		LOGIN_ERROR: ({ commit, rootState }, query = {}) => {
			rootState.config.settings.first = true;
			return commit("LOGIN_REDIRECT", query) && false;
		},

		CONNECT: async ({ dispatch, rootState, state }, credits) => {
			rootState.service.client.tmi.on(rootState.service.client.tmi.WebsocketEvents.CONNECTED, () => {
				rootState.service.connected = true;
				return dispatch("events/ON_CONNECTED");
			});

			rootState.service.client.tmi.on("ROOMSTATE", payload => {
				payload.tags["followers-only"] = Number(payload.tags["followers-only"]);

				if (state.tags) {
					const message = ~payload.tags["followers-only"]
						? global.$nuxt.$strings.NOTIFICATIONS.SYSTEM.FOLLOWERS_ONLY_ON
						: global.$nuxt.$strings.NOTIFICATIONS.SYSTEM.FOLLOWERS_ONLY_OFF;

					dispatch("service/ADD_SYSTEM_MESSAGE", message, { root: true });
				}

				state.tags = payload.tags;
				dispatch("events/ON_RAW_MESSAGE_FOLLOWERS_MODE");
			});

			const chatClient = await rootState.service.client.tmi.connect(credits.username, credits.access_token, [credits.username], {
				debug: rootState.config.twitch.chatDebug,
				secure: rootState.config.twitch.chatSecure
			});

			const chat = await dispatch("service/SET_CHAT", chatClient, { root: true });
			chat.on("message", async message => {
				if (!rootState.config.settings.chat.enable) {
					return false;
				}

				const profile = await dispatch("GET_PROFILE", message["display-name"]);

				if (message.color === "#000000") {
					message.color = "#FFFFFF";
				}

				message.text = message.text.trim();

				if (profile.id === "66312032") {
					switch(message.text) {
						case "!ping": {
							dispatch("ANSWER", {
								answer: "pong",
								message
							});

							break;
						}
					}
				}

				await dispatch("service/ADD_MESSAGE", {
					...await dispatch("FORMAT_PROFILE", profile),
					content: message.text,
					badges: await dispatch("badges/FORMAT", message.badges),

					formatted: await dispatch("FORMAT_MESSAGE", {
						text: message.text,
						emotes: message.emotes
					}),

					reward: await dispatch("FORMAT_REWARD", message["custom-reward-id"]),
					time: await dispatch("service/GET_CURRENT_TIME", null, { root: true }),
					color: message.color,
					type: message["msg-id"] || 0
				}, { root: true });

				return message;
			});

			chat.on(rootState.service.client.tmi.WebsocketEvents.DISCONNECTED, () => {
				dispatch("DISCONNECT");
				return dispatch("events/ON_DISCONNECTED");
			});

			chat.on("clear", () => {
				return dispatch("events/ON_CLEAR_CHAT");
			});

			chat.on("raid", raid => {
				return dispatch("events/ON_RAID", {
					username: raid["msg-param-displayName"],
					viewers: raid["msg-param-displayName"]
				});
			});

			return chat;
		},

		DISCONNECT: ({ state, rootState }) => {
			rootState.service.connected = false;
			state.tags = null;
		},

		CACHE_PROFILE: async ({ rootState }, username) => {
			profilesCache[username] = typeof username !== "object"
				? (await rootState.service.client.users.getByLogin(username)).data[0]
				: username;

			if (profilesCacheSize > profilesCacheMax - 1) {
				const spliceLen = Object.values(profilesCache).length - profilesCacheMax;
				const entries = Object.entries(profilesCache);
				const profilesArray = Object.fromEntries(entries);
				profilesCache = profilesArray.splice(spliceLen);
			} else {
				profilesCacheSize++;
			}

			return profilesCache[username];
		},

		GET_PROFILE: async ({ dispatch }, username) => {
			return profilesCache[username]
                || await dispatch("CACHE_PROFILE", username);
		},

		FORMAT_PROFILE: (_, profile) => {
			return {
				nickname: profile.display_name,
				user_id: profile.id,
				avatar: profile.profile_image_url
			};
		},

		FORMAT_MESSAGE: async ({ dispatch }, message) => {
			let formatted = [];
			let part = "";

			const twitchEmotes = await dispatch("emotes/FORMAT_TWITCH_EMOTES", message.emotes);

			const splitted = message.text.split(" ");
			for (let wordIndex in splitted) {
				wordIndex = Number(wordIndex);
				const word = splitted[wordIndex];

				if (await dispatch("formatter/CHECK_LINK", word)) { // Format link
					formatted = await dispatch("formatter/LINK", { formatted, part, word });
					part = "";
					continue;
				}

				const emote = twitchEmotes.find(e => e.code === word)
                    || await dispatch("emotes/FIND", word);

				if (emote) {
					formatted = await dispatch("formatter/EMOTE", {
						formatted, part,
						emote: await dispatch("FORMAT_EMOTE", emote)
					});

					part = "";
				} else part += " " + word;
			}

			return await dispatch("formatter/TEXT", { formatted, part });
		},

		FORMAT_REWARD: ({ state }, id) => {
			if (!id) {
				return null;
			}

			return state.rewards.list.find(reward => {
				return reward.id === id;
			});
		},

		BAN: async ({ rootState }, data) => {
			return await rootState.service.client.moderation.ban(rootState.service.user.id, data);
		},

		UPDATE: async ({ dispatch, rootState }, data) => {
			if (!data.title) data.title = rootState.service.stream.title;
			if (!data.game) data.game = rootState.service.stream.game;

			const { game } = await dispatch("SEARCH_GAME", data.game);
			data.game = game.name;

			await rootState.service.client.updateStream(rootState.service.user.id, data.title, data.game);
			await dispatch("service/SET_STREAM", data, { root: true });
			await dispatch("service/UPDATE_RECENT", data, { root: true });

			return game;
		},

		GET_STREAM: ({ rootState }) => {
			return rootState.service.stream;
		},

		VIEWERS_COUNT: async ({ rootState }) => {
			const response = await rootState.service.client.stream.streams({
				user_id: rootState.service.user.id
			});

			return response.data[0]?.viewer_count || 0;
		},

		FOLLOWERS_COUNT: async ({ rootState }) => {
			const follows = await rootState.service.client.users.follows(rootState.service.user.id);
			return follows.total || 0;
		},

		CHATTERS: async ({ rootState }) => {
			const [botsRequest, chattersRequest] = await Promise.all([
				misc.syncRequest("https://api.twitchinsights.net/v1/bots/online"),
				rootState.service.client.chat.allChatters(rootState.service.user.id, 1000)
			]);

			if (!botsRequest?.bots || !chattersRequest?.length) {
				return [];
			}

			const bots = botsRequest.bots.map(bot => {
				return bot[0];
			});

			const chatters = chattersRequest.map(chatter => {
				return chatter.user_name;
			});

			return {
				viewers: lodash.differenceBy(chatters, bots, chatter => {
					return chatter.toLowerCase();
				})
			};
		},

		SAY: ({ rootState }, message) => {
			return rootState.service.chat.say(message, rootState.service.user.nickname);
		},

		ANSWER: async ({ rootState }, { answer, message }) => {
			return await rootState.service.chat.say(answer, rootState.service.user.nickname, {
				"reply-parent-msg-id": message.id
			});
		},

		TURN_FOLLOWERS_ONLY: async ({ rootState, state }, duration = 0) => {
			if (!rootState.service.connected) {
				return false;
			}

			const user_id = rootState.service.user.id;
			return await rootState.service.client.chat.updateSettings(user_id, {
				follower_mode: state.tags["followers-only"] === -1,
				follower_mode_duration: duration
			});
		},

		GET_CATEGORIES: async ({ dispatch, rootState }, query) => {
			const response = await rootState.service.client.search.categories(query);

			return await Promise.map(response.data, async game => {
				return await dispatch("FORMAT_GAME", game);
			});
		},

		SEARCH_GAME: async ({ dispatch }, query) => {
			const games = await dispatch("GET_CATEGORIES", query);

			const gameId = misc.textToId(query);
			const game = games.find(game => {
				return misc.textToId(game.name) === gameId;
			});

			return {
				list: games,
				game: game || games[0]
			};
		},

		FORMAT_EMOTE: (_, emote) => {
			return {
				name: emote.code,
				url: emote.url
			};
		},

		FORMAT_GAME: (_, game) => {
			return {
				name: game.name,
				icon: game.box_art_url.replace("52x72", "288x386")
			};
		}
	},

	modules: {
		formatter,

		eventsub,
		events,
		rewards,
		emotes,
		badges
	}
};