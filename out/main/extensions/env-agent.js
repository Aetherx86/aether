"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const https = require("node:https");
const http = require("node:http");

let cachedEnv = null;

const STALLED_GEMINI_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
]);

function normalizeGeminiModel(raw) {
  const m = typeof raw === "string" ? raw.trim() : "";
  if (!m || STALLED_GEMINI_MODELS.has(m)) return "gemini-3.5-flash-lite";
  return m;
}

function readStoredAiSettingsFallback() {
  try {
    const p = path.join(os.homedir(), "Library", "Application Support", "Aether", "ai-settings.json");
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf8"));
    }
  } catch { /* ignore */ }
  return null;
}

function findEnvPath() {
  const candidates = [
    path.join(__dirname, "../../../.env"),
    path.join(os.homedir(), ".aether", ".env"),
    path.join(process.cwd(), ".env"),
    path.join(os.homedir(), ".env")
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch { /* ignore */ }
  }
  return path.join(os.homedir(), ".aether", ".env"); // writable fallback outside app.asar
}

function parseEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)?$/);
    if (match) {
      let val = (match[2] || "").trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[match[1]] = val;
    }
  }
  return env;
}

function getEnvConfig(forceReload = false) {
  if (cachedEnv && !forceReload) return cachedEnv;
  const envFile = findEnvPath();
  const fileVars = parseEnv(envFile);
  const stored = readStoredAiSettingsFallback();
  const providers = stored?.providers || {};

  cachedEnv = {
    envFile,
    openai: fileVars.OPENAI_API_KEY || process.env.OPENAI_API_KEY || providers.openai?.apiKey || "",
    anthropic: fileVars.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || providers.anthropic?.apiKey || "",
    gemini: fileVars.GEMINI_API_KEY || process.env.GEMINI_API_KEY || providers.gemini?.apiKey || "",
    deepseek: fileVars.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || providers.deepseek?.apiKey || "",
    openrouter: fileVars.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || providers.openrouter?.apiKey || "",
    ollamaBase: fileVars.OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
    defaultModel: normalizeGeminiModel(fileVars.DEFAULT_MODEL || process.env.DEFAULT_MODEL || "gemini-3.5-flash-lite")
  };
  return cachedEnv;
}

function saveEnvConfig(updates) {
  const envFile = findEnvPath();
  const existing = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
  let lines = existing ? existing.split(/\r?\n/) : [];
  
  const mapKey = {
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    gemini: "GEMINI_API_KEY",
    deepseek: "DEEPSEEK_API_KEY",
    openrouter: "OPENROUTER_API_KEY",
    ollamaBase: "OLLAMA_BASE_URL",
    defaultModel: "DEFAULT_MODEL"
  };

  for (const [key, val] of Object.entries(updates)) {
    const envKey = mapKey[key] || key;
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith(`${envKey}=`)) {
        lines[i] = `${envKey}="${val}"`;
        found = true;
        break;
      }
    }
    if (!found) {
      lines.push(`${envKey}="${val}"`);
    }
  }

  const dir = path.dirname(envFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(envFile, lines.join("\n"), "utf8");
  return getEnvConfig(true);
}

function maskKey(key) {
  if (!key || key.length < 8) return key ? "••••••••" : "";
  return key.slice(0, 3) + "••••••••" + key.slice(-4);
}

// Low-level fetch helper supporting http/https
function rawRequest(urlStr, options, postData) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === "https:" ? https : http;
    const req = client.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          headers: res.headers,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    req.on("error", reject);
    if (options.signal) {
      options.signal.addEventListener("abort", () => req.destroy(new Error("Aborted")));
    }
    if (postData) req.write(postData);
    req.end();
  });
}

async function executeAiChat({ provider, model, system, user, messages, apiKey, baseUrl, temperature = 0.3 }) {
  const config = getEnvConfig();
  const effectiveKey = apiKey || config[provider];
  
  const formattedMessages = messages ? [...messages] : [];
  if (!messages) {
    if (system) formattedMessages.push({ role: "system", content: system });
    if (user) formattedMessages.push({ role: "user", content: user });
  }

  if (provider === "anthropic") {
    const key = effectiveKey || config.anthropic;
    if (!key) throw new Error("Anthropic API Key not found in .env");
    const m = model || "claude-3-5-sonnet-latest";
    const res = await rawRequest("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      }
    }, JSON.stringify({
      model: m,
      max_tokens: 4096,
      system: system || "",
      messages: formattedMessages.filter(msg => msg.role !== "system").map(msg => ({ role: msg.role, content: msg.content })),
      temperature
    }));
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `Anthropic HTTP ${res.status}`);
    return { ok: true, content: data.content[0].text, raw: data };
  }

  if (provider === "gemini") {
    const key = effectiveKey || config.gemini;
    if (!key) throw new Error("Gemini API Key not found in .env or AI settings");
    const candidates = Array.from(new Set([
      normalizeGeminiModel(model || config.defaultModel),
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3-flash-preview"
    ]));
    const contents = formattedMessages.filter(msg => msg.role !== "system").map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: String(msg.content ?? "") }]
    }));
    let lastErr = null;
    for (const m of candidates) {
      try {
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), 12000);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
        const res = await rawRequest(url, {
          method: "POST",
          signal: ac.signal,
          headers: { "Content-Type": "application/json" }
        }, JSON.stringify({
          contents,
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          generationConfig: { temperature }
        })).finally(() => clearTimeout(timer));
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || `Gemini HTTP ${res.status}`);
        const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("");
        if (!text) throw new Error("Gemini returned empty text");
        try {
          const { geminiTracker } = require("./gemini-tracker");
          const tokens = data.usageMetadata?.totalTokenCount || (text.length / 4);
          geminiTracker.recordUsage(Math.round(tokens), m);
        } catch { /* ignore */ }
        return { ok: true, content: text, raw: data };
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("Gemini request failed");
  }

  // Default: OpenAI-compatible (OpenAI, DeepSeek, OpenRouter, Ollama)
  let endpoint = "https://api.openai.com/v1/chat/completions";
  let authKey = effectiveKey || config.openai;
  let targetModel = model || "gpt-4o";

  if (provider === "deepseek") {
    endpoint = "https://api.deepseek.com/chat/completions";
    authKey = effectiveKey || config.deepseek;
    targetModel = model || "deepseek-chat";
  } else if (provider === "openrouter") {
    endpoint = "https://openrouter.ai/api/v1/chat/completions";
    authKey = effectiveKey || config.openrouter;
    targetModel = model || "anthropic/claude-3.5-sonnet";
  } else if (provider === "ollama") {
    const root = baseUrl || config.ollamaBase;
    endpoint = `${root.replace(/\/+$/, "")}/api/chat`;
    authKey = "";
    targetModel = model || "qwen2.5:7b";
  }

  const headers = { "Content-Type": "application/json" };
  if (authKey) headers["Authorization"] = `Bearer ${authKey}`;

  const body = provider === "ollama" ? {
    model: targetModel,
    messages: formattedMessages,
    stream: false,
    options: { temperature }
  } : {
    model: targetModel,
    messages: formattedMessages,
    temperature
  };

  const res = await rawRequest(endpoint, {
    method: "POST",
    headers
  }, JSON.stringify(body));

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `AI HTTP ${res.status}`);
  const reply = provider === "ollama" ? data.message?.content : data.choices?.[0]?.message?.content;
  return { ok: true, content: reply || "", raw: data };
}

function registerEnvIpc(ipcMain) {
  ipcMain.handle("hyper:env:get", () => {
    const cfg = getEnvConfig(true);
    return {
      envFile: cfg.envFile,
      defaultModel: cfg.defaultModel,
      providers: {
        openai: { configured: !!cfg.openai, masked: maskKey(cfg.openai) },
        anthropic: { configured: !!cfg.anthropic, masked: maskKey(cfg.anthropic) },
        gemini: { configured: !!cfg.gemini, masked: maskKey(cfg.gemini) },
        deepseek: { configured: !!cfg.deepseek, masked: maskKey(cfg.deepseek) },
        openrouter: { configured: !!cfg.openrouter, masked: maskKey(cfg.openrouter) },
        ollama: { configured: !!cfg.ollamaBase, url: cfg.ollamaBase }
      }
    };
  });

  ipcMain.handle("hyper:env:set", (_event, updates) => {
    const updated = saveEnvConfig(updates);
    return { ok: true, envFile: updated.envFile };
  });

  ipcMain.handle("hyper:ai:chat", async (_event, params) => {
    try {
      return await executeAiChat(params);
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });
}

module.exports = {
  getEnvConfig,
  saveEnvConfig,
  executeAiChat,
  registerEnvIpc
};
