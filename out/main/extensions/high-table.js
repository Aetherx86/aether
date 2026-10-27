"use strict";

const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const AETHER_HOME = path.join(os.homedir(), ".aether");
const EXTRACTED_COUNCIL_SCRIPT = path.join(AETHER_HOME, "antigravity_council.py");

function ensureAetherDir() {
  if (!fs.existsSync(AETHER_HOME)) {
    try {
      fs.mkdirSync(AETHER_HOME, { recursive: true });
    } catch {}
  }
}

function resolveCouncilScriptPath() {
  ensureAetherDir();

  // 1. If running inside Electron and resourcesPath has unpacked scripts/
  if (process.resourcesPath) {
    const unpackedPath = path.join(process.resourcesPath, "scripts/antigravity_council.py");
    if (fs.existsSync(unpackedPath) && !unpackedPath.includes(".asar")) {
      return unpackedPath;
    }
  }

  // 2. Direct filesystem candidates (development repo outside asar)
  const devCandidates = [
    path.join(__dirname, "../../../scripts/antigravity_council.py"),
    path.join(__dirname, "../../scripts/antigravity_council.py"),
    path.join(process.cwd(), "scripts/antigravity_council.py")
  ];

  for (const cand of devCandidates) {
    try {
      if (fs.existsSync(cand) && !cand.includes(".asar")) {
        return cand;
      }
    } catch {}
  }

  // 3. If inside .asar, extract to real disk path in ~/.aether/antigravity_council.py
  const asarCandidates = [
    path.join(__dirname, "../../../scripts/antigravity_council.py"),
    path.join(__dirname, "../../scripts/antigravity_council.py"),
    path.join(__dirname, "antigravity_council.py")
  ];

  for (const asarCand of asarCandidates) {
    try {
      if (fs.existsSync(asarCand)) {
        const content = fs.readFileSync(asarCand, "utf8");
        fs.writeFileSync(EXTRACTED_COUNCIL_SCRIPT, content, { encoding: "utf8", mode: 0o755 });
        return EXTRACTED_COUNCIL_SCRIPT;
      }
    } catch {}
  }

  // 4. Fallback to Documents if present
  const docFallback = "/Users/sushikim/Documents/antigravity_council.py";
  if (fs.existsSync(docFallback)) {
    return docFallback;
  }

  if (fs.existsSync(EXTRACTED_COUNCIL_SCRIPT)) {
    return EXTRACTED_COUNCIL_SCRIPT;
  }

  return EXTRACTED_COUNCIL_SCRIPT;
}

const PYTHON_SCRIPT_PATH = resolveCouncilScriptPath();

const HIGH_TABLE_SEATS = [
  {
    index: 1,
    id: "seat-1",
    name: "Seat 1: The Logician",
    koreanTitle: "논리학자 / 분석가",
    icon: "📐",
    role: "Formal deductive rigor, explicit premises, structural validity, analytical precision.",
    defaultModel: "gemini-3.5-flash-lite",
    accentColor: "#60a5fa" // Blue
  },
  {
    index: 2,
    id: "seat-2",
    name: "Seat 2: The Visionary",
    koreanTitle: "창의적 전략가 / 발상가",
    icon: "🔮",
    role: "Lateral thinking, unconventional hypotheses, breakthrough paradigms, novel analogies.",
    defaultModel: "gemini-3.5-flash-lite",
    accentColor: "#c084fc" // Purple
  },
  {
    index: 3,
    id: "seat-3",
    name: "Seat 3: The Inquisitor",
    koreanTitle: "심문관 / 비판적 회의론자",
    icon: "⚔️",
    role: "Devil's advocate, stress-testing assumptions, failure modes, counter-examples, unstated biases.",
    defaultModel: "gemini-3.5-flash-lite",
    accentColor: "#f87171" // Red
  },
  {
    index: 4,
    id: "seat-4",
    name: "Seat 4: The Pragmatist",
    koreanTitle: "실용주의자 / 구현가",
    icon: "🛠️",
    role: "Empirical constraints, operational feasibility, ground-truth execution, real-world precedent.",
    defaultModel: "gemini-3.5-flash-lite",
    accentColor: "#fbbf24" // Amber
  },
  {
    index: 5,
    id: "seat-5",
    name: "Seat 5: The High Arbiter",
    koreanTitle: "의장 / 최종 종합 판정관",
    icon: "👑",
    role: "Forensic cross-examination, resolution of dialectical tensions, and definitive Supreme Decree.",
    defaultModel: "gemini-3.5-flash-lite",
    accentColor: "#34d399" // Emerald
  }
];

const AVAILABLE_MODELS = [
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash-Lite",
    badge: "Ultra-Fast",
    description: "Lowest latency, high quota availability (Recommended default)"
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    badge: "Balanced",
    description: "Balanced speed and deep analytical synthesis"
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    badge: "Frontier",
    description: "Frontier high-reasoning model (Auto-falls back if demand spikes)"
  },
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview",
    badge: "Fast Preview",
    description: "Lightweight preview intelligence"
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    badge: "Deep Reasoning",
    description: "High-capacity reasoning (Quota dependent)"
  },
  {
    id: "qwen2.5:7b",
    name: "Qwen 2.5 7B (Ollama)",
    badge: "Local Airgapped",
    description: "100% offline Metal accelerated local model",
    isLocal: true
  },
  {
    id: "mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit",
    name: "DeepSeek R1 Distill Qwen 14B (MLX)",
    badge: "Apple MLX 14B R1",
    description: "Local 14B DeepSeek-R1 distilled reasoning engine (Apple Metal)",
    isLocal: true
  },
  {
    id: "PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit",
    name: "Qwen 3.8 9B Abliterated (MLX 4-bit)",
    badge: "Apple Silicon",
    description: "Local uncensored sovereign MLX engine",
    isLocal: true
  }
];

let activeProcess = null;

function registerHighTableIpc(ipcMain) {
  ipcMain.handle("hyper:high-table:get-seats", () => {
    return HIGH_TABLE_SEATS;
  });

  ipcMain.handle("hyper:high-table:get-models", () => {
    return AVAILABLE_MODELS;
  });

  ipcMain.handle("hyper:high-table:abort", () => {
    if (activeProcess) {
      try {
        activeProcess.kill("SIGTERM");
        activeProcess = null;
        return { ok: true, aborted: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }
    return { ok: true, aborted: false };
  });

  ipcMain.handle("hyper:high-table:convene", async (event, { query, models }) => {
    if (!query || typeof query !== "string" || !query.trim()) {
      return { ok: false, error: "Inquiry prompt is required." };
    }

    const selectedModels = Array.isArray(models) && models.length === 5
      ? models
      : HIGH_TABLE_SEATS.map(s => s.defaultModel);

    return new Promise((resolve) => {
      const scriptPath = resolveCouncilScriptPath();
      const args = [
        scriptPath,
        "--json-events",
        "--models",
        selectedModels.join(","),
        "--prompt",
        query.trim()
      ];

      const pythonBin = fs.existsSync("/Library/Frameworks/Python.framework/Versions/3.15/bin/python3")
        ? "/Library/Frameworks/Python.framework/Versions/3.15/bin/python3"
        : (fs.existsSync("/opt/homebrew/bin/python3")
          ? "/opt/homebrew/bin/python3"
          : (fs.existsSync("/usr/bin/python3") ? "/usr/bin/python3" : "python3"));

      let envKey = process.env.GEMINI_API_KEY || "";
      if (!envKey) {
        try {
          const { resolveEnvConfig } = require("./env-agent");
          envKey = resolveEnvConfig().gemini || "";
        } catch {}
      }

      const proc = spawn(pythonBin, args, {
        env: {
          ...process.env,
          GEMINI_API_KEY: envKey,
          PYTHONUNBUFFERED: "1"
        }
      });

      activeProcess = proc;

      let buffer = "";
      let finalDecree = "";

      proc.stdout.on("data", (chunk) => {
        buffer += chunk.toString("utf8");
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep remainder

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("__HT_EVENT__:")) {
            try {
              const eventData = JSON.parse(trimmed.slice(13));
              if (eventData.type === "done" && eventData.decree) {
                finalDecree = eventData.decree;
              }
              event.sender.send("hyper:high-table:event", eventData);
            } catch (err) {
              console.error("[The High Table] JSON parse error:", err.message, line);
            }
          }
        }
      });

      let stderrOutput = "";
      proc.stderr.on("data", (chunk) => {
        stderrOutput += chunk.toString("utf8");
      });

      proc.on("close", (code) => {
        activeProcess = null;
        if (code === 0) {
          resolve({ ok: true, decree: finalDecree });
        } else {
          resolve({
            ok: false,
            error: stderrOutput || `Process exited with code ${code}`,
            decree: finalDecree
          });
        }
      });

      proc.on("error", (err) => {
        activeProcess = null;
        resolve({ ok: false, error: err.message });
      });
    });
  });
}

module.exports = {
  HIGH_TABLE_SEATS,
  AVAILABLE_MODELS,
  registerHighTableIpc
};
