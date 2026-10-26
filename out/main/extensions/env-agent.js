"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const https = require("node:https");
const http = require("node:http");

let cachedEnv = null;

function findEnvPath() {
  const candidates = [
    path.join(process.cwd(), ".env"),
    path.join(__dirname, "../../../.env"),
    path.join(os.homedir(), ".aether", ".env"),
    path.join(os.homedir(), ".env")
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0]; // default save location
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
  
  cachedEnv = {
    envFile,
    openai: fileVars.OPENAI_API_KEY || process.env.OPENAI_API_KEY || "",
    anthropic: fileVars.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "",
    gemini: fileVars.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
    deepseek: fileVars.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || "",
    openrouter: fileVars.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "",
    ollamaBase: fileVars.OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    defaultModel: fileVars.DEFAULT_MODEL || process.env.DEFAULT_MODEL || "gemini-flash-lite-latest"
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
    if (!key) throw new Error("Gemini API Key not found in .env");
    const m = model || "gemini-flash-lite-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
    const contents = formattedMessages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));
    const res = await rawRequest(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, JSON.stringify({
      contents,
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      generationConfig: { temperature }
    }));
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `Gemini HTTP ${res.status}`);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    try {
      const { geminiTracker } = require("./gemini-tracker");
      const tokens = data.usageMetadata?.totalTokenCount || (text.length / 4);
      geminiTracker.recordUsage(Math.round(tokens), m);
    } catch { /* ignore */ }
    return { ok: true, content: text, raw: data };
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
    targetModel = model || "qwen2.5-jailbroken:7b";
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
