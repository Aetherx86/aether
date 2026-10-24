"use strict";
const electron = require("electron");
const PDF_TOOLS_CHANNELS = {
  getInit: "pdf-tools:get-init",
  pickInputs: "pdf-tools:pick-inputs",
  run: "pdf-tools:run",
  openResult: "pdf-tools:open-result",
  revealResult: "pdf-tools:reveal-result",
  openInEditor: "pdf-tools:open-in-editor",
  findBlankPages: "pdf-tools:find-blank-pages",
  cancelFind: "pdf-tools:cancel-find",
  /** stop a tool that reports progress (compress) */
  cancelRun: "pdf-tools:cancel-run",
  /** the task the PDF editor's ribbon asked for, taken once */
  takeStart: "pdf-tools:take-start",
  /** main → window: a task from the ribbon is waiting */
  startReady: "pdf-tools:start-ready",
  /** main → window: { done, total } while blank pages are being looked for */
  progress: "pdf-tools:progress",
  close: "pdf-tools:close"
};
function themeOf(value) {
  return value === "light" || value === "dark" ? value : "system";
}
const api = {
  async getInit() {
    const init = await electron.ipcRenderer.invoke(PDF_TOOLS_CHANNELS.getInit);
    return { lang: init?.lang ?? "en", theme: themeOf(init?.theme) };
  },
  onThemeChanged(handler) {
    const listener = (_event, theme) => handler(themeOf(theme));
    electron.ipcRenderer.on("app:theme-changed", listener);
    return () => electron.ipcRenderer.removeListener("app:theme-changed", listener);
  },
  async pickInputs(multi, kind = "pdf", accept = "pdf") {
    const result = await electron.ipcRenderer.invoke(
      PDF_TOOLS_CHANNELS.pickInputs,
      multi,
      kind,
      accept
    );
    return result ?? { inputs: [], rejected: [] };
  },
  async run(request) {
    const result = await electron.ipcRenderer.invoke(PDF_TOOLS_CHANNELS.run, request);
    return result ?? { ok: false, error: "failed" };
  },
  async openResult(id) {
    await electron.ipcRenderer.invoke(PDF_TOOLS_CHANNELS.openResult, id);
  },
  async revealResult(id) {
    await electron.ipcRenderer.invoke(PDF_TOOLS_CHANNELS.revealResult, id);
  },
  async openInEditor() {
    await electron.ipcRenderer.invoke(PDF_TOOLS_CHANNELS.openInEditor);
  },
  async findBlankPages(inputId) {
    const result = await electron.ipcRenderer.invoke(PDF_TOOLS_CHANNELS.findBlankPages, inputId);
    return result ?? { ok: false, error: "failed" };
  },
  async cancelRun() {
    await electron.ipcRenderer.invoke(PDF_TOOLS_CHANNELS.cancelRun);
  },
  async cancelFind() {
    await electron.ipcRenderer.invoke(PDF_TOOLS_CHANNELS.cancelFind);
  },
  onProgress(handler) {
    const listener = (_event, value) => {
      const v = value ?? {};
      if (typeof v.done === "number" && typeof v.total === "number") handler(v.done, v.total);
    };
    electron.ipcRenderer.on(PDF_TOOLS_CHANNELS.progress, listener);
    return () => electron.ipcRenderer.removeListener(PDF_TOOLS_CHANNELS.progress, listener);
  },
  async takeStart() {
    const start = await electron.ipcRenderer.invoke(PDF_TOOLS_CHANNELS.takeStart);
    return start ?? null;
  },
  onStartReady(handler) {
    const listener = () => handler();
    electron.ipcRenderer.on(PDF_TOOLS_CHANNELS.startReady, listener);
    return () => electron.ipcRenderer.removeListener(PDF_TOOLS_CHANNELS.startReady, listener);
  },
  async close() {
    await electron.ipcRenderer.invoke(PDF_TOOLS_CHANNELS.close);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficePdfTools", api);
