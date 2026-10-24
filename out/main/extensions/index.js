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

  // 2. Gemini Quota & Token Tracking
  ipcMain.handle("hyper:gemini:quota", () => geminiTracker.getQuotaStats());

  // Intercept built-in ai:free-quota for Gemini
  try { ipcMain.removeHandler("ai:free-quota"); } catch {}
  ipcMain.handle("ai:free-quota", async (event, input) => {
    const provider = input?.provider || (typeof input === "string" ? input : "");
    if (provider === "gemini") {
      return geminiTracker.getQuotaStats();
    }
    return null;
  });

  // Intercept built-in ai:free-disconnect to lock Gemini key
  try { ipcMain.removeHandler("ai:free-disconnect"); } catch {}
  ipcMain.handle("ai:free-disconnect", async (event, input) => {
    const provider = input?.provider || (typeof input === "string" ? input : "");
    if (provider === "gemini") {
      console.log("[HyperOffice] Gemini key is locked; disconnect prevented.");
      return;
    }
  });

  // 3. Fallback hook for built-in ai:chat
  try { ipcMain.removeHandler("ai:chat"); } catch {}
  ipcMain.handle("ai:chat", async (event, request) => {
    const envCfg = getEnvConfig();
    const activeProvider = envCfg.gemini ? "gemini" :
                           envCfg.anthropic ? "anthropic" :
                           envCfg.openai ? "openai" :
                           envCfg.deepseek ? "deepseek" :
                           envCfg.openrouter ? "openrouter" : "ollama";

    if (envCfg[activeProvider] || activeProvider === "ollama") {
      try {
        return await executeAiChat({
          provider: activeProvider,
          system: request.system,
          user: request.user
        });
      } catch (err) {
        return { ok: false, error: `[.env AI Error] ${err.message}` };
      }
    }

    return { ok: false, error: "No AI provider configured. Set GEMINI_API_KEY in .env." };
  });

  // 4. Clean up on app exit
  app.on("before-quit", () => {
    terminalManager.killAll();
  });
}

module.exports = {
  installHyperOfficeExtensions
};
