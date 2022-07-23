/* eslint-disable no-undef */
import { app } from "electron";
import path from "path";

import storage from "./storage";
import WindowsLogic from "./windows";

app.getVersion = () => "1.8.0";

export default {
    icon: path.join("build", "icons", "icon.ico"),
    isDev: process.env.NODE_ENV === "development",
    storage,
    windows: new WindowsLogic()
};