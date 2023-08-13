export default {
	namespaced: true,

	state: () => ({
		list: {
			mic: false,
			sound: false,
			camera: null
		},

		sources: {}
	}),

	actions: {
		GET: async ({ dispatch, state }) => {
			const { inputs } = await dispatch("obs/SEND", { event: "GetInputList" }, { root: true });
			state.sources = await dispatch("GET_INPUTS_NAMES", inputs);

			state.list.mic = !(await dispatch("GET_MUTED", state.sources.mic));
			state.list.sound = !(await dispatch("GET_MUTED", state.sources.sound));
			state.list.camera = await dispatch("GET_CAMERA_VISIBLE");

			return state.sources;
		},

		LISTEN: async ({ dispatch, state, rootState }) => {
			const inputNames = await dispatch("GET");

			rootState.obs.obs.on("InputMuteStateChanged", ({ inputName, inputMuted }) => {
				switch (inputName) {
					case inputNames.mic: {
						state.list.mic = !inputMuted;
						return state.list.mic;
					}

					case inputNames.sound: {
						state.list.sound = !inputMuted;
						return state.list.sound;
					}
				}
			});

			return true;
		},

		GET_INPUTS_NAMES: (_, inputs) => {
			return {
				mic: inputs.find(input => input.inputKind === "wasapi_input_capture").inputName,
				sound: inputs.find(input => input.inputKind === "wasapi_output_capture").inputName
			};
		},

		GET_MUTED: async ({ dispatch }, inputName) => {
			const { inputMuted } = await dispatch("obs/SEND", {
				event: "GetInputMute",
				args: { inputName }
			}, { root: true });

			return inputMuted;
		},

		GET_VISIBLE: async ({ dispatch }, item) => {
			const { sceneItemEnabled } = await dispatch("obs/SEND", {
				event: "GetSceneItemEnabled",
				args: item
			}, { root: true });

			return sceneItemEnabled;
		},

		GET_CAMERA_VISIBLE: async ({ dispatch, rootState }) => {
			const { sceneItems } = await dispatch("obs/SEND", {
				event: "GetSceneItemList",
				args: rootState.obs.scene
			}, { root: true });

			for (const item of sceneItems) {
				if (rootState.config.obs.camera.includes(item.sourceName)) {
					return await dispatch("GET_VISIBLE", {
						sceneName: rootState.obs.scene.sceneName,
						sceneItemId: item.sceneItemId
					});
				}
			}

			return null;
		},

		UPDATE_CAMERA: async ({ dispatch, state }) => {
			state.list.camera = await dispatch("GET_CAMERA_VISIBLE");
			return state.list.camera;
		}
	}
};