"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const https = require("node:https");
const { getEnvConfig, saveEnvConfig } = require("./env-agent");
const { geminiTracker } = require("./gemini-tracker");

const DEFAULT_TOKEN_BUDGET = 1048576; // 1,048,576 tokens (1M Gemini Flash-Lite context/quota pool)

const SUPPORTED_AUDIO_MIME_BY_EXT = {
  ".wav": "audio/wav",
  ".mp3": "audio/mp3",
  ".m4a": "audio/mp4",
  ".mp4": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".oga": "audio/ogg",
  ".flac": "audio/flac",
  ".webm": "audio/webm"
};

let sessionTokensUsed = 0;
let runtimeApiKeyOverride = "";

function getHeimdallDataDir() {
  const dir = path.join(os.homedir(), "Library", "Application Support", "Aether");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // fallback to ~/.aether
      const fallback = path.join(os.homedir(), ".aether");
      if (!fs.existsSync(fallback)) fs.mkdirSync(fallback, { recursive: true });
      return fallback;
    }
  }
  return dir;
}

function getUsageFilePath() {
  return path.join(getHeimdallDataDir(), "heimdall-usage.json");
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function loadHeimdallUsage() {
  const filePath = getUsageFilePath();
  const today = getTodayString();
  const baseStats = geminiTracker.getQuotaStats();

  const defaultState = {
    date: today,
    tokenBudget: DEFAULT_TOKEN_BUDGET,
    tokensUsedToday: baseStats.tokensToday || 0,
    promptTokensToday: 0,
    audioTokensToday: 0,
    textTokensToday: 0,
    candidatesTokensToday: 0,
    requestsToday: baseStats.used || 0,
    lifetimeTokens: baseStats.lifetimeTokens || 0,
    lifetimeRequests: baseStats.lifetimeRequests || 0,
    lastCall: null
  };

  if (!fs.existsSync(filePath)) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (parsed.date !== today) {
      parsed.date = today;
      parsed.tokensUsedToday = 0;
      parsed.promptTokensToday = 0;
      parsed.audioTokensToday = 0;
      parsed.textTokensToday = 0;
      parsed.candidatesTokensToday = 0;
      parsed.requestsToday = 0;
    }
    if (!parsed.tokenBudget || parsed.tokenBudget < 1000) {
      parsed.tokenBudget = DEFAULT_TOKEN_BUDGET;
    }
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

function saveHeimdallUsage(state) {
  try {
    fs.writeFileSync(getUsageFilePath(), JSON.stringify(state, null, 2), "utf8");
  } catch (err) {
    console.error("[Heimdall] Failed to save token usage:", err.message);
  }
}

function calculateTokenQuota(state, budgetOverride) {
  const tokenBudget = Number(budgetOverride || state?.tokenBudget || DEFAULT_TOKEN_BUDGET);
  const used = Math.max(0, Number(state?.tokensUsedToday || 0));
  const remaining = Math.max(0, tokenBudget - used);
  const usedPctRaw = tokenBudget > 0 ? (used / tokenBudget) * 100 : 0;
  const usedPercentage = Math.min(100, Math.max(0, Number(usedPctRaw.toFixed(4))));
  const remainingPercentage = Math.min(100, Math.max(0, Number((100 - usedPctRaw).toFixed(4))));

  return {
    date: state?.date || getTodayString(),
    tokenBudget,
    tokensUsedToday: used,
    sessionTokensUsed,
    promptTokensToday: Number(state?.promptTokensToday || 0),
    audioTokensToday: Number(state?.audioTokensToday || 0),
    textTokensToday: Number(state?.textTokensToday || 0),
    candidatesTokensToday: Number(state?.candidatesTokensToday || 0),
    requestsToday: Number(state?.requestsToday || 0),
    lifetimeTokens: Number(state?.lifetimeTokens || 0),
    lifetimeRequests: Number(state?.lifetimeRequests || 0),
    tokensRemaining: remaining,
    usedPercentage,
    remainingPercentage,
    lastCall: state?.lastCall || null
  };
}

function recordHeimdallTokenUsage(usageMetadata = {}, operation = "summarize", model = "gemini-flash-lite-latest") {
  const state = loadHeimdallUsage();
  const promptTokens = Number(usageMetadata.promptTokenCount || 0);
  const candidatesTokens = Number(
    (usageMetadata.candidatesTokenCount || 0) + (usageMetadata.thoughtsTokenCount || 0)
  );
  const totalTokens = Number(usageMetadata.totalTokenCount || (promptTokens + candidatesTokens));

  let audioTokens = 0;
  let textTokens = 0;
  if (Array.isArray(usageMetadata.promptTokensDetails)) {
    for (const detail of usageMetadata.promptTokensDetails) {
      if (detail.modality === "AUDIO") audioTokens += Number(detail.tokenCount || 0);
      else if (detail.modality === "TEXT") textTokens += Number(detail.tokenCount || 0);
    }
  }
  if (audioTokens === 0 && textTokens === 0 && promptTokens > 0) {
    textTokens = promptTokens;
  }

  state.tokensUsedToday = (state.tokensUsedToday || 0) + totalTokens;
  state.promptTokensToday = (state.promptTokensToday || 0) + promptTokens;
  state.audioTokensToday = (state.audioTokensToday || 0) + audioTokens;
  state.textTokensToday = (state.textTokensToday || 0) + textTokens;
  state.candidatesTokensToday = (state.candidatesTokensToday || 0) + candidatesTokens;
  state.requestsToday = (state.requestsToday || 0) + 1;
  state.lifetimeTokens = (state.lifetimeTokens || 0) + totalTokens;
  state.lifetimeRequests = (state.lifetimeRequests || 0) + 1;
  sessionTokensUsed += totalTokens;

  const budget = state.tokenBudget || DEFAULT_TOKEN_BUDGET;
  const callRemaining = Math.max(0, budget - state.tokensUsedToday);
  const callUsedPct = budget > 0 ? (state.tokensUsedToday / budget) * 100 : 0;

  state.lastCall = {
    timestamp: new Date().toISOString(),
    operation,
    model,
    promptTokens,
    audioTokens,
    textTokens,
    candidatesTokens,
    totalTokens,
    remainingTokens: callRemaining,
    usedPercentage: Number(Math.min(100, callUsedPct).toFixed(4)),
    remainingPercentage: Number(Math.max(0, 100 - callUsedPct).toFixed(4))
  };

  saveHeimdallUsage(state);

  try {
    if (totalTokens > 0) {
      geminiTracker.recordUsage(totalTokens, model);
    }
  } catch {
    // ignore tracker sync failure
  }

  return calculateTokenQuota(state);
}

function maskApiKey(key) {
  if (!key) return "";
  if (key.length <= 10) return "••••••••";
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

function resolveGeminiKey(explicitKey) {
  if (explicitKey && typeof explicitKey === "string" && explicitKey.trim()) {
    return { key: explicitKey.trim(), source: "custom" };
  }
  if (runtimeApiKeyOverride) {
    return { key: runtimeApiKeyOverride, source: "custom" };
  }
  const cfg = getEnvConfig(true);
  if (cfg.gemini && cfg.gemini.trim()) {
    return { key: cfg.gemini.trim(), source: "env", envFile: cfg.envFile };
  }
  return { key: "", source: "none", envFile: cfg.envFile };
}

function getHeimdallStatus() {
  const resolved = resolveGeminiKey();
  const state = loadHeimdallUsage();
  const quota = calculateTokenQuota(state);

  return {
    ok: true,
    hasApiKey: Boolean(resolved.key),
    isKeyFromEnv: resolved.source === "env",
    maskedKey: maskApiKey(resolved.key),
    envFile: resolved.envFile || "",
    defaultModel: "gemini-flash-lite-latest",
    quota
  };
}

function classifySegmentLanguage(text) {
  if (!text || typeof text !== "string") {
    return { displayName: "🇰🇷 한국어", confidence: 1.0 };
  }

  let hangulCount = 0;
  let latinCount = 0;
  let kanaCount = 0;
  let cjkCount = 0;

  for (const ch of text) {
    const code = ch.codePointAt(0);
    if ((code >= 0xac00 && code <= 0xd7af) || (code >= 0x1100 && code <= 0x11ff) || (code >= 0x3130 && code <= 0x318f)) {
      hangulCount++;
    } else if ((code >= 0x3040 && code <= 0x309f) || (code >= 0x30a0 && code <= 0x30ff)) {
      kanaCount++;
    } else if (code >= 0x4e00 && code <= 0x9fff) {
      cjkCount++;
    } else if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) {
      latinCount++;
    }
  }

  const total = hangulCount + latinCount + kanaCount + cjkCount;
  if (total === 0) return { displayName: "🇰🇷 한국어", confidence: 1.0 };
  if (kanaCount > 0) return { displayName: "🇯🇵 日本語", confidence: 0.95 };
  if (cjkCount >= 2 && hangulCount === 0 && latinCount === 0) {
    return { displayName: "🇨🇳 中文", confidence: 0.90 };
  }
  if (hangulCount >= 2 && latinCount >= 2) {
    return { displayName: "🇰🇷 한/영 혼용 (Bilingual)", confidence: 0.99 };
  }
  if (hangulCount >= 1) {
    return { displayName: "🇰🇷 한국어", confidence: 0.98 };
  }
  if (latinCount >= 1) {
    return { displayName: "🇺🇸 English", confidence: 0.92 };
  }
  return { displayName: "🌐 다국어", confidence: 0.85 };
}

function geminiPostJson(modelName, apiKey, payload, timeoutMs = 45000) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const bodyStr = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const req = https.request(
      endpoint,
      {
        method: "POST",
        timeout: timeoutMs,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr)
        }
      },
      (res) => {
        let chunks = "";
        res.on("data", (d) => {
          chunks += d;
        });
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(chunks);
          } catch {
            return reject(new Error(`Invalid JSON from Gemini API (HTTP ${res.statusCode})`));
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const msg = json?.error?.message || `Gemini HTTP ${res.statusCode}`;
            return reject(new Error(msg));
          }
          resolve(json);
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Gemini API request timed out"));
    });
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

async function transcribeAndDiarizeAudio(params = {}) {
  const {
    audioBase64,
    filePath,
    mimeType = "audio/wav",
    locale = "auto",
    speakerProfiles = [],
    activeSpeakerId = 1,
    detectedPitchHz = 0,
    smartDiarization = true,
    model = "gemini-flash-lite-latest",
    apiKey
  } = params;

  const resolved = resolveGeminiKey(apiKey);
  if (!resolved.key) {
    throw new Error("Gemini API 키가 설정되지 않았습니다. .env 또는 Heimdall 설정 탭에서 GEMINI_API_KEY를 입력해주세요.");
  }

  let base64Payload = audioBase64;
  let effectiveMime = mimeType;

  if (!base64Payload && filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`오디오 파일을 찾을 수 없습니다: ${filePath}`);
    }
    const ext = path.extname(filePath).toLowerCase();
    effectiveMime = SUPPORTED_AUDIO_MIME_BY_EXT[ext] || "audio/wav";
    const fileBuf = fs.readFileSync(filePath);
    base64Payload = fileBuf.toString("base64");
  }

  if (!base64Payload) {
    throw new Error("분석할 오디오 데이터가 비어 있습니다.");
  }

  const profileDesc = Array.isArray(speakerProfiles) && speakerProfiles.length > 0
    ? speakerProfiles
        .map((p) => `Speaker ${p.id} ("${p.name || `화자 ${p.id}`}", avg pitch ~${Math.round(p.averagePitchHz || 150)}Hz)`)
        .join("; ")
    : 'Speaker 1 ("화자 1", ~125Hz); Speaker 2 ("화자 2", ~215Hz); Speaker 3 ("화자 3", ~170Hz)';

  const pitchHint = detectedPitchHz > 60
    ? `Measured live fundamental pitch (F0) of this audio clip: ${Math.round(detectedPitchHz)} Hz.`
    : "Live pitch not pre-locked; infer speaker turns directly from vocal timbre, pitch, and turn-taking.";

  const localeInstruction = locale && locale !== "auto"
    ? `Primary expected language locale: ${locale} (preserve technical English terms if code-switching occurs).`
    : "Automatically detect the spoken language(s) accurately (Korean, English, Japanese, Chinese, Spanish, French, German, or bilingual code-switching).";

  const diarizationRule = smartDiarization
    ? `Perform precise Speaker Diarization: separate distinct voices into speaker turns (speakerId 1, 2, 3, etc.) matching known profiles [${profileDesc}]. ${pitchHint} Default speaker if single consistent voice matches active speaker: Speaker ${activeSpeakerId}.`
    : `Assign speech to active Speaker ${activeSpeakerId} unless multiple clearly distinct speakers are talking in the same audio.`;

  const prompt = [
    "You are Heimdall, an elite acoustic transcription and biometric speaker diarization engine.",
    localeInstruction,
    diarizationRule,
    "CRITICAL VERBATIM RULE: Transcribe every utterance strictly verbatim in the EXACT language spoken in the audio. NEVER translate spoken words into another language (keep English in English, Korean in Korean, and preserve mixed bilingual terms as spoken).",
    "CRITICAL NOISE & SILENCE GATE: If the audio contains ONLY silence, room tone, breathing, coughing, throat clearing, sneezing, keyboard typing, mouse clicks, or unintelligible noise with NO spoken words, return {\"isNoiseOnly\": true, \"noiseLabel\": \"기침/배경 소음 또는 무음\", \"segments\": []}. NEVER hallucinate timestamps like '00:00' or filler words on silent/noisy audio.",
    "Return strictly valid JSON with schema:",
    "{\"isNoiseOnly\": boolean, \"noiseLabel\": string, \"segments\": [{\"speakerId\": number, \"speakerName\": string, \"language\": string, \"text\": string}]}"
  ].join("\n");

  const targetModel = model === "local-nl" ? "gemini-flash-lite-latest" : model;

  const responseJson = await geminiPostJson(targetModel, resolved.key, {
    contents: [
      {
        parts: [
          { inlineData: { mimeType: effectiveMime, data: base64Payload } },
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
      maxOutputTokens: 4096
    }
  });

  const quota = recordHeimdallTokenUsage(responseJson.usageMetadata || {}, "diarize", targetModel);

  const rawText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        isNoiseOnly: !cleaned,
        noiseLabel: "",
        segments: cleaned ? [{ speakerId: activeSpeakerId, text: cleaned }] : []
      };
    }
  }

  const speakerMap = {};
  if (Array.isArray(speakerProfiles)) {
    for (const p of speakerProfiles) {
      if (p && p.id) speakerMap[p.id] = p.name || `화자 ${p.id}`;
    }
  }

  const normalizedSegments = Array.isArray(parsed.segments)
    ? parsed.segments
        .filter((s) => s && typeof s.text === "string" && s.text.trim().length > 0)
        .filter((s) => !/^(00:00|0:00|silence|silent|\[silence\]|\(무음\))$/i.test(s.text.trim()))
        .map((s) => {
          const spkId = Number.isFinite(Number(s.speakerId)) && Number(s.speakerId) >= 1 ? Number(s.speakerId) : activeSpeakerId;
          const cleanText = s.text.trim();
          const langInfo = classifySegmentLanguage(cleanText);
          return {
            speakerId: spkId,
            speakerName: speakerMap[spkId] || s.speakerName || `화자 ${spkId}`,
            detectedLanguage: langInfo.displayName,
            text: cleanText,
            speakerPitchHz: detectedPitchHz > 60 ? Math.round(detectedPitchHz) : null
          };
        })
    : [];

  return {
    ok: true,
    isNoiseOnly: Boolean(parsed.isNoiseOnly) || normalizedSegments.length === 0,
    noiseLabel: parsed.noiseLabel || "",
    segments: normalizedSegments,
    usage: quota.lastCall,
    quota
  };
}

function generateSmartLocalSummary(text, languageHint = "한국어") {
  const trimmed = (text || "").trim();
  const sentences = trimmed
    .split(/(?<=[.!?。！？\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^\[.*\]\s*\d{2}:\d{2}:?$/.test(s));

  const words = trimmed
    .replace(/\[[^\]]+\]/g, " ")
    .split(/[\s,.;:!?()[\]{}"'`~<>\/\\]+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 2);

  const stopWords = new Set([
    "the", "and", "for", "that", "this", "with", "from", "have", "are", "was", "were", "will", "about",
    "화자", "발언", "말하는", "한국어", "english", "중입니다", "그리고", "그래서", "하지만", "있습니다", "합니다", "있는", "하는"
  ]);

  const freq = {};
  for (const w of words) {
    if (!stopWords.has(w) && !/^\d+$/.test(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }

  const topKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k]) => k);

  // Extract speaker breakdown
  const speakerMap = {};
  const blocks = trimmed.split(/\n{2,}/);
  for (const block of blocks) {
    const match = block.match(/^\[([^\]•]+)(?:[^\]]*)\][^:\n]*:\s*([\s\S]+)$/);
    if (match) {
      const spk = match[1].trim();
      const body = match[2].trim().replace(/\s+/g, " ");
      if (body) {
        if (!speakerMap[spk]) speakerMap[spk] = [];
        speakerMap[spk].push(body);
      }
    }
  }

  const contentSentences = sentences
    .map((s) => s.replace(/^\[[^\]]+\][^:\n]*:\s*/, "").trim())
    .filter(Boolean);

  const rankedSentences = contentSentences.length <= 3
    ? contentSentences
    : contentSentences
        .map((s) => {
          const lower = s.toLowerCase();
          const score = topKeywords.reduce((acc, kw) => acc + (lower.includes(kw) ? (freq[kw] || 1) : 0), 0);
          return { s, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item) => item.s);

  let md = "### 📌 핵심 요약 (Executive Summary)\n";
  if (rankedSentences.length === 0) {
    md += `- ${trimmed.slice(0, 200)}\n`;
  } else {
    for (const s of rankedSentences) {
      md += `- ${s}\n`;
    }
  }

  const speakers = Object.keys(speakerMap);
  if (speakers.length > 0) {
    md += "\n### 👥 화자별 발언 분석 (Speaker Diarization)\n";
    for (const spk of speakers) {
      const sample = speakerMap[spk].slice(0, 2).join(" / ");
      md += `- **${spk}** (${speakerMap[spk].length}회 발화): ${sample}\n`;
    }
  }

  md += "\n### 🏷️ 핵심 키워드\n";
  md += topKeywords.length > 0 ? topKeywords.map((k) => `\`#${k}\``).join(" ") + "\n" : "_감지된 주요 키워드 없음_\n";

  const estSec = Math.max(1, Math.round(words.length / 2.5));
  md += "\n### 📊 음성 텍스트 통계\n";
  md += `- **총 단어 수**: 약 ${words.length}단어 (${contentSentences.length || 1}문장)\n`;
  md += `- **예상 발화 시간**: 약 ${estSec}초\n`;
  md += `- **감지 언어**: ${languageHint || "한국어"}\n`;
  md += "\n> _💡 Heimdall 로컬 온디바이스 엔진으로 생성된 요약입니다. (Gemini 토큰 소모 0)_";

  return {
    markdown: md,
    wordCount: words.length,
    detectedTopics: topKeywords
  };
}

async function summarizeTranscript(params = {}) {
  const {
    transcript = "",
    languageHint = "한국어",
    engine = "gemini-flash-lite-latest",
    apiKey
  } = params;

  const trimmed = transcript.trim();
  if (!trimmed) {
    throw new Error("요약할 전사 텍스트가 비어 있습니다. 먼저 음성을 녹음하거나 텍스트를 입력해주세요.");
  }

  if (engine === "local-nl") {
    const localRes = generateSmartLocalSummary(trimmed, languageHint);
    const quota = calculateTokenQuota(loadHeimdallUsage());
    return {
      ok: true,
      engine: "local-nl",
      markdown: localRes.markdown,
      wordCount: localRes.wordCount,
      detectedTopics: localRes.detectedTopics,
      usage: null,
      quota
    };
  }

  const resolved = resolveGeminiKey(apiKey);
  if (!resolved.key) {
    throw new Error("Gemini API 키가 설정되지 않았습니다. .env 또는 설정 탭에서 GEMINI_API_KEY를 입력해주세요.");
  }

  const modelName = engine === "gemini-3.5-flash-lite" ? "gemini-3.5-flash-lite" : "gemini-flash-lite-latest";

  const prompt = [
    "당신은 Aether 플랫폼의 Heimdall(헤임달) 음향 지능 및 회의록 분석 AI입니다.",
    "아래 화자 분리된 음성 전사 내용을 분석하여 한눈에 파악할 수 있는 구조화된 마크다운 보고서를 작성해주세요.",
    "전사 텍스트에 [화자 1], [화자 2] 등 여러 발언자가 표시되어 있다면 각 화자별 핵심 주장과 입장을 명확히 분리하여 요약해주세요.",
    "",
    "[전사 내용]:",
    trimmed,
    "",
    "[작성 형식]:",
    "### 📌 3줄 핵심 요약",
    "- 핵심 요약 1",
    "- 핵심 요약 2",
    "- 핵심 요약 3",
    "",
    "### 👥 화자별 발언 및 의견 요약 (화자 분리)",
    "- **화자 1**: 주요 발언 및 핵심 관점",
    "- **화자 2**: 주요 발언 및 피드백 (단일 화자인 경우 해당 화자 중심 정리)",
    "",
    "### 📋 주요 논의 사항 및 세부 결정",
    "- 세부 포인트 정리",
    "",
    "### 🎯 액션 아이템 / 다음 할 일 (Action Items)",
    "- [ ] 실행 항목 1",
    "- [ ] 실행 항목 2",
    "",
    "### 🏷️ 핵심 키워드",
    "`#키워드1` `#키워드2` `#키워드3`",
    "",
    `언어 힌트: ${languageHint || "한국어"} (원문 언어에 맞춰 자연스럽고 전문적인 톤으로 작성)`
  ].join("\n");

  const responseJson = await geminiPostJson(modelName, resolved.key, {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.35,
      topP: 0.9,
      maxOutputTokens: 2048
    }
  });

  const summaryText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!summaryText.trim()) {
    throw new Error("Gemini 요약 응답이 비어 있습니다.");
  }

  const quota = recordHeimdallTokenUsage(responseJson.usageMetadata || {}, "summarize", modelName);
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  return {
    ok: true,
    engine: modelName,
    markdown: summaryText.trim(),
    wordCount,
    usage: quota.lastCall,
    quota
  };
}

function registerHeimdallIpc(ipcMain, dialogModule = null) {
  ipcMain.handle("hyper:heimdall:status", () => {
    try {
      return getHeimdallStatus();
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("hyper:heimdall:quota", () => {
    try {
      return { ok: true, quota: calculateTokenQuota(loadHeimdallUsage()) };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("hyper:heimdall:set-key", (_event, { apiKey, persistToEnv = true } = {}) => {
    try {
      const cleaned = typeof apiKey === "string" ? apiKey.trim() : "";
      runtimeApiKeyOverride = cleaned;
      if (persistToEnv && cleaned) {
        saveEnvConfig({ gemini: cleaned });
      }
      return getHeimdallStatus();
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("hyper:heimdall:set-budget", (_event, { tokenBudget } = {}) => {
    try {
      const budget = Math.max(1000, Number(tokenBudget) || DEFAULT_TOKEN_BUDGET);
      const state = loadHeimdallUsage();
      state.tokenBudget = budget;
      saveHeimdallUsage(state);
      return { ok: true, quota: calculateTokenQuota(state) };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("hyper:heimdall:reset-session", () => {
    sessionTokensUsed = 0;
    return { ok: true, quota: calculateTokenQuota(loadHeimdallUsage()) };
  });

  ipcMain.handle("hyper:heimdall:transcribe", async (_event, params) => {
    try {
      return await transcribeAndDiarizeAudio(params);
    } catch (err) {
      return { ok: false, error: err.message, quota: calculateTokenQuota(loadHeimdallUsage()) };
    }
  });

  ipcMain.handle("hyper:heimdall:summarize", async (_event, params) => {
    try {
      return await summarizeTranscript(params);
    } catch (err) {
      return { ok: false, error: err.message, quota: calculateTokenQuota(loadHeimdallUsage()) };
    }
  });

  ipcMain.handle("hyper:heimdall:pick-audio", async () => {
    try {
      const el = dialogModule || require("electron").dialog;
      const picked = await el.showOpenDialog({
        title: "Heimdall — 분석 및 화자 분리할 오디오 파일 선택",
        properties: ["openFile"],
        filters: [
          { name: "Audio Files", extensions: ["wav", "mp3", "m4a", "aac", "ogg", "flac", "webm", "mp4"] }
        ]
      });
      if (picked.canceled || !picked.filePaths?.length) {
        return { ok: false, canceled: true };
      }
      const filePath = picked.filePaths[0];
      const stat = fs.statSync(filePath);
      return {
        ok: true,
        filePath,
        fileName: path.basename(filePath),
        sizeBytes: stat.size
      };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("hyper:heimdall:save-nibelungen", (_event, { title, transcript, summary } = {}) => {
    try {
      const { saveNote } = require("./nibelungen");
      const stamp = new Date().toISOString().replace("T", " ").slice(0, 16);
      const noteTitle = title || `Heimdall Audio Brief (${stamp})`;
      const content = [
        `# 🎙️ ${noteTitle}`,
        "",
        "Linked Subsystem: [[Architecture]] • [[Heimdall Audio Intelligence]]",
        "",
        summary ? `## ✨ AI Executive Summary\n\n${summary}\n` : "",
        "## 🗣️ Speaker-Diarized Transcript",
        "",
        transcript || "_No transcript recorded._"
      ]
        .filter(Boolean)
        .join("\n");

      const saved = saveNote({
        title: noteTitle,
        tags: ["heimdall", "diarization", "audio-summary"],
        content
      });
      return { ok: true, note: saved };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });
}

module.exports = {
  DEFAULT_TOKEN_BUDGET,
  loadHeimdallUsage,
  calculateTokenQuota,
  recordHeimdallTokenUsage,
  getHeimdallStatus,
  classifySegmentLanguage,
  generateSmartLocalSummary,
  transcribeAndDiarizeAudio,
  summarizeTranscript,
  registerHeimdallIpc
};
