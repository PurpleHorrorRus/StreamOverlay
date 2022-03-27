/* eslint-disable no-undef */
const path = require("path");

const ICONS_DIR = path.resolve("build", "icons");

const windowsOS = {
    win: {
        icon: path.join(ICONS_DIR, "icon.ico"),
        publisherName: "PurpleHorrorRus",
        verifyUpdateCodeSignature: false,
        target: "nsis",
        publish: ["github"]
    },

    nsis: {
        perMachine: true,
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        differentialPackage: true
    }
};

module.exports = Object.assign(windowsOS, {
    asar: true,
    productName: "StreamOverlayMaximum",
    appId: "com.purplehorrorrus.streamoverlaymaximum",
    artifactName: "streamoverlaymaximum-trovo-${version}.${ext}",
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
        "node_modules"
    ],
    
    extraResources: [
        {
            from: "./build/icons",
            to: "../build/icons"
        }
    ],

    publish: {
        provider: "github",
        repo: "StreamOverlay",
        owner: "PurpleHorrorRus"
    }
});