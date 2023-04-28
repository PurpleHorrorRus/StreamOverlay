/* eslint-disable no-undef */
import { app } from "electron";
import path from "path";

import Storage from "./storage";
import WindowsLogic from "./windows";

app.getVersion = () => "2.3.2";

export default {
    icon: path.join("build", "icons", "icon.ico"),
    isDev: process.env.NODE_ENV === "development",
    storage: new Storage().create(),
    windows: new WindowsLogic()
};