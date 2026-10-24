"use strict";
const electron = require("electron");
const DOC_PICKER_CHANNELS = {
  getInit: "doc-picker:get-init",
  list: "doc-picker:list",
  choose: "doc-picker:choose",
  cancel: "doc-picker:cancel"
};
const DOC_PICKER_PAGE_KEY = "aiOfficeDocPicker";
function themeOf(value) {
  return value === "light" || value === "dark" ? value : "system";
}
const api = {
  async getInit() {
    const init = await electron.ipcRenderer.invoke(DOC_PICKER_CHANNELS.getInit);
    return { lang: init?.lang ?? "en", theme: themeOf(init?.theme) };
  },
  onThemeChanged(handler) {
    const listener = (_event, theme) => handler(themeOf(theme));
    electron.ipcRenderer.on("app:theme-changed", listener);
    return () => electron.ipcRenderer.removeListener("app:theme-changed", listener);
  },
  list: () => electron.ipcRenderer.invoke(DOC_PICKER_CHANNELS.list),
  choose: (ids) => electron.ipcRenderer.invoke(DOC_PICKER_CHANNELS.choose, ids),
  async cancel() {
    await electron.ipcRenderer.invoke(DOC_PICKER_CHANNELS.cancel);
  }
};
electron.contextBridge.exposeInMainWorld(DOC_PICKER_PAGE_KEY, api);
