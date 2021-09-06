import fetch from "node-fetch";

export default {
    syncRequest: async (url, params = {}) => {
        const response = await fetch(url, params);
        return !params.raw ? await response.json() : await response.text();
    },
    formatTime: time => {
        let h = time.hours,
            m = time.mins,
            s = time.seconds;
        if (time.seconds < 10) s = `0${time.seconds}`;
        if (time.mins < 10) m = `0${time.mins}`;
        if (time.hours) {
            if (time.hours < 10) h = `0${time.hours}`;
            return `${h}:${m}:${s}`;
        }
    },
    array_move(arr, oldIndex, newIndex) {
        if (newIndex >= arr.length) {
            let k = newIndex - arr.length + 1;
            while (k--) arr.push(undefined);
        }

        arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
        return arr;
    }
};