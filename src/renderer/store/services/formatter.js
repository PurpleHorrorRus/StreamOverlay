// eslint-disable-next-line max-len
const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
// eslint-disable-next-line no-useless-escape
const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/;

export default {
	namespaced: true,

	state: () => ({
		types: {
			TEXT: "text",
			LINK: "link",
			EMOTE: "emote"
		}
	}),

	actions: {
		CHECK_LINK: (_, word) => {
			return linkRegex.test(word);
		},

		PART: (_, { formatted, types }) => {
			for (const type of Object.keys(types)) {
				let content = types[type];

				if (typeof content === "string") {
					content = content.trim();
					if (content.length === 0) continue;
				}

				formatted.push({ type, content });
			}

			return formatted;
		},

		TEXT: async ({ dispatch, state }, data) => {
			return await dispatch("PART", {
				formatted: data.formatted,
				types: {
					[state.types.TEXT]: data.part
				}
			});
		},

		LINK: async ({ dispatch, state }, data) => {
			return await dispatch("PART", {
				formatted: data.formatted,
				types: {
					[state.types.TEXT]: data.part,
					[state.types.LINK]: {
						domain: data.word.match(domainRegex)[1].replace("www.", ""),
						link: data.word.replace("www.", "https://")
					}
				}
			});
		},

		EMOTE: async ({ dispatch, state }, data) => {
			return await dispatch("PART", {
				formatted: data.formatted,
				types: {
					[state.types.TEXT]: data.part,
					[state.types.EMOTE]: data.emote
				}
			});
		}
	}
};