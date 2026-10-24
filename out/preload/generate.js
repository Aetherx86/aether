"use strict";
const electron = require("electron");
const GENERATE_CHANNELS = {
  // window → main
  getState: "generate:get-state",
  getTheme: "generate:get-theme",
  setKind: "generate:set-kind",
  /** a conversion without AI (8.6), or null for back to the AI kinds */
  setConvert: "generate:set-convert",
  addMaterials: "generate:add-materials",
  removeMaterial: "generate:remove-material",
  saveMaterial: "generate:save-material",
  refresh: "generate:refresh",
  make: "generate:make",
  cancel: "generate:cancel",
  // main → window
  state: "generate:state"
  // home → main: GENERATE_HOME_CHANNELS (generate-home-channels.ts)
};
function themeOf(value) {
  return value === "light" || value === "dark" ? value : "system";
}
const api = {
  async getState() {
    const result = await electron.ipcRenderer.invoke(GENERATE_CHANNELS.getState);
    return result ?? null;
  },
  onState(handler) {
    const listener = (_event, state) => handler(state);
    electron.ipcRenderer.on(GENERATE_CHANNELS.state, listener);
    return () => electron.ipcRenderer.removeListener(GENERATE_CHANNELS.state, listener);
  },
  async getTheme() {
    return themeOf(await electron.ipcRenderer.invoke(GENERATE_CHANNELS.getTheme));
  },
  onThemeChanged(handler) {
    const listener = (_event, theme) => handler(themeOf(theme));
    electron.ipcRenderer.on("app:theme-changed", listener);
    return () => electron.ipcRenderer.removeListener("app:theme-changed", listener);
  },
  async setKind(kind) {
    await electron.ipcRenderer.invoke(GENERATE_CHANNELS.setKind, kind);
  },
  async setConvert(kind) {
    await electron.ipcRenderer.invoke(GENERATE_CHANNELS.setConvert, kind);
  },
  async addMaterials() {
    await electron.ipcRenderer.invoke(GENERATE_CHANNELS.addMaterials);
  },
  async removeMaterial(key) {
    await electron.ipcRenderer.invoke(GENERATE_CHANNELS.removeMaterial, key);
  },
  async saveMaterial(key) {
    await electron.ipcRenderer.invoke(GENERATE_CHANNELS.saveMaterial, key);
  },
  async refresh() {
    await electron.ipcRenderer.invoke(GENERATE_CHANNELS.refresh);
  },
  async make(text) {
    return await electron.ipcRenderer.invoke(GENERATE_CHANNELS.make, text) === true;
  },
  async cancel() {
    await electron.ipcRenderer.invoke(GENERATE_CHANNELS.cancel);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficeGenerateWindow", api);
