"use strict";
const electron = require("electron");
const OPENAI_IMAGES_BASE_URL = "https://api.openai.com/v1";
const GEMINI_MEDIA_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
const ZHIPU_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
const XAI_BASE_URL = "https://api.x.ai/v1";
const DASHSCOPE_BASE_URL = "https://dashscope.aliyuncs.com";
const MINIMAX_BASE_URL = "https://api.minimax.io/v1";
const DEEPSEEK_MEDIA_BASE_URL = "https://api.deepseek.com/v1";
const AI_MEDIA_PROVIDERS = [
  {
    id: "openai",
    label: "OpenAI",
    description: "GPT Image for generation and editing; GPT chat models for image analysis",
    keyPlaceholder: "sk-...",
    defaultBaseUrl: OPENAI_IMAGES_BASE_URL,
    imageProtocol: "openai-images",
    // GPT Image 2.5 (sunburst = quality, flare = fast) per the OpenAI models page
    // 2026-09-24, same token rates as GPT Image 2, both on generations and edits.
    // GPT-6 reads images over Chat Completions; the tool-call caveat that keeps
    // it off the chat provider does not apply to analysis.
    imageModels: [
      "gpt-image-2.5-sunburst",
      "gpt-image-2.5-flare",
      "gpt-image-2",
      "gpt-image-1.5",
      "gpt-image-1",
      "gpt-image-1-mini"
    ],
    defaultImageModel: "gpt-image-2",
    analysisProtocol: "openai-chat",
    analysisModels: [
      "gpt-6-sol",
      "gpt-6-luna",
      "gpt-5.6-sol",
      "gpt-5.6-terra",
      "gpt-5.6-luna",
      "gpt-5.5",
      "gpt-5.4-mini"
    ],
    defaultAnalysisModel: "gpt-5.6-luna",
    videoAnalysis: false
  },
  {
    id: "gemini",
    label: "Gemini",
    description: "Gemini native image output (Nano Banana) and Imagen; Gemini reads images, video and audio",
    keyPlaceholder: "AIza...",
    defaultBaseUrl: GEMINI_MEDIA_BASE_URL,
    imageProtocol: "gemini",
    imageModels: [
      "gemini-3.1-flash-image",
      "gemini-3-pro-image",
      "gemini-3.1-flash-lite-image",
      "gemini-2.5-flash-image"
    ],
    defaultImageModel: "gemini-3.1-flash-image",
    analysisProtocol: "gemini",
    analysisModels: [
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3-flash-preview",
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.1-pro-preview",
      "gemini-3.6-flash"
    ],
    defaultAnalysisModel: "gemini-3.5-flash-lite",
    videoAnalysis: true
  },
  {
    id: "doubao",
    label: "Doubao (Volcengine Ark)",
    description: "Seedream image generation and editing; Doubao Seed reads images and video",
    keyPlaceholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    defaultBaseUrl: ARK_BASE_URL,
    imageProtocol: "openai-images",
    // per the Ark model list 2026-10-12: Seedream 5.0 split into a pro cut
    // (layer split, interactive editing, 14-language text) and a flash cut
    // (same feature set, cheaper and faster), so 5.0 is no longer one model.
    // The 4.5 and 4.0 IDs are both flagged for retirement there and come out.
    // 5-0-260128 stays — only its lite alias is on the way out.
    imageModels: [
      "doubao-seedream-5-0-pro-260628",
      "doubao-seedream-5-0-flash-260915",
      "doubao-seedream-5-0-260128"
    ],
    defaultImageModel: "doubao-seedream-5-0-pro-260628",
    analysisProtocol: "openai-chat",
    analysisModels: ["doubao-seed-2-1-pro-260628", "doubao-seed-2-1-turbo-260628"],
    defaultAnalysisModel: "doubao-seed-2-1-pro-260628",
    videoAnalysis: true
  },
  {
    id: "glm",
    label: "GLM (Zhipu)",
    description: "CogView image generation; GLM-V reads images and video",
    keyPlaceholder: "xxxxxxxx.xxxxxxxx",
    defaultBaseUrl: ZHIPU_BASE_URL,
    imageProtocol: "openai-images",
    imageModels: ["cogview-4-250304", "cogview-3-flash"],
    defaultImageModel: "cogview-4-250304",
    analysisProtocol: "openai-chat",
    analysisModels: ["glm-4.6v", "glm-4.6v-flash"],
    defaultAnalysisModel: "glm-4.6v",
    videoAnalysis: true
  },
  {
    id: "xai",
    label: "Grok (xAI)",
    description: "Grok Imagine image generation; Grok reads images",
    keyPlaceholder: "xai-...",
    defaultBaseUrl: XAI_BASE_URL,
    imageProtocol: "openai-images",
    imageModels: ["grok-imagine-image-2.0", "grok-2-image-1212"],
    defaultImageModel: "grok-imagine-image-2.0",
    analysisProtocol: "openai-chat",
    analysisModels: ["grok-4.6", "grok-4.5"],
    defaultAnalysisModel: "grok-4.6",
    videoAnalysis: false
  },
  {
    id: "qwen",
    label: "Qwen (Alibaba Cloud)",
    description: "Qwen-Image generation; Qwen-VL reads images and video (DashScope)",
    keyPlaceholder: "sk-...",
    defaultBaseUrl: DASHSCOPE_BASE_URL,
    imageProtocol: "dashscope",
    imageModels: ["qwen-image-plus", "qwen-image"],
    defaultImageModel: "qwen-image-plus",
    analysisProtocol: "openai-chat",
    analysisModels: ["qwen3-vl-plus", "qwen3-vl-flash", "qwen3.8-max", "qwen3.7-plus"],
    defaultAnalysisModel: "qwen3-vl-plus",
    videoAnalysis: true
  },
  {
    id: "minimax",
    label: "MiniMax",
    description: "Image generation; MiniMax-M3 reads images and video (use api.minimaxi.com/v1 for CN)",
    keyPlaceholder: "eyJ...",
    defaultBaseUrl: MINIMAX_BASE_URL,
    imageProtocol: "minimax",
    imageModels: ["image-01"],
    defaultImageModel: "image-01",
    analysisProtocol: "openai-chat",
    analysisModels: ["MiniMax-M3"],
    defaultAnalysisModel: "MiniMax-M3",
    videoAnalysis: true
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    // native multimodal (V4.1 Flash = wire id deepseek-flash): reads JPEG/PNG/GIF/WebP,
    // no image generation and no video/audio, so it only appears for image analysis
    description: "DeepSeek V4.1 Flash reads images (native multimodal); no image generation",
    keyPlaceholder: "sk-...",
    defaultBaseUrl: DEEPSEEK_MEDIA_BASE_URL,
    imageModels: [],
    defaultImageModel: "",
    analysisProtocol: "openai-chat",
    analysisModels: ["deepseek-flash"],
    defaultAnalysisModel: "deepseek-flash",
    videoAnalysis: false
  },
  {
    id: "custom",
    label: "Custom",
    description: "Any OpenAI-compatible endpoint: /images/generations and /chat/completions",
    keyPlaceholder: "API Key",
    needsBaseUrl: true,
    defaultBaseUrl: "",
    imageProtocol: "openai-images",
    imageModels: [],
    defaultImageModel: "",
    analysisProtocol: "openai-chat",
    analysisModels: [],
    defaultAnalysisModel: "",
    videoAnalysis: false
  }
];
const AI_SEARCH_PROVIDERS = [
  { id: "serper", label: "Serper", keyPlaceholder: "Serper API key", imageSearch: true },
  { id: "serply", label: "Serply", keyPlaceholder: "Serply API key", imageSearch: true },
  { id: "tavily", label: "Tavily", keyPlaceholder: "tvly-...", imageSearch: false },
  { id: "parallel", label: "Parallel", keyPlaceholder: "Parallel API key", imageSearch: false },
  // exa/firecrawl: AI-search APIs without an image endpoint (like Tavily/Parallel)
  { id: "exa", label: "Exa", keyPlaceholder: "Exa API key", imageSearch: false },
  { id: "firecrawl", label: "Firecrawl", keyPlaceholder: "fc-...", imageSearch: false }
];
const DEEPSEEK_V41_FLASH = "deep-seek-v4.1-flash";
const AI_PROVIDERS = [
  {
    id: "claude-code",
    label: "Claude Code",
    // Aliases the CLI resolves to the subscription's current models, so no
    // dated id goes stale here. Empty leaves the choice to the CLI.
    models: ["opus", "sonnet", "haiku"],
    defaultModel: "",
    keyPlaceholder: ""
  },
  {
    id: "codex",
    label: "Codex CLI",
    // Populated at runtime from codex app-server model/list. Empty also lets
    // the CLI select the account's current default without a stale hardcode.
    models: [],
    defaultModel: "",
    keyPlaceholder: "",
    needsCliPath: true
  },
  {
    id: "anthropic",
    label: "Claude",
    // current-generation ids per platform.claude.com models overview (2026-10-09).
    // Fable needs data retention enabled on the org, otherwise the API answers
    // model_not_available; every other id is served to any key.
    models: [
      "claude-opus-5-5",
      "claude-sonnet-5",
      "claude-fable-5-1",
      "claude-opus-5",
      "claude-fable-5",
      "claude-sonnet-4-6",
      "claude-haiku-5-5"
    ],
    defaultModel: "claude-sonnet-5",
    keyPlaceholder: "sk-ant-api03-..."
  },
  {
    id: "gemini",
    label: "Gemini",
    models: [
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3-flash-preview",
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.1-pro-preview",
      "gemini-3.6-flash",
      "gemini-3.1-flash-lite"
    ],
    defaultModel: "gemini-3.5-flash-lite",
    keyPlaceholder: "AIza..."
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    // GET api.deepseek.com/v1/models serves `deepseek-v4-pro` and
    // `deepseek-flash` (verified 2026-09-21); the latter is V4.1 Flash with
    // native vision. We list it under a versioned name; the adapter maps it
    // back to the unversioned wire id (see DEEPSEEK_WIRE_IDS in registry.ts).
    models: ["deepseek-v4-pro", DEEPSEEK_V41_FLASH],
    defaultModel: "deepseek-v4-pro",
    keyPlaceholder: "sk-..."
  },
  {
    id: "openai",
    label: "OpenAI",
    // GPT-5.6 naming: sol is the flagship (the bare `gpt-5.6` alias resolves to
    // it, but spell it out so the picker says which tier it is), terra balances
    // cost/intelligence, luna is the high-volume tier (2026-08). The GPT-6
    // family (astra, sol, luna) is deliberately absent: Chat Completions
    // supports its function calling only with reasoning_effort none, full
    // tool use needs the Responses API, which has no protocol here (2026-09-24)
    models: ["gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna", "gpt-5.5", "gpt-5.4", "gpt-5.4-mini"],
    defaultModel: "gpt-5.6-terra",
    keyPlaceholder: "sk-..."
  },
  {
    id: "kimi",
    label: "Kimi",
    models: ["kimi-k3"],
    defaultModel: "kimi-k3",
    keyPlaceholder: "sk-..."
  },
  {
    id: "glm",
    label: "GLM",
    // bigmodel.cn text-model lineup (2026-08); 5.3 and 5.2 share a base model.
    // 5.3-Flash is the first multimodal GLM-5 and the documented successor to
    // 5-Turbo, which Z.ai delisted from its price card in late August and
    // Tencent CloudBase retires on 2026-10-30 with migration advice pointing
    // here. 5.2 is marked deprecated on third-party catalogues but is still
    // sold pay-as-you-go, so it stays listed.
    models: ["glm-5.3", "glm-5.3-flash", "glm-5.2"],
    defaultModel: "glm-5.3",
    keyPlaceholder: "xxxxxxxx.xxxxxxxx"
  },
  {
    id: "qwen",
    label: "Qwen",
    // Versioned DashScope ids: the bare qwen-max alias still points at a
    // Qwen2.5-era snapshot, so name the 3.x tiers explicitly (2026-08).
    // 3.8 ships as Max and Flash only — there is no 3.8-Plus tier, and
    // 3.7-Flash is still the listed high-volume option.
    models: ["qwen3.8-max", "qwen3.8-flash", "qwen3.7-plus", "qwen3.7-flash"],
    defaultModel: "qwen3.8-max",
    keyPlaceholder: "sk-..."
  },
  {
    id: "doubao",
    label: "Doubao",
    // Ark ids are dashed and date-pinned; it also accepts ep-... inference
    // endpoint ids in the model field
    models: ["doubao-seed-2-1-pro-260628", "doubao-seed-2-1-turbo-260628"],
    defaultModel: "doubao-seed-2-1-pro-260628",
    keyPlaceholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  {
    id: "mimo",
    label: "MiMo",
    // Xiaomi's open-weight omni-modal pair (released 2026-09-22): Pro is the
    // trillion-parameter flagship, Flash the efficiency/cost tier. Both take
    // text, image, video and audio input; a -pro-ultraspeed tier also exists but
    // is the same weights behind a faster serving path, so it is not a
    // separate model to pick here.
    models: ["mimo-v2.6-pro", "mimo-v2.6-flash"],
    defaultModel: "mimo-v2.6-pro",
    keyPlaceholder: "sk-..."
  },
  {
    id: "hunyuan",
    label: "Hunyuan",
    // Tencent's TokenHub chat models (docs 1823/132252, read 2026-09-30).
    // hy4-preview is the 1M-context flagship and has deep thinking on by
    // default; hy3 is the 256k balanced tier. Every other provider here
    // defaults to its flagship, so this does too.
    models: ["hy4-preview", "hy3"],
    defaultModel: "hy4-preview",
    keyPlaceholder: "sk-..."
  },
  {
    id: "ling",
    label: "Ling",
    // Ids as listed by developer.ant-ling.com (Ring = reasoning line); only
    // Ling-3.0-flash-VL takes images, see modelLacksVision()
    models: [
      "Ling-3.0-flash",
      "Ling-3.0-flash-VL",
      "Ling-3.0-tiny",
      "Ling-2.6-1T",
      "Ring-2.6-1T",
      "Ling-2.6-flash"
    ],
    defaultModel: "Ling-3.0-flash",
    keyPlaceholder: "API Key"
  },
  {
    id: "spark",
    label: "Spark",
    // iFlytek MaaS: lower-case model id and ak- key prefix are the vendor's own spelling
    models: ["spark-x2.5"],
    defaultModel: "spark-x2.5",
    keyPlaceholder: "ak-..."
  },
  {
    id: "longcat",
    label: "LongCat",
    // 2.5-Preview is the multimodal tier; 2.0 stays default so a fresh config avoids a preview
    models: ["LongCat-2.5-Preview", "LongCat-2.0"],
    defaultModel: "LongCat-2.0",
    keyPlaceholder: "API Key"
  },
  {
    id: "minimax",
    label: "MiniMax",
    // M3 is the current agentic/tool-use model; M2.5 moved to the legacy tier
    models: ["MiniMax-M3", "MiniMax-M2.7"],
    defaultModel: "MiniMax-M3",
    keyPlaceholder: "eyJ..."
  },
  {
    id: "xai",
    label: "Grok",
    // 4.7 (2026-09-21) is 2.1T / 500K context at 4.6's price. 4.6 stays the
    // default so a fresh config does not silently move to a model released
    // this month; say the word and the default follows the flagship like every
    // other provider here.
    models: ["grok-4.7", "grok-4.6", "grok-4.5"],
    defaultModel: "grok-4.6",
    keyPlaceholder: "xai-..."
  },
  {
    id: "mistral",
    label: "Mistral",
    // `-latest` aliases track the newest GA snapshot. Medium 3.5 is Mistral's
    // agentic tier; codestral is a code-completion/FIM model, not an agent driver.
    models: ["mistral-medium-latest", "mistral-large-latest", "mistral-small-latest"],
    defaultModel: "mistral-medium-latest",
    keyPlaceholder: "API Key"
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    // vendor-prefixed slugs exactly as openrouter.ai/api/v1/models lists them —
    // there is no `openai/gpt-5.6` alias there, only the per-tier ids
    models: [
      "openrouter/auto",
      "anthropic/claude-opus-5.5",
      "anthropic/claude-sonnet-5",
      "openai/gpt-6-astra",
      "openai/gpt-6-sol",
      "openai/gpt-6-luna",
      "openai/gpt-5.6-sol",
      "moonshotai/kimi-k3"
    ],
    defaultModel: "openrouter/auto",
    keyPlaceholder: "sk-or-..."
  },
  {
    id: "requesty",
    label: "Requesty",
    // Managed policy ids exactly as GET router.requesty.ai/v1/models/managed
    // lists them (2026-09-24): short stable names Requesty routes across
    // providers, used as-is in the model field. The full vendor-prefixed
    // catalog (GET /v1/models, e.g. openai/gpt-4o-mini) works too when typed
    // in. Ids ending "@eu" route through EU providers only.
    models: [
      "claude-sonnet-5",
      "claude-opus-5-5",
      "claude-opus-4-8",
      "gpt-6-sol",
      "gpt-6-luna",
      "gpt-5.6-sol",
      "gpt-5.6-terra",
      "gemini-3.7-flash",
      "deepseek-v4-pro",
      "kimi-k3"
    ],
    defaultModel: "claude-sonnet-5",
    keyPlaceholder: "sk-..."
  },
  {
    id: "opper",
    label: "Opper",
    // Pool ids exactly as GET api.opper.ai/v3/models lists them (2026-09-14):
    // a bare name is an Opper pool, and Opper picks the serving provider and
    // region per request. The vendor-prefixed catalog (anthropic/claude-sonnet-4-6,
    // azure/gpt-5, …) pins one provider and works as-is when typed in.
    // Full list at opper.ai/models.
    models: [
      "claude-sonnet-4-6",
      "claude-opus-5",
      "gpt-5.5",
      "gpt-5.4-mini",
      "gemini-3.8-flash",
      "deepseek-v4-pro",
      "kimi-k3",
      "mistral-large-2512"
    ],
    defaultModel: "claude-sonnet-4-6",
    keyPlaceholder: "API Key"
  },
  {
    id: "cheaperinference",
    label: "Cheaper Inference",
    // Bare model ids as GET api.cheaperinference.com/v1/models lists them (the
    // chat rows, type "text"): no vendor prefix, one key for every lab. Other
    // ids from that list work as-is when typed in. Full list at
    // cheaperinference.com/#models.
    models: ["gpt-5.4-mini", "gpt-5.4", "claude-sonnet-5", "gemini-3.1-pro"],
    defaultModel: "gpt-5.4-mini",
    keyPlaceholder: "ci_live_..."
  },
  {
    id: "atlascloud",
    label: "Atlas Cloud",
    // Lab-namespaced ids exactly as GET api.atlascloud.ai/v1/models lists them
    // (2026-10-08, public endpoint, no key needed); the rest of the 117-model
    // catalog works as-is when typed in. Chat, temperature and — for the
    // multimodal ids — data-URI image input are live-verified. The text-only
    // ids (deepseek-v4-*, glm-5.3, both MiniMax) are listed in
    // modelLacksVision(); Atlas Cloud serves MiniMax M3 text-only even though
    // MiniMax's own API takes images.
    models: [
      "deepseek-ai/deepseek-v4-pro",
      "deepseek-ai/deepseek-v4-flash",
      "moonshotai/kimi-k3",
      "moonshotai/kimi-k2.6",
      "zai-org/glm-5.3",
      "zai-org/glm-5.3-flash",
      "qwen/qwen3.8-max",
      "qwen/qwen3.5-flash",
      "minimaxai/minimax-m3",
      "minimaxai/minimax-m2.5"
    ],
    defaultModel: "deepseek-ai/deepseek-v4-pro",
    keyPlaceholder: "apikey-..."
  },
  {
    id: "opencode-zen",
    label: "OpenCode Zen",
    // Pay-as-you-go gateway (opencode.ai/docs/zen); ids exactly as GET
    // /zen/v1/models lists them (2026-10-09). GPT-5.x/6, Grok and Muse Spark
    // are served only through the Responses API, which has no protocol here,
    // so they stay out until one exists.
    models: [
      "claude-sonnet-5",
      "claude-opus-5-5",
      "claude-opus-5",
      "claude-fable-5-1",
      "claude-haiku-5-5",
      "gemini-3.7-flash",
      "gemini-3.1-pro",
      "kimi-k3",
      "kimi-k2.7-code",
      "deepseek-v4-pro",
      "deepseek-v4-flash",
      "glm-5.2",
      "minimax-m3",
      "qwen3.6-plus"
    ],
    defaultModel: "claude-sonnet-5",
    keyPlaceholder: "API Key"
  },
  {
    id: "opencode-go",
    label: "OpenCode Go",
    // $10/month subscription to open-weight coding models (opencode.ai/docs/go),
    // same key as Zen; ids exactly as GET /zen/go/v1/models lists them
    // (re-read 2026-09-30). GPT-5.6 Luna, Grok and Muse Spark are
    // Responses-only and left out for the same reason as above.
    models: [
      "kimi-k2.7-code",
      "kimi-k3",
      "kimi-k2.6",
      "glm-5.3",
      "glm-5.3-flash",
      "glm-5.2",
      "deepseek-v4-pro",
      "deepseek-v4-flash",
      "deepseek-v4.1-flash",
      "qwen3.8-max",
      "qwen3.8-flash",
      "minimax-m3",
      "minimax-m2.7",
      "mimo-v2.5-pro",
      "mimo-v2.6-pro",
      "mimo-v2.6-flash",
      "longcat-2.0",
      "longcat-2.5-preview-free",
      "hy4-preview",
      "hy3"
    ],
    defaultModel: "kimi-k2.7-code",
    keyPlaceholder: "API Key"
  },
  {
    id: "custom",
    label: "Custom",
    models: [],
    defaultModel: "",
    keyPlaceholder: "API Key",
    needsBaseUrl: true
  }
];
const SUBSCRIPTION_IPC_CHANNELS = {
  /** () → SubscriptionStatusMap: the last known statuses, `checking` until a first check answered */
  statuses: "ai:subscription-statuses",
  /** (SubscriptionRecheckRequest?) → SubscriptionStatusMap: look again, answer when done */
  recheck: "ai:subscription-recheck",
  /** (SubscriptionProviderRequest) → SubscriptionLaunchResult: open the CLI's own login */
  login: "ai:subscription-login",
  /** (SubscriptionProviderRequest) → SubscriptionLaunchResult: run the CLI's own logout, then look again */
  logout: "ai:subscription-logout",
  /** (SubscriptionProviderRequest) → SubscriptionLaunchResult: run the vendor install command */
  install: "ai:subscription-install",
  /** (SubscriptionProviderRequest) → SubscriptionLaunchResult: run the official update in a terminal window */
  update: "ai:subscription-update",
  /** (SubscriptionProviderRequest) → SubscriptionLaunchResult: end a login the app started, then look again */
  cancelLogin: "ai:subscription-cancel-login",
  /** (SubscriptionMeteredRequest) → SubscriptionMeteredResult: "use anyway" for a metered login */
  metered: "ai:subscription-metered",
  /** () → boolean: whether this build can generate images through the Codex subscription */
  codexImage: "ai:subscription-codex-image",
  /** event, payload SubscriptionStatusMap: the statuses changed */
  changed: "ai:subscription-changed"
};
function checkingSubscriptionStatus(provider) {
  return { provider, state: "checking", meteredAccepted: false };
}
function subscriptionStatusErrorKind(status) {
  if (status.state !== "error") return null;
  const text2 = status.error ?? "";
  if (text2.startsWith("needs-update:")) return "needs-update";
  if (text2.startsWith("timeout:")) return "timeout";
  return "failed";
}
const SUBSCRIPTION_PROGRAM_PATH_MAX_LENGTH = 32767;
function subscriptionProgramPathOf(value) {
  if (typeof value !== "string") return void 0;
  if (!value || value.length > SUBSCRIPTION_PROGRAM_PATH_MAX_LENGTH) return void 0;
  if (new RegExp("\\p{Cc}", "u").test(value)) return void 0;
  return /^(?:[A-Za-z]:[\\/]|\\\\|\/)/.test(value) ? value : void 0;
}
const SUBSCRIPTION_STATES = [
  "checking",
  "not-installed",
  "signed-out",
  "ready",
  "metered",
  "error"
];
const SUBSCRIPTION_LAUNCH_FAILURES = [
  "not-installed",
  "unsupported",
  "failed",
  "invalid"
];
function isRecord$1(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
const SUBSCRIPTION_ACCOUNT_MAX_LENGTH = 254;
const ACCOUNT_PATTERN = /^[\p{L}\p{N}._%+-]{1,64}@[\p{L}\p{N}-]{1,63}(?:\.[\p{L}\p{N}-]{1,63})+$/u;
function subscriptionAccountOf(value) {
  if (typeof value !== "string") return void 0;
  const account = value.trim();
  return account.length <= SUBSCRIPTION_ACCOUNT_MAX_LENGTH && ACCOUNT_PATTERN.test(account) ? account : void 0;
}
const SUBSCRIPTION_MODELS_MAX = 50;
const SUBSCRIPTION_MODEL_LABEL_MAX = 80;
const MODEL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:[\]-]{0,127}$/;
function modelIdOf(value) {
  if (typeof value !== "string") return void 0;
  const id = value.trim();
  return MODEL_ID_PATTERN.test(id) ? id : void 0;
}
function modelLabelOf(value) {
  if (typeof value !== "string") return "";
  return value.replace(new RegExp("\\p{Cc}+", "gu"), "").replace(/\s+/g, " ").trim().slice(0, SUBSCRIPTION_MODEL_LABEL_MAX);
}
function subscriptionModelsOf(value) {
  if (!Array.isArray(value)) return void 0;
  const models = [];
  const seen = /* @__PURE__ */ new Set();
  for (const entry of value) {
    if (models.length >= SUBSCRIPTION_MODELS_MAX) break;
    if (!isRecord$1(entry)) continue;
    const isDefaultEntry = entry.id === "";
    const id = isDefaultEntry ? "" : modelIdOf(entry.id);
    if (id === void 0 || seen.has(id)) continue;
    const resolved = modelIdOf(entry.resolved);
    if (isDefaultEntry && !resolved) continue;
    seen.add(id);
    models.push({
      id,
      label: modelLabelOf(entry.label) || id || resolved,
      ...resolved ? { resolved } : {},
      ...isDefaultEntry || entry.isDefault === true ? { isDefault: true } : {}
    });
  }
  return models.length > 0 ? models : void 0;
}
function subscriptionStatusMapOf(result2) {
  const raw = isRecord$1(result2) ? result2 : {};
  const statusOf = (provider) => {
    const status = raw[provider];
    if (!isRecord$1(status) || !SUBSCRIPTION_STATES.includes(status.state)) {
      return checkingSubscriptionStatus(provider);
    }
    const read = {
      ...status,
      provider,
      meteredAccepted: status.meteredAccepted === true
    };
    const signedIn = read.state === "ready" || read.state === "metered";
    const account = signedIn ? subscriptionAccountOf(status.account) : void 0;
    const models = signedIn ? subscriptionModelsOf(status.models) : void 0;
    const programPath = subscriptionStatusErrorKind(read) === "needs-update" ? subscriptionProgramPathOf(status.programPath) : void 0;
    delete read.account;
    delete read.models;
    delete read.signingIn;
    delete read.programPath;
    if (account) read.account = account;
    if (models) read.models = models;
    if (programPath) read.programPath = programPath;
    if (status.signingIn === "browser" || status.signingIn === "window") {
      read.signingIn = status.signingIn;
    }
    return read;
  };
  return { "claude-code": statusOf("claude-code"), codex: statusOf("codex") };
}
function subscriptionLaunchResultOf(result2) {
  const raw = isRecord$1(result2) ? result2 : {};
  if (raw.ok === true) return { ok: true };
  const reason = SUBSCRIPTION_LAUNCH_FAILURES.includes(raw.reason) ? raw.reason : "failed";
  return {
    ok: false,
    reason,
    ...typeof raw.installUrl === "string" ? { installUrl: raw.installUrl } : {}
  };
}
(() => {
  const g = globalThis;
  if (g.navigator?.platform) return /mac/i.test(g.navigator.platform);
  return g.process?.platform === "darwin";
})();
const FREE_AI_PROVIDERS = ["openrouter", "gemini"];
function isFreeAiProvider(id) {
  return FREE_AI_PROVIDERS.includes(id);
}
const FREE_AI_IPC_CHANNELS = {
  /** `{ provider: 'openrouter' }` starts the browser sign-in; `{ provider: 'gemini', apiKey }` checks a key */
  connect: "ai:free-connect",
  /** stops a browser sign-in that is still waiting */
  cancel: "ai:free-connect-cancel",
  /** `{ provider }`: forget the key; a selection of it goes back to auto */
  disconnect: "ai:free-disconnect",
  /** `{ provider }`: today's free allowance, when the provider reports it */
  quota: "ai:free-quota",
  /** `{ provider }`: open the page where a key is made */
  openKeyPage: "ai:free-open-key-page"
};
const FAILURES = [
  "cancelled",
  "timeout",
  "denied",
  "invalid",
  "network"
];
function freeAiConnectResultOf(raw) {
  const value = raw ?? {};
  if (value.ok === true && isFreeAiProvider(value.provider) && typeof value.model === "string") {
    return { ok: true, provider: value.provider, model: value.model };
  }
  const reason = FAILURES.find((f) => f === value.reason);
  return { ok: false, reason: reason ?? "network" };
}
function freeAiQuotaOf(raw) {
  const value = raw ?? {};
  const ok = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0;
  return ok(value.used) && ok(value.limit) && ok(value.remaining) ? { used: value.used, limit: value.limit, remaining: value.remaining } : null;
}
const ANTHROPIC_BASE_URL = "https://api.anthropic.com";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
function metaOf(id) {
  return AI_PROVIDERS.find((m) => m.id === id);
}
function modelHasFixedSampling(model) {
  return /(^|\/)(kimi-k3([^\w]|$)|gpt-[5-9]([^\w]|$)|gemini-3([^\w]|$)|o1(-mini|-preview)?([^\w]|$)|o3(-mini)?([^\w]|$)|o4-mini([^\w]|$))/i.test(
    model
  );
}
const DEEPSEEK_WIRE_IDS = { [DEEPSEEK_V41_FLASH]: "deepseek-flash" };
const OPENCODE_GATEWAY_ROOTS = {
  zen: "https://opencode.ai/zen",
  go: "https://opencode.ai/zen/go"
};
function normalizeBaseUrl(raw, fallback) {
  const candidate = (raw ?? fallback).trim();
  if (candidate === "" || candidate.length > 2048) {
    throw new Error("Base URL must be a non-empty http(s) URL under 2048 characters");
  }
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("Base URL must be a valid http(s) URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Base URL must use http or https");
  }
  if (parsed.username || parsed.password) {
    throw new Error("Base URL must not embed credentials; put the key in the API key field");
  }
  parsed.hash = "";
  return parsed.toString();
}
function stripTrailingV1(base) {
  const q = base.indexOf("?");
  const path = (q === -1 ? base : base.slice(0, q)).replace(/\/+$/, "").replace(/\/v1$/, "");
  return q === -1 ? path : `${path}${base.slice(q)}`;
}
function appendPath(base, path) {
  const q = base.indexOf("?");
  return q === -1 ? `${base}${path}` : `${base.slice(0, q)}${path}${base.slice(q)}`;
}
function opencodeEndpoint(root, routes) {
  return (config) => {
    const base = stripTrailingV1(normalizeBaseUrl(config.baseUrl, root));
    const model = config.model ?? "";
    const omit = model !== "" && (modelHasFixedSampling(model) || model.toLowerCase().startsWith("kimi-"));
    const sampling = omit ? { omitTemperature: true } : {};
    if (routes.anthropic.test(model)) return { protocol: "anthropic", baseUrl: base, ...sampling };
    if (routes.gemini?.test(model)) {
      return { protocol: "gemini", baseUrl: appendPath(base, "/v1"), ...sampling };
    }
    return { protocol: "openai-compatible", baseUrl: appendPath(base, "/v1"), ...sampling };
  };
}
function fixedEndpoint(protocol, baseUrl, extras) {
  return (config) => {
    const omit = extras?.omitTemperature || modelHasFixedSampling(config.model);
    return {
      protocol,
      baseUrl: config.baseUrl ? normalizeBaseUrl(config.baseUrl, baseUrl) : baseUrl,
      ...omit ? { omitTemperature: true } : {},
      ...extras?.useMaxCompletionTokens ? { useMaxCompletionTokens: true } : {},
      ...extras?.bodyExtras ? { bodyExtras: extras.bodyExtras } : {}
    };
  };
}
const AI_PROVIDER_ADAPTERS = {
  "claude-code": {
    meta: metaOf("claude-code"),
    capabilities: { auth: "claude-subscription", vision: true },
    resolveEndpoint() {
      return { protocol: "claude-code-cli", baseUrl: "" };
    }
  },
  codex: {
    meta: metaOf("codex"),
    capabilities: { auth: "codex-chatgpt", vision: true },
    resolveEndpoint() {
      return { protocol: "codex-app-server", baseUrl: "" };
    }
  },
  anthropic: {
    meta: metaOf("anthropic"),
    capabilities: { auth: "api-key", vision: true },
    resolveEndpoint: fixedEndpoint("anthropic", ANTHROPIC_BASE_URL)
  },
  gemini: {
    meta: metaOf("gemini"),
    capabilities: { auth: "api-key", vision: true },
    resolveEndpoint: fixedEndpoint("gemini", GEMINI_BASE_URL)
  },
  deepseek: {
    meta: metaOf("deepseek"),
    capabilities: { auth: "api-key", vision: true },
    resolveEndpoint(config) {
      const wire = DEEPSEEK_WIRE_IDS[config.model];
      return {
        ...fixedEndpoint("openai-compatible", "https://api.deepseek.com/v1")(config),
        ...wire ? { model: wire } : {}
      };
    }
  },
  openai: {
    meta: metaOf("openai"),
    capabilities: { auth: "api-key", vision: true },
    // every current OpenAI model accepts the renamed field, so it is safe endpoint-wide;
    // other openai-compatible vendors still expect `max_tokens`
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://api.openai.com/v1", {
      useMaxCompletionTokens: true
    })
  },
  kimi: {
    meta: metaOf("kimi"),
    capabilities: { auth: "api-key", vision: true },
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://api.moonshot.ai/v1", {
      omitTemperature: true
    })
  },
  glm: {
    meta: metaOf("glm"),
    capabilities: { auth: "api-key", vision: false },
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://open.bigmodel.cn/api/paas/v4")
  },
  qwen: {
    meta: metaOf("qwen"),
    capabilities: { auth: "api-key", vision: false },
    resolveEndpoint: fixedEndpoint(
      "openai-compatible",
      "https://dashscope.aliyuncs.com/compatible-mode/v1"
    )
  },
  doubao: {
    meta: metaOf("doubao"),
    capabilities: { auth: "api-key", vision: true },
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://ark.cn-beijing.volces.com/api/v3")
  },
  mimo: {
    meta: metaOf("mimo"),
    // the V2.6 series is omni-modal: text, image, video and audio in, text out
    capabilities: { auth: "api-key", vision: true },
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://api.xiaomimimo.com/v1")
  },
  hunyuan: {
    meta: metaOf("hunyuan"),
    // conservative: the chat models are documented for text first, so we do not
    // hand them screenshots until a model card says otherwise
    capabilities: { auth: "api-key", vision: false },
    // mainland TokenHub host; the intl one (tokenhub-intl.tencentcloudmaas.com)
    // is reachable by storing a base URL on this provider
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://tokenhub.tencentcloudmaas.com/v1")
  },
  ling: {
    meta: metaOf("ling"),
    capabilities: { auth: "api-key", vision: true },
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://api.ant-ling.com/v1")
  },
  spark: {
    meta: metaOf("spark"),
    capabilities: { auth: "api-key", vision: false },
    // endpointUrl() appends chat/completions to this documented /v2 base
    resolveEndpoint: fixedEndpoint(
      "openai-compatible",
      "https://maas-api.cn-huabei-1.xf-yun.com/v2"
    )
  },
  longcat: {
    meta: metaOf("longcat"),
    capabilities: { auth: "api-key", vision: true },
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://api.longcat.chat/openai/v1")
  },
  minimax: {
    meta: metaOf("minimax"),
    capabilities: { auth: "api-key", vision: true },
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://api.minimax.io/v1")
  },
  xai: {
    meta: metaOf("xai"),
    capabilities: { auth: "api-key", vision: true },
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://api.x.ai/v1")
  },
  mistral: {
    meta: metaOf("mistral"),
    capabilities: { auth: "api-key", vision: false },
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://api.mistral.ai/v1")
  },
  openrouter: {
    meta: metaOf("openrouter"),
    capabilities: { auth: "api-key", vision: true },
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://openrouter.ai/api/v1")
  },
  requesty: {
    meta: metaOf("requesty"),
    capabilities: { auth: "api-key", vision: true },
    // a stored base URL selects a regional router (https://router.eu.requesty.ai/v1 for the EU)
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://router.requesty.ai/v1")
  },
  opper: {
    meta: metaOf("opper"),
    capabilities: { auth: "api-key", vision: true },
    // one chat-completions endpoint for every pool and vendor route; the model id picks it
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://api.opper.ai/v3/compat")
  },
  cheaperinference: {
    meta: metaOf("cheaperinference"),
    capabilities: { auth: "api-key", vision: true },
    // one chat-completions endpoint for every model; the model id picks the lab
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://api.cheaperinference.com/v1")
  },
  atlascloud: {
    meta: metaOf("atlascloud"),
    capabilities: { auth: "api-key", vision: true },
    // one chat-completions endpoint for every lab; the namespaced model id picks it
    resolveEndpoint: fixedEndpoint("openai-compatible", "https://api.atlascloud.ai/v1")
  },
  "opencode-zen": {
    meta: metaOf("opencode-zen"),
    capabilities: { auth: "api-key", vision: true },
    // Claude and Qwen ride /v1/messages, Gemini its native generateContent path
    resolveEndpoint: opencodeEndpoint(OPENCODE_GATEWAY_ROOTS.zen, {
      anthropic: /^(claude-|qwen)/,
      gemini: /^gemini-/
    })
  },
  "opencode-go": {
    meta: metaOf("opencode-go"),
    capabilities: { auth: "api-key", vision: true },
    // MiniMax and Qwen 3.8 Flash ride /v1/messages; the rest is chat-completions
    // (the Go docs table lists every Qwen on Messages, but the client config
    // OpenCode ships routes only 3.8 Flash there — follow the running client)
    resolveEndpoint: opencodeEndpoint(OPENCODE_GATEWAY_ROOTS.go, {
      anthropic: /^(minimax-|qwen3\.8-flash$)/
    })
  },
  custom: {
    meta: metaOf("custom"),
    capabilities: { auth: "api-key", vision: true },
    resolveEndpoint(config) {
      if (!config.baseUrl) throw new Error("A custom provider requires a Base URL");
      return {
        protocol: "openai-compatible",
        baseUrl: normalizeBaseUrl(config.baseUrl, ""),
        ...modelHasFixedSampling(config.model) ? { omitTemperature: true } : {}
      };
    }
  }
};
function getProviderAdapter(provider) {
  const adapter = AI_PROVIDER_ADAPTERS[provider];
  if (!adapter) throw new Error(`Unknown provider: ${provider}`);
  return adapter;
}
const DROP_OPEN_CHANNEL = "app:open-dropped-files";
const OPENABLE_DOC_RE = /\.(docx|odt|xlsx|xlsm|xls|csv|tsv|pptx|pdf|md|markdown|html|htm|xmind|hwp|hwpx)$/i;
const KNOWN_UNSUPPORTED_DOC_RE = /\.(doc|rtf|ppt|pps|odp|ods|xlsb|pages|key|numbers)$/i;
const MAX_DROPPED_FILES = 20;
function tryResolvePath(file, getPathForFile) {
  try {
    return getPathForFile(file).trim();
  } catch {
    return "";
  }
}
const MAX_RESOLVED_DROP_PATHS = 100;
const MAX_DROP_PATH_CHARS = 4096;
function droppableFilePaths(ev, getPathForFile) {
  const transfer = ev.dataTransfer;
  if (!transfer || !transfer.types.includes("Files")) return null;
  const paths = [];
  for (const file of Array.from(transfer.files)) {
    if (paths.length >= MAX_RESOLVED_DROP_PATHS) break;
    const path = tryResolvePath(file, getPathForFile);
    if (!path || path.length > MAX_DROP_PATH_CHARS) continue;
    paths.push(path);
  }
  return paths;
}
const INSTALLED = /* @__PURE__ */ Symbol.for("genoffice.drop-open-installed");
function installDropOpenBridge() {
  const holder = globalThis;
  if (typeof window === "undefined" || holder[INSTALLED]) return;
  holder[INSTALLED] = true;
  window.addEventListener("dragover", (ev) => {
    if (ev.defaultPrevented) return;
    if (!ev.dataTransfer?.types.includes("Files")) return;
    ev.preventDefault();
  });
  window.addEventListener("drop", (ev) => {
    if (ev.defaultPrevented) return;
    const paths = droppableFilePaths(ev, (file) => electron.webUtils.getPathForFile(file));
    if (!paths) return;
    const payload = paths.filter((p) => OPENABLE_DOC_RE.test(p) || KNOWN_UNSUPPORTED_DOC_RE.test(p));
    ev.preventDefault();
    if (payload.length === 0) return;
    electron.ipcRenderer.send(DROP_OPEN_CHANNEL, payload.slice(0, MAX_DROPPED_FILES));
  });
}
const USER_SKILLS_BRIDGE_KEY = "aiOfficeUserSkills";
const USER_SKILLS_CHANNELS = {
  list: "skills:list",
  read: "skills:read",
  setState: "skills:set-state",
  hideBuiltin: "skills:hide-builtin",
  unhideBuiltins: "skills:unhide-builtins",
  remove: "skills:remove",
  copyToMine: "skills:copy-to-mine",
  suggestName: "skills:suggest-name",
  checkName: "skills:check-name",
  save: "skills:save",
  saveFromCard: "skills:save-from-card",
  importFolder: "skills:import-folder",
  importZip: "skills:import-zip",
  importGitHub: "skills:import-github",
  cancelImport: "skills:cancel-import",
  install: "skills:install",
  checkUpdate: "skills:check-update",
  applyUpdate: "skills:apply-update",
  cancelUpdate: "skills:cancel-update",
  exportInfo: "skills:export-info",
  exportZip: "skills:export-zip",
  openFolder: "skills:open-folder",
  aiRead: "skills:ai-read",
  aiReadFile: "skills:ai-read-file",
  openSettings: "skills:open-settings",
  agentNotice: "skills:agent-notice",
  agentNoticeSeen: "skills:agent-notice-seen",
  /** a template skill's copy in a new tab of its editor, with the request handed over (spec 5.7) */
  openTemplate: "skills:open-template",
  /** the current document's copy in a template preview tab (spec 5.6) */
  openPreview: "skills:open-preview",
  /** the preview tab: the original document's bytes, for "save the original as is" */
  previewOriginal: "skills:preview-original",
  /** the preview tab: its card was saved or cancelled */
  finishPreview: "skills:finish-preview",
  /** a new tab's AI panel takes its skill hand-off, once */
  takeHandoff: "skills:take-handoff",
  /** bring a tab this flow opened to the front */
  focusTab: "skills:focus-tab",
  /** main → the original tab: its template preview ended (saved, or not) */
  previewEnded: "skills:preview-ended",
  /** main → every window: the list or a state changed; read the list again */
  changed: "skills:changed"
};
function isRecord(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function text(value, max = 1e6) {
  return typeof value === "string" && value.length <= max ? value : void 0;
}
function skillIdOf(value) {
  const id = text(value, 512);
  return id && id.includes(":") ? id : void 0;
}
function skillViewsOf(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item) => isRecord(item) && typeof item.id === "string" && typeof item.name === "string"
  );
}
function skillsResultOf(value) {
  if (isRecord(value) && typeof value.ok === "boolean") return value;
  return { ok: false, reason: "failed" };
}
function previewEndedOf(value) {
  if (!isRecord(value)) return void 0;
  const previewId = text(value.previewId, 128);
  const outcome = value.outcome === "saved" || value.outcome === "unsaved" ? value.outcome : null;
  if (!previewId || !outcome) return void 0;
  const skillId = value.skillId === void 0 ? void 0 : skillIdOf(value.skillId);
  const title = value.title === void 0 ? void 0 : text(value.title, 1e4);
  return {
    previewId,
    outcome,
    ...skillId ? { skillId } : {},
    ...title !== void 0 ? { title } : {}
  };
}
const unavailable = { ok: false, reason: "failed" };
async function result(channel, ...args) {
  try {
    return skillsResultOf(await electron.ipcRenderer.invoke(channel, ...args));
  } catch {
    return unavailable;
  }
}
function userSkillsBridge() {
  return {
    list: async () => skillViewsOf(await electron.ipcRenderer.invoke(USER_SKILLS_CHANNELS.list).catch(() => [])),
    read: (id) => result(USER_SKILLS_CHANNELS.read, String(id)),
    setState: (id, patch) => result(USER_SKILLS_CHANNELS.setState, String(id), patch),
    hideBuiltin: (id) => result(USER_SKILLS_CHANNELS.hideBuiltin, String(id)),
    unhideBuiltins: (names) => result(USER_SKILLS_CHANNELS.unhideBuiltins, names),
    remove: (id) => result(USER_SKILLS_CHANNELS.remove, String(id)),
    copyToMine: (id, overwrite) => result(USER_SKILLS_CHANNELS.copyToMine, String(id), overwrite === true),
    suggestName: async (title) => {
      const name = await electron.ipcRenderer.invoke(USER_SKILLS_CHANNELS.suggestName, String(title)).catch(() => "");
      return typeof name === "string" ? name : "";
    },
    checkName: async (name, forId) => {
      const answer = await electron.ipcRenderer.invoke(USER_SKILLS_CHANNELS.checkName, String(name), forId).catch(() => void 0);
      const value = answer && typeof answer === "object" ? answer : {};
      if (value.ok === true) return { ok: true };
      return {
        ok: false,
        problem: typeof value.problem === "string" ? value.problem : "empty"
      };
    },
    save: (input) => result(USER_SKILLS_CHANNELS.save, input),
    saveFromCard: (input) => result(USER_SKILLS_CHANNELS.saveFromCard, input),
    importFolder: () => result(USER_SKILLS_CHANNELS.importFolder),
    importZip: () => result(USER_SKILLS_CHANNELS.importZip),
    importGitHub: (address) => result(USER_SKILLS_CHANNELS.importGitHub, String(address)),
    cancelImport: async (token) => {
      await electron.ipcRenderer.invoke(USER_SKILLS_CHANNELS.cancelImport, token).catch(() => void 0);
    },
    install: (token, selected, onCollision) => result(USER_SKILLS_CHANNELS.install, { token, selected, onCollision: onCollision ?? {} }),
    checkUpdate: async (id) => {
      try {
        const answer = await electron.ipcRenderer.invoke(USER_SKILLS_CHANNELS.checkUpdate, String(id));
        return skillsResultOf(answer);
      } catch {
        return unavailable;
      }
    },
    applyUpdate: (token) => result(USER_SKILLS_CHANNELS.applyUpdate, String(token)),
    cancelUpdate: async (token) => {
      await electron.ipcRenderer.invoke(USER_SKILLS_CHANNELS.cancelUpdate, String(token)).catch(() => void 0);
    },
    exportInfo: (id) => result(USER_SKILLS_CHANNELS.exportInfo, String(id)),
    exportZip: (id) => result(USER_SKILLS_CHANNELS.exportZip, String(id)),
    openFolder: (id) => result(USER_SKILLS_CHANNELS.openFolder, String(id)),
    aiRead: (id) => result(USER_SKILLS_CHANNELS.aiRead, String(id)),
    aiReadFile: (id, rel) => result(USER_SKILLS_CHANNELS.aiReadFile, String(id), String(rel)),
    openSettings: async () => {
      await electron.ipcRenderer.invoke(USER_SKILLS_CHANNELS.openSettings).catch(() => void 0);
    },
    agentNotice: async () => await electron.ipcRenderer.invoke(USER_SKILLS_CHANNELS.agentNotice).catch(() => false) === true,
    markAgentNoticeSeen: async () => {
      await electron.ipcRenderer.invoke(USER_SKILLS_CHANNELS.agentNoticeSeen).catch(() => void 0);
    },
    openTemplate: (input) => result(USER_SKILLS_CHANNELS.openTemplate, input),
    openPreview: (input) => result(USER_SKILLS_CHANNELS.openPreview, input),
    previewOriginal: (previewId) => result(USER_SKILLS_CHANNELS.previewOriginal, String(previewId)),
    finishPreview: (previewId, outcome, saved) => result(USER_SKILLS_CHANNELS.finishPreview, {
      previewId: String(previewId),
      outcome,
      ...saved ? { skillId: saved.skillId, title: saved.title } : {}
    }),
    takeHandoff: async (target) => {
      const answer = await electron.ipcRenderer.invoke(USER_SKILLS_CHANNELS.takeHandoff, String(target)).catch(() => null);
      return answer && typeof answer === "object" ? answer : null;
    },
    focusTab: (tabId) => result(USER_SKILLS_CHANNELS.focusTab, String(tabId)),
    onPreviewEnded(listener) {
      const handler = (_event, raw) => {
        const ended = previewEndedOf(raw);
        if (ended) listener(ended);
      };
      electron.ipcRenderer.on(USER_SKILLS_CHANNELS.previewEnded, handler);
      return () => {
        electron.ipcRenderer.removeListener(USER_SKILLS_CHANNELS.previewEnded, handler);
      };
    },
    onChanged(listener) {
      const handler = () => listener();
      electron.ipcRenderer.on(USER_SKILLS_CHANNELS.changed, handler);
      return () => {
        electron.ipcRenderer.removeListener(USER_SKILLS_CHANNELS.changed, handler);
      };
    }
  };
}
const AI_FONT_SIZES = ["default", "large", "xlarge", "custom"];
const AI_FONT_BASE_PX = 14;
const AI_CUSTOM_FONT_MIN_PX = 10;
const AI_CUSTOM_FONT_MAX_PX = 32;
const DEFAULT_AI_PANEL_PREFS = {
  fontSize: "default",
  customFontSize: AI_FONT_BASE_PX,
  spellcheck: true,
  openInNewDocs: true
};
function isAiFontSize(value) {
  return typeof value === "string" && AI_FONT_SIZES.includes(value);
}
function clampAiCustomFontSize(value) {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return Math.min(AI_CUSTOM_FONT_MAX_PX, Math.max(AI_CUSTOM_FONT_MIN_PX, Math.round(n)));
}
function normalizeAiPanelPrefs(raw) {
  const obj = raw !== null && typeof raw === "object" ? raw : {};
  return {
    side: obj.side === "right" ? "right" : "left",
    fontSize: isAiFontSize(obj.fontSize) ? obj.fontSize : DEFAULT_AI_PANEL_PREFS.fontSize,
    customFontSize: clampAiCustomFontSize(obj.customFontSize) ?? DEFAULT_AI_PANEL_PREFS.customFontSize,
    spellcheck: typeof obj.spellcheck === "boolean" ? obj.spellcheck : DEFAULT_AI_PANEL_PREFS.spellcheck,
    openInNewDocs: typeof obj.openInNewDocs === "boolean" ? obj.openInNewDocs : DEFAULT_AI_PANEL_PREFS.openInNewDocs
  };
}
const HOME_CHANNELS = {
  openHelp: "home:open-help",
  recents: "home:recents",
  searchFiles: "home:search-files",
  rerankSearch: "home:rerank-search",
  getFileSearchSettings: "home:get-file-search-settings",
  setFileSearchSettings: "home:set-file-search-settings",
  testFileSearchRerank: "home:test-file-search-rerank",
  starred: "home:starred",
  statPaths: "home:stat-paths",
  toggleStar: "home:toggle-star",
  unstarPaths: "home:unstar-paths",
  starredGroups: "home:starred-groups",
  setStarredGroup: "home:set-starred-group",
  openPath: "home:open-path",
  browse: "home:browse",
  newDoc: "home:new-doc",
  newSheet: "home:new-sheet",
  newSlide: "home:new-slide",
  newMarkdown: "home:new-markdown",
  newHtml: "home:new-html",
  newMindmap: "home:new-mindmap",
  newHwp: "home:new-hwp",
  newPdf: "home:new-pdf",
  removeRecent: "home:remove-recent",
  revealPath: "home:reveal-path",
  renameFile: "home:rename-file",
  duplicateFile: "home:duplicate-file",
  deleteFiles: "home:delete-files",
  openTrash: "home:open-trash",
  folderRoots: "home:folder-roots",
  addFolderRoot: "home:folder-root-add",
  dropFolderRoots: "home:folder-root-drop",
  removeFolderRoot: "home:folder-root-remove",
  listFolder: "home:folder-list",
  createFolder: "home:folder-create",
  renameFolder: "home:folder-rename",
  movePaths: "home:move-paths",
  deleteFolder: "home:folder-delete",
  folderChanged: "home:folder-changed",
  getLanguage: "home:get-language",
  setLanguage: "home:set-language",
  getUpdateChannel: "home:get-update-channel",
  setUpdateChannel: "home:set-update-channel",
  openSettings: "home:open-settings",
  getAppVersion: "home:get-app-version",
  onboardingSeen: "home:onboarding-seen",
  setOnboardingSeen: "home:set-onboarding-seen",
  getTheme: "home:get-theme",
  setTheme: "home:set-theme",
  getDocumentTheme: "home:get-document-theme",
  setDocumentTheme: "home:set-document-theme",
  getAutoSaveDefault: "home:get-auto-save-default",
  setAutoSaveDefault: "home:set-auto-save-default",
  getMcpStatus: "home:get-mcp-status",
  setMcpSettings: "home:set-mcp-settings",
  getMcpLogs: "home:get-mcp-logs",
  clearMcpLogs: "home:clear-mcp-logs",
  openMcpLogFile: "home:open-mcp-log-file",
  getAiPanelPrefs: "home:get-ai-panel-prefs",
  setAiPanelPrefs: "home:set-ai-panel-prefs",
  getDefaultSaveDir: "home:get-default-save-dir",
  getDefaultAppStatus: "home:get-default-app-status",
  setDefaultApp: "home:set-default-app",
  pickDefaultSaveDir: "home:pick-default-save-dir",
  openGitHubRepo: "home:open-github-repo",
  openFeedbackSurvey: "home:open-feedback-survey",
  openLicenseNotices: "home:open-license-notices",
  openRightsContact: "home:open-rights-contact"
};
const INTEGRATIONS_CHANNELS = {
  status: "integrations:status",
  installSkill: "integrations:install-skill",
  uninstallSkill: "integrations:uninstall-skill",
  pickSkillDir: "integrations:pick-skill-dir",
  saveSkillZip: "integrations:save-skill-zip",
  copyText: "integrations:copy-text"
};
const RESULT_STORE_CHANNELS = {
  size: "home:result-store-size",
  deleteAll: "home:result-store-delete-all"
};
const DRIVE_AI_CHANNELS = {
  /** main → every window: the Drive state changed (payload: the shell's DriveUiState) */
  changed: "drive:state-changed"
};
const DRIVE_CHANNELS = {
  state: "drive:state",
  stateChanged: DRIVE_AI_CHANNELS.changed,
  connect: "drive:connect",
  cancelConnect: "drive:cancel-connect",
  disconnect: "drive:disconnect",
  setAiAccess: "drive:set-ai-access",
  list: "drive:list",
  open: "drive:open"
};
const TABS_CHANNELS = {
  list: "tabs:list",
  activate: "tabs:activate",
  close: "tabs:close",
  showMenu: "tabs:show-menu",
  showNewMenu: "tabs:show-new-menu",
  showTabMenu: "tabs:show-tab-menu",
  detach: "tabs:detach",
  tearOff: "tabs:tear-off",
  dragTornWindow: "tabs:drag-torn-window",
  dockTornWindow: "tabs:dock-torn-window",
  endTornDrag: "tabs:end-torn-drag",
  dockPreview: "tabs:dock-preview",
  dockIndex: "tabs:dock-index",
  showAppMenu: "tabs:show-app-menu",
  reorder: "tabs:reorder",
  changed: "tabs:changed",
  chromePressed: "tabs:chrome-pressed"
};
const SPLIT_TABS_CHANNELS = {
  /** invoke: returns SplitViewState | null */
  get: "tabs:get-split",
  /** push: SplitViewState | null */
  changed: "tabs:split-changed",
  /** push: SplitHint | null */
  hint: "tabs:split-hint",
  /** send: number */
  setRatio: "tabs:set-split-ratio"
};
const GENERATE_HOME_CHANNELS = {
  openWithPaths: "generate:open-with-paths",
  openWithGroup: "generate:open-with-group"
};
const PDF_TOOLS_HOME_CHANNELS = {
  open: "pdf-tools:open"
};
const AGENT_HOME_OPEN_CHANNEL = "home:open-agent-window";
const DEFAULT_QUICK_LOOK_SETTINGS = {
  explorerSpacePreview: true,
  keepInTray: false
};
function normalizeQuickLookSettings(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_QUICK_LOOK_SETTINGS };
  }
  const obj = raw;
  return {
    explorerSpacePreview: typeof obj.explorerSpacePreview === "boolean" ? obj.explorerSpacePreview : DEFAULT_QUICK_LOOK_SETTINGS.explorerSpacePreview,
    keepInTray: typeof obj.keepInTray === "boolean" ? obj.keepInTray : DEFAULT_QUICK_LOOK_SETTINGS.keepInTray
  };
}
const QUICK_LOOK_HOME_CHANNELS = {
  preview: "quick-look:home-inspect",
  getSettings: "quick-look:get-settings",
  setSettings: "quick-look:set-settings"
};
const SHELL_SUBSCRIPTION_CHANNELS = {
  /** (AiSubscriptionProviderId) → void: open the vendor's install page */
  openInstallHelp: "home:open-subscription-install-help"
};
const UI_LANGUAGES = [
  "zh",
  "en",
  "ja",
  "ko",
  "fr",
  "de",
  "es",
  "th",
  "id",
  "ru",
  "ar",
  "pt",
  "it",
  "pl",
  "cs",
  "nl",
  "ms",
  "he",
  "hi",
  "zh-TW",
  "vi"
];
function isUiLanguage(value) {
  return UI_LANGUAGES.includes(value);
}
const EMPTY_PAGE = { entries: [], total: 0, totalAll: 0 };
function asRecentPage(result2) {
  if (result2 && typeof result2 === "object" && Array.isArray(result2.entries)) {
    return result2;
  }
  return EMPTY_PAGE;
}
const EMPTY_SEARCH = {
  hits: [],
  total: 0,
  index: { indexed: 0, pending: 0, scanning: false }
};
function asSearchPage(result2) {
  if (result2 && typeof result2 === "object" && Array.isArray(result2.hits)) {
    return result2;
  }
  return EMPTY_SEARCH;
}
function normalizeDefaultAppStatus(result2) {
  const r = result2 ?? {};
  const state = r.state;
  return {
    state: state === "default" || state === "other" || state === "unknown" ? state : "unsupported",
    others: Array.isArray(r.others) ? r.others.filter((x) => typeof x === "string") : [],
    manualOnly: r.manualOnly === true
  };
}
const homeApi = {
  async recents(query) {
    return asRecentPage(await electron.ipcRenderer.invoke(HOME_CHANNELS.recents, query));
  },
  async searchFiles(query) {
    return asSearchPage(await electron.ipcRenderer.invoke(HOME_CHANNELS.searchFiles, query));
  },
  async rerankSearch(query) {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.rerankSearch, query);
    return result2 && typeof result2 === "object" && Array.isArray(result2.order) ? result2 : null;
  },
  async getFileSearchSettings() {
    return await electron.ipcRenderer.invoke(HOME_CHANNELS.getFileSearchSettings);
  },
  async setFileSearchSettings(patch) {
    return await electron.ipcRenderer.invoke(
      HOME_CHANNELS.setFileSearchSettings,
      patch
    );
  },
  async testFileSearchRerank(input) {
    const raw = await electron.ipcRenderer.invoke(HOME_CHANNELS.testFileSearchRerank, input) ?? {};
    return raw.ok === true ? { ok: true } : { ok: false, error: typeof raw.error === "string" ? raw.error : "Connection failed" };
  },
  async starred(query) {
    return asRecentPage(await electron.ipcRenderer.invoke(HOME_CHANNELS.starred, query));
  },
  async starredGroups() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.starredGroups);
    return Array.isArray(result2) ? result2.filter((g) => typeof g === "string") : [];
  },
  async setStarredGroup(paths, group) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.setStarredGroup, paths, group);
  },
  async statPaths(paths) {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.statPaths, paths);
    return Array.isArray(result2) ? result2 : [];
  },
  async toggleStar(path) {
    if (typeof path !== "string" || !path) throw new Error("Invalid path.");
    await electron.ipcRenderer.invoke(HOME_CHANNELS.toggleStar, path);
  },
  async openHelp(topic) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.openHelp, typeof topic === "string" ? topic : void 0);
  },
  // knowledge-base ask panel (handlers live in the shell main, same process
  // that owns the index and the shared ai:stream registration)
  async kbList(scope) {
    return scope === void 0 ? electron.ipcRenderer.invoke("kb:list") : electron.ipcRenderer.invoke("kb:list", { scope });
  },
  async kbSearch(query, scope) {
    return electron.ipcRenderer.invoke("kb:search", scope === void 0 ? query : { ...query, scope });
  },
  async kbRead(path, offset, scope) {
    return electron.ipcRenderer.invoke(
      "kb:read",
      scope === void 0 ? { path, offset } : { path, offset, scope }
    );
  },
  async kbOpenScope(group) {
    const scope = await electron.ipcRenderer.invoke("kb:open-scope", group);
    if (typeof scope !== "string" || !scope) throw new Error("knowledge-base scope is not open");
    return scope;
  },
  async kbCloseScope(scope) {
    await electron.ipcRenderer.invoke("kb:close-scope", scope);
  },
  async aiGetSettings() {
    return electron.ipcRenderer.invoke("ai:get-settings");
  },
  async aiStream(request) {
    await electron.ipcRenderer.invoke("ai:stream", request);
  },
  async aiStreamCancel(requestId) {
    await electron.ipcRenderer.invoke("ai:stream-cancel", requestId);
  },
  onAiStream(handler) {
    const listener = (_event, chunk) => handler(chunk);
    electron.ipcRenderer.on("ai:stream-chunk", listener);
    return () => electron.ipcRenderer.removeListener("ai:stream-chunk", listener);
  },
  async openPath(path) {
    if (typeof path !== "string" || !path) throw new Error("Invalid path.");
    await electron.ipcRenderer.invoke(HOME_CHANNELS.openPath, path);
  },
  async browse() {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.browse);
  },
  async newDoc(opts) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.newDoc, opts);
  },
  async newSheet(opts) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.newSheet, opts);
  },
  async newSlide(opts) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.newSlide, opts);
  },
  async newMarkdown(opts) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.newMarkdown, opts);
  },
  async newHtml(opts) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.newHtml, opts);
  },
  async newMindmap(opts) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.newMindmap, opts);
  },
  async newHwp(opts) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.newHwp, opts);
  },
  async newPdf(opts) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.newPdf, opts);
  },
  async removeRecent(paths) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.removeRecent, paths);
  },
  async unstarPaths(paths) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.unstarPaths, paths);
  },
  async revealPath(path) {
    if (typeof path !== "string" || !path) throw new Error("Invalid path.");
    await electron.ipcRenderer.invoke(HOME_CHANNELS.revealPath, path);
  },
  async renameFile(path, newName) {
    if (typeof path !== "string" || !path) throw new Error("Invalid path.");
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.renameFile, path, newName);
    return result2 ?? { ok: false, error: "Rename failed" };
  },
  async duplicateFile(path) {
    if (typeof path !== "string" || !path) throw new Error("Invalid path.");
    await electron.ipcRenderer.invoke(HOME_CHANNELS.duplicateFile, path);
  },
  async deleteFiles(paths) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.deleteFiles, paths);
  },
  async folderRoots() {
    return await electron.ipcRenderer.invoke(HOME_CHANNELS.folderRoots);
  },
  async addFolderRoot() {
    return await electron.ipcRenderer.invoke(HOME_CHANNELS.addFolderRoot);
  },
  async dropFolderRoots(paths) {
    return await electron.ipcRenderer.invoke(HOME_CHANNELS.dropFolderRoots, paths);
  },
  async removeFolderRoot(path) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.removeFolderRoot, path);
  },
  pathForFile(file) {
    return electron.webUtils.getPathForFile(file);
  },
  async listFolder(dir) {
    return await electron.ipcRenderer.invoke(HOME_CHANNELS.listFolder, dir);
  },
  async createFolder(parent, name) {
    return await electron.ipcRenderer.invoke(HOME_CHANNELS.createFolder, parent, name);
  },
  async renameFolder(dir, newName) {
    return await electron.ipcRenderer.invoke(HOME_CHANNELS.renameFolder, dir, newName);
  },
  async movePaths(paths, targetDir, onConflict) {
    return await electron.ipcRenderer.invoke(
      HOME_CHANNELS.movePaths,
      paths,
      targetDir,
      onConflict
    );
  },
  async deleteFolder(dir) {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.deleteFolder, dir);
  },
  onFolderChanged(handler) {
    const listener = (_event, dirs) => {
      if (Array.isArray(dirs)) handler(dirs.filter((d) => typeof d === "string"));
    };
    electron.ipcRenderer.on(HOME_CHANNELS.folderChanged, listener);
    return () => electron.ipcRenderer.removeListener(HOME_CHANNELS.folderChanged, listener);
  },
  async openTrash() {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.openTrash);
  },
  async getLanguage() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.getLanguage);
    return isUiLanguage(result2) ? result2 : "zh";
  },
  async setLanguage(lang) {
    if (!isUiLanguage(lang)) throw new Error("Invalid language.");
    await electron.ipcRenderer.invoke(HOME_CHANNELS.setLanguage, lang);
  },
  async getUpdateChannel() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.getUpdateChannel);
    return result2 === "beta" ? "beta" : "stable";
  },
  async setUpdateChannel(channel) {
    if (channel !== "stable" && channel !== "beta") throw new Error("Invalid update channel.");
    await electron.ipcRenderer.invoke(HOME_CHANNELS.setUpdateChannel, channel);
  },
  onOpenSettings(handler) {
    const listener = (_event, target) => handler(target);
    electron.ipcRenderer.on(HOME_CHANNELS.openSettings, listener);
    return () => electron.ipcRenderer.removeListener(HOME_CHANNELS.openSettings, listener);
  },
  async getAppVersion() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.getAppVersion);
    return typeof result2 === "string" ? result2 : "";
  },
  async getUpdateState() {
    const result2 = await electron.ipcRenderer.invoke("update:get-state");
    return result2 ?? null;
  },
  async openUpdateDialog() {
    const result2 = await electron.ipcRenderer.invoke("update:open-for-update");
    return result2 === true;
  },
  onUpdateStateChanged(handler) {
    const listener = (_e, state) => handler(state);
    electron.ipcRenderer.on("update:state-changed", listener);
    return () => electron.ipcRenderer.removeListener("update:state-changed", listener);
  },
  async onboardingSeen() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.onboardingSeen);
    return result2 === true;
  },
  async setOnboardingSeen() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.setOnboardingSeen);
    return result2 === true;
  },
  async getTheme() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.getTheme);
    return result2 === "dark" || result2 === "light" ? result2 : "system";
  },
  async setTheme(theme) {
    if (theme !== "light" && theme !== "dark" && theme !== "system")
      throw new Error("Invalid theme.");
    await electron.ipcRenderer.invoke(HOME_CHANNELS.setTheme, theme);
  },
  async getDocumentTheme() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.getDocumentTheme);
    return result2 === "dark" || result2 === "light" ? result2 : "follow";
  },
  async setDocumentTheme(theme) {
    if (theme !== "light" && theme !== "dark" && theme !== "follow")
      throw new Error("Invalid document theme.");
    await electron.ipcRenderer.invoke(HOME_CHANNELS.setDocumentTheme, theme);
  },
  async getAutoSaveDefault() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.getAutoSaveDefault);
    const r = result2;
    return {
      on: r?.on === true,
      updatedAt: typeof r?.updatedAt === "number" ? r.updatedAt : 0
    };
  },
  async setAutoSaveDefault(on) {
    if (typeof on !== "boolean") throw new Error("Invalid AutoSave default.");
    await electron.ipcRenderer.invoke(HOME_CHANNELS.setAutoSaveDefault, on);
  },
  async getMcpStatus() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.getMcpStatus);
    const r = result2;
    return {
      running: r?.running === true,
      enabled: r?.enabled === true,
      port: typeof r?.port === "number" ? r.port : 3093,
      background: r?.background === true,
      logging: r?.logging === true,
      url: typeof r?.url === "string" ? r.url : null,
      capabilities: Array.isArray(r?.capabilities) ? r.capabilities.filter((c) => typeof c === "string") : ["docs"],
      ...typeof r?.error === "string" ? { error: r.error } : {}
    };
  },
  async setMcpSettings(patch) {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.setMcpSettings, patch);
    const r = result2;
    return {
      running: r?.running === true,
      enabled: r?.enabled === true,
      port: typeof r?.port === "number" ? r.port : 3093,
      background: r?.background === true,
      logging: r?.logging === true,
      url: typeof r?.url === "string" ? r.url : null,
      capabilities: Array.isArray(r?.capabilities) ? r.capabilities.filter((c) => typeof c === "string") : ["docs"],
      ...typeof r?.error === "string" ? { error: r.error } : {}
    };
  },
  async getMcpLogs() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.getMcpLogs);
    return Array.isArray(result2) ? result2.filter((l) => typeof l === "string") : [];
  },
  async clearMcpLogs() {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.clearMcpLogs);
  },
  async openMcpLogFile() {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.openMcpLogFile);
  },
  async getAiPanelPrefs() {
    return normalizeAiPanelPrefs(await electron.ipcRenderer.invoke(HOME_CHANNELS.getAiPanelPrefs));
  },
  async setAiPanelPrefs(patch) {
    return normalizeAiPanelPrefs(await electron.ipcRenderer.invoke(HOME_CHANNELS.setAiPanelPrefs, patch));
  },
  async getDefaultSaveDir() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.getDefaultSaveDir);
    return typeof result2 === "string" ? result2 : "";
  },
  async getDefaultAppStatus() {
    return normalizeDefaultAppStatus(await electron.ipcRenderer.invoke(HOME_CHANNELS.getDefaultAppStatus));
  },
  async setDefaultApp() {
    return normalizeDefaultAppStatus(await electron.ipcRenderer.invoke(HOME_CHANNELS.setDefaultApp));
  },
  async pickDefaultSaveDir() {
    const result2 = await electron.ipcRenderer.invoke(HOME_CHANNELS.pickDefaultSaveDir);
    return typeof result2 === "string" && result2 ? result2 : null;
  },
  onThemeChanged(handler) {
    const listener = (_event, theme) => {
      if (theme === "light" || theme === "dark" || theme === "system") handler(theme);
    };
    electron.ipcRenderer.on("app:theme-changed", listener);
    return () => electron.ipcRenderer.removeListener("app:theme-changed", listener);
  },
  onDocumentThemeChanged(handler) {
    const listener = (_event, theme) => {
      if (theme === "light" || theme === "dark" || theme === "follow") handler(theme);
    };
    electron.ipcRenderer.on("app:document-theme-changed", listener);
    return () => electron.ipcRenderer.removeListener("app:document-theme-changed", listener);
  },
  async openGitHubRepo() {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.openGitHubRepo);
  },
  async openFeedbackSurvey() {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.openFeedbackSurvey);
  },
  async openLicenseNotices() {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.openLicenseNotices);
  },
  async openRightsContact() {
    await electron.ipcRenderer.invoke(HOME_CHANNELS.openRightsContact);
  },
  // AI settings channels are registered once by the shell's aggregated docs handlers
  onAiSettingsChanged(handler) {
    const listener = () => handler();
    electron.ipcRenderer.on("ai:settings-changed", listener);
    return () => electron.ipcRenderer.removeListener("ai:settings-changed", listener);
  },
  async getAiSettings() {
    return await electron.ipcRenderer.invoke("ai:get-settings");
  },
  async setAiSettings(settings) {
    await electron.ipcRenderer.invoke("ai:set-settings", settings);
  },
  getAiProviders() {
    return AI_PROVIDERS.map((meta) => {
      let defaultBaseUrl = "";
      if (!meta.needsBaseUrl && !meta.needsCliPath) {
        defaultBaseUrl = getProviderAdapter(meta.id).resolveEndpoint({
          apiKey: "",
          model: meta.defaultModel
        }).baseUrl;
      }
      return { ...meta, defaultBaseUrl };
    });
  },
  async getCodexModels(cliPath) {
    return await electron.ipcRenderer.invoke("ai:codex-models", cliPath);
  },
  async getCustomModels(baseUrl, apiKey) {
    return await electron.ipcRenderer.invoke("ai:custom-models", { baseUrl, apiKey });
  },
  async testAiSettings(settings) {
    const result2 = await electron.ipcRenderer.invoke("ai:chat", {
      settings,
      system: "You are a connectivity test. Reply with the single word OK.",
      user: "ping"
    });
    const raw = result2 ?? {};
    return raw.ok === true ? { ok: true } : { ok: false, error: typeof raw.error === "string" ? raw.error : "Connection failed" };
  },
  getAiMediaProviders() {
    return AI_MEDIA_PROVIDERS;
  },
  getAiSearchProviders() {
    return AI_SEARCH_PROVIDERS;
  },
  async testAiSearchSettings(input) {
    const raw = await electron.ipcRenderer.invoke("ai:search-test", input) ?? {};
    return raw.ok === true ? { ok: true } : { ok: false, error: typeof raw.error === "string" ? raw.error : "Connection failed" };
  },
  async testAiMediaSettings(input) {
    const raw = await electron.ipcRenderer.invoke("ai:media-test", input) ?? {};
    return raw.ok === true ? { ok: true } : { ok: false, error: typeof raw.error === "string" ? raw.error : "Connection failed" };
  },
  async connectFreeAi(input) {
    return freeAiConnectResultOf(await electron.ipcRenderer.invoke(FREE_AI_IPC_CHANNELS.connect, input));
  },
  async cancelFreeAiConnect() {
    await electron.ipcRenderer.invoke(FREE_AI_IPC_CHANNELS.cancel);
  },
  async disconnectFreeAi(provider) {
    await electron.ipcRenderer.invoke(FREE_AI_IPC_CHANNELS.disconnect, { provider });
  },
  async getFreeAiQuota(provider) {
    return freeAiQuotaOf(await electron.ipcRenderer.invoke(FREE_AI_IPC_CHANNELS.quota, { provider }));
  },
  async openFreeAiKeyPage(provider) {
    await electron.ipcRenderer.invoke(FREE_AI_IPC_CHANNELS.openKeyPage, { provider });
  }
};
electron.contextBridge.exposeInMainWorld("aiOffice", homeApi);
const integrationsApi = {
  async status() {
    return await electron.ipcRenderer.invoke(INTEGRATIONS_CHANNELS.status);
  },
  async installSkill(target) {
    return await electron.ipcRenderer.invoke(
      INTEGRATIONS_CHANNELS.installSkill,
      target
    );
  },
  async uninstallSkill(agentId) {
    return await electron.ipcRenderer.invoke(
      INTEGRATIONS_CHANNELS.uninstallSkill,
      agentId
    );
  },
  async pickSkillDir(title) {
    const r = await electron.ipcRenderer.invoke(INTEGRATIONS_CHANNELS.pickSkillDir, title);
    return typeof r === "string" ? r : null;
  },
  async saveSkillZip(title) {
    const r = await electron.ipcRenderer.invoke(INTEGRATIONS_CHANNELS.saveSkillZip, title);
    return typeof r === "string" ? r : null;
  },
  async copyText(text2) {
    await electron.ipcRenderer.invoke(INTEGRATIONS_CHANNELS.copyText, text2);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficeIntegrations", integrationsApi);
const resultStoreApi = {
  async size() {
    const r = await electron.ipcRenderer.invoke(RESULT_STORE_CHANNELS.size);
    return typeof r === "number" && Number.isFinite(r) && r >= 0 ? r : 0;
  },
  async deleteAll() {
    await electron.ipcRenderer.invoke(RESULT_STORE_CHANNELS.deleteAll);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficeResultStore", resultStoreApi);
const driveApi = {
  state: () => electron.ipcRenderer.invoke(DRIVE_CHANNELS.state),
  onStateChanged(listener) {
    const handler = (_event, state) => listener(state);
    electron.ipcRenderer.on(DRIVE_CHANNELS.stateChanged, handler);
    return () => {
      electron.ipcRenderer.removeListener(DRIVE_CHANNELS.stateChanged, handler);
    };
  },
  connect: () => electron.ipcRenderer.invoke(DRIVE_CHANNELS.connect),
  async cancelConnect() {
    await electron.ipcRenderer.invoke(DRIVE_CHANNELS.cancelConnect);
  },
  async disconnect() {
    await electron.ipcRenderer.invoke(DRIVE_CHANNELS.disconnect);
  },
  setAiAccess: (on) => electron.ipcRenderer.invoke(DRIVE_CHANNELS.setAiAccess, on === true),
  list: (listing, pageToken) => electron.ipcRenderer.invoke(DRIVE_CHANNELS.list, listing, pageToken),
  open: (fileId) => electron.ipcRenderer.invoke(DRIVE_CHANNELS.open, fileId)
};
electron.contextBridge.exposeInMainWorld("aiOfficeDrive", driveApi);
electron.contextBridge.exposeInMainWorld(USER_SKILLS_BRIDGE_KEY, userSkillsBridge());
const subscriptionApi = {
  async statuses() {
    return subscriptionStatusMapOf(await electron.ipcRenderer.invoke(SUBSCRIPTION_IPC_CHANNELS.statuses));
  },
  async recheck(providers) {
    return subscriptionStatusMapOf(
      await electron.ipcRenderer.invoke(
        SUBSCRIPTION_IPC_CHANNELS.recheck,
        providers ? { providers } : void 0
      )
    );
  },
  async login(provider) {
    return subscriptionLaunchResultOf(
      await electron.ipcRenderer.invoke(SUBSCRIPTION_IPC_CHANNELS.login, { provider })
    );
  },
  async logout(provider) {
    return subscriptionLaunchResultOf(
      await electron.ipcRenderer.invoke(SUBSCRIPTION_IPC_CHANNELS.logout, { provider })
    );
  },
  async install(provider) {
    return subscriptionLaunchResultOf(
      await electron.ipcRenderer.invoke(SUBSCRIPTION_IPC_CHANNELS.install, { provider })
    );
  },
  async update(provider) {
    return subscriptionLaunchResultOf(
      await electron.ipcRenderer.invoke(SUBSCRIPTION_IPC_CHANNELS.update, { provider })
    );
  },
  async cancelLogin(provider) {
    return subscriptionLaunchResultOf(
      await electron.ipcRenderer.invoke(SUBSCRIPTION_IPC_CHANNELS.cancelLogin, { provider })
    );
  },
  async setMeteredAccepted(provider, accepted) {
    const result2 = await electron.ipcRenderer.invoke(SUBSCRIPTION_IPC_CHANNELS.metered, {
      provider,
      accepted
    });
    const raw = result2 ?? {};
    return { ok: raw.ok === true, statuses: subscriptionStatusMapOf(raw.statuses) };
  },
  async codexImageAvailable() {
    return await electron.ipcRenderer.invoke(SUBSCRIPTION_IPC_CHANNELS.codexImage) === true;
  },
  onChanged(handler) {
    const listener = (_event, statuses) => handler(subscriptionStatusMapOf(statuses));
    electron.ipcRenderer.on(SUBSCRIPTION_IPC_CHANNELS.changed, listener);
    return () => electron.ipcRenderer.removeListener(SUBSCRIPTION_IPC_CHANNELS.changed, listener);
  },
  async openInstallHelp(provider) {
    await electron.ipcRenderer.invoke(SHELL_SUBSCRIPTION_CHANNELS.openInstallHelp, provider);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficeSubscription", subscriptionApi);
const tabsApi = {
  async list() {
    const result2 = await electron.ipcRenderer.invoke(TABS_CHANNELS.list);
    return Array.isArray(result2) ? result2 : [];
  },
  async activate(id) {
    await electron.ipcRenderer.invoke(TABS_CHANNELS.activate, id);
  },
  async close(id) {
    await electron.ipcRenderer.invoke(TABS_CHANNELS.close, id);
  },
  async showMenu(x, y) {
    await electron.ipcRenderer.invoke(TABS_CHANNELS.showMenu, x, y);
  },
  async showNewMenu(x, y) {
    await electron.ipcRenderer.invoke(TABS_CHANNELS.showNewMenu, x, y);
  },
  async showTabMenu(id, x, y) {
    await electron.ipcRenderer.invoke(TABS_CHANNELS.showTabMenu, id, x, y);
  },
  async detach(id) {
    await electron.ipcRenderer.invoke(TABS_CHANNELS.detach, id);
  },
  async tearOff(id, screenX, screenY) {
    const result2 = await electron.ipcRenderer.invoke(TABS_CHANNELS.tearOff, id, screenX, screenY);
    return result2 === true;
  },
  dragTornWindow(screenX, screenY) {
    electron.ipcRenderer.send(TABS_CHANNELS.dragTornWindow, screenX, screenY);
  },
  async dockTornWindow(index) {
    await electron.ipcRenderer.invoke(TABS_CHANNELS.dockTornWindow, index);
  },
  async endTornDrag() {
    await electron.ipcRenderer.invoke(TABS_CHANNELS.endTornDrag);
  },
  onDockPreview(handler) {
    const listener = (_event, preview) => handler(preview && typeof preview.x === "number" ? { x: preview.x } : null);
    electron.ipcRenderer.on(TABS_CHANNELS.dockPreview, listener);
    return () => electron.ipcRenderer.removeListener(TABS_CHANNELS.dockPreview, listener);
  },
  reportDockIndex(index) {
    electron.ipcRenderer.send(TABS_CHANNELS.dockIndex, index);
  },
  async showAppMenu(x, y) {
    await electron.ipcRenderer.invoke(TABS_CHANNELS.showAppMenu, x, y);
  },
  async reorder(id, toIndex) {
    await electron.ipcRenderer.invoke(TABS_CHANNELS.reorder, id, toIndex);
  },
  onChanged(handler) {
    const listener = (_event, tabs) => handler(tabs);
    electron.ipcRenderer.on(TABS_CHANNELS.changed, listener);
    return () => electron.ipcRenderer.removeListener(TABS_CHANNELS.changed, listener);
  },
  async getSplit() {
    return await electron.ipcRenderer.invoke(SPLIT_TABS_CHANNELS.get);
  },
  setSplitRatio(ratio) {
    electron.ipcRenderer.send(SPLIT_TABS_CHANNELS.setRatio, ratio);
  },
  onSplitChanged(handler) {
    const listener = (_event, state) => handler(state);
    electron.ipcRenderer.on(SPLIT_TABS_CHANNELS.changed, listener);
    return () => electron.ipcRenderer.removeListener(SPLIT_TABS_CHANNELS.changed, listener);
  },
  onSplitHint(handler) {
    const listener = (_event, hint) => handler(hint);
    electron.ipcRenderer.on(SPLIT_TABS_CHANNELS.hint, listener);
    return () => electron.ipcRenderer.removeListener(SPLIT_TABS_CHANNELS.hint, listener);
  },
  notifyChromePressed() {
    electron.ipcRenderer.send(TABS_CHANNELS.chromePressed);
  },
  onChromePressed(handler) {
    const listener = () => handler();
    electron.ipcRenderer.on("app:chrome-pressed", listener);
    return () => electron.ipcRenderer.removeListener("app:chrome-pressed", listener);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficeTabs", tabsApi);
const generateHomeApi = {
  async openWithPaths(paths) {
    await electron.ipcRenderer.invoke(GENERATE_HOME_CHANNELS.openWithPaths, paths);
  },
  async openWithGroup(group) {
    await electron.ipcRenderer.invoke(GENERATE_HOME_CHANNELS.openWithGroup, group);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficeGenerate", generateHomeApi);
const pdfToolsHomeApi = {
  async open() {
    await electron.ipcRenderer.invoke(PDF_TOOLS_HOME_CHANNELS.open);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficePdfToolsHome", pdfToolsHomeApi);
electron.contextBridge.exposeInMainWorld("aiOfficeAgent", {
  async open() {
    await electron.ipcRenderer.invoke(AGENT_HOME_OPEN_CHANNEL);
  }
});
const quickLookHomeApi = {
  async preview(path) {
    if (typeof path !== "string" || !path.trim()) {
      return {
        ok: false,
        path: "",
        name: "",
        ext: "",
        family: "unsupported",
        sizeBytes: 0,
        mtimeMs: 0,
        truncated: false,
        error: "unreadable"
      };
    }
    const result2 = await electron.ipcRenderer.invoke(
      QUICK_LOOK_HOME_CHANNELS.preview,
      path
    );
    return result2 ?? {
      ok: false,
      path,
      name: path,
      ext: "",
      family: "unsupported",
      sizeBytes: 0,
      mtimeMs: 0,
      truncated: false,
      error: "unreadable"
    };
  },
  async getSettings() {
    const raw = await electron.ipcRenderer.invoke(QUICK_LOOK_HOME_CHANNELS.getSettings);
    return normalizeQuickLookSettings(raw);
  },
  async setSettings(settings) {
    const raw = await electron.ipcRenderer.invoke(QUICK_LOOK_HOME_CHANNELS.setSettings, settings);
    return normalizeQuickLookSettings(raw);
  }
};
electron.contextBridge.exposeInMainWorld("aiOfficeQuickLookHome", quickLookHomeApi);
installDropOpenBridge();

// === HyperOffice Preload Bridge ===
const hyperOfficeApi = {
  env: {
    getConfig: () => electron.ipcRenderer.invoke("hyper:env:get"),
    setConfig: (updates) => electron.ipcRenderer.invoke("hyper:env:set", updates),
    chat: (params) => electron.ipcRenderer.invoke("hyper:ai:chat", params)
  },
  terminal: {
    openTab: () => electron.ipcRenderer.invoke("hyper:term:open-tab"),
    create: (options) => electron.ipcRenderer.invoke("hyper:term:create", options),
    write: (id, input) => electron.ipcRenderer.invoke("hyper:term:write", { id, input }),
    kill: (id) => electron.ipcRenderer.invoke("hyper:term:kill", { id }),
    exec: (cmd, cwd) => electron.ipcRenderer.invoke("hyper:term:exec", { cmd, cwd }),
    onOutput: (listener) => {
      const handler = (_event, data) => listener(data);
      electron.ipcRenderer.on("hyper:term:output", handler);
      return () => electron.ipcRenderer.removeListener("hyper:term:output", handler);
    },
    onExit: (listener) => {
      const handler = (_event, data) => listener(data);
      electron.ipcRenderer.on("hyper:term:exit", handler);
      return () => electron.ipcRenderer.removeListener("hyper:term:exit", handler);
    }
  },
  office: {
    getTools: () => electron.ipcRenderer.invoke("hyper:office:tools"),
    callTool: (tool, args) => electron.ipcRenderer.invoke("hyper:office:call", { tool, args }),
    readHwp: (filePath) => electron.ipcRenderer.invoke("hyper:office:hwp", filePath),
    readDocs: (filePath) => electron.ipcRenderer.invoke("hyper:office:call", { tool: "office_read_docs", args: { filePath } }),
    readSheet: (filePath) => electron.ipcRenderer.invoke("hyper:office:call", { tool: "office_read_sheet", args: { filePath } }),
    readSlides: (filePath) => electron.ipcRenderer.invoke("hyper:office:call", { tool: "office_read_slides", args: { filePath } }),
    convert: (input, output) => electron.ipcRenderer.invoke("hyper:office:convert", { input, output }),
    render: (input, outputDir) => electron.ipcRenderer.invoke("hyper:office:render", { input, outputDir }),
    getSkills: () => electron.ipcRenderer.invoke("hyper:office:skills"),
    getSkillContent: (name) => electron.ipcRenderer.invoke("hyper:office:skill-content", name),
    ocr: (imgPath) => electron.ipcRenderer.invoke("hyper:office:ocr", imgPath)
  },
  gemini: {
    getQuota: () => electron.ipcRenderer.invoke("hyper:gemini:quota")
  },
  browser: {
    openTab: (url) => electron.ipcRenderer.invoke("hyper:browser:open-tab", url),
    getAetherumPage: (page) => electron.ipcRenderer.invoke("hyper:browser:get-aetherum-page", page),
    summarize: (url) => electron.ipcRenderer.invoke("hyper:browser:summarize", url),
    saveDoc: (url, outputPath) => electron.ipcRenderer.invoke("hyper:browser:save-doc", { url, outputPath }),
    setTor: (enabled) => electron.ipcRenderer.invoke("hyper:browser:set-tor", enabled),
    getTorStatus: () => electron.ipcRenderer.invoke("hyper:browser:tor-status")
  },
  adblock: {
    getStatus: (currentUrl) => electron.ipcRenderer.invoke("hyper:adblock:status", currentUrl),
    toggle: () => electron.ipcRenderer.invoke("hyper:adblock:toggle"),
    setEnabled: (enabled) => electron.ipcRenderer.invoke("hyper:adblock:set-enabled", enabled),
    setConfig: (partial) => electron.ipcRenderer.invoke("hyper:adblock:set-config", partial),
    toggleSite: (payload) => electron.ipcRenderer.invoke("hyper:adblock:toggle-site", payload),
    addRule: (rule) => electron.ipcRenderer.invoke("hyper:adblock:add-rule", rule),
    removeRule: (rule) => electron.ipcRenderer.invoke("hyper:adblock:remove-rule", rule),
    updateLists: () => electron.ipcRenderer.invoke("hyper:adblock:update-lists"),
    resetStats: (includeLifetime) => electron.ipcRenderer.invoke("hyper:adblock:reset-stats", includeLifetime),
    cleanUrl: (url) => electron.ipcRenderer.invoke("hyper:adblock:clean-url", url),
    getCosmeticPayload: (url) => electron.ipcRenderer.invoke("hyper:adblock:cosmetic", url),
    checkUrl: (payload) => electron.ipcRenderer.invoke("hyper:adblock:check-url", payload),
    onStatsUpdated: (listener) => {
      const handler = (_event, data) => listener(data);
      electron.ipcRenderer.on("hyper:adblock:stats-updated", handler);
      return () => electron.ipcRenderer.removeListener("hyper:adblock:stats-updated", handler);
    }
  },
  git: {
    getStatus: (cwd) => electron.ipcRenderer.invoke("hyper:git:status", cwd),
    getDiff: (cwd, filePath, staged) => electron.ipcRenderer.invoke("hyper:git:diff", { cwd, filePath, staged }),
    commit: (cwd, message, files) => electron.ipcRenderer.invoke("hyper:git:commit", { cwd, message, files }),
    officeDiff: (cwd, filePath, commit) => electron.ipcRenderer.invoke("hyper:git:office-diff", { cwd, filePath, commit })
  },
  projects: {
    list: () => electron.ipcRenderer.invoke("hyper:projects:list")
  },
  sleipnir: {
    getStatus: () => electron.ipcRenderer.invoke("hyper:sleipnir:status"),
    toggle: () => electron.ipcRenderer.invoke("hyper:sleipnir:toggle"),
    set: (enable) => electron.ipcRenderer.invoke("hyper:sleipnir:set", enable)
  },
  nibelungen: {
    openTab: () => electron.ipcRenderer.invoke("hyper:nibelungen:open-tab"),
    getGraph: (params) => electron.ipcRenderer.invoke("hyper:nibelungen:get-graph", params),
    listNotes: () => electron.ipcRenderer.invoke("hyper:nibelungen:list-notes"),
    saveNote: (note) => electron.ipcRenderer.invoke("hyper:nibelungen:save-note", note),
    deleteNote: (id) => electron.ipcRenderer.invoke("hyper:nibelungen:delete-note", id)
  },
  fafnir: {
    openTab: () => electron.ipcRenderer.invoke("hyper:fafnir:open-tab"),
    list: () => electron.ipcRenderer.invoke("hyper:fafnir:list"),
    encrypt: (params) => electron.ipcRenderer.invoke("hyper:fafnir:encrypt", params),
    decrypt: (params) => electron.ipcRenderer.invoke("hyper:fafnir:decrypt", params)
  },
  mimisbrunnr: {
    openTab: () => electron.ipcRenderer.invoke("hyper:mimisbrunnr:open-tab"),
    status: () => electron.ipcRenderer.invoke("hyper:mimisbrunnr:status"),
    hardware: () => electron.ipcRenderer.invoke("hyper:mimisbrunnr:hardware"),
    selectModel: (modelId) => electron.ipcRenderer.invoke("hyper:mimisbrunnr:select-model", modelId),
    prepareMlx: (modelId) => electron.ipcRenderer.invoke("hyper:mimisbrunnr:prepare-mlx", modelId),
    chat: (payload) => electron.ipcRenderer.invoke("hyper:mimisbrunnr:chat", payload)
  },
  ratatoskr: {
    openTab: () => electron.ipcRenderer.invoke("hyper:ratatoskr:open-tab"),
    request: (payload) => electron.ipcRenderer.invoke("hyper:ratatoskr:request", payload),
    querySqlite: (params) => electron.ipcRenderer.invoke("hyper:ratatoskr:query-sqlite", params),
    listTables: (dbPath) => electron.ipcRenderer.invoke("hyper:ratatoskr:list-tables", dbPath)
  },
  heimdall: {
    openTab: () => electron.ipcRenderer.invoke("hyper:heimdall:open-tab"),
    status: () => electron.ipcRenderer.invoke("hyper:heimdall:status"),
    getQuota: () => electron.ipcRenderer.invoke("hyper:heimdall:quota"),
    setApiKey: (params) => electron.ipcRenderer.invoke("hyper:heimdall:set-key", params),
    setBudget: (params) => electron.ipcRenderer.invoke("hyper:heimdall:set-budget", params),
    resetSession: () => electron.ipcRenderer.invoke("hyper:heimdall:reset-session"),
    requestMic: () => electron.ipcRenderer.invoke("hyper:heimdall:request-mic"),
    transcribe: (params) => electron.ipcRenderer.invoke("hyper:heimdall:transcribe", params),
    summarize: (params) => electron.ipcRenderer.invoke("hyper:heimdall:summarize", params),
    pickAudio: () => electron.ipcRenderer.invoke("hyper:heimdall:pick-audio"),
    saveToNibelungen: (params) => electron.ipcRenderer.invoke("hyper:heimdall:save-nibelungen", params)
  },
  highTable: {
    openTab: () => electron.ipcRenderer.invoke("hyper:high-table:open-tab"),
    getSeats: () => electron.ipcRenderer.invoke("hyper:high-table:get-seats"),
    getModels: () => electron.ipcRenderer.invoke("hyper:high-table:get-models"),
    convene: (params) => electron.ipcRenderer.invoke("hyper:high-table:convene", params),
    abort: () => electron.ipcRenderer.invoke("hyper:high-table:abort"),
    onEvent: (cb) => {
      const h = (_e, d) => cb(d);
      electron.ipcRenderer.on("hyper:high-table:event", h);
      return () => electron.ipcRenderer.removeListener("hyper:high-table:event", h);
    }
  }
};
electron.contextBridge.exposeInMainWorld("hyperOffice", hyperOfficeApi);
