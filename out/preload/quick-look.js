"use strict";
const electron = require("electron");
const FAMILY_BY_EXT = {
  docx: "docx",
  doc: "docx",
  odt: "docx",
  xlsx: "xlsx",
  xlsm: "xlsx",
  xls: "xlsx",
  csv: "xlsx",
  tsv: "xlsx",
  pptx: "pptx",
  ppt: "pptx",
  pdf: "pdf",
  hwp: "hwp",
  hwpx: "hwp",
  xmind: "xmind",
  md: "md",
  markdown: "md",
  html: "html",
  htm: "html",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  txt: "text",
  json: "text",
  xml: "text",
  log: "text",
  py: "text"
};
new Set(Object.keys(FAMILY_BY_EXT));
const QUICK_LOOK_WINDOW_CHANNELS = {
  getInit: "quick-look:get-init",
  update: "quick-look:payload",
  willShow: "quick-look:will-show",
  willHide: "quick-look:will-hide",
  themeChanged: "quick-look:theme-changed",
  langChanged: "quick-look:lang-changed",
  openInEditor: "quick-look:open-in-editor",
  revealInFolder: "quick-look:reveal-in-folder",
  close: "quick-look:close"
};
function themeOf(value) {
  return value === "light" || value === "dark" ? value : "system";
}
function langOf(value) {
  return typeof value === "string" && value ? value : "en";
}
const api = {
  async getInit() {
    const init = await electron.ipcRenderer.invoke(
      QUICK_LOOK_WINDOW_CHANNELS.getInit
    );
    return {
      lang: langOf(init?.lang),
      theme: themeOf(init?.theme),
      payload: init?.payload ?? null
    };
  },
  onUpdate(handler) {
    const listener = (_event, payload) => {
      if (payload && typeof payload === "object") {
        handler(payload);
      }
    };
    electron.ipcRenderer.on(QUICK_LOOK_WINDOW_CHANNELS.update, listener);
    return () => electron.ipcRenderer.removeListener(QUICK_LOOK_WINDOW_CHANNELS.update, listener);
  },
  onWillShow(handler) {
    const listener = () => handler();
    electron.ipcRenderer.on(QUICK_LOOK_WINDOW_CHANNELS.willShow, listener);
    return () => electron.ipcRenderer.removeListener(QUICK_LOOK_WINDOW_CHANNELS.willShow, listener);
  },
  onWillHide(handler) {
    const listener = () => handler();
    electron.ipcRenderer.on(QUICK_LOOK_WINDOW_CHANNELS.willHide, listener);
    return () => electron.ipcRenderer.removeListener(QUICK_LOOK_WINDOW_CHANNELS.willHide, listener);
  },
  onThemeChanged(handler) {
    const listener = (_event, theme) => handler(themeOf(theme));
    electron.ipcRenderer.on(QUICK_LOOK_WINDOW_CHANNELS.themeChanged, listener);
    electron.ipcRenderer.on("app:theme-changed", listener);
    return () => {
      electron.ipcRenderer.removeListener(QUICK_LOOK_WINDOW_CHANNELS.themeChanged, listener);
      electron.ipcRenderer.removeListener("app:theme-changed", listener);
    };
  },
  onLangChanged(handler) {
    const listener = (_event, lang) => handler(langOf(lang));
    electron.ipcRenderer.on(QUICK_LOOK_WINDOW_CHANNELS.langChanged, listener);
    return () => electron.ipcRenderer.removeListener(QUICK_LOOK_WINDOW_CHANNELS.langChanged, listener);
  },
  async openInEditor() {
    await electron.ipcRenderer.invoke(QUICK_LOOK_WINDOW_CHANNELS.openInEditor);
  },
  async revealInFolder() {
    await electron.ipcRenderer.invoke(QUICK_LOOK_WINDOW_CHANNELS.revealInFolder);
  },
  async close() {
    await electron.ipcRenderer.invoke(QUICK_LOOK_WINDOW_CHANNELS.close);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficeQuickLook", api);
