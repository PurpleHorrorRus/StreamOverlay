let interval = null;

export default {
    namespaced: true,
    state: () => ({
        hours: undefined,
        mins: 0,
        seconds: 0
    }),
    actions: {
        SETUP: ({ dispatch }) => {
            if (interval) {
                dispatch("CLEAR");
            }

            interval = setInterval(() => dispatch("UPDATE"), 1000);
        },

        CLEAR: ({ state }) => {
            state.seconds = 0;
            state.mins = 0;
            state.hours = undefined;

            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        },

        UPDATE: ({ state }) => {
            state.seconds++;

            if (state.seconds >= 60) {
                state.seconds = 0;
                state.mins++;
            }

            if (state.mins >= 60) {
                if (state.hours === undefined) state.hours = 1;
                else state.hours++;

                state.seconds = 0;
                state.mins = 0;
            }
        }
    }
};