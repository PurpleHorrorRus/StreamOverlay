/* eslint-disable no-undef */
const path = require("path");

const ICONS_DIR = path.resolve("build", "icons");

const windowsOS = {
    publish: {
        provider: "github",
        repo: "StreamOverlay",
        owner: "PurpleHorrorRus"
    },

    win: {
        icon: path.join(ICONS_DIR, "icon.ico"),
        publisherName: "PurpleHorrorRus",
        verifyUpdateCodeSignature: false,
        target: "nsis",

        publish: ["github"]
    },

    nsis: {
        differentialPackage: true
    }
};

module.exports = {
    asar: true,
    productName: "StreamOverlay",
    appId: "com.purplehorrorrus.streamoverlay",
    artifactName: "streamoverlay-${version}.${ext}",
    directories: {
        output: "build",
        buildResources: "dist"
    },
    files: [
        "!**",
        "dist/**/*",
        "!dist/renderer/icon.psd",
        "!dist/renderer/icons",
        "!dist/win-unpacked",
        "package.json",
        "node_modules",
    ],
    extraResources: [
        {
            from: "./build/icons",
            to: "../build/icons"
        }
    ],
    ...windowsOS
};