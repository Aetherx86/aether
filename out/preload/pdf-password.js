"use strict";
const electron = require("electron");
const PDF_PASSWORD_CHANNELS = {
  getState: "pdf-password:get-state",
  submit: "pdf-password:submit",
  cancel: "pdf-password:cancel",
  changed: "pdf-password:changed"
};
const api = {
  async getState() {
    const result = await electron.ipcRenderer.invoke(PDF_PASSWORD_CHANNELS.getState);
    return result ?? null;
  },
  submit(password) {
    void electron.ipcRenderer.invoke(PDF_PASSWORD_CHANNELS.submit, password);
  },
  cancel() {
    void electron.ipcRenderer.invoke(PDF_PASSWORD_CHANNELS.cancel);
  },
  onState(handler) {
    const listener = (_event, state) => handler(state);
    electron.ipcRenderer.on(PDF_PASSWORD_CHANNELS.changed, listener);
    return () => electron.ipcRenderer.removeListener(PDF_PASSWORD_CHANNELS.changed, listener);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficePdfPassword", api);
