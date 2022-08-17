let interval = null;

export default {
    namespaced: true,

    state: () => ({
        hours: undefined,
        mins: 0,
        seconds: 0
    }),

    actions: {
        SETUP: async ({ dispatch }) => {
            interval = setInterval(() => dispatch("UPDATE"), 1000);
            return interval;
        },

        FORMAT_TIME: (_, timecode) => {
            const [hours, mins, seconds] = timecode.split(":");
            return {
                hours: Number(hours) > 0 ? Number(hours) : undefined,
                mins: Number(mins),
                seconds: Math.floor(seconds)
            };
        },

        SET: async ({ dispatch, state }, time) => {
            time = await dispatch("FORMAT_TIME", time);

            state.hours = time.hours;
            state.mins = time.mins;
            state.seconds = time.seconds;

            return time;
        },

        CLEAR: ({ state }) => {
            state.seconds = 0;
            state.mins = 0;
            state.hours = undefined;

            clearInterval(interval);
            interval = null;
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