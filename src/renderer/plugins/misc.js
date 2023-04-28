

export default {
    syncRequest: async (url, params = {}) => {
        const response = await fetch(url, params).catch(() => ({ ok: false }));
        return response.ok ? await response.json() : null;
    },

    formatTime: time => {
        let { seconds, mins, hours } = time;

        if (time.seconds < 10) seconds = `0${time.seconds}`;
        if (time.mins < 10) mins = `0${time.mins}`;
        if (time.hours !== undefined) {
            if (time.hours < 10) hours = `0${hours}`;
            return `${hours}:${mins}:${seconds}`;
        }

        return `${mins}:${seconds}`;
    },

    arrayMove(arr, oldIndex, newIndex) {
        if (newIndex >= arr.length) {
            let k = newIndex - arr.length + 1;
            while (k--) arr.push(undefined);
        }

        arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
        return arr;
    },

    textToId(text = "") {
        return text.trim().replaceAll(" ", "").toLowerCase();
    }
};