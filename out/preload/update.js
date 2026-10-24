"use strict";
const electron = require("electron");
const UPDATE_CHANNELS = {
  getState: "update:get-state",
  download: "update:download",
  install: "update:install",
  later: "update:later",
  openDownload: "update:open-download",
  changed: "update:changed"
};
const api = {
  async getState() {
    const result = await electron.ipcRenderer.invoke(UPDATE_CHANNELS.getState);
    return result ?? null;
  },
  download() {
    void electron.ipcRenderer.invoke(UPDATE_CHANNELS.download);
  },
  install() {
    void electron.ipcRenderer.invoke(UPDATE_CHANNELS.install);
  },
  later() {
    void electron.ipcRenderer.invoke(UPDATE_CHANNELS.later);
  },
  openDownload() {
    void electron.ipcRenderer.invoke(UPDATE_CHANNELS.openDownload);
  },
  onState(handler) {
    const listener = (_event, state) => handler(state);
    electron.ipcRenderer.on(UPDATE_CHANNELS.changed, listener);
    return () => electron.ipcRenderer.removeListener(UPDATE_CHANNELS.changed, listener);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficeUpdate", api);
