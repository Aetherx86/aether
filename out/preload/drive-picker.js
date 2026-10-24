"use strict";
const electron = require("electron");
const DRIVE_PICKER_CHANNELS = {
  getInit: "drive-picker:get-init",
  list: "drive-picker:list",
  choose: "drive-picker:choose",
  cancel: "drive-picker:cancel"
};
function themeOf(value) {
  return value === "light" || value === "dark" ? value : "system";
}
const api = {
  async getInit() {
    const init = await electron.ipcRenderer.invoke(DRIVE_PICKER_CHANNELS.getInit);
    return { lang: init?.lang ?? "en", theme: themeOf(init?.theme) };
  },
  onThemeChanged(handler) {
    const listener = (_event, theme) => handler(themeOf(theme));
    electron.ipcRenderer.on("app:theme-changed", listener);
    return () => electron.ipcRenderer.removeListener("app:theme-changed", listener);
  },
  list: (listing, pageToken) => electron.ipcRenderer.invoke(DRIVE_PICKER_CHANNELS.list, listing, pageToken),
  choose: (picks) => electron.ipcRenderer.invoke(DRIVE_PICKER_CHANNELS.choose, picks),
  async cancel() {
    await electron.ipcRenderer.invoke(DRIVE_PICKER_CHANNELS.cancel);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficeDrivePicker", api);
