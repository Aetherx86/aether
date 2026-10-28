"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const VAULT_DIR = path.join(os.homedir(), ".aether", "nibelungen");

function ensureVault() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }

  // Populate default starter notes if empty
  const defaultNotes = [
    {
      id: "welcome-nibelungen",
      title: "Welcome to Nibelungen",
      tags: ["wiki", "intro", "knowledge", "guide"],
      content: `# Welcome to Nibelungen 🗝️\n\nNibelungen is your local-first personal knowledge graph and Obsidian-style wiki inside **Aether**.\n\n## Interactive Architecture & Sovereign Intelligence\n- **Multi-Agent Deliberation**: Explore [[The High Table]] and its 5 specialized philosophical seats: [[The Logician]], [[The Visionary]], [[The Inquisitor]], [[The Pragmatist]], and [[The High Arbiter]].\n- **Sovereign Airgapped AI**: Read about [[Mímisbrunnr]], running local [[DeepSeek R1]] 14B and [[Qwen 3.8]] on [[Apple Silicon M4]].\n- **Privacy & Defense**: Learn how [[Aetherum Browser]], [[Tor Network]], and [[Sleipnir]] bypass surveillance.\n- **Zero-Knowledge Storage**: Secure files with [[Fafnir Vault]].\n- **Developer Observability**: Inspect tools with [[Yggdrasil]], [[Ratatoskr]], and [[Heimdall]].\n\nCheck out the master [[Architecture]] graph to see all nodes connected!`
    },
    {
      id: "architecture",
      title: "Architecture",
      tags: ["dev", "system", "aether", "master"],
      content: `# Aether Sovereign System Architecture ⚡\n\nUnified privacy, intelligence, and productivity environment created by Jeffrey Kim.\n\n## 1. Epistemic & Strategic Intelligence\n- [[The High Table]]: 5-seat multi-agent council with 3-stage deliberation pipeline.\n- [[The Logician]]: Formal deductive rigor & premise validation.\n- [[The Visionary]]: Lateral thinking & breakthrough paradigms.\n- [[The Inquisitor]]: Critical skepticism & assumption stress-testing.\n- [[The Pragmatist]]: Operational feasibility & resource constraints.\n- [[The High Arbiter]]: Executive synthesis & definitive decree.\n- [[Mímisbrunnr]]: Airgapped local intelligence engine on Apple Silicon.\n- [[DeepSeek R1]]: 14B 4-bit reasoning model with <think> introspection.\n- [[Apple Silicon M4]]: 16 GB Unified Memory Metal acceleration.\n\n## 2. Privacy & Network Freedom\n- [[Aetherum Browser]]: Multi-session privacy web browser.\n- [[Tor Network]]: SOCKS5 routing on 127.0.0.1:9050.\n- [[Sleipnir]]: HTTPS SNI packet splitting and anti-DPI proxy on 127.0.0.1:8087.\n- [[Proton Mail Security]]: End-to-end encrypted messaging.\n\n## 3. Cryptography & Knowledge\n- [[Fafnir Vault]]: Zero-knowledge AES-256-GCM encrypted document drive.\n- [[Nibelungen]]: Local-first personal knowledge graph & bidirectional wiki.\n\n## 4. Execution & Observability\n- [[Yggdrasil]]: Native truecolor macOS shell workspace.\n- [[Ratatoskr]]: Visual REST API client & SQLite table inspector.\n- [[Heimdall]]: Acoustic biometric speaker diarization & live token telemetry.`
    },
    {
      id: "the-high-table",
      title: "The High Table",
      tags: ["council", "multi-agent", "strategy", "deliberation"],
      content: `# The High Table 🏛️\n\n**The High Table** is Aether's multi-agent epistemic and strategic deliberation council. It convenes 5 specialized AI seats to examine complex problems through rigorous dialectical reasoning.\n\n## The 5 Philosophical Seats\n1. [[The Logician]] (Seat 1): Formal deductive rigor, explicit premises, syllogistic validity.\n2. [[The Visionary]] (Seat 2): Lateral thinking, unconventional hypotheses, breakthrough paradigms.\n3. [[The Inquisitor]] (Seat 3): Devil's advocacy, stress-testing assumptions, failure modes.\n4. [[The Pragmatist]] (Seat 4): Real-world operational feasibility, execution timelines, engineering bounds.\n5. [[The High Arbiter]] (Seat 5): Epistemic consensus synthesis, final strategic verdict.\n\n## 3-Stage Deliberation Pipeline\n- **Stage 1 (Independent Analysis)**: Each seat analyzes the prompt in complete isolation.\n- **Stage 2 (Cross-Examination)**: Seats review and critique each other's theses, exposing contradictions.\n- **Stage 3 (Consensus & Decree)**: [[The High Arbiter]] synthesizes the debate into a binding decree.\n\n## Engine & Formatting\n- **Model Support**: Hybrid execution across cloud models (Gemini 3.5 Flash-Lite) and local models via [[Mímisbrunnr]] and [[DeepSeek R1]].\n- **Dual API Bridge**: Connects seamlessly to port 8080 (OpenAI-compatible mlx_lm server) and port 8088.\n- **Mathematical Rendering**: Built-in LaTeX and Typst formatting for fractions, matrices, inline math, and truth tables.\n- **View Modes**: Grid (2x3 overview), Tabs (individual deep-dive), Stacked (chronological review), and Fullscreen Focus Modal.\n- **Keyboard Shortcut**: Cmd+Enter to convene immediately.\n\nConnected to [[Architecture]], [[Mímisbrunnr]], and [[Heimdall]].`
    },
    {
      id: "the-logician",
      title: "The Logician",
      tags: ["council", "logic", "seat-1", "epistemology"],
      content: `# Seat 1: The Logician 📐\n\nThe analytical foundation of [[The High Table]].\n\n## Mission & Philosophy\n- **Formal Deductive Rigor**: Validates that all conclusions strictly follow from stated premises.\n- **Premise Identification**: Flags implicit assumptions and insists on formal definitions.\n- **Structural Truth Tables**: Employs symbolic logic, Boolean algebra, and systematic proofs.\n\n## Inter-Seat Dynamics\n- Pairs with [[The Visionary]] to provide rigorous rails for creative hypotheses.\n- Defends its logical constructs against adversarial stress-testing by [[The Inquisitor]].\n- In sovereign offline councils, Seat 1 is powered by [[DeepSeek R1]] via [[Mímisbrunnr]].\n\nPart of [[The High Table]] and [[Architecture]].`
    },
    {
      id: "the-visionary",
      title: "The Visionary",
      tags: ["council", "creativity", "seat-2", "strategy"],
      content: `# Seat 2: The Visionary 🔮\n\nThe creative and exploratory intelligence of [[The High Table]].\n\n## Mission & Philosophy\n- **Lateral Thinking**: Generates non-linear solutions, cross-disciplinary analogies, and unorthodox angles.\n- **Paradigm Breakthroughs**: Refuses conventional orthodoxies and asks 'what if' from first principles.\n- **Speculative Synthesis**: Imagines future states, unforeseen technological intersections, and emergent patterns.\n\n## Inter-Seat Dynamics\n- Expands the solution space beyond the strict axioms of [[The Logician]].\n- Tempered and grounded by [[The Pragmatist]] to ensure physical and resource feasibility.\n- Synthesized into the final blueprint by [[The High Arbiter]].\n\nPart of [[The High Table]] and [[Architecture]].`
    },
    {
      id: "the-inquisitor",
      title: "The Inquisitor",
      tags: ["council", "critique", "seat-3", "adversarial"],
      content: `# Seat 3: The Inquisitor ⚔️\n\nThe critical skeptic and devil's advocate of [[The High Table]].\n\n## Mission & Philosophy\n- **Adversarial Stress-Testing**: Actively searches for vulnerabilities, unstated assumptions, and worst-case scenarios.\n- **Counter-Examples**: Dismantles overgeneralized claims by constructing edge-case counter-proofs.\n- **Cognitive Bias Detection**: Identifies confirmation bias, sunk-cost fallacies, and groupthink.\n\n## Inter-Seat Dynamics\n- Attacks the premises of [[The Logician]] and interrogates the speculative claims of [[The Visionary]].\n- Provides the negative space necessary for [[The High Arbiter]] to craft a resilient verdict.\n- Driven by [[DeepSeek R1]]'s deep reflective <think> reasoning chains.\n\nPart of [[The High Table]] and [[Architecture]].`
    },
    {
      id: "the-pragmatist",
      title: "The Pragmatist",
      tags: ["council", "operations", "seat-4", "execution"],
      content: `# Seat 4: The Pragmatist ⚖️\n\nThe operational anchor and execution engineer of [[The High Table]].\n\n## Mission & Philosophy\n- **Empirical Feasibility**: Translates theoretical debate into concrete implementation steps.\n- **Resource Constraints**: Evaluates compute, memory, bandwidth, financial cost, and time-to-delivery.\n- **Failure Mode Mitigation**: Establishes rollback strategies, fallback pipelines, and monitoring checkpoints.\n\n## Inter-Seat Dynamics\n- Anchors [[The Visionary]] to reality and enforces engineering bounds on [[The Logician]].\n- Collaborates with [[The Inquisitor]] to ensure practical security.\n- Drafts the Actionable Directives section for [[The High Arbiter]]'s decree.\n\nPart of [[The High Table]] and [[Architecture]].`
    },
    {
      id: "the-high-arbiter",
      title: "The High Arbiter",
      tags: ["council", "synthesis", "seat-5", "decree"],
      content: `# Seat 5: The High Arbiter 👑\n\nThe supreme synthesizer and executive authority of [[The High Table]].\n\n## Mission & Philosophy\n- **Epistemic Synthesis**: Reconciles the dialectic tensions between [[The Logician]], [[The Visionary]], [[The Inquisitor]], and [[The Pragmatist]].\n- **The High Decree**: Delivers the definitive verdict resolving the user's inquiry.\n- **Structured Decree Format**:\n  1. *Core Epistemic Verdict*: Definitive stance on the question.\n  2. *Strategic Blueprint*: Step-by-step roadmap for execution.\n  3. *Risk Matrix*: Critical trade-offs and mitigation measures.\n  4. *Directives*: Explicit checklist for immediate action.\n\n## Model Assignment\n- Operates on [[DeepSeek R1]] 14B under sovereign presets or Gemini 3.5 Flash-Lite under cloud presets.\n\nPart of [[The High Table]] and [[Architecture]].`
    },
    {
      id: "mimisbrunnr",
      title: "Mímisbrunnr",
      tags: ["ai", "sovereign", "local", "privacy"],
      content: `# Mímisbrunnr Sovereign AI Engine 🧠\n\n**Mímisbrunnr** (The Well of Memory) is Aether's sovereign, airgapped artificial intelligence runtime operating 100% locally on [[Apple Silicon M4]].\n\n## Sovereign Model Whitelist\n1. **[[DeepSeek R1]] 14B (4-bit MLX)**:\n   - Quantized Apple Metal weights (\`mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit\` & \`Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit\`).\n   - Deep chain-of-thought <think> reasoning rendered in collapsible UI boxes.\n2. **[[Qwen 3.8]] 9B Abliterated MLX**:\n   - High-throughput uncensored model for objective truthfulness (\`PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit\`).\n3. **[[Qwen 2.5]] 7B Metal**:\n   - Lightweight fallback model executed via local Ollama daemon (\`127.0.0.1:11434\`).\n\n## Architecture & Integration\n- **Zero Network Telemetry**: Completely airgapped execution; no data packets leave the device.\n- **Dual API Server**: Listens on port 8080 (compatible with mlx_lm server) and internal port 8088.\n- **Runtime Resolver**: Automatically checks and prioritizes ~/airllm-env and ~/.aether/mlx-env.\n- **Offline Fallback Engine**: Embedded heuristics for terminal script debugging, email summaries, and code generation when servers are inactive.\n\nDirectly powers the sovereign presets of [[The High Table]] and integrates with [[Yggdrasil]].`
    },
    {
      id: "deepseek-r1",
      title: "DeepSeek R1",
      tags: ["ai", "model", "reasoning", "mlx"],
      content: `# DeepSeek R1 Reasoning Model 🔬\n\n**DeepSeek R1 Distill Qwen 14B (4-bit)** is the primary reasoning engine within Aether's sovereign intelligence tier.\n\n## Key Capabilities\n- **Emergent Chain-of-Thought**: Generates internal reasoning traces wrapped in <think> ... </think> blocks before providing its definitive answer.\n- **Epistemic Self-Correction**: Identifies flaws in its own preliminary hypotheses, backtracks, and recalculates answers.\n- **Metal Acceleration**: Formatted in Apple MLX affine 4-bit quantization, running at 35–45 tokens/second on [[Apple Silicon M4]].\n- **RAM Efficiency**: Consumes only ~8.8 GB of unified memory, leaving ~7 GB of headroom on 16 GB systems without disk swapping.\n\n## Aether UI Integration\n- **Collapsible Reasoning Boxes**: Both [[Mímisbrunnr]] and [[The High Table]] automatically parse <think> tags and render them as interactive collapsible sections.\n- **Deliberation Lead**: Defaults as the sovereign model for Seat 1 ([[The Logician]]), Seat 3 ([[The Inquisitor]]), and Seat 5 ([[The High Arbiter]]).\n\nConnected to [[Mímisbrunnr]], [[The High Table]], and [[Apple Silicon M4]].`
    },
    {
      id: "apple-silicon-m4",
      title: "Apple Silicon M4",
      tags: ["hardware", "metal", "m4", "apple"],
      content: `# Apple Silicon M4 Hardware Architecture 🍏\n\nHardware substrate powering Aether's local-first sovereign workstation.\n\n## Specifications & Unified Memory\n- **Unified RAM**: 16 GB high-speed unified memory with ~120 GB/s bandwidth.\n- **Zero-Copy Architecture**: CPU and GPU share the exact same physical memory space. Unlike discrete GPUs with PCIe transfer bottlenecks, models are loaded once into unified RAM and executed directly.\n- **Apple Neural Engine (ANE)**: 16-core neural accelerator assisting with low-power transformer inference.\n- **Metal Performance Shaders (MPS)**: Highly optimized Metal matrix multiplication kernels via Apple MLX.\n\n## Model Sizing on 16 GB Unified RAM\n- [[DeepSeek R1]] 14B 4-bit: ~8.8 GB RAM footprint (100% resident in RAM).\n- [[Qwen 3.8]] 9B 4-bit: ~5.6 GB RAM footprint.\n- macOS System Overhead: ~3.5 GB.\n- **Total Headroom**: ~3.5 to 7 GB remaining, eliminating disk thrashing and SSD wear.\n\nMonitored by [[Mímisbrunnr]] and utilized by [[The High Table]].`
    },
    {
      id: "aetherum-browser",
      title: "Aetherum Browser",
      tags: ["browser", "privacy", "tor", "adblock"],
      content: `# Aetherum Browser 🌐\n\n**Aetherum** is Aether's built-in sovereign privacy browser, designed to provide censorship-resistant and surveillance-free web access.\n\n## Core Privacy Features\n- **Native [[Tor Network]] Routing**: Routes traffic through local Tor SOCKS5 proxy on 127.0.0.1:9050 with single-click toggle.\n- **[[Sleipnir]] Anti-DPI Shield**: Automatically routes HTTPS traffic through 127.0.0.1:8087 to fragment TLS ClientHello SNI packets.\n- **Multi-Layer Adblock Shield**: Blocks tracking beacons, third-party analytics, and telemetry scripts with custom rule injection.\n- **Ephemeral Sandbox**: Multi-session partition isolation preventing cross-tab identity correlation.\n- **Internal Hub Pages**:\n  - aetherum://welcome: System launchpad and quick navigation.\n  - aetherum://high-table: Launchpad to [[The High Table]].\n  - aetherum://nibelungen: Launchpad to [[Nibelungen]].\n  - aetherum://fafnir: Launchpad to [[Fafnir Vault]].\n\nPart of [[Architecture]].`
    },
    {
      id: "sleipnir",
      title: "Sleipnir",
      tags: ["network", "anti-dpi", "security", "proxy"],
      content: `# Sleipnir Anti-DPI Engine 🐎\n\n**Sleipnir** (The Eight-Legged Steed) is Aether's local HTTPS SNI packet splitting proxy running on 127.0.0.1:8087.\n\n## Mechanism of Action\n- **TLS ClientHello Segmentation**: Deep Packet Inspection (DPI) boxes operated by ISPs and state censors inspect the plaintext Server Name Indication (SNI) in TLS ClientHello packets.\n- Sleipnir intercepts outbound TLS handshakes and fragments the TCP payload across multiple IP packets directly through the middle of the hostname string.\n- DPI middleboxes fail to reconstruct the host across split packets, while the destination server reassembles TCP transparently.\n- **DoH Resolution**: Resolves all DNS queries securely using Cloudflare DNS-over-HTTPS (https://1.1.1.1/dns-query), preventing ISP DNS poisoning.\n\nSeamlessly shields [[Aetherum Browser]] and integrates into [[Architecture]].`
    },
    {
      id: "fafnir-vault",
      title: "Fafnir Vault",
      tags: ["crypto", "vault", "security", "aes-256"],
      content: `# Fafnir Zero-Knowledge Vault 🛡️\n\n**Fafnir** is Aether's encrypted document drive, safeguarding confidential files with zero-knowledge cryptography.\n\n## Cryptographic Specification\n- **Cipher**: AES-256-GCM (Authenticated Encryption with Associated Data).\n- **Key Derivation**: PBKDF2 with SHA-256 across 100,000 iterations.\n- **Salt & IV**: 16-byte cryptographically secure random salt, 12-byte initialization vector per container.\n- **Integrity Tag**: 16-byte authentication tag ensuring bit-flip detection and tamper rejection.\n- **Metadata Protection**: Secure header preserving original filename, UTF-8 Korean Hangul, and file size.\n- **Vault Location**: ~/.aether/fafnir_vault/*.fafnir.\n\nConnected to [[Architecture]] and [[Nibelungen]].`
    },
    {
      id: "yggdrasil",
      title: "Yggdrasil",
      tags: ["terminal", "shell", "zsh", "macos"],
      content: `# Yggdrasil Workspace 🌳\n\n**Yggdrasil** (The World Tree) is Aether's native terminal environment providing an isolated macOS shell.\n\n## Features\n- **Native Zsh Engine**: Spawns interactive zsh shells with ANSI truecolor rendering.\n- **Toolbar Quick Actions**:\n  - uname -m: Inspect chip architecture (arm64).\n  - Tor Status: Verify connection to [[Tor Network]].\n  - Clear: Instantly flush buffer.\n- **Signal Handling**: Robust Ctrl+C interrupt and process lifecycle management.\n- **Script Diagnostic**: Paired with [[Mímisbrunnr]]'s offline script debugger to catch dangerous patterns (rm -rf / or unquoted variables) before execution.\n\nPart of [[Architecture]].`
    },
    {
      id: "ratatoskr",
      title: "Ratatoskr",
      tags: ["api", "database", "sqlite", "tools"],
      content: `# Ratatoskr API & Database Explorer 🐿️\n\n**Ratatoskr** is Aether's developer telemetry console, REST API client, and SQLite database inspector.\n\n## Features\n- **Visual REST Client**:\n  - Supports GET, POST, PUT, DELETE, and PATCH methods.\n  - Custom header injection, query parameter builder, and JSON payload editor.\n  - Real-time HTTP status codes, latency timings, and response headers.\n- **SQLite Database Viewer**:\n  - Direct connection to local SQLite databases.\n  - Table schema browser, row inspector, and arbitrary SQL query runner.\n- **Telemetry Bridge**: Observes IPC traffic and extensions across Aether.\n\nPart of [[Architecture]].`
    },
    {
      id: "heimdall",
      title: "Heimdall",
      tags: ["audio", "biometrics", "telemetry", "ai"],
      content: `# Heimdall Biometrics & Token Telemetry 👁️\n\n**Heimdall** (The All-Seeing Guardian) provides acoustic biometrics, audio diarization, and AI resource monitoring for Aether.\n\n## Capabilities\n- **Acoustic Speaker Diarization**:\n  - Processes multi-speaker audio recordings, separating speech into labeled speaker tracks.\n  - Generates meeting transcripts and action items.\n- **Live Token Telemetry**:\n  - Visual telemetry header displaying real-time Gemini API token usage and remaining quota.\n  - Tracks consumption rates and prevents sudden API lockout.\n- **Resilience Engine**:\n  - Automatically activates fallback illustrations for 429 rate limit errors.\n  - Integrates fallback chains into [[The High Table]].\n\nPart of [[Architecture]].`
    },
    {
      id: "proton-mail-security",
      title: "Proton Mail Security",
      tags: ["security", "email", "privacy"],
      content: `# Proton Mail Security ✉️\n\nZero-knowledge end-to-end encrypted messaging integrated with [[Aetherum Browser]].\n\n## Security Topology\n- Primary target: https://mail.proton.me\n- Outbound routing protected via [[Tor Network]] and [[Sleipnir]] SNI packet fragmentation.\n- Auto-indexed by [[Nibelungen]] for cross-referencing research documents and correspondence.\n- Summarized locally by [[Mímisbrunnr]]'s offline email analyzer with zero cloud exposure.\n\nPart of [[Architecture]].`
    }
  ];

  for (const n of defaultNotes) {
    const fpath = path.join(VAULT_DIR, `${n.id}.json`);
    if (!fs.existsSync(fpath)) {
      fs.writeFileSync(fpath, JSON.stringify(n, null, 2), "utf8");
    }
  }
}

function listNotes() {
  ensureVault();
  const files = fs.readdirSync(VAULT_DIR).filter(f => f.endsWith(".json"));
  const notes = [];
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(VAULT_DIR, f), "utf8"));
      notes.push(data);
    } catch {}
  }
  return notes;
}

function extractWikilinks(text) {
  const matches = [];
  const regex = /\[\[(.*?)\]\]/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    matches.push(m[1].trim());
  }
  return matches;
}

function buildKnowledgeGraph(extraBookmarks = [], extraEmails = []) {
  const notes = listNotes();
  const nodesMap = new Map();
  const edges = [];

  // 1. Add Note Nodes
  for (const n of notes) {
    nodesMap.set(n.title.toLowerCase(), {
      id: n.id,
      title: n.title,
      type: "note",
      tags: n.tags || [],
      val: 18,
      content: n.content
    });
  }

  // 2. Add Bookmarks as Nodes
  for (const b of extraBookmarks) {
    const bId = `bm-${b.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    if (!nodesMap.has(b.title.toLowerCase())) {
      nodesMap.set(b.title.toLowerCase(), {
        id: bId,
        title: b.title,
        type: "bookmark",
        tags: ["bookmark", "web"],
        val: 14,
        url: b.url,
        content: `Bookmark: ${b.url}`
      });
    }
  }

  // 3. Connect Edges via [[Wikilinks]] & Shared Tags
  for (const n of notes) {
    const sourceNode = nodesMap.get(n.title.toLowerCase());
    if (!sourceNode) continue;

    const links = extractWikilinks(n.content || "");
    for (const targetTitle of links) {
      let targetNode = nodesMap.get(targetTitle.toLowerCase());
      // If target node doesn't exist yet, create ghost topic node
      if (!targetNode) {
        targetNode = {
          id: `topic-${targetTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          title: targetTitle,
          type: "topic",
          tags: ["concept"],
          val: 12,
          content: `Topic: ${targetTitle}`
        };
        nodesMap.set(targetTitle.toLowerCase(), targetNode);
      }
      edges.push({
        source: sourceNode.id,
        target: targetNode.id,
        type: "wikilink"
      });
    }

    // Connect bookmarks mentioned in text
    for (const b of extraBookmarks) {
      if (n.content && n.content.toLowerCase().includes(b.title.toLowerCase())) {
        const bNode = nodesMap.get(b.title.toLowerCase());
        if (bNode && bNode.id !== sourceNode.id) {
          edges.push({
            source: sourceNode.id,
            target: bNode.id,
            type: "reference"
          });
        }
      }
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges
  };
}

function saveNote(note) {
  ensureVault();
  const id = note.id || `note-${Date.now()}`;
  const record = {
    id,
    title: note.title || "Untitled Note",
    tags: note.tags || [],
    content: note.content || "",
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(VAULT_DIR, `${id}.json`), JSON.stringify(record, null, 2), "utf8");
  return record;
}

function deleteNote(id) {
  ensureVault();
  const fpath = path.join(VAULT_DIR, `${id}.json`);
  if (fs.existsSync(fpath)) {
    fs.unlinkSync(fpath);
    return true;
  }
  return false;
}

function registerNibelungenIpc(ipcMain) {
  ensureVault();

  ipcMain.handle("hyper:nibelungen:get-graph", (_event, { bookmarks = [], emails = [] } = {}) => {
    return buildKnowledgeGraph(bookmarks, emails);
  });

  ipcMain.handle("hyper:nibelungen:list-notes", () => {
    return listNotes();
  });

  ipcMain.handle("hyper:nibelungen:save-note", (_event, note) => {
    return saveNote(note);
  });

  ipcMain.handle("hyper:nibelungen:delete-note", (_event, id) => {
    return deleteNote(id);
  });
}

module.exports = {
  buildKnowledgeGraph,
  listNotes,
  saveNote,
  deleteNote,
  registerNibelungenIpc
};
