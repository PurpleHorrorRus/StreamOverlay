/* eslint-disable no-undef */
const socketio = require("socket.io");
const express = require("express");
const app = express();

const config = {
    port: 5136 || process.env.PORT
};

const server = app.listen(config.port);
const io = socketio.listen(server);

const SOCKETS = {
    OBS_CHAT: null
};

const forwardToOBS = data => {
    if (!SOCKETS.OBS_CHAT) {
        console.error("[0,OBS_CHAT_ERROR_CONNECTION]");
        return;
    }

    SOCKETS.OBS_CHAT.emit("message", data);
};

process.on("message", forwardToOBS);

io.on("connect", socket => {
    const { type } = socket.handshake.query;
    SOCKETS[type] = socket;
});