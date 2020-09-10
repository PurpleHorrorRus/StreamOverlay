/* eslint-disable no-undef */
import { app } from "electron";
app.on("window-all-closed", app.quit);
require("./updater");
require("./mainWindow");