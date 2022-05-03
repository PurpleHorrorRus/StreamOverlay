/* eslint-disable no-undef */
import { app } from "electron";
import path from "path";

import storage from "./storage";
import WindowsLogic from "./windows";

app.getVersion = () => "1.6.8";

const icon = path.join("build", "icons", "icon.ico");
const isDev = process.env.NODE_ENV === "development";

export default {
    icon,
    isDev,
    storage,
    windows: new WindowsLogic()
};