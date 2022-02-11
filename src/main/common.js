/* eslint-disable no-undef */
import { app } from "electron";
import path from "path";

import storage from "./storage";
import windows from "./windows";

app.getVersion = () => "1.5.0";

const icon = path.join("build", "icons", "icon.ico");
const isDev = process.env.NODE_ENV === "development";

export default {
    icon,
    isDev,
    storage,
    windows
};