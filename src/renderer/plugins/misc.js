export default { 
    fancyTimeFormat: time => {
        const hrs = ~~(time / 3600), mins = ~~((time % 3600) / 60), secs = ~~time % 60;

        let ret = "";

        if(hrs > 0) ret += `${hrs}:${mins < 10 ? "0" : ""}`;
        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;

        return ret;
    },
    formatTime: time => {
        let h = time.hours, m = time.mins, s = time.seconds;
        if (time.seconds < 10) s = `0${time.seconds}`;
        if (time.mins < 10) m = `0${time.mins}`;
        if (time.hours) {
            if(time.hours < 10) h = `0${time.hours}`;
            return `${h}:${m}:${s}`;
        } else return `${m}:${s}`;
	
    },
    formatUnixTime: time => {
        const date = new Date(time * 1000);
        const hours = date.getHours(),
            minutes = "0" + date.getMinutes();

        return `${hours}:${minutes.substr(-2)}`;
    },
    getRandom: (min, max) => (Math.floor(Math.random() * (max - min + 1)) + min),
    shuffle: array => {
        let currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
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