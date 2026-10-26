"use strict";

let electron;
try {
  electron = require("electron");
} catch {
  electron = null;
}

const { registerEnvIpc, getEnvConfig, executeAiChat } = require("./env-agent");
const { registerTerminalIpc, terminalManager } = require("./terminal");
const { registerOfficeIpc } = require("./office-tools");
const { registerGitIpc } = require("./git-bridge");
const { geminiTracker } = require("./gemini-tracker");
const { registerAetherumIpc } = require("./aetherum-browser");
const { registerSleipnirIpc } = require("./sleipnir");
const { registerNibelungenIpc } = require("./nibelungen");
const { registerFafnirIpc } = require("./fafnir");
const { registerMimisbrunnrIpc } = require("./mimisbrunnr");
const { registerRatatoskrIpc } = require("./ratatoskr");
const { registerHeimdallIpc } = require("./heimdall");
const { registerAdblockIpc } = require("./adblock");
const { registerHighTableIpc } = require("./high-table");

let installed = false;

function installHyperOfficeExtensions(electronModule = null) {
  if (installed) return;
  const el = electronModule || electron;
  if (!el || !el.ipcMain) {
    console.warn("[HyperOffice] Electron ipcMain not available, skipping extension IPC hooks.");
    return;
  }
  installed = true;

  const { app, ipcMain } = el;

  console.log("=================================================");
  console.log("🚀 [HyperOffice Extensions] Initializing...");
  console.log("   • .env Multi-AI Agent Provider: Active");
  console.log("   • PTY Terminal Subsystem: Active");
  console.log("   • Office Tools & WASM HWP/PDF Bridge: Active");
  console.log("   • Git Versioning & Visual Diff: Active");
  console.log("   • Gemini Quota & Key Lock Tracker: Active");
  console.log("=================================================");

  // 1. Register All Custom IPC Handlers
  registerEnvIpc(ipcMain);
  registerTerminalIpc(ipcMain);
  registerOfficeIpc(ipcMain);
  registerGitIpc(ipcMain);
  registerAetherumIpc(ipcMain);
  registerSleipnirIpc(ipcMain);
  registerNibelungenIpc(ipcMain);
  registerFafnirIpc(ipcMain);
  registerMimisbrunnrIpc(ipcMain);
  registerRatatoskrIpc(ipcMain);
  registerHeimdallIpc(ipcMain, el.dialog);
  registerAdblockIpc(ipcMain);
  registerHighTableIpc(ipcMain);

  ipcMain.handle("hyper:heimdall:request-mic", async () => {
    try {
      if (process.platform === "darwin" && el.systemPreferences?.askForMediaAccess) {
        const status = el.systemPreferences.getMediaAccessStatus("microphone");
        if (status === "granted") return { granted: true, status };
        const granted = await el.systemPreferences.askForMediaAccess("microphone");
        return { granted, status: granted ? "granted" : status };
      }
      return { granted: true, status: "granted" };
    } catch (err) {
      return { granted: true, status: "unknown", error: err.message };
    }
  });

  // 2. Gemini Quota & Token Tracking (native ai:chat / ai:free-quota / ai:free-disconnect stay in main/index.js)
  ipcMain.handle("hyper:gemini:quota", () => geminiTracker.getQuotaStats());

  // 4. Clean up on app exit
  app.on("before-quit", () => {
    terminalManager.killAll();
  });
}

module.exports = {
  installHyperOfficeExtensions
};
