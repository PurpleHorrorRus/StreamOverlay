/* eslint-disable no-undef */
const path = require("path");

const ICONS_DIR = path.resolve("build", "icons");

const windowsOS = {
    win: {
        icon: path.join(ICONS_DIR, "icon.ico"),
        publisherName: "PurpleHorrorRus",
        verifyUpdateCodeSignature: false,
        target: "nsis"
    },

    nsis: {
        differentialPackage: true
    }
};

module.exports = {
    asar: true,
    productName: "StreamOverlayMaximum",
    appId: "com.purplehorrorrus.streamoverlaymaximum",
    artifactName: "streamoverlaymaximum-${version}.${ext}",
    directories: {
        output: "build",
        buildResources: "dist"
    },
    // default files: https://www.electron.build/configuration/contents
    files: [
        "!**",
        "dist/**/*",
        "!dist/renderer/icon.psd",
        "!dist/renderer/icons",
        "package.json",
        "node_modules",
    ],
    extraResources: [
        {
            from: "./build/icons",
            to: "../build/icons"
        },
        {
            from: "./config",
            to: "../config"
        },
        {
            from: "./chat",
            to: "../chat"
        }
    ],
    ...windowsOS
};
