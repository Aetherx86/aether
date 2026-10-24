"use strict";
const electron = require("electron");
const AGENT_CHANNELS = {
  getInit: "agent-window:get-init",
  pickFolder: "agent-window:pick-folder",
  setPrefs: "agent-window:set-prefs",
  start: "agent-window:start",
  send: "agent-window:send",
  answer: "agent-window:answer",
  stop: "agent-window:stop",
  openFile: "agent-window:open-file",
  getTheme: "agent-window:get-theme",
  /** the Codex choices remembered for a project folder (spec 7.2) */
  getProjectPrefs: "agent-window:get-project-prefs",
  setProjectPrefs: "agent-window:set-project-prefs",
  /** main → window: one session event */
  event: "agent-window:event",
  /** main → window: `propose_skill` asks for a skill card (spec 6.3) */
  skillProposal: "agent-window:skill-proposal",
  /** main → window: `propose_skill_install` proposes a GitHub skill (spec 6.4) */
  installProposal: "agent-window:install-proposal",
  /** whether a template candidate can be saved as it is (its redaction marks) */
  templateCheck: "agent-window:template-check",
  /** a template candidate's bytes for "save as it is"; refused while it may withhold */
  templateAsIs: "agent-window:template-as-is",
  /** "make a blank template": the candidate's copy in a template preview tab */
  templateBlank: "agent-window:template-blank"
};
function themeOf(value) {
  return value === "light" || value === "dark" ? value : "system";
}
const api = {
  async getInit() {
    return await electron.ipcRenderer.invoke(AGENT_CHANNELS.getInit);
  },
  async getTheme() {
    return themeOf(await electron.ipcRenderer.invoke(AGENT_CHANNELS.getTheme));
  },
  onThemeChanged(handler) {
    const listener = (_event, theme) => handler(themeOf(theme));
    electron.ipcRenderer.on("app:theme-changed", listener);
    return () => electron.ipcRenderer.removeListener("app:theme-changed", listener);
  },
  async pickFolder() {
    const folder = await electron.ipcRenderer.invoke(AGENT_CHANNELS.pickFolder);
    return typeof folder === "string" ? folder : null;
  },
  async setPrefs(prefs) {
    return await electron.ipcRenderer.invoke(AGENT_CHANNELS.setPrefs, prefs);
  },
  async start(request) {
    return await electron.ipcRenderer.invoke(AGENT_CHANNELS.start, request);
  },
  async send(sessionId, text) {
    return await electron.ipcRenderer.invoke(AGENT_CHANNELS.send, sessionId, text) === true;
  },
  async answer(sessionId, requestId, allow, scope) {
    await electron.ipcRenderer.invoke(AGENT_CHANNELS.answer, sessionId, requestId, allow, scope ?? "once");
  },
  async getProjectPrefs(folder) {
    return await electron.ipcRenderer.invoke(
      AGENT_CHANNELS.getProjectPrefs,
      folder
    );
  },
  async setProjectPrefs(folder, patch) {
    return await electron.ipcRenderer.invoke(
      AGENT_CHANNELS.setProjectPrefs,
      folder,
      patch
    );
  },
  async stop(sessionId) {
    await electron.ipcRenderer.invoke(AGENT_CHANNELS.stop, sessionId);
  },
  async openFile(sessionId, path) {
    return await electron.ipcRenderer.invoke(AGENT_CHANNELS.openFile, sessionId, path) === true;
  },
  onEvent(handler) {
    const listener = (_event, payload) => handler(payload);
    electron.ipcRenderer.on(AGENT_CHANNELS.event, listener);
    return () => electron.ipcRenderer.removeListener(AGENT_CHANNELS.event, listener);
  },
  onSkillProposal(handler) {
    const listener = (_event, payload) => handler(payload);
    electron.ipcRenderer.on(AGENT_CHANNELS.skillProposal, listener);
    return () => electron.ipcRenderer.removeListener(AGENT_CHANNELS.skillProposal, listener);
  },
  onInstallProposal(handler) {
    const listener = (_event, payload) => handler(payload);
    electron.ipcRenderer.on(AGENT_CHANNELS.installProposal, listener);
    return () => electron.ipcRenderer.removeListener(AGENT_CHANNELS.installProposal, listener);
  },
  async templateCheck(proposalKey, candidateId) {
    const answer = await electron.ipcRenderer.invoke(AGENT_CHANNELS.templateCheck, proposalKey, candidateId).catch(() => null);
    return resultOf(answer);
  },
  async templateAsIs(proposalKey, candidateId) {
    const answer = await electron.ipcRenderer.invoke(AGENT_CHANNELS.templateAsIs, proposalKey, candidateId).catch(() => null);
    return resultOf(answer);
  },
  async templateBlank(proposalKey, candidateId, request) {
    const answer = await electron.ipcRenderer.invoke(AGENT_CHANNELS.templateBlank, proposalKey, candidateId, request).catch(() => null);
    return resultOf(answer);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficeAgentWindow", api);
const SKILLS_CHANNELS = {
  list: "skills:list",
  read: "skills:read",
  suggestName: "skills:suggest-name",
  checkName: "skills:check-name",
  saveFromCard: "skills:save-from-card",
  openSettings: "skills:open-settings",
  agentNotice: "skills:agent-notice",
  agentNoticeSeen: "skills:agent-notice-seen",
  changed: "skills:changed",
  // the GitHub preview of an install a session proposed (spec 6.4): the main
  // process lets this window make these three management calls and no other
  importGitHub: "skills:import-github",
  cancelImport: "skills:cancel-import",
  install: "skills:install",
  // a template preview tab a card opened (spec 6.3)
  focusTab: "skills:focus-tab",
  previewEnded: "skills:preview-ended"
};
function previewEndedOf(raw) {
  const value = raw && typeof raw === "object" ? raw : {};
  if (typeof value.previewId !== "string" || !value.previewId) return null;
  if (value.outcome !== "saved" && value.outcome !== "unsaved") return null;
  return {
    previewId: value.previewId,
    outcome: value.outcome,
    ...typeof value.skillId === "string" ? { skillId: value.skillId } : {},
    ...typeof value.title === "string" ? { title: value.title } : {}
  };
}
function resultOf(value) {
  return value && typeof value === "object" && typeof value.ok === "boolean" ? value : { ok: false, reason: "failed" };
}
const skillsApi = {
  async list() {
    const list = await electron.ipcRenderer.invoke(SKILLS_CHANNELS.list).catch(() => []);
    return (Array.isArray(list) ? list : []).filter(
      (item) => item && typeof item === "object" && typeof item.id === "string"
    );
  },
  async read(id) {
    return resultOf(await electron.ipcRenderer.invoke(SKILLS_CHANNELS.read, String(id)).catch(() => null));
  },
  async suggestName(title) {
    const name = await electron.ipcRenderer.invoke(SKILLS_CHANNELS.suggestName, String(title)).catch(() => "");
    return typeof name === "string" ? name : "";
  },
  async checkName(name, forId) {
    const answer = await electron.ipcRenderer.invoke(SKILLS_CHANNELS.checkName, String(name), forId).catch(() => null);
    const value = answer && typeof answer === "object" ? answer : {};
    if (value.ok === true) return { ok: true };
    return {
      ok: false,
      problem: typeof value.problem === "string" ? value.problem : "empty"
    };
  },
  async saveFromCard(input) {
    return resultOf(await electron.ipcRenderer.invoke(SKILLS_CHANNELS.saveFromCard, input).catch(() => null));
  },
  async openSettings() {
    await electron.ipcRenderer.invoke(SKILLS_CHANNELS.openSettings).catch(() => void 0);
  },
  async agentNotice() {
    return await electron.ipcRenderer.invoke(SKILLS_CHANNELS.agentNotice).catch(() => false) === true;
  },
  async markAgentNoticeSeen() {
    await electron.ipcRenderer.invoke(SKILLS_CHANNELS.agentNoticeSeen).catch(() => void 0);
  },
  onChanged(listener) {
    const handler = () => listener();
    electron.ipcRenderer.on(SKILLS_CHANNELS.changed, handler);
    return () => electron.ipcRenderer.removeListener(SKILLS_CHANNELS.changed, handler);
  },
  async importGitHub(address) {
    return resultOf(
      await electron.ipcRenderer.invoke(SKILLS_CHANNELS.importGitHub, String(address)).catch(() => null)
    );
  },
  async cancelImport(token) {
    await electron.ipcRenderer.invoke(SKILLS_CHANNELS.cancelImport, token).catch(() => void 0);
  },
  async install(token, selected, onCollision) {
    return resultOf(
      await electron.ipcRenderer.invoke(SKILLS_CHANNELS.install, { token, selected, onCollision: onCollision ?? {} }).catch(() => null)
    );
  },
  async focusTab(tabId) {
    return resultOf(
      await electron.ipcRenderer.invoke(SKILLS_CHANNELS.focusTab, String(tabId)).catch(() => null)
    );
  },
  onPreviewEnded(listener) {
    const handler = (_event, raw) => {
      const ended = previewEndedOf(raw);
      if (ended) listener(ended);
    };
    electron.ipcRenderer.on(SKILLS_CHANNELS.previewEnded, handler);
    return () => electron.ipcRenderer.removeListener(SKILLS_CHANNELS.previewEnded, handler);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficeUserSkills", skillsApi);
