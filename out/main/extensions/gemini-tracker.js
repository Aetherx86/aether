"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const LOCKED_KEY = process.env.GEMINI_API_KEY || "";
const DAILY_REQUEST_LIMIT = 1500; // Gemini Free Tier RPD (Requests Per Day)
const DAILY_TOKEN_LIMIT = 1000000; // Gemini Free Tier TPM pool

function getUsageFilePath() {
  const userDir = path.join(os.homedir(), "Library", "Application Support", "Aether");
  if (!fs.existsSync(userDir)) {
    try { fs.mkdirSync(userDir, { recursive: true }); } catch { /* ignore */ }
  }
  return path.join(userDir, "gemini-usage.json");
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function loadUsage() {
  const p = getUsageFilePath();
  const today = getTodayString();
  const defaultUsage = {
    date: today,
    requestsToday: 0,
    tokensToday: 0,
    lifetimeTokens: 0,
    lifetimeRequests: 0,
    lockedKey: LOCKED_KEY
  };

  if (!fs.existsSync(p)) return defaultUsage;

  try {
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    if (data.date !== today) {
      // New day: reset daily counters, keep lifetime
      data.date = today;
      data.requestsToday = 0;
      data.tokensToday = 0;
    }
    data.lockedKey = LOCKED_KEY;
    return data;
  } catch {
    return defaultUsage;
  }
}

function saveUsage(data) {
  try {
    fs.writeFileSync(getUsageFilePath(), JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("[GeminiTracker] Failed to persist usage:", err);
  }
}

class GeminiUsageTracker {
  constructor() {
    this.usage = loadUsage();
  }

  recordUsage(tokenCount = 0, model = "gemini-2.5-flash") {
    const today = getTodayString();
    if (this.usage.date !== today) {
      this.usage.date = today;
      this.usage.requestsToday = 0;
      this.usage.tokensToday = 0;
    }

    const tokens = typeof tokenCount === "number" && tokenCount > 0 ? tokenCount : 150; // estimate if not reported
    this.usage.requestsToday += 1;
    this.usage.tokensToday += tokens;
    this.usage.lifetimeTokens += tokens;
    this.usage.lifetimeRequests += 1;
    this.usage.lastModel = model;
    this.usage.lastUsed = new Date().toISOString();

    saveUsage(this.usage);
  }

  getQuotaStats() {
    const today = getTodayString();
    if (this.usage.date !== today) {
      this.usage.date = today;
      this.usage.requestsToday = 0;
      this.usage.tokensToday = 0;
      saveUsage(this.usage);
    }

    const usedReq = this.usage.requestsToday;
    const remReq = Math.max(0, DAILY_REQUEST_LIMIT - usedReq);
    const reqPercent = Math.max(0, Math.min(100, Math.round((remReq / DAILY_REQUEST_LIMIT) * 100)));

    const usedTokens = this.usage.tokensToday;
    const remTokens = Math.max(0, DAILY_TOKEN_LIMIT - usedTokens);
    const tokenPercent = Math.max(0, Math.min(100, Math.round((remTokens / DAILY_TOKEN_LIMIT) * 100)));

    return {
      used: usedReq,
      limit: DAILY_REQUEST_LIMIT,
      remaining: remReq,
      percentage: reqPercent,
      tokensToday: usedTokens,
      tokensUsed: usedTokens,
      tokenLimit: DAILY_TOKEN_LIMIT,
      tokenRemaining: remTokens,
      tokenPercentage: tokenPercent,
      lifetimeTokens: this.usage.lifetimeTokens,
      lifetimeRequests: this.usage.lifetimeRequests,
      locked: true,
      provider: "gemini"
    };
  }

  isKeyLocked() {
    return true;
  }

  getLockedKey() {
    return LOCKED_KEY;
  }
}

const geminiTracker = new GeminiUsageTracker();

module.exports = {
  geminiTracker,
  LOCKED_KEY
};
