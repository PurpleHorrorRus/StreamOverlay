export default {
    send: (window, event, data) => {
        if (window) {
            window.webContents.send(event, data);
        }
    }
};