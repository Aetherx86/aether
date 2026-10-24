import { c as createI18n, d as defineStrings, j as jsxRuntimeExports, r as reactExports, h as htmlLang } from "./index-DMHLWY5B.js";
const CJK_FAMILY_ALIASES = {
  // Simplified CJK (zh spellings)
  宋体: ["SimSun"],
  黑体: ["SimHei"],
  微软雅黑: ["Microsoft YaHei"],
  楷体: ["KaiTi"],
  仿宋: ["FangSong"],
  仿宋_GB2312: ["FangSong_GB2312"],
  楷体_GB2312: ["KaiTi_GB2312"],
  等线: ["DengXian"],
  "等线 Light": ["DengXian Light"],
  // Traditional CJK (zh-TW spellings)
  微软正黑体: ["Microsoft JhengHei", "微軟正黑體"],
  新細明體: ["PMingLiU"],
  標楷體: ["DFKai-SB"],
  // Japanese
  メイリオ: ["Meiryo"],
  游ゴシック: ["Yu Gothic"],
  游明朝: ["Yu Mincho"],
  "ＭＳ ゴシック": ["MS Gothic"],
  "ＭＳ 明朝": ["MS Mincho"],
  "Hiragino Mincho ProN": ["Hiragino Mincho", "ヒラギノ明朝 ProN"],
  // Korean
  "맑은 고딕": ["Malgun Gothic"],
  바탕: ["Batang"],
  돋움: ["Dotum"],
  굴림: ["Gulim"]
};
const RESERVED_USER_SKILL_NAMES = /* @__PURE__ */ new Set(["genoffice", "aether"]);
const USE_SKILL_TOOL = "use_skill";
const READ_SKILL_FILE_TOOL = "read_skill_file";
const PROPOSE_SKILL_TOOL = "propose_skill";
const USER_SKILL_TOOL_NAMES = /* @__PURE__ */ new Set([
  USE_SKILL_TOOL,
  READ_SKILL_FILE_TOOL,
  PROPOSE_SKILL_TOOL
]);
const PROPOSAL_SHOWN_PREFIX = "Skill card shown: ";
function proposedTitleOf(output) {
  if (!output?.startsWith(PROPOSAL_SHOWN_PREFIX)) return "";
  const line = output.slice(PROPOSAL_SHOWN_PREFIX.length).split("\n", 1)[0];
  try {
    const title = JSON.parse(line);
    return typeof title === "string" ? title : "";
  } catch {
    return "";
  }
}
const AUTO_SKILL_DESCRIPTION_MAX = 300;
const AUTO_SKILLS_MAX = 100;
const AUTO_SKILLS_NAMES_ONLY_MAX = 200;
const AUTO_SKILL_TITLE_MAX = 120;
const SKILL_TEXT_FILE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".md",
  ".txt",
  ".json",
  ".yaml",
  ".yml",
  ".csv",
  ".xml",
  ".html",
  ".css"
]);
const DEFAULT_LABELS = {
  used: (title) => `Used the ${title} skill`,
  proposed: (title) => `Skill proposal: ${title}`
};
function clip(text, max) {
  const line = text.replace(/\s+/g, " ").trim();
  return line.length > max ? `${line.slice(0, max)}…` : line;
}
function isAutoSkill(skill) {
  return skill.enabled && !skill.hidden && !skill.unreadable && !skill.agentOnly && skill.invoke === "auto" && !skill.shadowedBy && !RESERVED_USER_SKILL_NAMES.has(skill.name.toLowerCase());
}
function autoSkillsSection(skills, options = {}) {
  const descriptionMax = options.descriptionMax ?? AUTO_SKILL_DESCRIPTION_MAX;
  const max = options.max ?? AUTO_SKILLS_MAX;
  const namesMax = options.namesMax ?? AUTO_SKILLS_NAMES_ONLY_MAX;
  const attached = new Set(options.attached ?? []);
  const listed = skills.filter((s) => isAutoSkill(s) && !attached.has(s.id));
  if (listed.length === 0) return "";
  const titleOf = (s) => clip(options.displayTitle?.(s) || s.title || s.name, AUTO_SKILL_TITLE_MAX);
  const full = listed.slice(0, max).map((s) => `- ${s.id} | ${titleOf(s)} | ${clip(s.description, descriptionMax)}`);
  const namesOnly = listed.slice(max, max + namesMax).map((s) => `- ${s.id} | ${titleOf(s)}`);
  const dropped = listed.length - full.length - namesOnly.length;
  const lines = [...full, ...namesOnly];
  if (dropped > 0) lines.push(`(${dropped} more skills are not listed.)`);
  return `Skills you may use on your own (id | title | description):
${lines.join("\n")}`;
}
function escapeAttr(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function unescapeAttr(value) {
  return value.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&amp;/g, "&");
}
function attachedSkillIdsOf(text) {
  const ids = [];
  for (const match of text.matchAll(/<skill id="([^"]*)"/g)) {
    const id2 = unescapeAttr(match[1]);
    if (id2 && !ids.includes(id2)) ids.push(id2);
  }
  return ids;
}
function lastUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "user") return m.text;
  }
  return "";
}
const SKILLS_SYSTEM_PROMPT = `## Skills
The person keeps skills: instructions for work they do again and again.
- When a request matches a skill in the list below, call use_skill with its id
  before you start, then follow what it returns. Read another file of the skill
  with read_skill_file only when its text points you to one.
- A skill the person chose for this request is already in their message (a
  <skill id="…"> block); follow it there and do not call use_skill for it.
- Scripts of a skill never run here; do not ask for them to be run.
- When the person asks to save the work as a skill, or to make or change a
  skill, call propose_skill. It shows them a card to check; nothing is saved
  until they press Save on it, so never say the skill was saved.`;
const PROPOSE_DESCRIPTION = "Show the person a card with a skill to save: a new skill, or a change to an existing one (give targetId). This tool never saves anything; the person checks the card and presses Save. When you make a skill from the conversation, keep what would repeat: the order of steps, the rules, the tone and wording, the checks before finishing. Leave out values used only once (names of people, dates, this particular content): list them in the body as values given each time instead. Write the body as instructions to an assistant, in the language of the conversation. Set wantsTemplate when the finished document itself should be kept as a template to fill in next time.";
function tools() {
  return [
    {
      name: USE_SKILL_TOOL,
      description: "Load one of the person’s enabled skills by its id from the skills list: returns its instructions, the list of its other text files and whether it has a template document.",
      inputSchema: {
        type: "object",
        properties: { id: { type: "string", description: "the skill id, e.g. app:home-letter" } },
        required: ["id"]
      }
    },
    {
      name: READ_SKILL_FILE_TOOL,
      description: "Read one text file (.md, .txt, .json, .yaml, .yml, .csv, .xml, .html, .css) inside an enabled skill’s folder, by its path inside the folder as use_skill listed it.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "the skill id" },
          path: {
            type: "string",
            description: "path inside the skill folder, e.g. reference/tone.md"
          }
        },
        required: ["id", "path"]
      }
    },
    {
      name: PROPOSE_SKILL_TOOL,
      description: PROPOSE_DESCRIPTION,
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "short title shown to the person" },
          name: {
            type: "string",
            description: "English name: lowercase letters, digits and hyphens, 1-64 characters, e.g. meeting-minutes"
          },
          description: {
            type: "string",
            description: "one or two sentences: what the skill does and when to use it"
          },
          body: { type: "string", description: "the instructions (Markdown)" },
          wantsTemplate: {
            type: "boolean",
            description: "keep the current document as the skill’s template"
          },
          targetId: {
            type: "string",
            description: "id of the existing skill to change; leave out for a new skill"
          }
        },
        required: ["title", "description", "body"]
      }
    }
  ];
}
function refusalText(reason, id2) {
  switch (reason) {
    case "not-found":
      return `No skill with id ${id2}. Use an id from the skills list.`;
    case "disabled":
    case "hidden":
      return `The skill ${id2} is turned off. The person can turn it on in Settings → Skills.`;
    case "agent-only":
      return `The skill ${id2} is for the agent window only.`;
    case "unreadable":
      return `The skill ${id2} cannot be read.`;
    default:
      return `The skill ${id2} could not be read.`;
  }
}
function fileRefusalText(reason, id2, path) {
  switch (reason) {
    case "outside":
      return `${path} is not a file inside the skill folder of ${id2}.`;
    case "not-text":
      return `Only text files can be read (${[...SKILL_TEXT_FILE_EXTENSIONS].join(", ")}).`;
    case "too-large":
      return `${path} is too large to read.`;
    case "not-found":
      return `No file ${path} in the skill ${id2}.`;
    default:
      return refusalText(reason, id2);
  }
}
function entryRefusal(entry, id2) {
  if (!entry || RESERVED_USER_SKILL_NAMES.has(entry.name.toLowerCase()))
    return refusalText("not-found", id2);
  if (entry.agentOnly) return refusalText("agent-only", id2);
  if (entry.unreadable) return refusalText("unreadable", id2);
  if (!entry.enabled || entry.hidden) return refusalText("disabled", id2);
  return void 0;
}
function pathLeavesFolder(path) {
  const wanted = path.replace(/\\/g, "/").replace(/^\.\//, "");
  if (!wanted || wanted.startsWith("/") || /^[A-Za-z]:/.test(wanted)) return true;
  return wanted.split("/").some((part) => part === "" || part === "." || part === "..");
}
function extensionOf(path) {
  const base = path.replace(/\\/g, "/").split("/").at(-1) ?? "";
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(dot).toLowerCase() : "";
}
function str$3(value) {
  return typeof value === "string" ? value : "";
}
const fail = (output, summary) => ({
  output,
  isError: true,
  summary
});
function createUserSkillsSkill(deps) {
  const labels = deps.labels ?? DEFAULT_LABELS;
  const toolDefs = tools();
  const find = (id2) => deps.list().find((s) => s.id === id2);
  const findFresh = async (id2) => {
    const known = find(id2);
    if (known || !id2 || !deps.reload) return known;
    await deps.reload().catch(() => void 0);
    return find(id2);
  };
  const titleOf = (skill) => deps.displayTitle?.(skill) || skill.title || skill.name;
  const attached = () => attachedSkillIdsOf(lastUserText(deps.messages?.() ?? []));
  const useSkill = async (call) => {
    const id2 = str$3(call.input.id).trim();
    const entry = await findFresh(id2);
    const refusal = entryRefusal(entry, id2);
    if (refusal || !entry) return fail(refusal ?? refusalText("not-found", id2), USE_SKILL_TOOL);
    const title = titleOf(entry);
    if (attached().includes(id2)) {
      return {
        output: `The skill ${id2} is already in the person’s message for this request; follow it there.`,
        summary: labels.used(title)
      };
    }
    const read = await deps.read(id2).catch(() => null);
    if (!read || !read.ok) {
      return fail(refusalText(read ? read.reason : "failed", id2), USE_SKILL_TOOL);
    }
    const skill = read.skill;
    deps.onUsed?.(skill);
    const lines = [
      `<skill id="${escapeAttr(id2)}" title="${escapeAttr(title)}">`,
      skill.body.trim(),
      "</skill>",
      skill.files.length > 0 ? `Other text files in this skill's folder (read with read_skill_file): ${skill.files.join(", ")}` : "Other text files in this skill’s folder: none",
      skill.template ? `Template document: ${skill.template}. The app offers the person to open a copy of it as a new document; do not try to open it yourself.` : "Template document: none"
    ];
    if (skill.hasScripts) {
      lines.push("This skill has scripts; scripts are not run here. Do the work without them.");
    }
    return { output: lines.join("\n"), summary: labels.used(title) };
  };
  const readSkillFile = async (call) => {
    const id2 = str$3(call.input.id).trim();
    const path = str$3(call.input.path).trim();
    const entry = await findFresh(id2);
    const refusal = entryRefusal(entry, id2);
    if (refusal || !entry)
      return fail(refusal ?? refusalText("not-found", id2), READ_SKILL_FILE_TOOL);
    if (pathLeavesFolder(path)) return fail(fileRefusalText("outside", id2, path), path);
    if (!SKILL_TEXT_FILE_EXTENSIONS.has(extensionOf(path))) {
      return fail(fileRefusalText("not-text", id2, path), path);
    }
    const read = await deps.readFile(id2, path).catch(() => null);
    if (!read || !read.ok)
      return fail(fileRefusalText(read ? read.reason : "failed", id2, path), path);
    return {
      output: `${path} (skill ${id2}):

${read.text}`,
      summary: `${titleOf(entry)} · ${path}`
    };
  };
  const proposeSkill = (call) => {
    const title = str$3(call.input.title).trim();
    const body = str$3(call.input.body);
    if (!title) return fail("title must not be empty", PROPOSE_SKILL_TOOL);
    if (!body.trim()) return fail("body must not be empty", PROPOSE_SKILL_TOOL);
    const targetId = str$3(call.input.targetId).trim();
    let target;
    if (targetId) {
      const entry = find(targetId);
      if (!entry || RESERVED_USER_SKILL_NAMES.has(entry.name.toLowerCase())) {
        return fail(refusalText("not-found", targetId), PROPOSE_SKILL_TOOL);
      }
      if (entry.agentOnly) return fail(refusalText("agent-only", targetId), PROPOSE_SKILL_TOOL);
      if (entry.unreadable) return fail(refusalText("unreadable", targetId), PROPOSE_SKILL_TOOL);
      if (entry.source === "project")
        return fail(refusalText("not-found", targetId), PROPOSE_SKILL_TOOL);
      target = {
        id: entry.id,
        name: entry.name,
        title: titleOf(entry),
        owned: entry.owned,
        source: entry.source
      };
    }
    deps.onProposal({
      key: call.id,
      title,
      name: str$3(call.input.name).trim(),
      description: str$3(call.input.description).trim(),
      body,
      wantsTemplate: call.input.wantsTemplate === true,
      target
    });
    return {
      output: `${PROPOSAL_SHOWN_PREFIX}${JSON.stringify(title)}
The skill card is shown to the person in the chat. Nothing is saved until they press Save on it, so it is not saved yet. Tell them briefly what the card holds and that they can change it before saving.`,
      summary: labels.proposed(title)
    };
  };
  return {
    id: "user-skills",
    get systemPrompt() {
      const list = autoSkillsSection(deps.list(), {
        ...deps.limits,
        attached: attached(),
        displayTitle: deps.displayTitle
      });
      return list ? `${SKILLS_SYSTEM_PROMPT}

${list}` : SKILLS_SYSTEM_PROMPT;
    },
    tools: toolDefs,
    executeTool: async (call) => {
      if (call.name === USE_SKILL_TOOL) return useSkill(call);
      if (call.name === READ_SKILL_FILE_TOOL) return readSkillFile(call);
      if (call.name === PROPOSE_SKILL_TOOL) return proposeSkill(call);
      return fail(`unknown tool: ${call.name}`, call.name);
    }
  };
}
function isRecord$4(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function userSkillEntriesOf(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const view of raw) {
    if (!isRecord$4(view)) continue;
    const id2 = str$3(view.id);
    const name = str$3(view.name);
    if (!id2.includes(":") || !name) continue;
    if (RESERVED_USER_SKILL_NAMES.has(name.toLowerCase())) continue;
    out.push({
      id: id2,
      source: str$3(view.source) || id2.split(":")[0],
      name,
      title: str$3(view.title) || name,
      description: str$3(view.description),
      enabled: view.enabled === true,
      invoke: view.invoke === "manual" ? "manual" : "auto",
      agentOnly: view.agentOnly === true,
      hidden: view.hidden === true,
      unreadable: !!view.unreadable,
      shadowedBy: typeof view.shadowedBy === "string" && view.shadowedBy ? view.shadowedBy : void 0,
      owned: view.owned === true
    });
  }
  return out;
}
function reasonOf(raw) {
  const reason = isRecord$4(raw) ? raw.reason : void 0;
  return { ok: false, reason: typeof reason === "string" && reason ? reason : "failed" };
}
function skillTextAnswerOf(raw) {
  if (!isRecord$4(raw) || raw.ok !== true || !isRecord$4(raw.skill)) return reasonOf(raw);
  const s = raw.skill;
  if (typeof s.id !== "string" || typeof s.body !== "string") return reasonOf(null);
  return {
    ok: true,
    skill: {
      id: s.id,
      name: str$3(s.name),
      title: str$3(s.title) || str$3(s.name) || s.id,
      body: s.body,
      files: Array.isArray(s.files) ? s.files.filter((f) => typeof f === "string") : [],
      template: typeof s.template === "string" && s.template ? s.template : void 0,
      hasScripts: s.hasScripts === true
    }
  };
}
function skillFileAnswerOf(raw) {
  if (!isRecord$4(raw) || raw.ok !== true || typeof raw.text !== "string") return reasonOf(raw);
  return { ok: true, text: raw.text };
}
function windowUserSkillsBridge() {
  const b = globalThis.aiOfficeUserSkills;
  return b && typeof b.list === "function" && typeof b.aiRead === "function" && typeof b.aiReadFile === "function" && typeof b.onChanged === "function" ? b : null;
}
function createBridgedUserSkillsSkill(bridge, options) {
  let entries = [];
  let seq = 0;
  const reload = async () => {
    const mine = ++seq;
    const raw = await bridge.list();
    if (mine === seq) entries = userSkillEntriesOf(raw);
  };
  const refresh = () => {
    void reload().catch(() => void 0);
  };
  refresh();
  const off = bridge.onChanged(refresh);
  const skill = createUserSkillsSkill({
    ...options,
    list: () => entries,
    reload,
    read: async (id2) => skillTextAnswerOf(await bridge.aiRead(id2).catch(() => null)),
    readFile: async (id2, path) => skillFileAnswerOf(await bridge.aiReadFile(id2, path).catch(() => null))
  });
  return {
    id: skill.id,
    get systemPrompt() {
      return skill.systemPrompt;
    },
    tools: skill.tools,
    executeTool: (call, signal) => skill.executeTool(call, signal),
    refresh,
    dispose: off
  };
}
const BUILTIN_SKILL_NAMES = [
  "meeting-minutes",
  "internal-comms",
  "humanizer",
  "copy-editing",
  "find-skills"
];
const zh$6 = {
  "builtinSkillTitle.meeting-minutes": "整理会议纪要",
  "builtinSkillDesc.meeting-minutes": "把会议记录整理成列明决定事项和待办事项的会议纪要。",
  "builtinSkillTitle.internal-comms": "撰写公告、简报和常见问题",
  "builtinSkillDesc.internal-comms": "撰写公告、内部简报、进展汇报、常见问题解答等组织内部的文字。",
  "builtinSkillTitle.humanizer": "去除 AI 痕迹（以英文文本为准）",
  "builtinSkillDesc.humanizer": "找出英文文本中带有 AI 痕迹的表达，在不改变内容的前提下改得更自然。",
  "builtinSkillTitle.copy-editing": "润色文字（以英文文本为准）",
  "builtinSkillDesc.copy-editing": "把已经写好的英文文本逐遍检查，改得更清楚、更简洁。",
  "builtinSkillTitle.find-skills": "查找技能",
  "builtinSkillDesc.find-skills": "仅在智能体窗口中可用，需要联网，用来查找所需技能并建议安装。"
};
const BUILTIN_SKILL_STRINGS = defineStrings({
  zh: zh$6,
  en: {
    "builtinSkillTitle.meeting-minutes": "Meeting minutes",
    "builtinSkillDesc.meeting-minutes": "Turns meeting notes into minutes that show the decisions and action items.",
    "builtinSkillTitle.internal-comms": "Announcements, newsletters and FAQs",
    "builtinSkillDesc.internal-comms": "Writes announcements, newsletters, progress updates, FAQs and other internal messages.",
    "builtinSkillTitle.humanizer": "Remove the AI feel (English text)",
    "builtinSkillDesc.humanizer": "Finds phrasing that sounds AI-written in English text and makes it natural without changing what it says.",
    "builtinSkillTitle.copy-editing": "Copy editing (English text)",
    "builtinSkillDesc.copy-editing": "Goes over English text you have already written and makes it clearer and tighter.",
    "builtinSkillTitle.find-skills": "Find skills",
    "builtinSkillDesc.find-skills": "Works only in the agent window and needs internet access to find skills and suggest installing them."
  },
  ja: {
    "builtinSkillTitle.meeting-minutes": "議事録をまとめる",
    "builtinSkillDesc.meeting-minutes": "会議のメモを、決定事項とやることが分かる議事録にまとめます。",
    "builtinSkillTitle.internal-comms": "お知らせ・社内報・FAQ を書く",
    "builtinSkillDesc.internal-comms": "お知らせ、社内報、進捗報告、よくある質問など、組織内の文章を書きます。",
    "builtinSkillTitle.humanizer": "AI っぽさを消す（英語の文章向け）",
    "builtinSkillDesc.humanizer": "英語の文章から AI が書いたように見える表現を探し、内容を変えずに自然に直します。",
    "builtinSkillTitle.copy-editing": "文章を磨く（英語の文章向け）",
    "builtinSkillDesc.copy-editing": "書き上げた英語の文章を何度か見直し、より明確で簡潔にします。",
    "builtinSkillTitle.find-skills": "スキルを探す",
    "builtinSkillDesc.find-skills": "エージェントのウィンドウでのみ使え、インターネットにつないで必要なスキルを探し、インストールを提案します。"
  },
  ko: {
    "builtinSkillTitle.meeting-minutes": "회의록 정리",
    "builtinSkillDesc.meeting-minutes": "회의 메모를 결정 사항과 할 일이 보이는 회의록으로 정리합니다.",
    "builtinSkillTitle.internal-comms": "공지·소식지·FAQ 쓰기",
    "builtinSkillDesc.internal-comms": "공지, 소식지, 진행 보고, 자주 묻는 질문 같은 조직 안의 글을 씁니다.",
    "builtinSkillTitle.humanizer": "AI 티 없애기(영어 글 기준)",
    "builtinSkillDesc.humanizer": "영어 글에서 AI가 쓴 티가 나는 표현을 찾아 내용은 그대로 두고 자연스럽게 고칩니다.",
    "builtinSkillTitle.copy-editing": "문장 다듬기(영어 글 기준)",
    "builtinSkillDesc.copy-editing": "이미 쓴 영어 글을 여러 번 훑으며 더 분명하고 간결하게 다듬습니다.",
    "builtinSkillTitle.find-skills": "스킬 찾기",
    "builtinSkillDesc.find-skills": "에이전트 창에서만 쓸 수 있으며, 인터넷에 연결해 필요한 스킬을 찾고 설치를 제안합니다."
  },
  fr: {
    "builtinSkillTitle.meeting-minutes": "Comptes rendus de réunion",
    "builtinSkillDesc.meeting-minutes": "Transforme les notes de réunion en compte rendu qui fait ressortir les décisions et les actions.",
    "builtinSkillTitle.internal-comms": "Annonces, lettres d’info et FAQ",
    "builtinSkillDesc.internal-comms": "Rédige annonces, lettres d’information, points d’avancement, FAQ et autres messages internes.",
    "builtinSkillTitle.humanizer": "Effacer l’effet IA (texte en anglais)",
    "builtinSkillDesc.humanizer": "Repère dans un texte anglais les tournures qui sonnent écrites par une IA et les rend naturelles sans changer le sens.",
    "builtinSkillTitle.copy-editing": "Relecture du style (texte en anglais)",
    "builtinSkillDesc.copy-editing": "Relit en plusieurs passes un texte anglais déjà écrit pour le rendre plus clair et plus concis.",
    "builtinSkillTitle.find-skills": "Trouver des compétences",
    "builtinSkillDesc.find-skills": "Fonctionne uniquement dans la fenêtre Agent et demande une connexion Internet pour trouver des compétences et proposer de les installer."
  },
  de: {
    "builtinSkillTitle.meeting-minutes": "Besprechungsprotokoll",
    "builtinSkillDesc.meeting-minutes": "Macht aus Besprechungsnotizen ein Protokoll, das Beschlüsse und Aufgaben zeigt.",
    "builtinSkillTitle.internal-comms": "Mitteilungen, Newsletter und FAQs",
    "builtinSkillDesc.internal-comms": "Schreibt Mitteilungen, Newsletter, Statusberichte, FAQs und andere interne Texte.",
    "builtinSkillTitle.humanizer": "KI-Klang entfernen (englische Texte)",
    "builtinSkillDesc.humanizer": "Findet in englischen Texten Formulierungen, die nach KI klingen, und macht sie natürlich, ohne den Inhalt zu ändern.",
    "builtinSkillTitle.copy-editing": "Texte überarbeiten (englische Texte)",
    "builtinSkillDesc.copy-editing": "Geht einen fertigen englischen Text in mehreren Durchgängen durch und macht ihn klarer und knapper.",
    "builtinSkillTitle.find-skills": "Skills finden",
    "builtinSkillDesc.find-skills": "Funktioniert nur im Agent-Fenster und braucht Internet, um Skills zu finden und ihre Installation vorzuschlagen."
  },
  es: {
    "builtinSkillTitle.meeting-minutes": "Actas de reunión",
    "builtinSkillDesc.meeting-minutes": "Convierte las notas de una reunión en un acta que muestra las decisiones y las tareas.",
    "builtinSkillTitle.internal-comms": "Avisos, boletines y preguntas frecuentes",
    "builtinSkillDesc.internal-comms": "Redacta avisos, boletines, informes de avance, preguntas frecuentes y otros textos internos.",
    "builtinSkillTitle.humanizer": "Quitar el tono de IA (texto en inglés)",
    "builtinSkillDesc.humanizer": "Busca en textos en inglés las expresiones que suenan escritas por una IA y las vuelve naturales sin cambiar lo que dicen.",
    "builtinSkillTitle.copy-editing": "Pulir el texto (texto en inglés)",
    "builtinSkillDesc.copy-editing": "Repasa varias veces un texto en inglés ya escrito para hacerlo más claro y conciso.",
    "builtinSkillTitle.find-skills": "Buscar habilidades",
    "builtinSkillDesc.find-skills": "Solo funciona en la ventana del agente y necesita internet para buscar habilidades y proponer su instalación."
  },
  th: {
    "builtinSkillTitle.meeting-minutes": "สรุปบันทึกการประชุม",
    "builtinSkillDesc.meeting-minutes": "เรียบเรียงโน้ตการประชุมเป็นบันทึกการประชุมที่เห็นข้อตัดสินใจและงานที่ต้องทำ",
    "builtinSkillTitle.internal-comms": "เขียนประกาศ จดหมายข่าว และคำถามที่พบบ่อย",
    "builtinSkillDesc.internal-comms": "เขียนประกาศ จดหมายข่าว รายงานความคืบหน้า คำถามที่พบบ่อย และข้อความภายในองค์กรอื่น ๆ",
    "builtinSkillTitle.humanizer": "ลบความรู้สึกแบบ AI (สำหรับข้อความภาษาอังกฤษ)",
    "builtinSkillDesc.humanizer": "หาสำนวนที่ฟังเหมือน AI เขียนในข้อความภาษาอังกฤษ แล้วปรับให้เป็นธรรมชาติโดยไม่เปลี่ยนเนื้อหา",
    "builtinSkillTitle.copy-editing": "ขัดเกลาข้อความ (สำหรับข้อความภาษาอังกฤษ)",
    "builtinSkillDesc.copy-editing": "อ่านทวนข้อความภาษาอังกฤษที่เขียนไว้แล้วหลายรอบ ให้ชัดเจนและกระชับขึ้น",
    "builtinSkillTitle.find-skills": "ค้นหาสกิล",
    "builtinSkillDesc.find-skills": "ใช้ได้เฉพาะในหน้าต่างเอเจนต์และต้องต่ออินเทอร์เน็ต เพื่อค้นหาสกิลและเสนอให้ติดตั้ง"
  },
  id: {
    "builtinSkillTitle.meeting-minutes": "Notulen rapat",
    "builtinSkillDesc.meeting-minutes": "Mengubah catatan rapat menjadi notulen yang menampilkan keputusan dan tugas tindak lanjut.",
    "builtinSkillTitle.internal-comms": "Pengumuman, buletin, dan FAQ",
    "builtinSkillDesc.internal-comms": "Menulis pengumuman, buletin, laporan kemajuan, FAQ, dan pesan internal lainnya.",
    "builtinSkillTitle.humanizer": "Hilangkan kesan AI (teks bahasa Inggris)",
    "builtinSkillDesc.humanizer": "Mencari ungkapan yang terdengar ditulis AI dalam teks bahasa Inggris dan membuatnya wajar tanpa mengubah isinya.",
    "builtinSkillTitle.copy-editing": "Merapikan tulisan (teks bahasa Inggris)",
    "builtinSkillDesc.copy-editing": "Memeriksa ulang teks bahasa Inggris yang sudah ditulis beberapa kali agar lebih jelas dan ringkas.",
    "builtinSkillTitle.find-skills": "Cari skill",
    "builtinSkillDesc.find-skills": "Hanya berfungsi di jendela agen dan memerlukan internet untuk mencari skill serta mengusulkan pemasangannya."
  },
  ru: {
    "builtinSkillTitle.meeting-minutes": "Протокол встречи",
    "builtinSkillDesc.meeting-minutes": "Превращает заметки со встречи в протокол, где видны решения и задачи.",
    "builtinSkillTitle.internal-comms": "Объявления, рассылки и ответы на вопросы",
    "builtinSkillDesc.internal-comms": "Пишет объявления, рассылки, отчёты о ходе работ, ответы на частые вопросы и другие внутренние тексты.",
    "builtinSkillTitle.humanizer": "Убрать «почерк» ИИ (текст на английском)",
    "builtinSkillDesc.humanizer": "Находит в английском тексте обороты, похожие на написанные ИИ, и делает их естественными, не меняя смысла.",
    "builtinSkillTitle.copy-editing": "Редактура текста (текст на английском)",
    "builtinSkillDesc.copy-editing": "Несколько раз проходит по готовому английскому тексту и делает его яснее и короче.",
    "builtinSkillTitle.find-skills": "Поиск навыков",
    "builtinSkillDesc.find-skills": "Работает только в окне агента и требует интернета, чтобы найти навыки и предложить их установить."
  },
  ar: {
    "builtinSkillTitle.meeting-minutes": "محضر الاجتماع",
    "builtinSkillDesc.meeting-minutes": "يحوّل ملاحظات الاجتماع إلى محضر يبيّن القرارات والمهام المطلوبة.",
    "builtinSkillTitle.internal-comms": "الإعلانات والنشرات والأسئلة الشائعة",
    "builtinSkillDesc.internal-comms": "يكتب الإعلانات والنشرات وتقارير التقدّم والأسئلة الشائعة وغيرها من الرسائل الداخلية.",
    "builtinSkillTitle.humanizer": "إزالة طابع الذكاء الاصطناعي (للنصوص الإنجليزية)",
    "builtinSkillDesc.humanizer": "يبحث في النص الإنجليزي عن العبارات التي تبدو مكتوبة بالذكاء الاصطناعي ويجعلها طبيعية دون تغيير معناها.",
    "builtinSkillTitle.copy-editing": "تحرير الأسلوب (للنصوص الإنجليزية)",
    "builtinSkillDesc.copy-editing": "يراجع نصًا إنجليزيًا مكتوبًا عدة مرات ليجعله أوضح وأوجز.",
    "builtinSkillTitle.find-skills": "البحث عن المهارات",
    "builtinSkillDesc.find-skills": "يعمل في نافذة الوكيل فقط ويحتاج إلى الإنترنت للبحث عن المهارات واقتراح تثبيتها."
  },
  pt: {
    "builtinSkillTitle.meeting-minutes": "Atas de reunião",
    "builtinSkillDesc.meeting-minutes": "Transforma anotações de reunião em uma ata que mostra as decisões e as tarefas.",
    "builtinSkillTitle.internal-comms": "Avisos, boletins e perguntas frequentes",
    "builtinSkillDesc.internal-comms": "Escreve avisos, boletins, relatórios de andamento, perguntas frequentes e outros textos internos.",
    "builtinSkillTitle.humanizer": "Tirar o tom de IA (texto em inglês)",
    "builtinSkillDesc.humanizer": "Encontra em textos em inglês as expressões que parecem escritas por IA e as deixa naturais sem mudar o que dizem.",
    "builtinSkillTitle.copy-editing": "Revisar o texto (texto em inglês)",
    "builtinSkillDesc.copy-editing": "Revê em várias passadas um texto em inglês já escrito para deixá-lo mais claro e conciso.",
    "builtinSkillTitle.find-skills": "Encontrar habilidades",
    "builtinSkillDesc.find-skills": "Funciona só na janela do agente e precisa de internet para encontrar habilidades e sugerir a instalação."
  },
  it: {
    "builtinSkillTitle.meeting-minutes": "Verbali di riunione",
    "builtinSkillDesc.meeting-minutes": "Trasforma gli appunti di una riunione in un verbale che mostra decisioni e attività.",
    "builtinSkillTitle.internal-comms": "Avvisi, newsletter e FAQ",
    "builtinSkillDesc.internal-comms": "Scrive avvisi, newsletter, aggiornamenti sull’avanzamento, FAQ e altri testi interni.",
    "builtinSkillTitle.humanizer": "Togliere l’effetto IA (testi in inglese)",
    "builtinSkillDesc.humanizer": "Trova nei testi in inglese le espressioni che sembrano scritte da un’IA e le rende naturali senza cambiarne il senso.",
    "builtinSkillTitle.copy-editing": "Rifinire il testo (testi in inglese)",
    "builtinSkillDesc.copy-editing": "Rilegge più volte un testo in inglese già scritto per renderlo più chiaro e conciso.",
    "builtinSkillTitle.find-skills": "Trova abilità",
    "builtinSkillDesc.find-skills": "Funziona solo nella finestra dell’agente e richiede internet per trovare abilità e proporne l’installazione."
  },
  pl: {
    "builtinSkillTitle.meeting-minutes": "Protokół ze spotkania",
    "builtinSkillDesc.meeting-minutes": "Zamienia notatki ze spotkania w protokół, w którym widać decyzje i zadania.",
    "builtinSkillTitle.internal-comms": "Ogłoszenia, biuletyny i FAQ",
    "builtinSkillDesc.internal-comms": "Pisze ogłoszenia, biuletyny, raporty z postępów, FAQ i inne teksty wewnętrzne.",
    "builtinSkillTitle.humanizer": "Usuń styl AI (tekst angielski)",
    "builtinSkillDesc.humanizer": "Wyszukuje w tekście angielskim sformułowania brzmiące jak pisane przez AI i czyni je naturalnymi bez zmiany treści.",
    "builtinSkillTitle.copy-editing": "Redakcja tekstu (tekst angielski)",
    "builtinSkillDesc.copy-editing": "Kilka razy przechodzi przez gotowy tekst angielski, by był jaśniejszy i zwięźlejszy.",
    "builtinSkillTitle.find-skills": "Znajdź umiejętności",
    "builtinSkillDesc.find-skills": "Działa tylko w oknie agenta i wymaga internetu, aby znaleźć umiejętności i zaproponować ich instalację."
  },
  cs: {
    "builtinSkillTitle.meeting-minutes": "Zápis z porady",
    "builtinSkillDesc.meeting-minutes": "Udělá z poznámek z porady zápis, ve kterém jsou vidět rozhodnutí a úkoly.",
    "builtinSkillTitle.internal-comms": "Oznámení, zpravodaje a časté dotazy",
    "builtinSkillDesc.internal-comms": "Píše oznámení, zpravodaje, zprávy o postupu, časté dotazy a další interní texty.",
    "builtinSkillTitle.humanizer": "Odstranit dojem AI (anglický text)",
    "builtinSkillDesc.humanizer": "Najde v anglickém textu obraty, které působí jako psané AI, a upraví je přirozeně bez změny obsahu.",
    "builtinSkillTitle.copy-editing": "Úprava textu (anglický text)",
    "builtinSkillDesc.copy-editing": "Projde hotový anglický text v několika krocích a udělá ho jasnějším a stručnějším.",
    "builtinSkillTitle.find-skills": "Najít dovednosti",
    "builtinSkillDesc.find-skills": "Funguje jen v okně agenta a potřebuje internet, aby našel dovednosti a navrhl jejich instalaci."
  },
  nl: {
    "builtinSkillTitle.meeting-minutes": "Notulen van vergaderingen",
    "builtinSkillDesc.meeting-minutes": "Maakt van vergaderaantekeningen notulen waarin besluiten en actiepunten zichtbaar zijn.",
    "builtinSkillTitle.internal-comms": "Mededelingen, nieuwsbrieven en veelgestelde vragen",
    "builtinSkillDesc.internal-comms": "Schrijft mededelingen, nieuwsbrieven, voortgangsrapporten, veelgestelde vragen en andere interne berichten.",
    "builtinSkillTitle.humanizer": "AI-toon verwijderen (Engelse tekst)",
    "builtinSkillDesc.humanizer": "Zoekt in Engelse tekst formuleringen die naar AI klinken en maakt ze natuurlijk zonder de inhoud te veranderen.",
    "builtinSkillTitle.copy-editing": "Tekst redigeren (Engelse tekst)",
    "builtinSkillDesc.copy-editing": "Loopt een geschreven Engelse tekst een paar keer na en maakt hem duidelijker en bondiger.",
    "builtinSkillTitle.find-skills": "Vaardigheden zoeken",
    "builtinSkillDesc.find-skills": "Werkt alleen in het agentvenster en heeft internet nodig om vaardigheden te vinden en installatie voor te stellen."
  },
  ms: {
    "builtinSkillTitle.meeting-minutes": "Minit mesyuarat",
    "builtinSkillDesc.meeting-minutes": "Menyusun nota mesyuarat menjadi minit yang menunjukkan keputusan dan tindakan susulan.",
    "builtinSkillTitle.internal-comms": "Pengumuman, buletin dan soalan lazim",
    "builtinSkillDesc.internal-comms": "Menulis pengumuman, buletin, laporan kemajuan, soalan lazim dan mesej dalaman lain.",
    "builtinSkillTitle.humanizer": "Buang kesan AI (teks bahasa Inggeris)",
    "builtinSkillDesc.humanizer": "Mencari ungkapan yang berbunyi seperti ditulis AI dalam teks bahasa Inggeris dan menjadikannya semula jadi tanpa mengubah maksud.",
    "builtinSkillTitle.copy-editing": "Menyunting tulisan (teks bahasa Inggeris)",
    "builtinSkillDesc.copy-editing": "Menyemak teks bahasa Inggeris yang sudah ditulis beberapa kali supaya lebih jelas dan ringkas.",
    "builtinSkillTitle.find-skills": "Cari kemahiran",
    "builtinSkillDesc.find-skills": "Hanya berfungsi dalam tetingkap ejen dan memerlukan internet untuk mencari kemahiran serta mencadangkan pemasangannya."
  },
  he: {
    "builtinSkillTitle.meeting-minutes": "סיכום פגישה",
    "builtinSkillDesc.meeting-minutes": "הופך רשימות מפגישה לסיכום שמציג את ההחלטות ואת המשימות.",
    "builtinSkillTitle.internal-comms": "הודעות, עלוני מידע ושאלות נפוצות",
    "builtinSkillDesc.internal-comms": "כותב הודעות, עלוני מידע, דיווחי התקדמות, שאלות נפוצות ושאר טקסטים פנימיים.",
    "builtinSkillTitle.humanizer": "הסרת הרושם של AI (טקסט באנגלית)",
    "builtinSkillDesc.humanizer": "מאתר בטקסט באנגלית ניסוחים שנשמעים כאילו AI כתב אותם והופך אותם לטבעיים בלי לשנות את התוכן.",
    "builtinSkillTitle.copy-editing": "עריכת לשון (טקסט באנגלית)",
    "builtinSkillDesc.copy-editing": "עובר כמה פעמים על טקסט באנגלית שכבר נכתב והופך אותו לבהיר ולתמציתי יותר.",
    "builtinSkillTitle.find-skills": "חיפוש מיומנויות",
    "builtinSkillDesc.find-skills": "פועל רק בחלון הסוכן ודורש אינטרנט כדי למצוא מיומנויות ולהציע להתקין אותן."
  },
  hi: {
    "builtinSkillTitle.meeting-minutes": "बैठक का कार्यवृत्त",
    "builtinSkillDesc.meeting-minutes": "बैठक के नोट्स को ऐसे कार्यवृत्त में बदलता है जिसमें निर्णय और करने के काम साफ़ दिखें।",
    "builtinSkillTitle.internal-comms": "सूचनाएँ, न्यूज़लेटर और सामान्य प्रश्न",
    "builtinSkillDesc.internal-comms": "सूचनाएँ, न्यूज़लेटर, प्रगति रिपोर्ट, सामान्य प्रश्न और दूसरे आंतरिक संदेश लिखता है।",
    "builtinSkillTitle.humanizer": "AI जैसा लहजा हटाएँ (अंग्रेज़ी पाठ)",
    "builtinSkillDesc.humanizer": "अंग्रेज़ी पाठ में AI के लिखे जैसे लगने वाले वाक्यांश ढूँढता है और अर्थ बदले बिना उन्हें स्वाभाविक बनाता है।",
    "builtinSkillTitle.copy-editing": "पाठ सँवारें (अंग्रेज़ी पाठ)",
    "builtinSkillDesc.copy-editing": "पहले से लिखे अंग्रेज़ी पाठ को कई बार जाँचकर उसे ज़्यादा साफ़ और संक्षिप्त बनाता है।",
    "builtinSkillTitle.find-skills": "कौशल खोजें",
    "builtinSkillDesc.find-skills": "केवल एजेंट विंडो में काम करता है और कौशल खोजने व उन्हें इंस्टॉल करने का सुझाव देने के लिए इंटरनेट चाहिए।"
  },
  "zh-TW": {
    "builtinSkillTitle.meeting-minutes": "整理會議紀錄",
    "builtinSkillDesc.meeting-minutes": "把會議筆記整理成列明決議事項和待辦事項的會議紀錄。",
    "builtinSkillTitle.internal-comms": "撰寫公告、電子報和常見問題",
    "builtinSkillDesc.internal-comms": "撰寫公告、內部電子報、進度報告、常見問題等組織內部的文字。",
    "builtinSkillTitle.humanizer": "去除 AI 痕跡（以英文文字為準）",
    "builtinSkillDesc.humanizer": "找出英文文字中帶有 AI 痕跡的說法，在不改變內容的前提下改得更自然。",
    "builtinSkillTitle.copy-editing": "潤飾文字（以英文文字為準）",
    "builtinSkillDesc.copy-editing": "把已經寫好的英文文字逐次檢查，改得更清楚、更簡潔。",
    "builtinSkillTitle.find-skills": "尋找技能",
    "builtinSkillDesc.find-skills": "僅能在代理程式視窗中使用，需要連網，用來尋找所需技能並建議安裝。"
  },
  vi: {
    "builtinSkillTitle.meeting-minutes": "Biên bản cuộc họp",
    "builtinSkillDesc.meeting-minutes": "Biến ghi chú cuộc họp thành biên bản nêu rõ các quyết định và việc cần làm.",
    "builtinSkillTitle.internal-comms": "Thông báo, bản tin và câu hỏi thường gặp",
    "builtinSkillDesc.internal-comms": "Viết thông báo, bản tin, báo cáo tiến độ, câu hỏi thường gặp và các văn bản nội bộ khác.",
    "builtinSkillTitle.humanizer": "Bỏ giọng AI (văn bản tiếng Anh)",
    "builtinSkillDesc.humanizer": "Tìm trong văn bản tiếng Anh những cách diễn đạt nghe như AI viết và sửa cho tự nhiên mà không đổi nội dung.",
    "builtinSkillTitle.copy-editing": "Trau chuốt câu chữ (văn bản tiếng Anh)",
    "builtinSkillDesc.copy-editing": "Rà lại nhiều lượt một văn bản tiếng Anh đã viết để nó rõ ràng và gọn hơn.",
    "builtinSkillTitle.find-skills": "Tìm kỹ năng",
    "builtinSkillDesc.find-skills": "Chỉ dùng được trong cửa sổ tác tử và cần internet để tìm kỹ năng và đề xuất cài đặt."
  }
});
const builtinSkillText = createI18n(BUILTIN_SKILL_STRINGS);
function builtinSkillTitle(lang, name) {
  return builtinSkillText(lang, `builtinSkillTitle.${name}`);
}
function builtinSkillDesc(lang, name) {
  return builtinSkillText(lang, `builtinSkillDesc.${name}`);
}
function isBuiltinSkillName(name) {
  return BUILTIN_SKILL_NAMES.includes(name);
}
const zh$5 = {
  listLabel: "技能",
  manage: "管理技能…",
  template: "含模板",
  scriptsNotice: "此技能的脚本不会在普通 AI 窗口中运行",
  tooLarge: "技能太大，无法一起发送",
  missing: "不可用",
  missingNotice: "找不到技能，因此没有发送。请移除该技能后再发送。",
  removeChip: "移除 {title}",
  sourceBuiltin: "内置",
  sourceApp: "我的技能",
  sourceAppGitHub: "我的技能 · GitHub",
  sourceUser: "Claude 技能文件夹",
  sourcePlugin: "Claude 插件 · {plugin}",
  sourceCodex: "Codex 技能文件夹"
};
const SKILL_PICKER_STRINGS = defineStrings({
  zh: zh$5,
  en: {
    listLabel: "Skills",
    manage: "Manage skills…",
    template: "Includes a template",
    scriptsNotice: "This skill’s scripts do not run in the regular AI panel",
    tooLarge: "The skills are too large to send along",
    missing: "Unavailable",
    missingNotice: "A skill could not be found, so nothing was sent. Remove it and send again.",
    removeChip: "Remove {title}",
    sourceBuiltin: "Built-in",
    sourceApp: "My skills",
    sourceAppGitHub: "My skills · GitHub",
    sourceUser: "Claude skills folder",
    sourcePlugin: "Claude plugin · {plugin}",
    sourceCodex: "Codex skills folder"
  },
  ja: {
    listLabel: "スキル",
    manage: "スキルを管理…",
    template: "テンプレートあり",
    scriptsNotice: "このスキルのスクリプトは通常の AI ウィンドウでは実行されません",
    tooLarge: "スキルが大きすぎるため一緒に送信できません",
    missing: "なし",
    missingNotice: "スキルが見つからないため送信しませんでした。そのスキルを外してもう一度送信してください。",
    removeChip: "{title} を外す",
    sourceBuiltin: "標準",
    sourceApp: "マイスキル",
    sourceAppGitHub: "マイスキル · GitHub",
    sourceUser: "Claude スキルフォルダー",
    sourcePlugin: "Claude プラグイン · {plugin}",
    sourceCodex: "Codex スキルフォルダー"
  },
  ko: {
    listLabel: "스킬",
    manage: "스킬 관리…",
    template: "양식 포함",
    scriptsNotice: "이 스킬의 스크립트는 일반 AI 창에서 실행되지 않습니다",
    tooLarge: "스킬이 너무 커서 함께 보낼 수 없습니다",
    missing: "없음",
    missingNotice: "스킬을 찾을 수 없어 보내지 않았습니다. 그 스킬을 빼고 다시 보내세요.",
    removeChip: "{title} 빼기",
    sourceBuiltin: "기본",
    sourceApp: "내 스킬",
    sourceAppGitHub: "내 스킬 · 깃허브",
    sourceUser: "Claude 스킬 폴더",
    sourcePlugin: "Claude 플러그인 · {plugin}",
    sourceCodex: "Codex 스킬 폴더"
  },
  fr: {
    listLabel: "Compétences",
    manage: "Gérer les compétences…",
    template: "Contient un modèle",
    scriptsNotice: "Les scripts de cette compétence ne s’exécutent pas dans le panneau IA normal",
    tooLarge: "Les compétences sont trop volumineuses pour être envoyées",
    missing: "Indisponible",
    missingNotice: "Une compétence est introuvable, rien n’a donc été envoyé. Retirez-la et envoyez à nouveau.",
    removeChip: "Retirer {title}",
    sourceBuiltin: "Intégrée",
    sourceApp: "Mes compétences",
    sourceAppGitHub: "Mes compétences · GitHub",
    sourceUser: "Dossier de compétences Claude",
    sourcePlugin: "Extension Claude · {plugin}",
    sourceCodex: "Dossier de compétences Codex"
  },
  de: {
    listLabel: "Skills",
    manage: "Skills verwalten…",
    template: "Mit Vorlage",
    scriptsNotice: "Die Skripte dieses Skills laufen im normalen KI-Bereich nicht",
    tooLarge: "Die Skills sind zu groß, um mitgesendet zu werden",
    missing: "Nicht verfügbar",
    missingNotice: "Ein Skill wurde nicht gefunden, daher wurde nichts gesendet. Entfernen Sie ihn und senden Sie erneut.",
    removeChip: "{title} entfernen",
    sourceBuiltin: "Integriert",
    sourceApp: "Meine Skills",
    sourceAppGitHub: "Meine Skills · GitHub",
    sourceUser: "Claude-Skill-Ordner",
    sourcePlugin: "Claude-Plugin · {plugin}",
    sourceCodex: "Codex-Skill-Ordner"
  },
  es: {
    listLabel: "Habilidades",
    manage: "Gestionar habilidades…",
    template: "Incluye plantilla",
    scriptsNotice: "Los scripts de esta habilidad no se ejecutan en el panel de IA normal",
    tooLarge: "Las habilidades son demasiado grandes para enviarlas",
    missing: "No disponible",
    missingNotice: "No se encontró una habilidad, así que no se envió nada. Quítela y vuelva a enviar.",
    removeChip: "Quitar {title}",
    sourceBuiltin: "Integrada",
    sourceApp: "Mis habilidades",
    sourceAppGitHub: "Mis habilidades · GitHub",
    sourceUser: "Carpeta de habilidades de Claude",
    sourcePlugin: "Complemento de Claude · {plugin}",
    sourceCodex: "Carpeta de habilidades de Codex"
  },
  th: {
    listLabel: "สกิล",
    manage: "จัดการสกิล…",
    template: "มีแม่แบบ",
    scriptsNotice: "สคริปต์ของสกิลนี้จะไม่ทำงานในหน้าต่าง AI ปกติ",
    tooLarge: "สกิลมีขนาดใหญ่เกินกว่าจะส่งไปด้วยได้",
    missing: "ไม่มี",
    missingNotice: "ไม่พบสกิล จึงยังไม่ได้ส่ง โปรดนำสกิลนั้นออกแล้วส่งอีกครั้ง",
    removeChip: "นำ {title} ออก",
    sourceBuiltin: "ในตัว",
    sourceApp: "สกิลของฉัน",
    sourceAppGitHub: "สกิลของฉัน · GitHub",
    sourceUser: "โฟลเดอร์สกิล Claude",
    sourcePlugin: "ปลั๊กอิน Claude · {plugin}",
    sourceCodex: "โฟลเดอร์สกิล Codex"
  },
  id: {
    listLabel: "Skill",
    manage: "Kelola skill…",
    template: "Berisi templat",
    scriptsNotice: "Skrip skill ini tidak dijalankan di panel AI biasa",
    tooLarge: "Skill terlalu besar untuk ikut dikirim",
    missing: "Tidak ada",
    missingNotice: "Skill tidak ditemukan, jadi tidak ada yang dikirim. Hapus skill itu lalu kirim lagi.",
    removeChip: "Hapus {title}",
    sourceBuiltin: "Bawaan",
    sourceApp: "Skill saya",
    sourceAppGitHub: "Skill saya · GitHub",
    sourceUser: "Folder skill Claude",
    sourcePlugin: "Plugin Claude · {plugin}",
    sourceCodex: "Folder skill Codex"
  },
  ru: {
    listLabel: "Навыки",
    manage: "Управление навыками…",
    template: "Есть шаблон",
    scriptsNotice: "Скрипты этого навыка не запускаются в обычной панели ИИ",
    tooLarge: "Навыки слишком большие, чтобы отправить их вместе",
    missing: "Нет",
    missingNotice: "Навык не найден, поэтому ничего не отправлено. Уберите его и отправьте снова.",
    removeChip: "Убрать {title}",
    sourceBuiltin: "Встроенный",
    sourceApp: "Мои навыки",
    sourceAppGitHub: "Мои навыки · GitHub",
    sourceUser: "Папка навыков Claude",
    sourcePlugin: "Плагин Claude · {plugin}",
    sourceCodex: "Папка навыков Codex"
  },
  ar: {
    listLabel: "المهارات",
    manage: "إدارة المهارات…",
    template: "يتضمن قالبًا",
    scriptsNotice: "لا تعمل نصوص هذه المهارة البرمجية في نافذة الذكاء الاصطناعي العادية",
    tooLarge: "المهارات كبيرة جدًا بحيث لا يمكن إرسالها معًا",
    missing: "غير متاحة",
    missingNotice: "تعذر العثور على مهارة، لذلك لم يُرسل شيء. أزلها ثم أرسل مرة أخرى.",
    removeChip: "إزالة {title}",
    sourceBuiltin: "مضمّنة",
    sourceApp: "مهاراتي",
    sourceAppGitHub: "مهاراتي · GitHub",
    sourceUser: "مجلد مهارات Claude",
    sourcePlugin: "إضافة Claude · {plugin}",
    sourceCodex: "مجلد مهارات Codex"
  },
  pt: {
    listLabel: "Habilidades",
    manage: "Gerenciar habilidades…",
    template: "Inclui modelo",
    scriptsNotice: "Os scripts desta habilidade não são executados no painel de IA normal",
    tooLarge: "As habilidades são grandes demais para enviar junto",
    missing: "Indisponível",
    missingNotice: "Uma habilidade não foi encontrada, então nada foi enviado. Remova-a e envie novamente.",
    removeChip: "Remover {title}",
    sourceBuiltin: "Integrada",
    sourceApp: "Minhas habilidades",
    sourceAppGitHub: "Minhas habilidades · GitHub",
    sourceUser: "Pasta de habilidades do Claude",
    sourcePlugin: "Plugin do Claude · {plugin}",
    sourceCodex: "Pasta de habilidades do Codex"
  },
  it: {
    listLabel: "Abilità",
    manage: "Gestisci abilità…",
    template: "Include un modello",
    scriptsNotice: "Gli script di questa abilità non vengono eseguiti nel pannello IA normale",
    tooLarge: "Le abilità sono troppo grandi per essere inviate insieme",
    missing: "Non disponibile",
    missingNotice: "Un’abilità non è stata trovata, quindi non è stato inviato nulla. Rimuovila e invia di nuovo.",
    removeChip: "Rimuovi {title}",
    sourceBuiltin: "Integrata",
    sourceApp: "Le mie abilità",
    sourceAppGitHub: "Le mie abilità · GitHub",
    sourceUser: "Cartella abilità di Claude",
    sourcePlugin: "Plugin di Claude · {plugin}",
    sourceCodex: "Cartella abilità di Codex"
  },
  pl: {
    listLabel: "Umiejętności",
    manage: "Zarządzaj umiejętnościami…",
    template: "Zawiera szablon",
    scriptsNotice: "Skrypty tej umiejętności nie są uruchamiane w zwykłym panelu AI",
    tooLarge: "Umiejętności są za duże, by wysłać je razem",
    missing: "Brak",
    missingNotice: "Nie znaleziono umiejętności, więc nic nie wysłano. Usuń ją i wyślij ponownie.",
    removeChip: "Usuń {title}",
    sourceBuiltin: "Wbudowana",
    sourceApp: "Moje umiejętności",
    sourceAppGitHub: "Moje umiejętności · GitHub",
    sourceUser: "Folder umiejętności Claude",
    sourcePlugin: "Wtyczka Claude · {plugin}",
    sourceCodex: "Folder umiejętności Codex"
  },
  cs: {
    listLabel: "Dovednosti",
    manage: "Spravovat dovednosti…",
    template: "Obsahuje šablonu",
    scriptsNotice: "Skripty této dovednosti se v běžném panelu AI nespouštějí",
    tooLarge: "Dovednosti jsou příliš velké, než aby se odeslaly spolu",
    missing: "Nedostupné",
    missingNotice: "Dovednost nebyla nalezena, proto se nic neodeslalo. Odeberte ji a odešlete znovu.",
    removeChip: "Odebrat {title}",
    sourceBuiltin: "Vestavěná",
    sourceApp: "Moje dovednosti",
    sourceAppGitHub: "Moje dovednosti · GitHub",
    sourceUser: "Složka dovedností Claude",
    sourcePlugin: "Plugin Claude · {plugin}",
    sourceCodex: "Složka dovedností Codex"
  },
  nl: {
    listLabel: "Vaardigheden",
    manage: "Vaardigheden beheren…",
    template: "Met sjabloon",
    scriptsNotice: "De scripts van deze vaardigheid worden niet uitgevoerd in het gewone AI-paneel",
    tooLarge: "De vaardigheden zijn te groot om mee te sturen",
    missing: "Niet beschikbaar",
    missingNotice: "Een vaardigheid is niet gevonden, dus er is niets verstuurd. Verwijder hem en verstuur opnieuw.",
    removeChip: "{title} verwijderen",
    sourceBuiltin: "Ingebouwd",
    sourceApp: "Mijn vaardigheden",
    sourceAppGitHub: "Mijn vaardigheden · GitHub",
    sourceUser: "Claude-vaardighedenmap",
    sourcePlugin: "Claude-plug-in · {plugin}",
    sourceCodex: "Codex-vaardighedenmap"
  },
  ms: {
    listLabel: "Kemahiran",
    manage: "Urus kemahiran…",
    template: "Mengandungi templat",
    scriptsNotice: "Skrip kemahiran ini tidak dijalankan dalam panel AI biasa",
    tooLarge: "Kemahiran terlalu besar untuk dihantar bersama",
    missing: "Tiada",
    missingNotice: "Kemahiran tidak ditemui, jadi tiada apa-apa dihantar. Alih keluar kemahiran itu dan hantar semula.",
    removeChip: "Alih keluar {title}",
    sourceBuiltin: "Terbina dalam",
    sourceApp: "Kemahiran saya",
    sourceAppGitHub: "Kemahiran saya · GitHub",
    sourceUser: "Folder kemahiran Claude",
    sourcePlugin: "Pemalam Claude · {plugin}",
    sourceCodex: "Folder kemahiran Codex"
  },
  he: {
    listLabel: "מיומנויות",
    manage: "ניהול מיומנויות…",
    template: "כולל תבנית",
    scriptsNotice: "הסקריפטים של מיומנות זו לא רצים בחלון ה-AI הרגיל",
    tooLarge: "המיומנויות גדולות מכדי לשלוח אותן יחד",
    missing: "לא זמינה",
    missingNotice: "מיומנות לא נמצאה, ולכן דבר לא נשלח. הסירו אותה ושלחו שוב.",
    removeChip: "הסרת {title}",
    sourceBuiltin: "מובנית",
    sourceApp: "המיומנויות שלי",
    sourceAppGitHub: "המיומנויות שלי · GitHub",
    sourceUser: "תיקיית המיומנויות של Claude",
    sourcePlugin: "תוסף Claude · {plugin}",
    sourceCodex: "תיקיית המיומנויות של Codex"
  },
  hi: {
    listLabel: "कौशल",
    manage: "कौशल प्रबंधित करें…",
    template: "टेम्पलेट शामिल",
    scriptsNotice: "इस कौशल की स्क्रिप्ट सामान्य AI विंडो में नहीं चलतीं",
    tooLarge: "कौशल इतने बड़े हैं कि साथ में नहीं भेजे जा सकते",
    missing: "उपलब्ध नहीं",
    missingNotice: "एक कौशल नहीं मिला, इसलिए कुछ नहीं भेजा गया। उसे हटाकर फिर से भेजें।",
    removeChip: "{title} हटाएँ",
    sourceBuiltin: "अंतर्निहित",
    sourceApp: "मेरे कौशल",
    sourceAppGitHub: "मेरे कौशल · GitHub",
    sourceUser: "Claude कौशल फ़ोल्डर",
    sourcePlugin: "Claude प्लगइन · {plugin}",
    sourceCodex: "Codex कौशल फ़ोल्डर"
  },
  "zh-TW": {
    listLabel: "技能",
    manage: "管理技能…",
    template: "含範本",
    scriptsNotice: "此技能的指令碼不會在一般 AI 視窗中執行",
    tooLarge: "技能太大，無法一起傳送",
    missing: "無法使用",
    missingNotice: "找不到技能，因此沒有傳送。請移除該技能後再傳送。",
    removeChip: "移除 {title}",
    sourceBuiltin: "內建",
    sourceApp: "我的技能",
    sourceAppGitHub: "我的技能 · GitHub",
    sourceUser: "Claude 技能資料夾",
    sourcePlugin: "Claude 外掛程式 · {plugin}",
    sourceCodex: "Codex 技能資料夾"
  },
  vi: {
    listLabel: "Kỹ năng",
    manage: "Quản lý kỹ năng…",
    template: "Có mẫu",
    scriptsNotice: "Tập lệnh của kỹ năng này không chạy trong cửa sổ AI thông thường",
    tooLarge: "Các kỹ năng quá lớn để gửi kèm",
    missing: "Không còn",
    missingNotice: "Không tìm thấy kỹ năng nên chưa gửi gì. Hãy bỏ kỹ năng đó rồi gửi lại.",
    removeChip: "Bỏ {title}",
    sourceBuiltin: "Có sẵn",
    sourceApp: "Kỹ năng của tôi",
    sourceAppGitHub: "Kỹ năng của tôi · GitHub",
    sourceUser: "Thư mục kỹ năng Claude",
    sourcePlugin: "Plugin Claude · {plugin}",
    sourceCodex: "Thư mục kỹ năng Codex"
  }
});
const skillPickerText = createI18n(SKILL_PICKER_STRINGS);
function aiSkillsBridge() {
  const b = globalThis.aiOfficeUserSkills;
  return b && typeof b.list === "function" && typeof b.aiRead === "function" && typeof b.openSettings === "function" && typeof b.onChanged === "function" ? b : null;
}
function skillTriggerAt(value, caret, options = {}) {
  if (options.composing) return null;
  if (!Number.isInteger(caret) || caret < 1 || caret > value.length) return null;
  let start = caret;
  while (start > 0 && !/\s/.test(value.charAt(start - 1))) start -= 1;
  const char = value.charAt(start);
  if (char !== "/" && char !== "$") return null;
  if (char === "$" && options.dollarAtStartOnly && start !== 0) return null;
  return { char, start, end: caret, query: value.slice(start + 1, caret) };
}
function removeSkillTrigger(value, trigger) {
  return { value: value.slice(0, trigger.start) + value.slice(trigger.end), caret: trigger.start };
}
function skillPickerKeyAction(event) {
  if (!event.open || event.isComposing) return null;
  switch (event.key) {
    case "ArrowDown":
      return "next";
    case "ArrowUp":
      return "prev";
    case "Enter":
    case "Tab":
      return event.shiftKey ? null : "pick";
    case "Escape":
      return "close";
    default:
      return null;
  }
}
function isRecord$3(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function str$2(value) {
  return typeof value === "string" ? value : "";
}
function skillSourceLabel(lang, skill) {
  switch (skill.source) {
    case "builtin":
      return skillPickerText(lang, "sourceBuiltin");
    case "app":
      return skillPickerText(lang, skill.github ? "sourceAppGitHub" : "sourceApp");
    case "user":
      return skillPickerText(lang, "sourceUser");
    case "plugin":
      return skillPickerText(lang, "sourcePlugin", { plugin: skill.plugin ?? "" });
    case "codex":
      return skillPickerText(lang, "sourceCodex");
    default:
      return "";
  }
}
function pickerSkillsOf(raw, lang, surface = "panel") {
  if (!Array.isArray(raw)) return [];
  const items = [];
  for (const view of raw) {
    if (!isRecord$3(view)) continue;
    const id2 = str$2(view.id);
    const name = str$2(view.name);
    const source = str$2(view.source);
    if (!id2.includes(":") || !name || !source) continue;
    if (view.enabled !== true || view.hidden === true || view.unreadable) continue;
    if (view.agentOnly === true && surface !== "agent") continue;
    if (RESERVED_USER_SKILL_NAMES.has(name.toLowerCase())) continue;
    const plugin = typeof view.plugin === "string" ? view.plugin : void 0;
    const builtin = source === "builtin" && isBuiltinSkillName(name);
    items.push({
      id: id2,
      source,
      plugin,
      name,
      title: builtin ? builtinSkillTitle(lang, name) : str$2(view.title) || name,
      description: builtin ? builtinSkillDesc(lang, name) : str$2(view.description),
      sourceLabel: skillSourceLabel(lang, { source, plugin, github: view.github }),
      hasScripts: view.hasScripts === true,
      template: !!view.template && view.templateExists === true,
      ...view.template && view.templateExists !== true ? { templateMissing: true } : {}
    });
  }
  return items;
}
function fold(text) {
  return text.normalize("NFC").toLocaleLowerCase();
}
function filterPickerSkills(items, query) {
  const q = fold(query.trim());
  if (!q) return [...items];
  const ranked = [];
  items.forEach((item, index) => {
    const title = fold(item.title);
    const name = fold(item.name);
    let rank = -1;
    if (title.startsWith(q) || name.startsWith(q)) rank = 0;
    else if (title.includes(q) || name.includes(q)) rank = 1;
    else if (fold(item.description).includes(q)) rank = 2;
    if (rank >= 0) ranked.push({ item, rank, index });
  });
  ranked.sort((a, b) => a.rank - b.rank || a.index - b.index);
  return ranked.map((r) => r.item);
}
const SKILL_CHIPS_MAX = 32;
function skillChipOf(item) {
  return {
    id: item.id,
    source: item.source,
    title: item.title,
    sourceLabel: item.sourceLabel,
    hasScripts: item.hasScripts,
    template: item.template,
    ...item.templateMissing ? { templateMissing: true } : {}
  };
}
function skillChipRef(chip) {
  return { id: chip.id, source: chip.source, title: chip.title };
}
function withSkillChip(chips, chip) {
  if (chips.some((c) => c.id === chip.id)) return [...chips];
  if (chips.length >= SKILL_CHIPS_MAX) return [...chips];
  return [...chips, chip];
}
function chipsAfterListChange(chips, items) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const out = [];
  for (const chip of chips) {
    const item = byId.get(chip.id);
    if (item) out.push({ ...skillChipOf(item), missing: false });
  }
  return out;
}
function chipTitleRepeats(chips, chip) {
  return chips.some((c) => c.id !== chip.id && c.title === chip.title);
}
const SKILL_SEND_MAX_CHARS = 15e4;
function attr(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
const SKILLS_LEAD = "The person chose the skills below for this request. A skill is a set of instructions the person keeps; follow it for this request. Its scripts are not run here.";
function skillRequestText(skills) {
  if (skills.length === 0) return "";
  const blocks = skills.map((skill) => {
    const files = skill.files.length > 0 ? `

Text files in this skill's folder: ${skill.files.join(", ")}` : "";
    return `<skill id="${attr(skill.id)}" title="${attr(skill.title)}">
${skill.body.trim()}${files}
</skill>`;
  });
  return `

${SKILLS_LEAD}

${blocks.join("\n\n")}`;
}
function buildSkillRequest(skills, max = SKILL_SEND_MAX_CHARS) {
  const text = skillRequestText(skills);
  if (text.length > max) return { ok: false, reason: "too-large", chars: text.length };
  return { ok: true, text };
}
function isRecord$2(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function skillForRequestOf(raw) {
  if (!isRecord$2(raw) || raw.ok !== true || !isRecord$2(raw.skill)) return void 0;
  const s = raw.skill;
  if (typeof s.id !== "string" || typeof s.body !== "string") return void 0;
  return {
    id: s.id,
    title: typeof s.title === "string" && s.title ? s.title : s.id,
    body: s.body,
    files: Array.isArray(s.files) ? s.files.filter((f) => typeof f === "string") : []
  };
}
async function readSkillsForRequest(bridge, ids) {
  const unique = [...new Set(ids)];
  const answers = await Promise.all(
    unique.map(
      (id2) => bridge.aiRead(id2).then(
        (raw) => skillForRequestOf(raw),
        () => void 0
      )
    )
  );
  const skills = [];
  const missing = [];
  unique.forEach((id2, i) => {
    const skill = answers[i];
    if (skill) skills.push(skill);
    else missing.push(id2);
  });
  return { skills, missing };
}
const DESCRIPTION_PREVIEW_CHARS = 90;
function preview(text) {
  const line = text.replace(/\s+/g, " ").trim();
  return line.length > DESCRIPTION_PREVIEW_CHARS ? `${line.slice(0, DESCRIPTION_PREVIEW_CHARS)}…` : line;
}
function skillPickerOptionId(listId, index) {
  return `${listId}-opt-${index}`;
}
function SkillPicker({
  lang,
  listId,
  items,
  active,
  onPick,
  onHover
}) {
  const manageIndex = items.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "ai-skill-picker",
      role: "listbox",
      id: listId,
      "aria-label": skillPickerText(lang, "listLabel"),
      onMouseDown: (e) => e.preventDefault(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ai-skill-picker-rows", children: items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            id: skillPickerOptionId(listId, index),
            role: "option",
            "aria-selected": index === active,
            className: `ai-skill-picker-row${index === active ? " is-active" : ""}`,
            onMouseEnter: () => onHover(index),
            onClick: () => onPick(index),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-skill-picker-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ai-skill-picker-title", dir: "auto", children: item.title }),
                item.sourceLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ai-skill-picker-source", children: item.sourceLabel }),
                item.template && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ai-skill-picker-badge", children: skillPickerText(lang, "template") })
              ] }),
              item.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ai-skill-picker-desc", dir: "auto", children: preview(item.description) })
            ]
          },
          item.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            id: skillPickerOptionId(listId, manageIndex),
            role: "option",
            "aria-selected": active === manageIndex,
            className: `ai-skill-picker-row ai-skill-picker-manage${active === manageIndex ? " is-active" : ""}`,
            onMouseEnter: () => onHover(manageIndex),
            onClick: () => onPick(manageIndex),
            children: skillPickerText(lang, "manage")
          }
        )
      ]
    }
  );
}
function RemoveIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 32 32", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "path",
    {
      d: "M24 9.4L22.6 8L16 14.6L9.4 8L8 9.4l6.6 6.6L8 22.6L9.4 24l6.6-6.6l6.6 6.6l1.4-1.4l-6.6-6.6L24 9.4z",
      fill: "currentColor"
    }
  ) });
}
function SkillChip({
  lang,
  chip,
  showSource = false,
  onRemove
}) {
  const tip = chip.sourceLabel ? `${chip.title} · ${chip.sourceLabel}` : chip.title;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `ai-skill-chip${chip.missing ? " is-missing" : ""}`,
      "data-skill-id": chip.id,
      title: tip,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ai-skill-chip-mark", "aria-hidden": "true", children: "/" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ai-skill-chip-title", dir: "auto", children: chip.title }),
        showSource && chip.sourceLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ai-skill-chip-source", children: chip.sourceLabel }),
        chip.missing && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ai-skill-chip-missing", children: skillPickerText(lang, "missing") }),
        onRemove && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "ai-skill-chip-remove",
            onClick: onRemove,
            "aria-label": skillPickerText(lang, "removeChip", { title: chip.title }),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RemoveIcon, {})
          }
        )
      ]
    }
  );
}
function SkillChipRow({
  lang,
  chips,
  notice,
  onRemove
}) {
  if (chips.length === 0 && !notice) return null;
  const scripts = chips.some((c) => c.hasScripts && !c.missing);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-skill-chips", children: [
    chips.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ai-skill-chip-list", children: chips.map((chip) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      SkillChip,
      {
        lang,
        chip,
        showSource: chipTitleRepeats(chips, chip),
        onRemove: () => onRemove(chip.id)
      },
      chip.id
    )) }),
    scripts && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ai-skill-chip-note", children: skillPickerText(lang, "scriptsNotice") }),
    notice && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ai-skill-chip-note is-error", role: "alert", children: notice })
  ] });
}
function SentSkillChips({
  lang,
  chips,
  isAvailable
}) {
  if (!chips || chips.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ai-skill-chip-list ai-msg-skill-chips", children: chips.map((chip) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    SkillChip,
    {
      lang,
      chip: { ...chip, missing: isAvailable ? !isAvailable(chip.id) : false }
    },
    chip.id
  )) });
}
const NO_SKILL_USE = Object.freeze({ text: "", chips: [] });
function sameIds(a, b) {
  return a.length === b.length && a.every(
    (c, i) => c.id === b[i]?.id && c.title === b[i]?.title && !!c.missing === !!b[i]?.missing
  );
}
function useComposerSkills(options) {
  const { lang, surface = "panel", dollarAtStartOnly, maxChars = SKILL_SEND_MAX_CHARS } = options;
  const bridgeRef = reactExports.useRef(null);
  bridgeRef.current = options.bridge !== void 0 ? options.bridge : aiSkillsBridge();
  const hasBridge = bridgeRef.current !== null;
  const templateRef = reactExports.useRef(options.onTemplateSkill);
  templateRef.current = options.onTemplateSkill;
  const [items, setItems] = reactExports.useState([]);
  const [loaded, setLoaded] = reactExports.useState(false);
  const [chips, setChips] = reactExports.useState([]);
  const [notice, setNotice] = reactExports.useState(null);
  const chipsRef = reactExports.useRef(chips);
  chipsRef.current = chips;
  const historyRef = reactExports.useRef([]);
  const [gone, setGone] = reactExports.useState(() => /* @__PURE__ */ new Set());
  const readingRef = reactExports.useRef(false);
  const liveRef = reactExports.useRef(true);
  const listSeqRef = reactExports.useRef(0);
  const langRef = reactExports.useRef(lang);
  langRef.current = lang;
  const refresh = reactExports.useCallback(() => {
    const bridge = bridgeRef.current;
    if (!bridge) return;
    const seq = ++listSeqRef.current;
    void bridge.list().then((raw) => {
      if (!liveRef.current || seq !== listSeqRef.current) return;
      const next = pickerSkillsOf(raw, langRef.current, surface);
      setItems(next);
      setLoaded(true);
      setGone(/* @__PURE__ */ new Set());
      setChips((prev) => {
        const kept = chipsAfterListChange(prev, next);
        return sameIds(prev, kept) ? prev : kept;
      });
    }).catch(() => {
    });
  }, [surface]);
  reactExports.useEffect(() => {
    liveRef.current = true;
    const bridge = bridgeRef.current;
    if (!bridge) return;
    refresh();
    const off = bridge.onChanged(refresh);
    return () => {
      liveRef.current = false;
      off();
    };
  }, [refresh, hasBridge]);
  reactExports.useEffect(() => {
    if (loaded) refresh();
  }, [lang]);
  const isAvailable = reactExports.useCallback(
    (id2) => !loaded || items.some((item) => item.id === id2) && !gone.has(id2),
    [items, loaded, gone]
  );
  const onPick = reactExports.useCallback((item) => {
    setNotice(null);
    setChips((prev) => withSkillChip(prev, skillChipOf(item)));
  }, []);
  const onRemove = reactExports.useCallback((id2) => {
    setNotice(null);
    setChips((prev) => prev.filter((c) => c.id !== id2));
  }, []);
  const onManage = reactExports.useCallback(() => {
    void bridgeRef.current?.openSettings().catch(() => {
    });
  }, []);
  const withSkills = reactExports.useCallback(
    (userText, send) => {
      const composerChips = chipsRef.current;
      const history = historyRef.current.filter((id2) => !composerChips.some((c) => c.id === id2));
      const bridge = bridgeRef.current;
      if (composerChips.length === 0 && history.length === 0 || !bridge) {
        send(NO_SKILL_USE);
        return;
      }
      if (readingRef.current) return;
      const t = (key) => skillPickerText(langRef.current, key);
      if (composerChips.some((c) => c.missing)) {
        setNotice(t("missingNotice"));
        return;
      }
      readingRef.current = true;
      void (async () => {
        try {
          const template = composerChips.find((c) => c.template || c.templateMissing);
          const onTemplate = templateRef.current;
          if (template && onTemplate) {
            const taken = await onTemplate({
              skill: template,
              chips: [...composerChips],
              text: userText
            });
            if (taken === "stop") return;
            if (taken) {
              setChips((prev) => prev.filter((c) => !composerChips.some((u) => u.id === c.id)));
              return;
            }
          }
          const ids = [...composerChips.map((c) => c.id), ...history];
          const { skills, missing } = await readSkillsForRequest(bridge, ids);
          if (!liveRef.current) return;
          if (missing.length > 0) setGone((prev) => /* @__PURE__ */ new Set([...prev, ...missing]));
          const chosenMissing = composerChips.filter((c) => missing.includes(c.id));
          if (chosenMissing.length > 0) {
            setChips(
              (prev) => prev.map((c) => missing.includes(c.id) ? { ...c, missing: true } : c)
            );
            setNotice(t("missingNotice"));
            return;
          }
          const built = buildSkillRequest(skills, maxChars);
          if (!built.ok) {
            setNotice(t("tooLarge"));
            return;
          }
          setNotice(null);
          send({ text: built.text, chips: composerChips.map(skillChipRef) });
        } finally {
          readingRef.current = false;
        }
      })();
    },
    [maxChars]
  );
  const consume = reactExports.useCallback((use) => {
    historyRef.current = [];
    setNotice(null);
    if (use.chips.length === 0) return;
    const sent = new Set(use.chips.map((c) => c.id));
    setChips((prev) => prev.filter((c) => !sent.has(c.id)));
  }, []);
  const restoreHistory = reactExports.useCallback(
    (chipLists) => {
      const ids = [];
      for (const list of chipLists) {
        for (const chip of list ?? []) if (!ids.includes(chip.id)) ids.push(chip.id);
      }
      historyRef.current = ids;
    },
    []
  );
  const resetConversation = reactExports.useCallback(() => {
    historyRef.current = [];
  }, []);
  const composer = hasBridge ? {
    lang,
    items,
    chips,
    notice,
    dollarAtStartOnly,
    onOpen: refresh,
    onPick,
    onRemove,
    onManage
  } : void 0;
  return {
    composer,
    chips,
    isAvailable,
    withSkills,
    consume,
    restoreHistory,
    resetConversation
  };
}
function useSkillPickerInput({
  skills,
  value,
  onChange,
  textareaRef
}) {
  const listId = reactExports.useId();
  const [caret, setCaret] = reactExports.useState(null);
  const [composing, setComposing] = reactExports.useState(false);
  const [dismissed, setDismissed] = reactExports.useState(null);
  const [selection, setSelection] = reactExports.useState({ key: "", index: 0 });
  const pendingCaretRef = reactExports.useRef(null);
  const live = skills && caret !== null ? skillTriggerAt(value, caret, { dollarAtStartOnly: skills.dollarAtStartOnly, composing }) : null;
  const frozenRef = reactExports.useRef(null);
  if (!composing) frozenRef.current = live;
  const trigger = composing ? frozenRef.current : live;
  const matches = trigger && skills ? filterPickerSkills(skills.items, trigger.query) : [];
  const open = !!trigger && matches.length > 0 && dismissed !== trigger.start;
  const key = trigger ? `${trigger.start}:${trigger.query}` : "";
  const active = selection.key === key ? Math.min(selection.index, matches.length) : 0;
  reactExports.useEffect(() => {
    if (!trigger && dismissed !== null) setDismissed(null);
  }, [trigger, dismissed]);
  const onOpen = skills?.onOpen;
  reactExports.useEffect(() => {
    if (open) onOpen?.();
  }, [open]);
  reactExports.useLayoutEffect(() => {
    const at = pendingCaretRef.current;
    const ta = textareaRef.current;
    if (at === null || !ta) return;
    pendingCaretRef.current = null;
    ta.setSelectionRange(at, at);
    setCaret(at);
  }, [value, textareaRef]);
  const pick = (index) => {
    if (!skills || !trigger) return;
    if (index >= matches.length) {
      setDismissed(trigger.start);
      skills.onManage();
      return;
    }
    const item = matches[index];
    if (!item) return;
    const next = removeSkillTrigger(value, trigger);
    pendingCaretRef.current = next.caret;
    onChange(next.value);
    skills.onPick(item);
  };
  const onKeyDown = (e) => {
    const action = skillPickerKeyAction({
      key: e.key,
      shiftKey: e.shiftKey,
      isComposing: e.nativeEvent.isComposing || composing,
      open
    });
    if (!action || !trigger) return false;
    e.preventDefault();
    e.stopPropagation();
    const count = matches.length + 1;
    if (action === "next") setSelection({ key, index: (active + 1) % count });
    else if (action === "prev") setSelection({ key, index: (active - 1 + count) % count });
    else if (action === "close") setDismissed(trigger.start);
    else pick(active);
    return true;
  };
  const track = (el) => {
    if (!skills) return;
    setCaret(el.selectionStart === el.selectionEnd ? el.selectionStart : null);
  };
  const inputProps = open ? {
    "aria-expanded": true,
    "aria-controls": listId,
    "aria-activedescendant": skillPickerOptionId(listId, active),
    "aria-autocomplete": "list"
  } : {};
  const popup = open && skills ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ai-skill-anchor", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    SkillPicker,
    {
      lang: skills.lang,
      listId,
      items: matches,
      active,
      onPick: pick,
      onHover: (index) => setSelection({ key, index })
    }
  ) }) : null;
  const chipRow = skills ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    SkillChipRow,
    {
      lang: skills.lang,
      chips: skills.chips,
      notice: skills.notice,
      onRemove: skills.onRemove
    }
  ) : null;
  return {
    onKeyDown,
    track,
    onCompositionStart: () => setComposing(true),
    onCompositionEnd: (e) => {
      setComposing(false);
      track(e.currentTarget);
    },
    onBlur: () => setCaret(null),
    inputProps,
    popup,
    chipRow,
    open
  };
}
function skillCardBridge() {
  const b = globalThis.aiOfficeUserSkills;
  return b && typeof b.suggestName === "function" && typeof b.checkName === "function" && typeof b.saveFromCard === "function" && typeof b.openSettings === "function" ? b : null;
}
const NAME_PROBLEMS = /* @__PURE__ */ new Set([
  "empty",
  "too-long",
  "characters",
  "hyphen-edge",
  "double-hyphen",
  "reserved",
  "taken"
]);
function skillNameCheckOf(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  if (r.ok === true) return { ok: true };
  const problem = typeof r.problem === "string" && NAME_PROBLEMS.has(r.problem) ? r.problem : "empty";
  return { ok: false, problem };
}
function skillCardSaveResultOf(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  if (r.ok === true && typeof r.id === "string" && r.id) return { ok: true, id: r.id };
  return {
    ok: false,
    reason: typeof r.reason === "string" && r.reason ? r.reason : "failed",
    ...typeof r.problem === "string" ? { problem: r.problem } : {}
  };
}
function skillCardMode(proposal) {
  if (!proposal.target) return "new";
  return proposal.target.owned ? "edit-own" : "copy";
}
function initialSkillCardDraft(proposal) {
  return {
    title: proposal.title,
    name: proposal.name || proposal.target?.name || "",
    description: proposal.description,
    body: proposal.body,
    invoke: "auto",
    withTemplate: proposal.wantsTemplate
  };
}
function keepsTargetName(proposal, name) {
  return !!proposal.target && name.trim() === proposal.target.name;
}
const NAME_KEYS = {
  empty: "nameEmpty",
  "too-long": "nameTooLong",
  characters: "nameCharacters",
  "hyphen-edge": "nameHyphenEdge",
  "double-hyphen": "nameDoubleHyphen",
  reserved: "nameReserved",
  taken: "nameTaken"
};
function skillNameProblemKey(problem) {
  return NAME_KEYS[problem];
}
function skillCardNameVerdict(mode, proposal, name, state) {
  if (!name.trim()) return { blocked: "nameEmpty", overwrite: false, notice: null };
  if (state === "checking") return { blocked: "nameChecking", overwrite: false, notice: null };
  if (state.ok) return { blocked: null, overwrite: false, notice: null };
  if (state.problem === "taken") {
    if (mode === "copy") return { blocked: null, overwrite: true, notice: "nameTakenReplace" };
    return { blocked: "nameTaken", overwrite: false, notice: null };
  }
  if (keepsTargetName(proposal, name)) return { blocked: null, overwrite: false, notice: null };
  return { blocked: skillNameProblemKey(state.problem), overwrite: false, notice: null };
}
function skillCardSaveBlock(draft, nameBlock) {
  if (!draft.title.trim()) return "blockTitle";
  if (!draft.description.trim()) return "blockDescription";
  if (!draft.body.trim()) return "blockBody";
  return nameBlock;
}
function skillCardSaveInput(draft, proposal, options = {}) {
  return {
    title: draft.title.trim(),
    name: draft.name.trim(),
    description: draft.description.trim(),
    body: draft.body,
    invoke: draft.invoke,
    ...options.template ? { template: options.template } : {},
    ...proposal.target ? { targetId: proposal.target.id } : {},
    ...options.overwrite ? { overwrite: true } : {}
  };
}
function skillCardSaveFailureKey(reason, problem) {
  switch (reason) {
    case "empty-title":
      return "blockTitle";
    case "empty-description":
      return "blockDescription";
    case "empty-body":
      return "blockBody";
    case "name-taken":
    case "exists":
      return "nameTaken";
    case "bad-name":
      return problem && NAME_PROBLEMS.has(problem) ? skillNameProblemKey(problem) : "nameCharacters";
    case "not-allowed":
      return "noBridge";
    case "trash-failed":
      return "trashFailed";
    default:
      return "saveFailed";
  }
}
const PROPOSE_TOOL = "propose_skill";
const SAVED_MARKER = "skill-card-saved:";
function skillCardSavedRecord(title, id2) {
  return { name: PROPOSE_TOOL, summary: title, output: `${SAVED_MARKER}${id2}` };
}
function isSavedRecord(tool) {
  return tool.name === PROPOSE_TOOL && !!tool.output?.startsWith(SAVED_MARKER);
}
function isSkillCardSavedMessage(message) {
  return message.role === "assistant" && !message.text && (message.tools?.length ?? 0) > 0 && message.tools.every(isSavedRecord);
}
function storedTitle(tool) {
  const named = proposedTitleOf(tool.output);
  if (named) return named;
  try {
    const input = JSON.parse(tool.input ?? "");
    if (typeof input.title === "string" && input.title.trim()) return input.title.trim();
  } catch {
  }
  return "";
}
function readStoredSkillCards(messages, keyPrefix = "stored") {
  const proposals = [];
  const savedTitles = [];
  const kept = [];
  messages.forEach((message, i) => {
    if (isSkillCardSavedMessage(message)) {
      for (const tool of message.tools ?? []) savedTitles.push(tool.summary);
      return;
    }
    const keys = [];
    if (message.role === "assistant") {
      message.tools?.forEach((tool, j) => {
        if (tool.name !== PROPOSE_TOOL || tool.isError || isSavedRecord(tool)) return;
        const key = `${keyPrefix}-${i}-${j}`;
        keys.push(key);
        proposals.push({ key, title: storedTitle(tool), status: "unsaved" });
      });
    }
    kept.push(keys.length > 0 ? { ...message, skillProposals: keys } : message);
  });
  const open = () => [...proposals].reverse().filter((p) => p.status === "unsaved");
  for (const title of savedTitles) {
    const match = open().find((p) => p.title === title) ?? open().find((p) => p.title === "");
    if (match) match.status = "saved";
  }
  return { messages: kept, proposals };
}
const zh$4 = {
  cardNewTitle: "创建技能",
  cardEditTitle: "修改技能",
  fieldTitle: "标题",
  fieldDescription: "说明",
  fieldBody: "正文",
  advanced: "高级",
  fieldName: "名称",
  nameHint: "英文小写字母、数字和连字符(-)，最多 64 个字符",
  invokeLabel: "AI 何时使用",
  invokeAuto: "自动使用",
  invokeManual: "仅在调用时",
  templateCheck: "将此文档作为模板一起保存",
  templateBlank: "制作空白模板",
  templateAsIs: "按原文档保存",
  save: "保存",
  replace: "替换",
  cancel: "取消",
  saving: "正在保存…",
  copyNotice: "将以副本形式保存到我的技能，并关闭原技能",
  saved: "已保存",
  openSettings: "在设置中查看",
  unsaved: "未保存的技能建议",
  blockTitle: "请填写标题",
  blockDescription: "请填写说明",
  blockBody: "请填写正文",
  nameChecking: "正在检查名称…",
  nameEmpty: "请填写名称",
  nameTooLong: "名称最多 64 个字符",
  nameCharacters: "名称只能使用英文小写字母、数字和连字符(-)",
  nameHyphenEdge: "名称不能以连字符(-)开头或结尾",
  nameDoubleHyphen: "名称中不能连续使用两个连字符(--)",
  nameReserved: "不能使用此名称",
  nameTaken: "我的技能中已有同名技能",
  nameTakenReplace: "我的技能中已有同名技能，保存后将替换它",
  saveFailed: "无法保存",
  trashFailed: "无法将要替换的技能移到回收站，因此没有保存任何内容",
  noBridge: "此窗口无法保存技能",
  skillUsed: "已使用技能 {title}",
  skillProposed: "技能建议：{title}"
};
const SKILL_CARD_STRINGS = defineStrings({
  zh: zh$4,
  en: {
    cardNewTitle: "New skill",
    cardEditTitle: "Change skill",
    fieldTitle: "Title",
    fieldDescription: "Description",
    fieldBody: "Instructions",
    advanced: "Advanced",
    fieldName: "Name",
    nameHint: "Lowercase English letters, digits and hyphens (-), up to 64 characters",
    invokeLabel: "When the AI uses it",
    invokeAuto: "On its own",
    invokeManual: "Only when called",
    templateCheck: "Save this document along as a template",
    templateBlank: "Make a blank template",
    templateAsIs: "Save the document as it is",
    save: "Save",
    replace: "Replace",
    cancel: "Cancel",
    saving: "Saving…",
    copyNotice: "A copy is saved to my skills, and the original skill is turned off",
    saved: "Saved",
    openSettings: "View in Settings",
    unsaved: "Unsaved skill proposal",
    blockTitle: "Enter a title",
    blockDescription: "Enter a description",
    blockBody: "Enter the instructions",
    nameChecking: "Checking the name…",
    nameEmpty: "Enter a name",
    nameTooLong: "The name can be up to 64 characters",
    nameCharacters: "The name can use only lowercase English letters, digits and hyphens (-)",
    nameHyphenEdge: "The name cannot start or end with a hyphen (-)",
    nameDoubleHyphen: "The name cannot have two hyphens in a row (--)",
    nameReserved: "This name cannot be used",
    nameTaken: "My skills already have a skill with this name",
    nameTakenReplace: "My skills already have a skill with this name; saving replaces it",
    saveFailed: "Could not save",
    trashFailed: "The skill it replaces could not be moved to the trash, so nothing was saved",
    noBridge: "Skills cannot be saved in this window",
    skillUsed: "Used the {title} skill",
    skillProposed: "Skill proposal: {title}"
  },
  ja: {
    cardNewTitle: "スキルを作成",
    cardEditTitle: "スキルを修正",
    fieldTitle: "タイトル",
    fieldDescription: "説明",
    fieldBody: "本文",
    advanced: "詳細",
    fieldName: "名前",
    nameHint: "英小文字・数字・ハイフン(-)で 64 文字まで",
    invokeLabel: "AI が使うとき",
    invokeAuto: "自動で使う",
    invokeManual: "呼んだときだけ",
    templateCheck: "この文書をテンプレートとして一緒に保存",
    templateBlank: "空のテンプレートを作る",
    templateAsIs: "元の文書のまま保存",
    save: "保存",
    replace: "置き換え",
    cancel: "キャンセル",
    saving: "保存しています…",
    copyNotice: "マイスキルにコピーを作って保存し、元のスキルはオフにします",
    saved: "保存しました",
    openSettings: "設定で見る",
    unsaved: "保存していないスキルの提案",
    blockTitle: "タイトルを入力してください",
    blockDescription: "説明を入力してください",
    blockBody: "本文を入力してください",
    nameChecking: "名前を確認しています…",
    nameEmpty: "名前を入力してください",
    nameTooLong: "名前は 64 文字までです",
    nameCharacters: "名前には英小文字・数字・ハイフン(-)だけが使えます",
    nameHyphenEdge: "名前をハイフン(-)で始めたり終えたりできません",
    nameDoubleHyphen: "名前にハイフンを 2 つ続けて(--)使えません",
    nameReserved: "この名前は使えません",
    nameTaken: "マイスキルに同じ名前のスキルがあります",
    nameTakenReplace: "マイスキルに同じ名前のスキルがあり、保存するとそのスキルを置き換えます",
    saveFailed: "保存できませんでした",
    trashFailed: "置き換えるスキルをごみ箱に移動できなかったため、何も保存していません",
    noBridge: "このウィンドウではスキルを保存できません",
    skillUsed: "{title} スキルを使いました",
    skillProposed: "スキルの提案: {title}"
  },
  ko: {
    cardNewTitle: "스킬 만들기",
    cardEditTitle: "스킬 고치기",
    fieldTitle: "제목",
    fieldDescription: "설명",
    fieldBody: "본문",
    advanced: "고급",
    fieldName: "이름",
    nameHint: "영어 소문자·숫자·하이픈(-)으로 64자까지",
    invokeLabel: "AI가 쓰는 때",
    invokeAuto: "스스로 쓰기",
    invokeManual: "부를 때만",
    templateCheck: "이 문서를 양식으로 함께 저장",
    templateBlank: "비운 양식 만들기",
    templateAsIs: "원래 문서 그대로 저장",
    save: "저장",
    replace: "바꾸기",
    cancel: "취소",
    saving: "저장하는 중…",
    copyNotice: "내 스킬로 사본을 만들어 저장하고, 원래 스킬은 끕니다",
    saved: "저장했습니다",
    openSettings: "설정에서 보기",
    unsaved: "저장하지 않은 스킬 제안",
    blockTitle: "제목을 적어 주세요",
    blockDescription: "설명을 적어 주세요",
    blockBody: "본문을 적어 주세요",
    nameChecking: "이름을 확인하는 중…",
    nameEmpty: "이름을 적어 주세요",
    nameTooLong: "이름은 64자까지입니다",
    nameCharacters: "이름에는 영어 소문자, 숫자, 하이픈(-)만 쓸 수 있습니다",
    nameHyphenEdge: "이름은 하이픈(-)으로 시작하거나 끝날 수 없습니다",
    nameDoubleHyphen: "이름에 하이픈을 두 번(--) 잇달아 쓸 수 없습니다",
    nameReserved: "이 이름은 쓸 수 없습니다",
    nameTaken: "내 스킬에 같은 이름이 있습니다",
    nameTakenReplace: "내 스킬에 같은 이름이 있어, 저장하면 그 스킬을 바꿉니다",
    saveFailed: "저장하지 못했습니다",
    trashFailed: "바꿀 스킬을 휴지통으로 옮기지 못해 아무것도 저장하지 않았습니다",
    noBridge: "이 창에서는 스킬을 저장할 수 없습니다",
    skillUsed: "{title} 스킬을 썼습니다",
    skillProposed: "스킬 제안: {title}"
  },
  fr: {
    cardNewTitle: "Nouvelle compétence",
    cardEditTitle: "Modifier la compétence",
    fieldTitle: "Titre",
    fieldDescription: "Description",
    fieldBody: "Instructions",
    advanced: "Avancé",
    fieldName: "Nom",
    nameHint: "Lettres anglaises minuscules, chiffres et traits d’union (-), 64 caractères au plus",
    invokeLabel: "Quand l’IA l’utilise",
    invokeAuto: "D’elle-même",
    invokeManual: "Seulement sur appel",
    templateCheck: "Enregistrer aussi ce document comme modèle",
    templateBlank: "Créer un modèle vierge",
    templateAsIs: "Enregistrer le document tel quel",
    save: "Enregistrer",
    replace: "Remplacer",
    cancel: "Annuler",
    saving: "Enregistrement…",
    copyNotice: "Une copie est enregistrée dans mes compétences et la compétence d’origine est désactivée",
    saved: "Enregistré",
    openSettings: "Voir dans les paramètres",
    unsaved: "Proposition de compétence non enregistrée",
    blockTitle: "Saisissez un titre",
    blockDescription: "Saisissez une description",
    blockBody: "Saisissez les instructions",
    nameChecking: "Vérification du nom…",
    nameEmpty: "Saisissez un nom",
    nameTooLong: "Le nom compte 64 caractères au plus",
    nameCharacters: "Le nom ne peut contenir que des lettres anglaises minuscules, des chiffres et des traits d’union (-)",
    nameHyphenEdge: "Le nom ne peut pas commencer ni finir par un trait d’union (-)",
    nameDoubleHyphen: "Le nom ne peut pas contenir deux traits d’union de suite (--)",
    nameReserved: "Ce nom ne peut pas être utilisé",
    nameTaken: "Mes compétences contiennent déjà une compétence de ce nom",
    nameTakenReplace: "Mes compétences contiennent déjà une compétence de ce nom ; l’enregistrement la remplace",
    saveFailed: "Impossible d’enregistrer",
    trashFailed: "La compétence remplacée n’a pas pu être mise à la corbeille : rien n’a été enregistré",
    noBridge: "Les compétences ne peuvent pas être enregistrées dans cette fenêtre",
    skillUsed: "Compétence {title} utilisée",
    skillProposed: "Proposition de compétence : {title}"
  },
  de: {
    cardNewTitle: "Neuer Skill",
    cardEditTitle: "Skill ändern",
    fieldTitle: "Titel",
    fieldDescription: "Beschreibung",
    fieldBody: "Anweisungen",
    advanced: "Erweitert",
    fieldName: "Name",
    nameHint: "Englische Kleinbuchstaben, Ziffern und Bindestriche (-), höchstens 64 Zeichen",
    invokeLabel: "Wann die KI ihn nutzt",
    invokeAuto: "Selbstständig",
    invokeManual: "Nur beim Aufrufen",
    templateCheck: "Dieses Dokument als Vorlage mitspeichern",
    templateBlank: "Leere Vorlage erstellen",
    templateAsIs: "Dokument unverändert speichern",
    save: "Speichern",
    replace: "Ersetzen",
    cancel: "Abbrechen",
    saving: "Wird gespeichert…",
    copyNotice: "Eine Kopie wird unter meinen Skills gespeichert, und der ursprüngliche Skill wird ausgeschaltet",
    saved: "Gespeichert",
    openSettings: "In den Einstellungen ansehen",
    unsaved: "Nicht gespeicherter Skill-Vorschlag",
    blockTitle: "Geben Sie einen Titel ein",
    blockDescription: "Geben Sie eine Beschreibung ein",
    blockBody: "Geben Sie die Anweisungen ein",
    nameChecking: "Name wird geprüft…",
    nameEmpty: "Geben Sie einen Namen ein",
    nameTooLong: "Der Name darf höchstens 64 Zeichen haben",
    nameCharacters: "Der Name darf nur englische Kleinbuchstaben, Ziffern und Bindestriche (-) enthalten",
    nameHyphenEdge: "Der Name darf nicht mit einem Bindestrich (-) beginnen oder enden",
    nameDoubleHyphen: "Der Name darf keine zwei Bindestriche hintereinander (--) enthalten",
    nameReserved: "Dieser Name kann nicht verwendet werden",
    nameTaken: "Unter meinen Skills gibt es schon einen mit diesem Namen",
    nameTakenReplace: "Unter meinen Skills gibt es schon einen mit diesem Namen; Speichern ersetzt ihn",
    saveFailed: "Speichern nicht möglich",
    trashFailed: "Der ersetzte Skill konnte nicht in den Papierkorb verschoben werden, daher wurde nichts gespeichert",
    noBridge: "In diesem Fenster können keine Skills gespeichert werden",
    skillUsed: "Skill {title} verwendet",
    skillProposed: "Skill-Vorschlag: {title}"
  },
  es: {
    cardNewTitle: "Nueva habilidad",
    cardEditTitle: "Cambiar habilidad",
    fieldTitle: "Título",
    fieldDescription: "Descripción",
    fieldBody: "Instrucciones",
    advanced: "Avanzado",
    fieldName: "Nombre",
    nameHint: "Letras inglesas minúsculas, números y guiones (-), hasta 64 caracteres",
    invokeLabel: "Cuándo la usa la IA",
    invokeAuto: "Por sí sola",
    invokeManual: "Solo al llamarla",
    templateCheck: "Guardar también este documento como plantilla",
    templateBlank: "Crear una plantilla en blanco",
    templateAsIs: "Guardar el documento tal cual",
    save: "Guardar",
    replace: "Reemplazar",
    cancel: "Cancelar",
    saving: "Guardando…",
    copyNotice: "Se guarda una copia en mis habilidades y la habilidad original se desactiva",
    saved: "Guardado",
    openSettings: "Ver en Configuración",
    unsaved: "Propuesta de habilidad sin guardar",
    blockTitle: "Escribe un título",
    blockDescription: "Escribe una descripción",
    blockBody: "Escribe las instrucciones",
    nameChecking: "Comprobando el nombre…",
    nameEmpty: "Escribe un nombre",
    nameTooLong: "El nombre puede tener hasta 64 caracteres",
    nameCharacters: "El nombre solo puede llevar letras inglesas minúsculas, números y guiones (-)",
    nameHyphenEdge: "El nombre no puede empezar ni terminar con un guion (-)",
    nameDoubleHyphen: "El nombre no puede llevar dos guiones seguidos (--)",
    nameReserved: "Este nombre no se puede usar",
    nameTaken: "Mis habilidades ya tienen una con este nombre",
    nameTakenReplace: "Mis habilidades ya tienen una con este nombre; al guardar se reemplaza",
    saveFailed: "No se pudo guardar",
    trashFailed: "No se pudo mover a la papelera la habilidad que reemplaza, así que no se guardó nada",
    noBridge: "En esta ventana no se pueden guardar habilidades",
    skillUsed: "Se usó la habilidad {title}",
    skillProposed: "Propuesta de habilidad: {title}"
  },
  th: {
    cardNewTitle: "สร้างสกิล",
    cardEditTitle: "แก้ไขสกิล",
    fieldTitle: "ชื่อเรื่อง",
    fieldDescription: "คำอธิบาย",
    fieldBody: "เนื้อหา",
    advanced: "ขั้นสูง",
    fieldName: "ชื่อ",
    nameHint: "ตัวพิมพ์เล็กภาษาอังกฤษ ตัวเลข และขีด (-) ไม่เกิน 64 ตัวอักษร",
    invokeLabel: "AI ใช้เมื่อใด",
    invokeAuto: "ใช้เอง",
    invokeManual: "เฉพาะเมื่อเรียก",
    templateCheck: "บันทึกเอกสารนี้เป็นแม่แบบด้วย",
    templateBlank: "สร้างแม่แบบเปล่า",
    templateAsIs: "บันทึกเอกสารตามเดิม",
    save: "บันทึก",
    replace: "แทนที่",
    cancel: "ยกเลิก",
    saving: "กำลังบันทึก…",
    copyNotice: "จะบันทึกสำเนาไว้ในสกิลของฉัน และปิดสกิลต้นฉบับ",
    saved: "บันทึกแล้ว",
    openSettings: "ดูในการตั้งค่า",
    unsaved: "ข้อเสนอสกิลที่ไม่ได้บันทึก",
    blockTitle: "กรุณาใส่ชื่อเรื่อง",
    blockDescription: "กรุณาใส่คำอธิบาย",
    blockBody: "กรุณาใส่เนื้อหา",
    nameChecking: "กำลังตรวจสอบชื่อ…",
    nameEmpty: "กรุณาใส่ชื่อ",
    nameTooLong: "ชื่อยาวได้ไม่เกิน 64 ตัวอักษร",
    nameCharacters: "ชื่อใช้ได้เฉพาะตัวพิมพ์เล็กภาษาอังกฤษ ตัวเลข และขีด (-)",
    nameHyphenEdge: "ชื่อขึ้นต้นหรือลงท้ายด้วยขีด (-) ไม่ได้",
    nameDoubleHyphen: "ชื่อมีขีดสองตัวติดกัน (--) ไม่ได้",
    nameReserved: "ใช้ชื่อนี้ไม่ได้",
    nameTaken: "สกิลของฉันมีชื่อนี้อยู่แล้ว",
    nameTakenReplace: "สกิลของฉันมีชื่อนี้อยู่แล้ว การบันทึกจะแทนที่สกิลนั้น",
    saveFailed: "บันทึกไม่ได้",
    trashFailed: "ย้ายสกิลที่จะถูกแทนที่ไปถังขยะไม่ได้ จึงไม่ได้บันทึกอะไร",
    noBridge: "บันทึกสกิลในหน้าต่างนี้ไม่ได้",
    skillUsed: "ใช้สกิล {title} แล้ว",
    skillProposed: "ข้อเสนอสกิล: {title}"
  },
  id: {
    cardNewTitle: "Skill baru",
    cardEditTitle: "Ubah skill",
    fieldTitle: "Judul",
    fieldDescription: "Deskripsi",
    fieldBody: "Instruksi",
    advanced: "Lanjutan",
    fieldName: "Nama",
    nameHint: "Huruf kecil Inggris, angka, dan tanda hubung (-), paling banyak 64 karakter",
    invokeLabel: "Kapan AI memakainya",
    invokeAuto: "Sendiri",
    invokeManual: "Hanya saat dipanggil",
    templateCheck: "Simpan juga dokumen ini sebagai templat",
    templateBlank: "Buat templat kosong",
    templateAsIs: "Simpan dokumen apa adanya",
    save: "Simpan",
    replace: "Ganti",
    cancel: "Batal",
    saving: "Menyimpan…",
    copyNotice: "Salinan disimpan ke skill saya, dan skill aslinya dimatikan",
    saved: "Tersimpan",
    openSettings: "Lihat di Pengaturan",
    unsaved: "Usulan skill yang tidak disimpan",
    blockTitle: "Isi judul",
    blockDescription: "Isi deskripsi",
    blockBody: "Isi instruksi",
    nameChecking: "Memeriksa nama…",
    nameEmpty: "Isi nama",
    nameTooLong: "Nama paling banyak 64 karakter",
    nameCharacters: "Nama hanya boleh berisi huruf kecil Inggris, angka, dan tanda hubung (-)",
    nameHyphenEdge: "Nama tidak boleh diawali atau diakhiri tanda hubung (-)",
    nameDoubleHyphen: "Nama tidak boleh berisi dua tanda hubung berurutan (--)",
    nameReserved: "Nama ini tidak dapat dipakai",
    nameTaken: "Skill saya sudah punya nama ini",
    nameTakenReplace: "Skill saya sudah punya nama ini; menyimpan akan menggantinya",
    saveFailed: "Tidak dapat menyimpan",
    trashFailed: "Skill yang digantikan tidak dapat dipindahkan ke tempat sampah, jadi tidak ada yang disimpan",
    noBridge: "Skill tidak dapat disimpan di jendela ini",
    skillUsed: "Memakai skill {title}",
    skillProposed: "Usulan skill: {title}"
  },
  ru: {
    cardNewTitle: "Новый навык",
    cardEditTitle: "Изменить навык",
    fieldTitle: "Заголовок",
    fieldDescription: "Описание",
    fieldBody: "Инструкции",
    advanced: "Дополнительно",
    fieldName: "Имя",
    nameHint: "Строчные английские буквы, цифры и дефисы (-), не больше 64 символов",
    invokeLabel: "Когда ИИ его использует",
    invokeAuto: "Сам",
    invokeManual: "Только по вызову",
    templateCheck: "Сохранить этот документ как шаблон",
    templateBlank: "Сделать пустой шаблон",
    templateAsIs: "Сохранить документ как есть",
    save: "Сохранить",
    replace: "Заменить",
    cancel: "Отмена",
    saving: "Сохранение…",
    copyNotice: "Копия сохраняется в мои навыки, а исходный навык выключается",
    saved: "Сохранено",
    openSettings: "Открыть в настройках",
    unsaved: "Несохранённое предложение навыка",
    blockTitle: "Введите заголовок",
    blockDescription: "Введите описание",
    blockBody: "Введите инструкции",
    nameChecking: "Проверка имени…",
    nameEmpty: "Введите имя",
    nameTooLong: "Имя — не больше 64 символов",
    nameCharacters: "В имени можно использовать только строчные английские буквы, цифры и дефисы (-)",
    nameHyphenEdge: "Имя не может начинаться или заканчиваться дефисом (-)",
    nameDoubleHyphen: "В имени не может быть двух дефисов подряд (--)",
    nameReserved: "Это имя нельзя использовать",
    nameTaken: "В моих навыках уже есть навык с таким именем",
    nameTakenReplace: "В моих навыках уже есть навык с таким именем; сохранение заменит его",
    saveFailed: "Не удалось сохранить",
    trashFailed: "Не удалось переместить заменяемый навык в корзину, поэтому ничего не сохранено",
    noBridge: "В этом окне нельзя сохранять навыки",
    skillUsed: "Использован навык {title}",
    skillProposed: "Предложение навыка: {title}"
  },
  ar: {
    cardNewTitle: "مهارة جديدة",
    cardEditTitle: "تعديل المهارة",
    fieldTitle: "العنوان",
    fieldDescription: "الوصف",
    fieldBody: "التعليمات",
    advanced: "متقدم",
    fieldName: "الاسم",
    nameHint: "أحرف إنجليزية صغيرة وأرقام وشرطات (-)، حتى 64 حرفًا",
    invokeLabel: "متى يستخدمها الذكاء الاصطناعي",
    invokeAuto: "من تلقاء نفسه",
    invokeManual: "عند الاستدعاء فقط",
    templateCheck: "حفظ هذا المستند معها كقالب",
    templateBlank: "إنشاء قالب فارغ",
    templateAsIs: "حفظ المستند كما هو",
    save: "حفظ",
    replace: "استبدال",
    cancel: "إلغاء",
    saving: "جارٍ الحفظ…",
    copyNotice: "تُحفظ نسخة في مهاراتي، وتُوقف المهارة الأصلية",
    saved: "تم الحفظ",
    openSettings: "عرض في الإعدادات",
    unsaved: "اقتراح مهارة غير محفوظ",
    blockTitle: "أدخل عنوانًا",
    blockDescription: "أدخل وصفًا",
    blockBody: "أدخل التعليمات",
    nameChecking: "جارٍ التحقق من الاسم…",
    nameEmpty: "أدخل اسمًا",
    nameTooLong: "يصل الاسم إلى 64 حرفًا",
    nameCharacters: "لا يقبل الاسم إلا الأحرف الإنجليزية الصغيرة والأرقام والشرطات (-)",
    nameHyphenEdge: "لا يمكن أن يبدأ الاسم أو ينتهي بشرطة (-)",
    nameDoubleHyphen: "لا يمكن أن يحتوي الاسم على شرطتين متتاليتين (--)",
    nameReserved: "لا يمكن استخدام هذا الاسم",
    nameTaken: "توجد في مهاراتي مهارة بهذا الاسم",
    nameTakenReplace: "توجد في مهاراتي مهارة بهذا الاسم؛ الحفظ يستبدلها",
    saveFailed: "تعذّر الحفظ",
    trashFailed: "تعذّر نقل المهارة التي تحل محلها إلى سلة المهملات، فلم يُحفظ شيء",
    noBridge: "لا يمكن حفظ المهارات في هذه النافذة",
    skillUsed: "تم استخدام مهارة {title}",
    skillProposed: "اقتراح مهارة: {title}"
  },
  pt: {
    cardNewTitle: "Nova habilidade",
    cardEditTitle: "Alterar habilidade",
    fieldTitle: "Título",
    fieldDescription: "Descrição",
    fieldBody: "Instruções",
    advanced: "Avançado",
    fieldName: "Nome",
    nameHint: "Letras inglesas minúsculas, números e hífens (-), até 64 caracteres",
    invokeLabel: "Quando a IA a usa",
    invokeAuto: "Por conta própria",
    invokeManual: "Só quando chamada",
    templateCheck: "Salvar também este documento como modelo",
    templateBlank: "Criar um modelo em branco",
    templateAsIs: "Salvar o documento como está",
    save: "Salvar",
    replace: "Substituir",
    cancel: "Cancelar",
    saving: "Salvando…",
    copyNotice: "Uma cópia é salva nas minhas habilidades e a habilidade original é desativada",
    saved: "Salvo",
    openSettings: "Ver nas Configurações",
    unsaved: "Proposta de habilidade não salva",
    blockTitle: "Digite um título",
    blockDescription: "Digite uma descrição",
    blockBody: "Digite as instruções",
    nameChecking: "Verificando o nome…",
    nameEmpty: "Digite um nome",
    nameTooLong: "O nome pode ter até 64 caracteres",
    nameCharacters: "O nome só pode ter letras inglesas minúsculas, números e hífens (-)",
    nameHyphenEdge: "O nome não pode começar nem terminar com hífen (-)",
    nameDoubleHyphen: "O nome não pode ter dois hífens seguidos (--)",
    nameReserved: "Este nome não pode ser usado",
    nameTaken: "Minhas habilidades já têm uma com este nome",
    nameTakenReplace: "Minhas habilidades já têm uma com este nome; salvar a substitui",
    saveFailed: "Não foi possível salvar",
    trashFailed: "Não foi possível mover para a lixeira a habilidade que ela substitui, então nada foi salvo",
    noBridge: "Não é possível salvar habilidades nesta janela",
    skillUsed: "Habilidade {title} usada",
    skillProposed: "Proposta de habilidade: {title}"
  },
  it: {
    cardNewTitle: "Nuova abilità",
    cardEditTitle: "Modifica abilità",
    fieldTitle: "Titolo",
    fieldDescription: "Descrizione",
    fieldBody: "Istruzioni",
    advanced: "Avanzate",
    fieldName: "Nome",
    nameHint: "Lettere inglesi minuscole, cifre e trattini (-), fino a 64 caratteri",
    invokeLabel: "Quando l’IA la usa",
    invokeAuto: "Da sola",
    invokeManual: "Solo quando richiamata",
    templateCheck: "Salva anche questo documento come modello",
    templateBlank: "Crea un modello vuoto",
    templateAsIs: "Salva il documento così com’è",
    save: "Salva",
    replace: "Sostituisci",
    cancel: "Annulla",
    saving: "Salvataggio…",
    copyNotice: "Una copia viene salvata nelle mie abilità e l’abilità originale viene disattivata",
    saved: "Salvato",
    openSettings: "Vedi nelle Impostazioni",
    unsaved: "Proposta di abilità non salvata",
    blockTitle: "Inserisci un titolo",
    blockDescription: "Inserisci una descrizione",
    blockBody: "Inserisci le istruzioni",
    nameChecking: "Controllo del nome…",
    nameEmpty: "Inserisci un nome",
    nameTooLong: "Il nome può avere fino a 64 caratteri",
    nameCharacters: "Il nome può contenere solo lettere inglesi minuscole, cifre e trattini (-)",
    nameHyphenEdge: "Il nome non può iniziare né finire con un trattino (-)",
    nameDoubleHyphen: "Il nome non può avere due trattini di seguito (--)",
    nameReserved: "Questo nome non si può usare",
    nameTaken: "Le mie abilità ne hanno già una con questo nome",
    nameTakenReplace: "Le mie abilità ne hanno già una con questo nome; salvando la sostituisci",
    saveFailed: "Impossibile salvare",
    trashFailed: "Non è stato possibile spostare nel cestino l’abilità che sostituisce, quindi non è stato salvato nulla",
    noBridge: "In questa finestra non si possono salvare abilità",
    skillUsed: "Abilità {title} usata",
    skillProposed: "Proposta di abilità: {title}"
  },
  pl: {
    cardNewTitle: "Nowa umiejętność",
    cardEditTitle: "Zmień umiejętność",
    fieldTitle: "Tytuł",
    fieldDescription: "Opis",
    fieldBody: "Instrukcje",
    advanced: "Zaawansowane",
    fieldName: "Nazwa",
    nameHint: "Małe litery angielskie, cyfry i łączniki (-), do 64 znaków",
    invokeLabel: "Kiedy AI jej używa",
    invokeAuto: "Samodzielnie",
    invokeManual: "Tylko po wywołaniu",
    templateCheck: "Zapisz też ten dokument jako szablon",
    templateBlank: "Utwórz pusty szablon",
    templateAsIs: "Zapisz dokument bez zmian",
    save: "Zapisz",
    replace: "Zastąp",
    cancel: "Anuluj",
    saving: "Zapisywanie…",
    copyNotice: "Kopia zostanie zapisana w moich umiejętnościach, a oryginał wyłączony",
    saved: "Zapisano",
    openSettings: "Zobacz w ustawieniach",
    unsaved: "Niezapisana propozycja umiejętności",
    blockTitle: "Wpisz tytuł",
    blockDescription: "Wpisz opis",
    blockBody: "Wpisz instrukcje",
    nameChecking: "Sprawdzanie nazwy…",
    nameEmpty: "Wpisz nazwę",
    nameTooLong: "Nazwa może mieć do 64 znaków",
    nameCharacters: "Nazwa może zawierać tylko małe litery angielskie, cyfry i łączniki (-)",
    nameHyphenEdge: "Nazwa nie może zaczynać się ani kończyć łącznikiem (-)",
    nameDoubleHyphen: "Nazwa nie może mieć dwóch łączników z rzędu (--)",
    nameReserved: "Tej nazwy nie można użyć",
    nameTaken: "Moje umiejętności mają już taką nazwę",
    nameTakenReplace: "Moje umiejętności mają już taką nazwę; zapisanie ją zastąpi",
    saveFailed: "Nie udało się zapisać",
    trashFailed: "Nie udało się przenieść zastępowanej umiejętności do kosza, więc nic nie zapisano",
    noBridge: "W tym oknie nie można zapisywać umiejętności",
    skillUsed: "Użyto umiejętności {title}",
    skillProposed: "Propozycja umiejętności: {title}"
  },
  cs: {
    cardNewTitle: "Nová dovednost",
    cardEditTitle: "Změnit dovednost",
    fieldTitle: "Název",
    fieldDescription: "Popis",
    fieldBody: "Pokyny",
    advanced: "Upřesnit",
    fieldName: "Jméno",
    nameHint: "Malá anglická písmena, číslice a spojovníky (-), nejvýše 64 znaků",
    invokeLabel: "Kdy ji AI použije",
    invokeAuto: "Sama",
    invokeManual: "Jen na vyvolání",
    templateCheck: "Uložit i tento dokument jako šablonu",
    templateBlank: "Vytvořit prázdnou šablonu",
    templateAsIs: "Uložit dokument tak, jak je",
    save: "Uložit",
    replace: "Nahradit",
    cancel: "Zrušit",
    saving: "Ukládání…",
    copyNotice: "Kopie se uloží do mých dovedností a původní dovednost se vypne",
    saved: "Uloženo",
    openSettings: "Zobrazit v nastavení",
    unsaved: "Neuložený návrh dovednosti",
    blockTitle: "Zadejte název",
    blockDescription: "Zadejte popis",
    blockBody: "Zadejte pokyny",
    nameChecking: "Kontrola jména…",
    nameEmpty: "Zadejte jméno",
    nameTooLong: "Jméno může mít nejvýše 64 znaků",
    nameCharacters: "Jméno smí obsahovat jen malá anglická písmena, číslice a spojovníky (-)",
    nameHyphenEdge: "Jméno nesmí začínat ani končit spojovníkem (-)",
    nameDoubleHyphen: "Jméno nesmí obsahovat dva spojovníky za sebou (--)",
    nameReserved: "Toto jméno nelze použít",
    nameTaken: "Mezi mými dovednostmi už je jedna s tímto jménem",
    nameTakenReplace: "Mezi mými dovednostmi už je jedna s tímto jménem; uložení ji nahradí",
    saveFailed: "Uložení se nezdařilo",
    trashFailed: "Dovednost, kterou nahrazuje, nebylo možné přesunout do koše, proto se nic neuložilo",
    noBridge: "V tomto okně nelze dovednosti ukládat",
    skillUsed: "Použita dovednost {title}",
    skillProposed: "Návrh dovednosti: {title}"
  },
  nl: {
    cardNewTitle: "Nieuwe vaardigheid",
    cardEditTitle: "Vaardigheid wijzigen",
    fieldTitle: "Titel",
    fieldDescription: "Beschrijving",
    fieldBody: "Instructies",
    advanced: "Geavanceerd",
    fieldName: "Naam",
    nameHint: "Kleine Engelse letters, cijfers en koppeltekens (-), hoogstens 64 tekens",
    invokeLabel: "Wanneer de AI hem gebruikt",
    invokeAuto: "Uit zichzelf",
    invokeManual: "Alleen bij aanroepen",
    templateCheck: "Dit document ook als sjabloon opslaan",
    templateBlank: "Leeg sjabloon maken",
    templateAsIs: "Document opslaan zoals het is",
    save: "Opslaan",
    replace: "Vervangen",
    cancel: "Annuleren",
    saving: "Opslaan…",
    copyNotice: "Er wordt een kopie in mijn vaardigheden opgeslagen en de oorspronkelijke gaat uit",
    saved: "Opgeslagen",
    openSettings: "Bekijken in Instellingen",
    unsaved: "Niet-opgeslagen voorstel voor een vaardigheid",
    blockTitle: "Vul een titel in",
    blockDescription: "Vul een beschrijving in",
    blockBody: "Vul de instructies in",
    nameChecking: "Naam controleren…",
    nameEmpty: "Vul een naam in",
    nameTooLong: "De naam mag hoogstens 64 tekens hebben",
    nameCharacters: "De naam mag alleen kleine Engelse letters, cijfers en koppeltekens (-) bevatten",
    nameHyphenEdge: "De naam mag niet met een koppelteken (-) beginnen of eindigen",
    nameDoubleHyphen: "De naam mag geen twee koppeltekens achter elkaar (--) bevatten",
    nameReserved: "Deze naam kan niet worden gebruikt",
    nameTaken: "Mijn vaardigheden hebben er al een met deze naam",
    nameTakenReplace: "Mijn vaardigheden hebben er al een met deze naam; opslaan vervangt die",
    saveFailed: "Opslaan is mislukt",
    trashFailed: "De vaardigheid die wordt vervangen kon niet naar de prullenbak, dus er is niets opgeslagen",
    noBridge: "In dit venster kunnen geen vaardigheden worden opgeslagen",
    skillUsed: "Vaardigheid {title} gebruikt",
    skillProposed: "Voorstel voor vaardigheid: {title}"
  },
  ms: {
    cardNewTitle: "Kemahiran baharu",
    cardEditTitle: "Ubah kemahiran",
    fieldTitle: "Tajuk",
    fieldDescription: "Keterangan",
    fieldBody: "Arahan",
    advanced: "Lanjutan",
    fieldName: "Nama",
    nameHint: "Huruf kecil Inggeris, digit dan sengkang (-), hingga 64 aksara",
    invokeLabel: "Bila AI menggunakannya",
    invokeAuto: "Sendiri",
    invokeManual: "Hanya apabila dipanggil",
    templateCheck: "Simpan juga dokumen ini sebagai templat",
    templateBlank: "Buat templat kosong",
    templateAsIs: "Simpan dokumen seadanya",
    save: "Simpan",
    replace: "Ganti",
    cancel: "Batal",
    saving: "Menyimpan…",
    copyNotice: "Salinan disimpan dalam kemahiran saya, dan kemahiran asal dimatikan",
    saved: "Disimpan",
    openSettings: "Lihat dalam Tetapan",
    unsaved: "Cadangan kemahiran yang tidak disimpan",
    blockTitle: "Masukkan tajuk",
    blockDescription: "Masukkan keterangan",
    blockBody: "Masukkan arahan",
    nameChecking: "Menyemak nama…",
    nameEmpty: "Masukkan nama",
    nameTooLong: "Nama boleh mempunyai hingga 64 aksara",
    nameCharacters: "Nama hanya boleh menggunakan huruf kecil Inggeris, digit dan sengkang (-)",
    nameHyphenEdge: "Nama tidak boleh bermula atau berakhir dengan sengkang (-)",
    nameDoubleHyphen: "Nama tidak boleh mempunyai dua sengkang berturut-turut (--)",
    nameReserved: "Nama ini tidak boleh digunakan",
    nameTaken: "Kemahiran saya sudah ada nama ini",
    nameTakenReplace: "Kemahiran saya sudah ada nama ini; menyimpan akan menggantikannya",
    saveFailed: "Tidak dapat menyimpan",
    trashFailed: "Kemahiran yang diganti tidak dapat dialihkan ke tong sampah, jadi tiada apa-apa disimpan",
    noBridge: "Kemahiran tidak boleh disimpan dalam tetingkap ini",
    skillUsed: "Menggunakan kemahiran {title}",
    skillProposed: "Cadangan kemahiran: {title}"
  },
  he: {
    cardNewTitle: "מיומנות חדשה",
    cardEditTitle: "שינוי מיומנות",
    fieldTitle: "כותרת",
    fieldDescription: "תיאור",
    fieldBody: "הוראות",
    advanced: "מתקדם",
    fieldName: "שם",
    nameHint: "אותיות אנגליות קטנות, ספרות ומקפים (-), עד 64 תווים",
    invokeLabel: "מתי הבינה המלאכותית משתמשת בה",
    invokeAuto: "מעצמה",
    invokeManual: "רק כשקוראים לה",
    templateCheck: "לשמור גם את המסמך הזה כתבנית",
    templateBlank: "יצירת תבנית ריקה",
    templateAsIs: "שמירת המסמך כמו שהוא",
    save: "שמירה",
    replace: "החלפה",
    cancel: "ביטול",
    saving: "שומר…",
    copyNotice: "עותק נשמר במיומנויות שלי, והמיומנות המקורית מושבתת",
    saved: "נשמר",
    openSettings: "הצגה בהגדרות",
    unsaved: "הצעת מיומנות שלא נשמרה",
    blockTitle: "יש להזין כותרת",
    blockDescription: "יש להזין תיאור",
    blockBody: "יש להזין הוראות",
    nameChecking: "בודק את השם…",
    nameEmpty: "יש להזין שם",
    nameTooLong: "השם יכול להכיל עד 64 תווים",
    nameCharacters: "השם יכול להכיל רק אותיות אנגליות קטנות, ספרות ומקפים (-)",
    nameHyphenEdge: "השם לא יכול להתחיל או להסתיים במקף (-)",
    nameDoubleHyphen: "השם לא יכול להכיל שני מקפים ברצף (--)",
    nameReserved: "אי אפשר להשתמש בשם הזה",
    nameTaken: "במיומנויות שלי כבר יש מיומנות בשם הזה",
    nameTakenReplace: "במיומנויות שלי כבר יש מיומנות בשם הזה; השמירה תחליף אותה",
    saveFailed: "השמירה נכשלה",
    trashFailed: "לא ניתן היה להעביר לאשפה את המיומנות שהיא מחליפה, ולכן שום דבר לא נשמר",
    noBridge: "אי אפשר לשמור מיומנויות בחלון הזה",
    skillUsed: "נעשה שימוש במיומנות {title}",
    skillProposed: "הצעת מיומנות: {title}"
  },
  hi: {
    cardNewTitle: "नया कौशल",
    cardEditTitle: "कौशल बदलें",
    fieldTitle: "शीर्षक",
    fieldDescription: "विवरण",
    fieldBody: "निर्देश",
    advanced: "उन्नत",
    fieldName: "नाम",
    nameHint: "छोटे अंग्रेज़ी अक्षर, अंक और हाइफ़न (-), अधिकतम 64 वर्ण",
    invokeLabel: "AI इसे कब इस्तेमाल करे",
    invokeAuto: "अपने आप",
    invokeManual: "केवल बुलाने पर",
    templateCheck: "इस दस्तावेज़ को टेम्पलेट के रूप में साथ सहेजें",
    templateBlank: "खाली टेम्पलेट बनाएँ",
    templateAsIs: "दस्तावेज़ को जैसा है वैसा सहेजें",
    save: "सहेजें",
    replace: "बदलें",
    cancel: "रद्द करें",
    saving: "सहेजा जा रहा है…",
    copyNotice: "मेरे कौशल में एक कॉपी सहेजी जाती है और मूल कौशल बंद हो जाता है",
    saved: "सहेजा गया",
    openSettings: "सेटिंग्स में देखें",
    unsaved: "बिना सहेजा कौशल प्रस्ताव",
    blockTitle: "शीर्षक लिखें",
    blockDescription: "विवरण लिखें",
    blockBody: "निर्देश लिखें",
    nameChecking: "नाम जाँचा जा रहा है…",
    nameEmpty: "नाम लिखें",
    nameTooLong: "नाम अधिकतम 64 वर्ण का हो सकता है",
    nameCharacters: "नाम में केवल छोटे अंग्रेज़ी अक्षर, अंक और हाइफ़न (-) हो सकते हैं",
    nameHyphenEdge: "नाम हाइफ़न (-) से शुरू या खत्म नहीं हो सकता",
    nameDoubleHyphen: "नाम में लगातार दो हाइफ़न (--) नहीं हो सकते",
    nameReserved: "यह नाम इस्तेमाल नहीं किया जा सकता",
    nameTaken: "मेरे कौशल में इस नाम का कौशल पहले से है",
    nameTakenReplace: "मेरे कौशल में इस नाम का कौशल पहले से है; सहेजने पर वह बदल जाएगा",
    saveFailed: "सहेजा नहीं जा सका",
    trashFailed: "जिस कौशल की जगह यह आता है उसे ट्रैश में नहीं ले जाया जा सका, इसलिए कुछ भी सहेजा नहीं गया",
    noBridge: "इस विंडो में कौशल सहेजा नहीं जा सकता",
    skillUsed: "{title} कौशल इस्तेमाल किया",
    skillProposed: "कौशल प्रस्ताव: {title}"
  },
  "zh-TW": {
    cardNewTitle: "建立技能",
    cardEditTitle: "修改技能",
    fieldTitle: "標題",
    fieldDescription: "說明",
    fieldBody: "內文",
    advanced: "進階",
    fieldName: "名稱",
    nameHint: "英文小寫字母、數字和連字號(-)，最多 64 個字元",
    invokeLabel: "AI 何時使用",
    invokeAuto: "自動使用",
    invokeManual: "僅在呼叫時",
    templateCheck: "將此文件作為範本一起儲存",
    templateBlank: "製作空白範本",
    templateAsIs: "依原文件儲存",
    save: "儲存",
    replace: "取代",
    cancel: "取消",
    saving: "正在儲存…",
    copyNotice: "將以副本形式儲存到我的技能，並關閉原技能",
    saved: "已儲存",
    openSettings: "在設定中檢視",
    unsaved: "未儲存的技能建議",
    blockTitle: "請填寫標題",
    blockDescription: "請填寫說明",
    blockBody: "請填寫內文",
    nameChecking: "正在檢查名稱…",
    nameEmpty: "請填寫名稱",
    nameTooLong: "名稱最多 64 個字元",
    nameCharacters: "名稱只能使用英文小寫字母、數字和連字號(-)",
    nameHyphenEdge: "名稱不能以連字號(-)開頭或結尾",
    nameDoubleHyphen: "名稱中不能連續使用兩個連字號(--)",
    nameReserved: "不能使用此名稱",
    nameTaken: "我的技能中已有同名技能",
    nameTakenReplace: "我的技能中已有同名技能，儲存後將取代它",
    saveFailed: "無法儲存",
    trashFailed: "無法將要取代的技能移到資源回收筒，因此沒有儲存任何內容",
    noBridge: "此視窗無法儲存技能",
    skillUsed: "已使用技能 {title}",
    skillProposed: "技能建議：{title}"
  },
  vi: {
    cardNewTitle: "Kỹ năng mới",
    cardEditTitle: "Sửa kỹ năng",
    fieldTitle: "Tiêu đề",
    fieldDescription: "Mô tả",
    fieldBody: "Hướng dẫn",
    advanced: "Nâng cao",
    fieldName: "Tên",
    nameHint: "Chữ thường tiếng Anh, chữ số và dấu gạch ngang (-), tối đa 64 ký tự",
    invokeLabel: "Khi nào AI dùng",
    invokeAuto: "Tự dùng",
    invokeManual: "Chỉ khi được gọi",
    templateCheck: "Lưu kèm tài liệu này làm mẫu",
    templateBlank: "Tạo mẫu trống",
    templateAsIs: "Lưu tài liệu như hiện tại",
    save: "Lưu",
    replace: "Thay thế",
    cancel: "Hủy",
    saving: "Đang lưu…",
    copyNotice: "Một bản sao được lưu vào kỹ năng của tôi và kỹ năng gốc sẽ bị tắt",
    saved: "Đã lưu",
    openSettings: "Xem trong Cài đặt",
    unsaved: "Đề xuất kỹ năng chưa lưu",
    blockTitle: "Hãy nhập tiêu đề",
    blockDescription: "Hãy nhập mô tả",
    blockBody: "Hãy nhập hướng dẫn",
    nameChecking: "Đang kiểm tra tên…",
    nameEmpty: "Hãy nhập tên",
    nameTooLong: "Tên dài tối đa 64 ký tự",
    nameCharacters: "Tên chỉ được dùng chữ thường tiếng Anh, chữ số và dấu gạch ngang (-)",
    nameHyphenEdge: "Tên không được bắt đầu hoặc kết thúc bằng dấu gạch ngang (-)",
    nameDoubleHyphen: "Tên không được có hai dấu gạch ngang liền nhau (--)",
    nameReserved: "Không thể dùng tên này",
    nameTaken: "Kỹ năng của tôi đã có tên này",
    nameTakenReplace: "Kỹ năng của tôi đã có tên này; khi lưu sẽ thay thế kỹ năng đó",
    saveFailed: "Không lưu được",
    trashFailed: "Không thể chuyển kỹ năng bị thay thế vào thùng rác nên chưa lưu gì",
    noBridge: "Không thể lưu kỹ năng trong cửa sổ này",
    skillUsed: "Đã dùng kỹ năng {title}",
    skillProposed: "Đề xuất kỹ năng: {title}"
  }
});
const skillCardText = createI18n(SKILL_CARD_STRINGS);
const NAME_CHECK_DELAY_MS = 250;
function SkillProposalCard({
  lang,
  proposal,
  bridge,
  canBeTemplate = false,
  renderTemplateActions,
  initialDraft,
  onSaved,
  onCancel
}) {
  const t = (key, params) => skillCardText(lang, key, params);
  const ids = reactExports.useId();
  const mode = skillCardMode(proposal);
  const [draft, setDraft] = reactExports.useState(() => ({
    ...initialSkillCardDraft(proposal),
    ...initialDraft
  }));
  const [nameState, setNameState] = reactExports.useState("checking");
  const [advanced, setAdvanced] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const [failure, setFailure] = reactExports.useState(null);
  const liveRef = reactExports.useRef(true);
  reactExports.useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
    };
  }, []);
  reactExports.useEffect(() => {
    if (draft.name || !bridge) return;
    void bridge.suggestName(draft.title).then((name) => {
      if (liveRef.current && typeof name === "string" && name) {
        setDraft((d) => d.name ? d : { ...d, name });
      }
    }).catch(() => void 0);
  }, []);
  const checkSeqRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    const seq = ++checkSeqRef.current;
    const name = draft.name.trim();
    if (!bridge || !name) {
      setNameState(name ? "checking" : { ok: false, problem: "empty" });
      return;
    }
    setNameState("checking");
    const timer = setTimeout(() => {
      const forId = mode === "edit-own" ? proposal.target?.id : void 0;
      void bridge.checkName(name, forId).then(
        (raw) => skillNameCheckOf(raw),
        () => skillNameCheckOf(null)
      ).then((check) => {
        if (liveRef.current && seq === checkSeqRef.current) setNameState(check);
      });
    }, NAME_CHECK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [draft.name, bridge, mode, proposal.target?.id]);
  const verdict = skillCardNameVerdict(mode, proposal, draft.name, nameState);
  const blockKey = bridge ? skillCardSaveBlock(draft, verdict.blocked) : "noBridge";
  const blocked = blockKey ? t(blockKey) : null;
  const nameProblem = verdict.blocked && verdict.blocked !== "nameChecking";
  reactExports.useEffect(() => {
    if (nameProblem) setAdvanced(true);
  }, [nameProblem]);
  const save = async (template) => {
    if (!bridge || busy || blockKey) return false;
    setBusy(true);
    setFailure(null);
    try {
      const input = skillCardSaveInput(draft, proposal, { overwrite: verdict.overwrite, template });
      const result = skillCardSaveResultOf(await bridge.saveFromCard(input).catch(() => null));
      if (!liveRef.current) return result.ok;
      if (result.ok) {
        onSaved(result.id, draft);
        return true;
      }
      setFailure(skillCardSaveFailureKey(result.reason, result.problem));
      if (result.reason === "bad-name" || result.reason === "name-taken") setAdvanced(true);
      return false;
    } finally {
      if (liveRef.current) setBusy(false);
    }
  };
  const set = (patch) => {
    setFailure(null);
    setDraft((d) => ({ ...d, ...patch }));
  };
  const showTemplate = canBeTemplate;
  const templateChecked = showTemplate && draft.withTemplate;
  const templateContext = {
    lang,
    proposal,
    draft,
    blocked,
    busy,
    save
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: "ai-skill-card",
      "aria-labelledby": `${ids}-head`,
      "data-skill-card-mode": mode,
      dir: "auto",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-skill-card-head", id: `${ids}-head`, children: [
          t(mode === "new" ? "cardNewTitle" : "cardEditTitle"),
          proposal.target && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ai-skill-card-target", children: proposal.target.title })
        ] }),
        mode === "copy" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "ai-skill-card-note", children: t("copyNotice") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "ai-skill-card-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("fieldTitle") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: draft.title,
              disabled: busy,
              onChange: (e) => set({ title: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "ai-skill-card-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("fieldDescription") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              rows: 2,
              value: draft.description,
              disabled: busy,
              onChange: (e) => set({ description: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "ai-skill-card-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("fieldBody") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              className: "ai-skill-card-body",
              rows: 8,
              value: draft.body,
              disabled: busy,
              onChange: (e) => set({ body: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "ai-skill-card-invoke", disabled: busy, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { children: t("invokeLabel") }),
          ["auto", "manual"].map((invoke) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "radio",
                name: `${ids}-invoke`,
                value: invoke,
                checked: draft.invoke === invoke,
                onChange: () => set({ invoke })
              }
            ),
            t(invoke === "auto" ? "invokeAuto" : "invokeManual")
          ] }, invoke))
        ] }),
        showTemplate && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "ai-skill-card-check", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: draft.withTemplate,
              disabled: busy,
              onChange: (e) => set({ withTemplate: e.target.checked })
            }
          ),
          t("templateCheck")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "details",
          {
            className: "ai-skill-card-advanced",
            open: advanced,
            onToggle: (e) => setAdvanced(e.currentTarget.open),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: t("advanced") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "ai-skill-card-field", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("fieldName") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: draft.name,
                    disabled: busy,
                    spellCheck: false,
                    dir: "ltr",
                    "aria-invalid": nameProblem ? true : void 0,
                    onChange: (e) => set({ name: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "ai-skill-card-hint", children: t("nameHint") })
            ]
          }
        ),
        verdict.notice && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "ai-skill-card-note", children: t(verdict.notice) }),
        (failure || blocked && blockKey !== "nameChecking") && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "ai-skill-card-note is-error", role: "alert", children: failure ? t(failure) : blocked }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-skill-card-actions", children: [
          templateChecked ? renderTemplateActions ? renderTemplateActions(templateContext) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ai-skill-card-btn primary", disabled: true, children: t("templateBlank") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ai-skill-card-btn", disabled: true, children: t("templateAsIs") })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "ai-skill-card-btn primary",
              disabled: busy || !!blockKey,
              title: blocked ?? void 0,
              onClick: () => void save(),
              children: busy ? t("saving") : t(mode === "edit-own" ? "replace" : "save")
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ai-skill-card-btn", disabled: busy, onClick: onCancel, children: t("cancel") })
        ] })
      ]
    }
  );
}
function SkillCardLine({
  lang,
  status,
  title,
  onOpenSettings
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `ai-skill-card-line is-${status}`, "data-skill-card-status": status, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ai-skill-card-line-text", dir: "auto", children: [
      skillCardText(lang, status === "saved" ? "saved" : "unsaved"),
      title ? ` · ${title}` : ""
    ] }),
    status === "saved" && onOpenSettings && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      " · ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ai-skill-card-link", onClick: onOpenSettings, children: skillCardText(lang, "openSettings") })
    ] })
  ] });
}
const zh$3 = {
  takenOver: "将在新标签页中使用模板工作",
  goToTab: "转到标签页",
  firstTemplateOnly: "使用 {title} 的模板",
  templateMissing: "{title} 技能的模板文件不存在",
  openWithTemplate: "用此模板新建文档",
  openFailed: "无法在新标签页中打开模板",
  previewTabTitle: "模板预览 - {title}",
  previewContinues: "在模板预览标签页中继续",
  saveThisTab: "将此标签页保存为模板",
  asIsRedacted: "文档中有隐藏的内容，无法按原文档保存",
  clearRequest: "请把这份文档做成可以反复使用的模板。清空已填写的值（姓名、日期、个人信息、只用于这一次的内容），保留模板的样子（标题、表格、项目和格式）。",
  handoffNotSent: "无法读取转交的技能，请求未发送",
  documentUnreadable: "无法读取当前文档",
  untitled: "无标题"
};
const SKILL_TEMPLATE_STRINGS = defineStrings({
  zh: zh$3,
  en: {
    takenOver: "Working with the template in a new tab",
    goToTab: "Go to the tab",
    firstTemplateOnly: "Using the template of {title}",
    templateMissing: "The template file of the {title} skill is missing",
    openWithTemplate: "Open a new document from this template",
    openFailed: "The template could not be opened in a new tab",
    previewTabTitle: "Template preview - {title}",
    previewContinues: "Continues in the template preview tab",
    saveThisTab: "Save this tab as the template",
    asIsRedacted: "The document has hidden (redacted) parts, so it cannot be saved as it is",
    clearRequest: "Turn this document into a reusable template. Clear the filled-in values (names, dates, personal information, content used only this once) and keep the form itself (headings, tables, items and formatting) as it is.",
    handoffNotSent: "A handed-over skill could not be read, so the request was not sent",
    documentUnreadable: "The current document could not be read",
    untitled: "Untitled"
  },
  ja: {
    takenOver: "新しいタブでテンプレートを使って作業します",
    goToTab: "タブへ移動",
    firstTemplateOnly: "テンプレートは {title} のものを使います",
    templateMissing: "{title} スキルのテンプレートファイルがありません",
    openWithTemplate: "このテンプレートで新しい文書を開く",
    openFailed: "テンプレートを新しいタブで開けませんでした",
    previewTabTitle: "テンプレートのプレビュー - {title}",
    previewContinues: "テンプレートのプレビュータブで続けます",
    saveThisTab: "このタブをテンプレートとして保存",
    asIsRedacted: "文書に隠した内容があるため、元の文書のまま保存できません",
    clearRequest: "この文書を繰り返し使えるテンプレートにしてください。記入済みの値（名前、日付、個人情報、今回だけの内容）は空にし、テンプレートの形（見出し、表、項目、書式）はそのまま残してください。",
    handoffNotSent: "引き継いだスキルを読めなかったため、依頼は送信していません",
    documentUnreadable: "現在の文書を読み取れませんでした",
    untitled: "無題"
  },
  ko: {
    takenOver: "새 탭에서 양식으로 작업합니다",
    goToTab: "탭으로 가기",
    firstTemplateOnly: "양식은 {title}의 것을 씁니다",
    templateMissing: "{title} 스킬의 양식 파일이 없습니다",
    openWithTemplate: "이 양식으로 새 문서 열기",
    openFailed: "양식을 새 탭에 열지 못했습니다",
    previewTabTitle: "양식 미리보기 - {title}",
    previewContinues: "양식 미리보기 탭에서 이어집니다",
    saveThisTab: "이 탭을 양식으로 저장",
    asIsRedacted: "문서에 가린 내용이 있어 원래 문서 그대로 저장할 수 없습니다",
    clearRequest: "이 문서를 되풀이해 쓸 수 있는 양식으로 만들어 주세요. 채워진 값(이름, 날짜, 개인정보, 이번에만 쓰인 내용)은 비우고, 양식 모양(제목, 표, 항목, 서식)은 그대로 두세요.",
    handoffNotSent: "넘겨받은 스킬을 읽지 못해 요청을 보내지 않았습니다",
    documentUnreadable: "지금 문서를 읽지 못했습니다",
    untitled: "제목 없음"
  },
  fr: {
    takenOver: "Travail avec le modèle dans un nouvel onglet",
    goToTab: "Aller à l’onglet",
    firstTemplateOnly: "Le modèle de {title} est utilisé",
    templateMissing: "Le fichier modèle de la compétence {title} est introuvable",
    openWithTemplate: "Ouvrir un nouveau document à partir de ce modèle",
    openFailed: "Impossible d’ouvrir le modèle dans un nouvel onglet",
    previewTabTitle: "Aperçu du modèle - {title}",
    previewContinues: "La suite se passe dans l’onglet d’aperçu du modèle",
    saveThisTab: "Enregistrer cet onglet comme modèle",
    asIsRedacted: "Le document contient des parties masquées : il ne peut pas être enregistré tel quel",
    clearRequest: "Fais de ce document un modèle réutilisable. Vide les valeurs remplies (noms, dates, données personnelles, contenu propre à cette fois) et garde la forme du modèle (titres, tableaux, rubriques et mise en forme) telle quelle.",
    handoffNotSent: "Une compétence transmise n’a pas pu être lue : la demande n’a pas été envoyée",
    documentUnreadable: "Impossible de lire le document actuel",
    untitled: "Sans titre"
  },
  de: {
    takenOver: "Die Vorlage wird in einem neuen Tab bearbeitet",
    goToTab: "Zum Tab",
    firstTemplateOnly: "Die Vorlage von {title} wird verwendet",
    templateMissing: "Die Vorlagendatei des Skills {title} fehlt",
    openWithTemplate: "Neues Dokument aus dieser Vorlage öffnen",
    openFailed: "Die Vorlage konnte nicht in einem neuen Tab geöffnet werden",
    previewTabTitle: "Vorlagenvorschau - {title}",
    previewContinues: "Weiter im Tab der Vorlagenvorschau",
    saveThisTab: "Diesen Tab als Vorlage speichern",
    asIsRedacted: "Das Dokument enthält verborgene Stellen und kann deshalb nicht unverändert gespeichert werden",
    clearRequest: "Mach aus diesem Dokument eine wiederverwendbare Vorlage. Leere die ausgefüllten Werte (Namen, Daten, persönliche Angaben, nur diesmal verwendete Inhalte) und lass die Form der Vorlage (Überschriften, Tabellen, Punkte und Formatierung) unverändert.",
    handoffNotSent: "Ein übergebener Skill konnte nicht gelesen werden, die Anfrage wurde nicht gesendet",
    documentUnreadable: "Das aktuelle Dokument konnte nicht gelesen werden",
    untitled: "Unbenannt"
  },
  es: {
    takenOver: "Se trabaja con la plantilla en una pestaña nueva",
    goToTab: "Ir a la pestaña",
    firstTemplateOnly: "Se usa la plantilla de {title}",
    templateMissing: "Falta el archivo de plantilla de la habilidad {title}",
    openWithTemplate: "Abrir un documento nuevo con esta plantilla",
    openFailed: "No se pudo abrir la plantilla en una pestaña nueva",
    previewTabTitle: "Vista previa de la plantilla - {title}",
    previewContinues: "Continúa en la pestaña de vista previa de la plantilla",
    saveThisTab: "Guardar esta pestaña como plantilla",
    asIsRedacted: "El documento tiene partes ocultas, así que no se puede guardar tal cual",
    clearRequest: "Convierte este documento en una plantilla reutilizable. Vacía los valores rellenados (nombres, fechas, datos personales, contenido usado solo esta vez) y deja la forma de la plantilla (títulos, tablas, apartados y formato) tal como está.",
    handoffNotSent: "No se pudo leer una habilidad recibida, así que no se envió la solicitud",
    documentUnreadable: "No se pudo leer el documento actual",
    untitled: "Sin título"
  },
  th: {
    takenOver: "กำลังทำงานกับแม่แบบในแท็บใหม่",
    goToTab: "ไปที่แท็บ",
    firstTemplateOnly: "ใช้แม่แบบของ {title}",
    templateMissing: "ไม่พบไฟล์แม่แบบของสกิล {title}",
    openWithTemplate: "เปิดเอกสารใหม่จากแม่แบบนี้",
    openFailed: "ไม่สามารถเปิดแม่แบบในแท็บใหม่ได้",
    previewTabTitle: "ตัวอย่างแม่แบบ - {title}",
    previewContinues: "ดำเนินการต่อในแท็บตัวอย่างแม่แบบ",
    saveThisTab: "บันทึกแท็บนี้เป็นแม่แบบ",
    asIsRedacted: "เอกสารมีส่วนที่ซ่อนไว้ จึงบันทึกตามต้นฉบับไม่ได้",
    clearRequest: "ช่วยทำเอกสารนี้ให้เป็นแม่แบบที่ใช้ซ้ำได้ ล้างค่าที่กรอกไว้ (ชื่อ วันที่ ข้อมูลส่วนบุคคล เนื้อหาที่ใช้เฉพาะครั้งนี้) และคงรูปแบบของแม่แบบ (หัวข้อ ตาราง รายการ และการจัดรูปแบบ) ไว้ตามเดิม",
    handoffNotSent: "อ่านสกิลที่ส่งต่อมาไม่ได้ จึงไม่ได้ส่งคำขอ",
    documentUnreadable: "อ่านเอกสารปัจจุบันไม่ได้",
    untitled: "ไม่มีชื่อ"
  },
  id: {
    takenOver: "Bekerja dengan templat di tab baru",
    goToTab: "Buka tab",
    firstTemplateOnly: "Templat yang dipakai milik {title}",
    templateMissing: "Berkas templat skill {title} tidak ada",
    openWithTemplate: "Buka dokumen baru dari templat ini",
    openFailed: "Templat tidak dapat dibuka di tab baru",
    previewTabTitle: "Pratinjau templat - {title}",
    previewContinues: "Dilanjutkan di tab pratinjau templat",
    saveThisTab: "Simpan tab ini sebagai templat",
    asIsRedacted: "Dokumen memiliki bagian yang disembunyikan, jadi tidak dapat disimpan apa adanya",
    clearRequest: "Jadikan dokumen ini templat yang bisa dipakai ulang. Kosongkan nilai yang sudah diisi (nama, tanggal, data pribadi, isi yang hanya dipakai kali ini) dan biarkan bentuk templat (judul, tabel, butir, dan format) tetap seperti adanya.",
    handoffNotSent: "Skill yang diteruskan tidak dapat dibaca, jadi permintaan tidak dikirim",
    documentUnreadable: "Dokumen saat ini tidak dapat dibaca",
    untitled: "Tanpa judul"
  },
  ru: {
    takenOver: "Работа с шаблоном идёт в новой вкладке",
    goToTab: "Перейти на вкладку",
    firstTemplateOnly: "Используется шаблон навыка {title}",
    templateMissing: "Файл шаблона навыка {title} не найден",
    openWithTemplate: "Открыть новый документ по этому шаблону",
    openFailed: "Не удалось открыть шаблон в новой вкладке",
    previewTabTitle: "Предпросмотр шаблона - {title}",
    previewContinues: "Продолжение во вкладке предпросмотра шаблона",
    saveThisTab: "Сохранить эту вкладку как шаблон",
    asIsRedacted: "В документе есть скрытые части, поэтому его нельзя сохранить как есть",
    clearRequest: "Сделай из этого документа шаблон для повторного использования. Очисти заполненные значения (имена, даты, личные данные, то, что нужно только в этот раз) и оставь форму шаблона (заголовки, таблицы, пункты и оформление) как есть.",
    handoffNotSent: "Не удалось прочитать переданный навык, поэтому запрос не отправлен",
    documentUnreadable: "Не удалось прочитать текущий документ",
    untitled: "Без названия"
  },
  ar: {
    takenOver: "يجري العمل على القالب في علامة تبويب جديدة",
    goToTab: "الانتقال إلى علامة التبويب",
    firstTemplateOnly: "يُستخدم قالب {title}",
    templateMissing: "ملف القالب الخاص بمهارة {title} غير موجود",
    openWithTemplate: "فتح مستند جديد من هذا القالب",
    openFailed: "تعذّر فتح القالب في علامة تبويب جديدة",
    previewTabTitle: "معاينة القالب - {title}",
    previewContinues: "يستمر العمل في علامة تبويب معاينة القالب",
    saveThisTab: "حفظ علامة التبويب هذه كقالب",
    asIsRedacted: "في المستند أجزاء مخفية، لذا لا يمكن حفظه كما هو",
    clearRequest: "اجعل هذا المستند قالبًا يمكن استخدامه مرارًا. أفرغ القيم المملوءة (الأسماء والتواريخ والبيانات الشخصية والمحتوى المستخدم لهذه المرة فقط) واترك شكل القالب (العناوين والجداول والبنود والتنسيق) كما هو.",
    handoffNotSent: "تعذّرت قراءة مهارة محوّلة، لذا لم يُرسل الطلب",
    documentUnreadable: "تعذّرت قراءة المستند الحالي",
    untitled: "بلا عنوان"
  },
  pt: {
    takenOver: "O trabalho com o modelo continua numa nova aba",
    goToTab: "Ir para a aba",
    firstTemplateOnly: "É usado o modelo de {title}",
    templateMissing: "O arquivo de modelo da habilidade {title} não existe",
    openWithTemplate: "Abrir um novo documento com este modelo",
    openFailed: "Não foi possível abrir o modelo numa nova aba",
    previewTabTitle: "Pré-visualização do modelo - {title}",
    previewContinues: "Continua na aba de pré-visualização do modelo",
    saveThisTab: "Salvar esta aba como modelo",
    asIsRedacted: "O documento tem partes ocultas, por isso não pode ser salvo como está",
    clearRequest: "Transforme este documento num modelo reutilizável. Esvazie os valores preenchidos (nomes, datas, dados pessoais, conteúdo usado só desta vez) e mantenha a forma do modelo (títulos, tabelas, itens e formatação) como está.",
    handoffNotSent: "Não foi possível ler uma habilidade recebida, por isso o pedido não foi enviado",
    documentUnreadable: "Não foi possível ler o documento atual",
    untitled: "Sem título"
  },
  it: {
    takenOver: "Si lavora con il modello in una nuova scheda",
    goToTab: "Vai alla scheda",
    firstTemplateOnly: "Si usa il modello di {title}",
    templateMissing: "Il file modello dell’abilità {title} non c’è",
    openWithTemplate: "Apri un nuovo documento da questo modello",
    openFailed: "Impossibile aprire il modello in una nuova scheda",
    previewTabTitle: "Anteprima del modello - {title}",
    previewContinues: "Si continua nella scheda di anteprima del modello",
    saveThisTab: "Salva questa scheda come modello",
    asIsRedacted: "Il documento ha parti nascoste, quindi non può essere salvato così com’è",
    clearRequest: "Trasforma questo documento in un modello riutilizzabile. Svuota i valori compilati (nomi, date, dati personali, contenuti usati solo questa volta) e lascia la forma del modello (titoli, tabelle, voci e formattazione) così com’è.",
    handoffNotSent: "Non è stato possibile leggere un’abilità ricevuta, quindi la richiesta non è stata inviata",
    documentUnreadable: "Impossibile leggere il documento attuale",
    untitled: "Senza titolo"
  },
  pl: {
    takenOver: "Praca z szablonem trwa w nowej karcie",
    goToTab: "Przejdź do karty",
    firstTemplateOnly: "Używany jest szablon umiejętności {title}",
    templateMissing: "Brakuje pliku szablonu umiejętności {title}",
    openWithTemplate: "Otwórz nowy dokument z tego szablonu",
    openFailed: "Nie udało się otworzyć szablonu w nowej karcie",
    previewTabTitle: "Podgląd szablonu - {title}",
    previewContinues: "Dalej w karcie podglądu szablonu",
    saveThisTab: "Zapisz tę kartę jako szablon",
    asIsRedacted: "Dokument ma ukryte fragmenty, więc nie można go zapisać bez zmian",
    clearRequest: "Zrób z tego dokumentu szablon do wielokrotnego użytku. Wyczyść wpisane wartości (imiona, daty, dane osobowe, treści użyte tylko ten raz) i zostaw kształt szablonu (nagłówki, tabele, punkty i formatowanie) bez zmian.",
    handoffNotSent: "Nie udało się odczytać przekazanej umiejętności, więc prośba nie została wysłana",
    documentUnreadable: "Nie udało się odczytać bieżącego dokumentu",
    untitled: "Bez tytułu"
  },
  cs: {
    takenOver: "Práce se šablonou pokračuje na nové kartě",
    goToTab: "Přejít na kartu",
    firstTemplateOnly: "Použije se šablona dovednosti {title}",
    templateMissing: "Soubor šablony dovednosti {title} chybí",
    openWithTemplate: "Otevřít nový dokument z této šablony",
    openFailed: "Šablonu se nepodařilo otevřít na nové kartě",
    previewTabTitle: "Náhled šablony - {title}",
    previewContinues: "Pokračuje se na kartě náhledu šablony",
    saveThisTab: "Uložit tuto kartu jako šablonu",
    asIsRedacted: "Dokument obsahuje skryté části, proto ho nelze uložit beze změny",
    clearRequest: "Udělej z tohoto dokumentu šablonu k opakovanému použití. Vyprázdni vyplněné hodnoty (jména, data, osobní údaje, obsah použitý jen tentokrát) a ponech podobu šablony (nadpisy, tabulky, položky a formátování) beze změny.",
    handoffNotSent: "Předanou dovednost se nepodařilo přečíst, proto žádost nebyla odeslána",
    documentUnreadable: "Aktuální dokument se nepodařilo přečíst",
    untitled: "Bez názvu"
  },
  nl: {
    takenOver: "Er wordt in een nieuw tabblad met de sjabloon gewerkt",
    goToTab: "Naar het tabblad",
    firstTemplateOnly: "De sjabloon van {title} wordt gebruikt",
    templateMissing: "Het sjabloonbestand van de vaardigheid {title} ontbreekt",
    openWithTemplate: "Nieuw document openen met deze sjabloon",
    openFailed: "De sjabloon kon niet in een nieuw tabblad worden geopend",
    previewTabTitle: "Sjabloonvoorbeeld - {title}",
    previewContinues: "Gaat verder in het tabblad met het sjabloonvoorbeeld",
    saveThisTab: "Dit tabblad als sjabloon opslaan",
    asIsRedacted: "Het document heeft verborgen delen en kan daarom niet ongewijzigd worden opgeslagen",
    clearRequest: "Maak van dit document een herbruikbare sjabloon. Maak de ingevulde waarden leeg (namen, datums, persoonsgegevens, inhoud die alleen deze keer gebruikt is) en laat de vorm van de sjabloon (koppen, tabellen, onderdelen en opmaak) zoals die is.",
    handoffNotSent: "Een doorgegeven vaardigheid kon niet worden gelezen, dus het verzoek is niet verzonden",
    documentUnreadable: "Het huidige document kon niet worden gelezen",
    untitled: "Naamloos"
  },
  ms: {
    takenOver: "Kerja dengan templat diteruskan dalam tab baharu",
    goToTab: "Pergi ke tab",
    firstTemplateOnly: "Templat milik {title} digunakan",
    templateMissing: "Fail templat kemahiran {title} tiada",
    openWithTemplate: "Buka dokumen baharu daripada templat ini",
    openFailed: "Templat tidak dapat dibuka dalam tab baharu",
    previewTabTitle: "Pratonton templat - {title}",
    previewContinues: "Diteruskan dalam tab pratonton templat",
    saveThisTab: "Simpan tab ini sebagai templat",
    asIsRedacted: "Dokumen mempunyai bahagian tersembunyi, jadi tidak boleh disimpan seadanya",
    clearRequest: "Jadikan dokumen ini templat yang boleh digunakan semula. Kosongkan nilai yang telah diisi (nama, tarikh, maklumat peribadi, kandungan untuk kali ini sahaja) dan kekalkan bentuk templat (tajuk, jadual, butiran dan format) seperti asal.",
    handoffNotSent: "Kemahiran yang diserahkan tidak dapat dibaca, jadi permintaan tidak dihantar",
    documentUnreadable: "Dokumen semasa tidak dapat dibaca",
    untitled: "Tanpa tajuk"
  },
  he: {
    takenOver: "העבודה עם התבנית ממשיכה בכרטיסייה חדשה",
    goToTab: "מעבר לכרטיסייה",
    firstTemplateOnly: "נעשה שימוש בתבנית של {title}",
    templateMissing: "קובץ התבנית של המיומנות {title} חסר",
    openWithTemplate: "פתיחת מסמך חדש מהתבנית הזו",
    openFailed: "לא ניתן לפתוח את התבנית בכרטיסייה חדשה",
    previewTabTitle: "תצוגה מקדימה של תבנית - {title}",
    previewContinues: "ממשיכים בכרטיסיית התצוגה המקדימה של התבנית",
    saveThisTab: "שמירת הכרטיסייה הזו כתבנית",
    asIsRedacted: "במסמך יש חלקים מוסתרים, ולכן אי אפשר לשמור אותו כמו שהוא",
    clearRequest: "הפוך את המסמך הזה לתבנית לשימוש חוזר. רוקן את הערכים שמולאו (שמות, תאריכים, מידע אישי, תוכן שנכתב רק לפעם הזו) והשאר את צורת התבנית (כותרות, טבלאות, סעיפים ועיצוב) כפי שהיא.",
    handoffNotSent: "לא ניתן היה לקרוא מיומנות שהועברה, ולכן הבקשה לא נשלחה",
    documentUnreadable: "לא ניתן היה לקרוא את המסמך הנוכחי",
    untitled: "ללא כותרת"
  },
  hi: {
    takenOver: "टेम्पलेट के साथ काम नए टैब में हो रहा है",
    goToTab: "टैब पर जाएँ",
    firstTemplateOnly: "{title} का टेम्पलेट इस्तेमाल हो रहा है",
    templateMissing: "{title} कौशल की टेम्पलेट फ़ाइल नहीं मिली",
    openWithTemplate: "इस टेम्पलेट से नया दस्तावेज़ खोलें",
    openFailed: "टेम्पलेट नए टैब में नहीं खुल सका",
    previewTabTitle: "टेम्पलेट पूर्वावलोकन - {title}",
    previewContinues: "टेम्पलेट पूर्वावलोकन टैब में आगे बढ़ें",
    saveThisTab: "इस टैब को टेम्पलेट के रूप में सहेजें",
    asIsRedacted: "दस्तावेज़ में छिपाए गए हिस्से हैं, इसलिए इसे जैसा है वैसा नहीं सहेजा जा सकता",
    clearRequest: "इस दस्तावेज़ को बार-बार इस्तेमाल होने वाला टेम्पलेट बनाइए। भरे हुए मान (नाम, तारीख़, निजी जानकारी, सिर्फ़ इस बार की सामग्री) खाली कर दीजिए और टेम्पलेट का रूप (शीर्षक, तालिकाएँ, बिंदु और फ़ॉर्मैटिंग) वैसा ही रहने दीजिए।",
    handoffNotSent: "सौंपा गया कौशल पढ़ा नहीं जा सका, इसलिए अनुरोध नहीं भेजा गया",
    documentUnreadable: "मौजूदा दस्तावेज़ पढ़ा नहीं जा सका",
    untitled: "शीर्षकहीन"
  },
  "zh-TW": {
    takenOver: "將在新分頁中使用範本工作",
    goToTab: "前往分頁",
    firstTemplateOnly: "使用 {title} 的範本",
    templateMissing: "{title} 技能的範本檔案不存在",
    openWithTemplate: "用此範本開新文件",
    openFailed: "無法在新分頁中開啟範本",
    previewTabTitle: "範本預覽 - {title}",
    previewContinues: "在範本預覽分頁中繼續",
    saveThisTab: "將此分頁儲存為範本",
    asIsRedacted: "文件中有隱藏的內容，無法按原文件儲存",
    clearRequest: "請把這份文件做成可以重複使用的範本。清空已填寫的值（姓名、日期、個人資料、只用於這一次的內容），保留範本的樣子（標題、表格、項目和格式）。",
    handoffNotSent: "無法讀取轉交的技能，請求未送出",
    documentUnreadable: "無法讀取目前的文件",
    untitled: "未命名"
  },
  vi: {
    takenOver: "Đang làm việc với mẫu trong một thẻ mới",
    goToTab: "Đến thẻ",
    firstTemplateOnly: "Dùng mẫu của {title}",
    templateMissing: "Không có tệp mẫu của kỹ năng {title}",
    openWithTemplate: "Mở tài liệu mới từ mẫu này",
    openFailed: "Không thể mở mẫu trong thẻ mới",
    previewTabTitle: "Xem trước mẫu - {title}",
    previewContinues: "Tiếp tục trong thẻ xem trước mẫu",
    saveThisTab: "Lưu thẻ này làm mẫu",
    asIsRedacted: "Tài liệu có phần bị ẩn nên không thể lưu nguyên như hiện tại",
    clearRequest: "Hãy biến tài liệu này thành một mẫu dùng lại được. Xóa trống các giá trị đã điền (tên, ngày, thông tin cá nhân, nội dung chỉ dùng lần này) và giữ nguyên hình thức của mẫu (tiêu đề, bảng, mục và định dạng).",
    handoffNotSent: "Không đọc được kỹ năng được chuyển sang nên yêu cầu chưa được gửi",
    documentUnreadable: "Không đọc được tài liệu hiện tại",
    untitled: "Không có tiêu đề"
  }
});
const skillTemplateText = createI18n(SKILL_TEMPLATE_STRINGS);
function skillTemplateBridge() {
  const b = globalThis.aiOfficeUserSkills;
  const calls = [
    "openTemplate",
    "openPreview",
    "previewOriginal",
    "finishPreview",
    "takeHandoff",
    "focusTab",
    "onPreviewEnded",
    "aiRead"
  ];
  return b && calls.every((name) => typeof b[name] === "function") ? b : null;
}
function templateChoice(request) {
  const withTemplate = request.chips.filter((chip) => chip.template || chip.templateMissing);
  return { skill: withTemplate[0] ?? request.skill, several: withTemplate.length > 1 };
}
function isRecord$1(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function chipRefOf(chip) {
  return { id: chip.id, source: chip.source, title: chip.title };
}
function chipRefForSkill(skill) {
  const source = skill.id.slice(0, Math.max(0, skill.id.indexOf(":"))) || "app";
  return { id: skill.id, source, title: skill.title };
}
function templateOpenResultOf(raw) {
  if (isRecord$1(raw) && raw.ok === true && typeof raw.tabId === "string" && raw.tabId) {
    return { ok: true, tabId: raw.tabId };
  }
  const reason = isRecord$1(raw) && typeof raw.reason === "string" ? raw.reason : "failed";
  return { ok: false, reason };
}
function isTemplateMissing(reason) {
  return reason === "no-template" || reason === "not-found";
}
function previewOpenResultOf(raw) {
  if (isRecord$1(raw) && raw.ok === true && typeof raw.tabId === "string" && typeof raw.previewId === "string" && raw.tabId && raw.previewId) {
    return { ok: true, tabId: raw.tabId, previewId: raw.previewId };
  }
  return {
    ok: false,
    reason: isRecord$1(raw) && typeof raw.reason === "string" ? raw.reason : "failed"
  };
}
function previewOriginalOf(raw) {
  if (!isRecord$1(raw) || raw.ok !== true) return null;
  if (!(raw.bytes instanceof Uint8Array) || typeof raw.fileName !== "string" || !raw.fileName) {
    return null;
  }
  return { bytes: raw.bytes, fileName: raw.fileName };
}
function previewEndedOf(raw) {
  if (!isRecord$1(raw) || typeof raw.previewId !== "string" || !raw.previewId) return null;
  if (raw.outcome !== "saved" && raw.outcome !== "unsaved") return null;
  return {
    previewId: raw.previewId,
    outcome: raw.outcome,
    ...typeof raw.skillId === "string" ? { skillId: raw.skillId } : {},
    ...typeof raw.title === "string" ? { title: raw.title } : {}
  };
}
function handedProposalOf(raw) {
  if (!isRecord$1(raw)) return null;
  const { key, title, name, description, body } = raw;
  if (typeof key !== "string" || !key || typeof title !== "string") return null;
  if (typeof description !== "string" || typeof body !== "string") return null;
  let target;
  if (isRecord$1(raw.target)) {
    const t = raw.target;
    if (typeof t.id !== "string" || typeof t.name !== "string" || typeof t.title !== "string" || typeof t.source !== "string") {
      return null;
    }
    target = { id: t.id, name: t.name, title: t.title, owned: t.owned === true, source: t.source };
  }
  return {
    key,
    title,
    name: typeof name === "string" ? name : "",
    description,
    body,
    wantsTemplate: true,
    target
  };
}
function handedDraftOf(raw) {
  if (!isRecord$1(raw)) return void 0;
  const draft = {};
  for (const field of ["title", "name", "description", "body"]) {
    const value = raw[field];
    if (typeof value === "string") draft[field] = value;
  }
  if (raw.invoke === "auto" || raw.invoke === "manual") draft.invoke = raw.invoke;
  return draft;
}
function handedRequestOf(raw, target) {
  if (!isRecord$1(raw) || raw.mode !== "skill" || raw.target !== target) return null;
  if (typeof raw.id !== "string" || typeof raw.text !== "string") return null;
  const chips = [];
  if (Array.isArray(raw.chips)) {
    for (const chip of raw.chips) {
      if (isRecord$1(chip) && typeof chip.id === "string" && typeof chip.source === "string" && typeof chip.title === "string") {
        chips.push({ id: chip.id, source: chip.source, title: chip.title });
      }
    }
  }
  let preview2;
  if (isRecord$1(raw.preview)) {
    const p = raw.preview;
    const proposal = handedProposalOf(p.proposal);
    if (proposal && typeof p.previewId === "string" && typeof p.title === "string" && typeof p.fileName === "string" && p.fileName) {
      const draft = handedDraftOf(p.draft);
      preview2 = {
        previewId: p.previewId,
        title: p.title,
        fileName: p.fileName,
        originalRedacted: p.originalRedacted !== false,
        proposal,
        ...draft ? { draft } : {}
      };
    }
  }
  return { id: raw.id, text: raw.text, chips, ...preview2 ? { preview: preview2 } : {} };
}
function useRedacted(read) {
  const [redacted, setRedacted] = reactExports.useState(null);
  const readRef = reactExports.useRef(read);
  readRef.current = read;
  reactExports.useEffect(() => {
    let live = true;
    const current = readRef.current;
    if (!current) {
      setRedacted(false);
      return;
    }
    Promise.resolve().then(() => current()).then(
      (answer) => live && setRedacted(answer === true),
      // an answer that cannot be had blocks: less is saved rather than a hidden part
      () => live && setRedacted(true)
    );
    return () => {
      live = false;
    };
  }, []);
  return redacted;
}
function OriginalTemplateActions({
  context,
  document: document2,
  bridge,
  onPreviewOpened
}) {
  const { lang, busy, blocked } = context;
  const redacted = useRedacted(document2.redacted);
  const [working, setWorking] = reactExports.useState(false);
  const [failure, setFailure] = reactExports.useState(null);
  const liveRef = reactExports.useRef(true);
  reactExports.useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
    };
  }, []);
  const readBytes = async () => {
    try {
      return await document2.bytes();
    } catch {
      return null;
    }
  };
  const redactedNow = async () => {
    try {
      return await document2.redacted() !== false;
    } catch {
      return true;
    }
  };
  const saveAsIs = async () => {
    if (working || redacted !== false) return;
    setWorking(true);
    setFailure(null);
    try {
      if (await redactedNow()) {
        if (liveRef.current) setFailure(skillTemplateText(lang, "asIsRedacted"));
        return;
      }
      const bytes = await readBytes();
      if (!liveRef.current) return;
      if (!bytes) {
        setFailure(skillTemplateText(lang, "documentUnreadable"));
        return;
      }
      await context.save({ bytes, fileName: document2.fileName });
    } finally {
      if (liveRef.current) setWorking(false);
    }
  };
  const makeBlank = async () => {
    if (working || !bridge) return;
    setWorking(true);
    setFailure(null);
    try {
      const bytes = await readBytes();
      if (!liveRef.current) return;
      if (!bytes) {
        setFailure(skillTemplateText(lang, "documentUnreadable"));
        return;
      }
      const opened = previewOpenResultOf(
        await bridge.openPreview({
          bytes,
          fileName: document2.fileName,
          title: document2.title,
          tabTitle: skillTemplateText(lang, "previewTabTitle", { title: document2.title }),
          text: skillTemplateText(lang, "clearRequest"),
          originalRedacted: redacted !== false || await redactedNow(),
          proposal: context.proposal,
          draft: context.draft
        }).catch(() => null)
      );
      if (!liveRef.current) return;
      if (opened.ok) onPreviewOpened({ tabId: opened.tabId, previewId: opened.previewId });
      else setFailure(skillTemplateText(lang, "openFailed"));
    } finally {
      if (liveRef.current) setWorking(false);
    }
  };
  const disabled = busy || working || !!blocked;
  const asIsReason = redacted ? skillTemplateText(lang, "asIsRedacted") : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "ai-skill-card-btn primary",
        disabled: disabled || !bridge,
        title: blocked ?? void 0,
        onClick: () => void makeBlank(),
        children: skillCardText(lang, "templateBlank")
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "ai-skill-card-btn",
        disabled: disabled || redacted !== false,
        title: asIsReason ?? blocked ?? void 0,
        "data-template-as-is-blocked": redacted ? "redacted" : void 0,
        onClick: () => void saveAsIs(),
        children: skillCardText(lang, "templateAsIs")
      }
    ),
    (asIsReason || failure) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "ai-skill-card-note is-error ai-skill-card-template-note", role: "status", children: failure ?? asIsReason })
  ] });
}
function PreviewTemplateActions({
  context,
  preview: preview2,
  document: document2,
  bridge
}) {
  const { lang, busy, blocked } = context;
  const [working, setWorking] = reactExports.useState(false);
  const [failure, setFailure] = reactExports.useState(null);
  const liveRef = reactExports.useRef(true);
  reactExports.useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
    };
  }, []);
  const run = async (read) => {
    if (working) return;
    setWorking(true);
    setFailure(null);
    try {
      const bytes = await read().catch(() => null);
      if (!liveRef.current) return;
      if (!bytes) {
        setFailure(skillTemplateText(lang, "documentUnreadable"));
        return;
      }
      await context.save({ bytes, fileName: preview2.fileName });
    } finally {
      if (liveRef.current) setWorking(false);
    }
  };
  const saveThisTab = () => run(async () => document2 ? document2.bytes() : null);
  const saveOriginal = () => run(async () => {
    if (!bridge || preview2.originalRedacted) return null;
    const original = previewOriginalOf(await bridge.previewOriginal(preview2.previewId));
    return original?.bytes ?? null;
  });
  const disabled = busy || working || !!blocked;
  const asIsReason = preview2.originalRedacted ? skillTemplateText(lang, "asIsRedacted") : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "ai-skill-card-btn primary",
        disabled: disabled || !document2,
        title: blocked ?? void 0,
        onClick: () => void saveThisTab(),
        children: skillTemplateText(lang, "saveThisTab")
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "ai-skill-card-btn",
        disabled: disabled || preview2.originalRedacted || !bridge,
        title: asIsReason ?? blocked ?? void 0,
        "data-template-as-is-blocked": preview2.originalRedacted ? "redacted" : void 0,
        onClick: () => void saveOriginal(),
        children: skillCardText(lang, "templateAsIs")
      }
    ),
    (asIsReason || failure) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "ai-skill-card-note is-error ai-skill-card-template-note", role: "status", children: failure ?? asIsReason })
  ] });
}
function SkillCardPreviewLine({
  lang,
  title,
  onGoToTab
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-skill-card-line is-preview", "data-skill-card-status": "preview", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ai-skill-card-line-text", dir: "auto", children: [
      skillTemplateText(lang, "previewContinues"),
      title ? ` · ${title}` : ""
    ] }),
    onGoToTab && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      " · ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ai-skill-card-link", onClick: onGoToTab, children: skillTemplateText(lang, "goToTab") })
    ] })
  ] });
}
typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");
function matchNav(navs, href) {
  return navs.find((n) => href.startsWith(n.scheme));
}
const HREF = /(?:[^\s()]|\([^\s()]*\))+/.source;
const INLINE_RE = new RegExp(
  `(\`[^\`\\n]+\`|\\*\\*[^*\\n]+?\\*\\*|\\*[^*\\n]+?\\*|!\\[[^\\]\\n]*\\]\\(${HREF}\\)|\\[[^\\]\\n]+\\]\\(${HREF}\\))`,
  "g"
);
const LINK_RE = new RegExp(`^\\[([^\\]]+)\\]\\((${HREF})\\)$`);
const IMG_RE = new RegExp(`^!\\[([^\\]]*)\\]\\((${HREF})\\)$`);
const IMG_LINE_RE = new RegExp(`^\\s*!\\[([^\\]]*)\\]\\((${HREF})\\)$`);
function renderInline(text, navs, images) {
  const out = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    const tok = m[0] ?? "";
    if (tok.startsWith("`")) out.push(/* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: tok.slice(1, -1) }, key++));
    else if (tok.startsWith("**")) out.push(/* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: tok.slice(2, -2) }, key++));
    else if (tok.startsWith("![")) {
      const img = IMG_RE.exec(tok);
      const src = img ? images?.resolve?.(img[2] ?? "") : void 0;
      if (img && src) {
        out.push(
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "ai-md-img", src, alt: img[1] ?? "", loading: "lazy" }, key++)
        );
      } else out.push(tok);
    } else if (tok.startsWith("[")) {
      const link = LINK_RE.exec(tok);
      const href = link?.[2] ?? "";
      const hit = link ? matchNav(navs, href) : void 0;
      if (link && hit) {
        out.push(
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              className: "ai-md-nav",
              href,
              onClick: (e) => {
                e.preventDefault();
                hit.onNavigate(href);
              },
              children: link[1]
            },
            key++
          )
        );
      } else {
        out.push(tok);
      }
    } else out.push(/* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: tok.slice(1, -1) }, key++));
    last = i + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
const FENCE_RE = /^\s*(`{3,}|~{3,})/;
const DELIM_CELL_RE = /^\s*:?-+:?\s*$/;
function splitCells(line) {
  const cells = [];
  let cur = "";
  let inCode = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && line[i + 1] === "|") {
      cur += "|";
      i++;
    } else if (ch === "`") {
      inCode = !inCode;
      cur += ch;
    } else if (ch === "|" && !inCode) {
      cells.push(cur);
      cur = "";
    } else cur += ch;
  }
  cells.push(cur);
  if (cells.length && !cells[0]?.trim()) cells.shift();
  if (cells.length && !cells[cells.length - 1]?.trim()) cells.pop();
  return cells.map((c) => c.trim());
}
function parseDelimiterRow(line) {
  if (!line.includes("-")) return null;
  const cells = splitCells(line);
  if (!cells.length || !cells.every((c) => DELIM_CELL_RE.test(c))) return null;
  return cells.map((c) => {
    const l = c.startsWith(":");
    const r = c.endsWith(":");
    if (l && r) return "center";
    if (r) return "right";
    if (l) return "left";
    return void 0;
  });
}
function parseBlocks(text) {
  const blocks = [];
  let cur = null;
  const flush = () => {
    if (cur) {
      blocks.push(cur);
      cur = null;
    }
  };
  const lines = text.split("\n");
  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx] ?? "";
    const line = raw.trimEnd();
    if (cur?.kind === "code") {
      if (FENCE_RE.test(line)) flush();
      else cur.lines.push(raw);
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    const img = IMG_LINE_RE.exec(line);
    if (img) {
      flush();
      blocks.push({ kind: "img", alt: img[1] ?? "", href: img[2] ?? "" });
      continue;
    }
    if (FENCE_RE.test(line)) {
      flush();
      cur = { kind: "code", lines: [] };
      continue;
    }
    if (cur?.kind === "table") {
      if (line.includes("|")) {
        const width = cur.head.length;
        const cells = splitCells(line).slice(0, width);
        while (cells.length < width) cells.push("");
        cur.rows.push(cells);
        continue;
      }
      flush();
    }
    if (line.includes("|")) {
      const align = parseDelimiterRow(lines[idx + 1] ?? "");
      if (align) {
        const head = splitCells(line);
        if (head.length === align.length) {
          flush();
          cur = { kind: "table", align, head, rows: [] };
          idx++;
          continue;
        }
      }
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      blocks.push({ kind: "h", text: h[2] ?? "", level: (h[1] ?? "#").length });
      continue;
    }
    const ul = /^\s*[-*•]\s+(.*)$/.exec(line);
    if (ul) {
      if (cur?.kind !== "ul") {
        flush();
        cur = { kind: "ul", items: [] };
      }
      cur.items.push(ul[1] ?? "");
      continue;
    }
    const ol = /^\s*\d+[.、)]\s+(.*)$/.exec(line);
    if (ol) {
      if (cur?.kind !== "ol") {
        flush();
        cur = { kind: "ol", items: [] };
      }
      cur.items.push(ol[1] ?? "");
      continue;
    }
    if (cur?.kind !== "p") {
      flush();
      cur = { kind: "p", lines: [] };
    }
    cur.lines.push(line);
  }
  flush();
  return blocks;
}
function MarkdownView({
  text,
  nav,
  navs,
  images
}) {
  const navList = nav ? [nav, ...navs ?? []] : navs ?? [];
  const blocks = reactExports.useMemo(() => parseBlocks(text), [text]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ai-md", children: blocks.map((b, i) => {
    if (b.kind === "h") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `ai-md-h ai-md-h${b.level}`, children: renderInline(b.text, navList, images) }, i);
    }
    if (b.kind === "img") {
      const src = images?.resolve?.(b.href);
      if (!src) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: `![${b.alt}](${b.href})` }, i);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "ai-md-img", src, alt: b.alt, loading: "lazy" }, i);
    }
    if (b.kind === "ul" || b.kind === "ol") {
      const items = b.items.map((it2, j) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: renderInline(it2, navList, images) }, j));
      return b.kind === "ul" ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: items }, i) : /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { children: items }, i);
    }
    if (b.kind === "code") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "ai-md-pre", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: b.lines.join("\n") }) }, i);
    }
    if (b.kind === "table") {
      const cellStyle = (j) => b.align[j] ? { textAlign: b.align[j] } : void 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ai-md-table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "ai-md-table", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: b.head.map((c, j) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: cellStyle(j), children: renderInline(c, navList, images) }, j)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: b.rows.map((row, r) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: row.map((c, j) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: cellStyle(j), children: renderInline(c, navList, images) }, j)) }, r)) })
      ] }) }, i);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: b.lines.map((ln, j) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
      j > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      renderInline(ln, navList, images)
    ] }, j)) }, i);
  }) });
}
const Markdown = reactExports.memo(MarkdownView);
(() => {
  const map = /* @__PURE__ */ new Map();
  for (const [key, aliases] of Object.entries(CJK_FAMILY_ALIASES)) {
    const group = [key, ...aliases];
    for (const a of group) {
      const list = map.get(a);
      if (list) {
        for (const b of group) if (b !== a && !list.includes(b)) list.push(b);
      } else {
        map.set(
          a,
          group.filter((b) => b !== a)
        );
      }
    }
  }
  return map;
})();
const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
function newCustomEndpointId() {
  let id2 = "";
  for (let i = 0; i < 8; i += 1) id2 += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
  return `ep-${id2}`;
}
const str$1 = (v) => typeof v === "string" ? v.trim() : "";
function configuredSlot(config) {
  return Boolean(str$1(config?.baseUrl) || str$1(config?.model) || str$1(config?.apiKey));
}
function normalizeEndpoints(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry;
    const id2 = str$1(e.id);
    if (!id2 || seen.has(id2)) continue;
    seen.add(id2);
    const models = Array.isArray(e.models) ? [
      ...new Set(
        e.models.filter((m) => typeof m === "string").map((m) => m.trim())
      )
    ].filter(Boolean) : void 0;
    out.push({
      id: id2,
      name: str$1(e.name),
      baseUrl: str$1(e.baseUrl),
      apiKey: str$1(e.apiKey),
      model: str$1(e.model),
      ...models && models.length > 0 ? { models } : {}
    });
  }
  return out;
}
function resolveCustomEndpoints(settings) {
  let endpoints = normalizeEndpoints(settings.customEndpoints);
  const slot = settings.providers?.custom;
  if (endpoints.length === 0 && configuredSlot(slot)) {
    endpoints = [
      {
        id: newCustomEndpointId(),
        name: "",
        baseUrl: str$1(slot?.baseUrl),
        apiKey: str$1(slot?.apiKey),
        model: str$1(slot?.model)
      }
    ];
  }
  if (endpoints.length === 0) {
    const { customEndpoints: _list, customEndpoint: _active, ...rest } = settings;
    return rest;
  }
  const active = endpoints.find((e) => e.id === str$1(settings.customEndpoint)) ?? endpoints[0];
  return {
    ...settings,
    customEndpoints: endpoints,
    customEndpoint: active.id,
    providers: {
      ...settings.providers,
      custom: { apiKey: active.apiKey, model: active.model, baseUrl: active.baseUrl }
    }
  };
}
function activeCustomEndpoint(settings) {
  return settings.customEndpoints?.find((e) => e.id === settings.customEndpoint);
}
function selectCustomEndpoint(settings, id2) {
  return resolveCustomEndpoints({ ...settings, customEndpoint: id2 });
}
function upsertCustomEndpoint(settings, endpoint, activate = false) {
  const list = settings.customEndpoints ?? [];
  const exists = list.some((e) => e.id === endpoint.id);
  const customEndpoints = exists ? list.map((e) => e.id === endpoint.id ? endpoint : e) : [...list, endpoint];
  return resolveCustomEndpoints({
    ...settings,
    customEndpoints,
    customEndpoint: activate || !exists ? endpoint.id : settings.customEndpoint
  });
}
function removeCustomEndpoint(settings, id2) {
  const customEndpoints = (settings.customEndpoints ?? []).filter((e) => e.id !== id2);
  const blank = { apiKey: "", model: "", baseUrl: "" };
  return resolveCustomEndpoints({
    ...settings,
    customEndpoints,
    providers: { ...settings.providers, custom: blank }
  });
}
function customEndpointLabel(endpoint, fallback) {
  if (endpoint.name) return endpoint.name;
  try {
    return new URL(endpoint.baseUrl).host || fallback;
  } catch {
    return endpoint.baseUrl || fallback;
  }
}
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
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.1-pro-preview",
      "gemini-3.6-flash"
    ],
    defaultAnalysisModel: "gemini-3.8-flash",
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
function providerHasCapability(meta, capability) {
  if (capability === "image") return !!meta.imageProtocol;
  if (capability === "video") return !!meta.analysisProtocol && meta.videoAnalysis;
  return !!meta.analysisProtocol;
}
function defaultAiMediaSettings() {
  const providers = {};
  for (const meta of AI_MEDIA_PROVIDERS) {
    providers[meta.id] = {
      apiKey: "",
      imageModel: meta.defaultImageModel,
      analysisModel: meta.defaultAnalysisModel,
      baseUrl: meta.needsBaseUrl ? "" : void 0
    };
  }
  return {
    imageProvider: "codex",
    analysisProvider: "chat",
    videoAnalysisProvider: "none",
    providers
  };
}
function resolveAiMediaSettings(stored) {
  const defaults = defaultAiMediaSettings();
  if (!stored) return defaults;
  const providers = { ...defaults.providers };
  for (const [id2, config] of Object.entries(stored.providers ?? {})) {
    if (!config || typeof config !== "object") continue;
    const str2 = (v, fallback) => typeof v === "string" ? v.trim() : fallback;
    const base = providers[id2];
    providers[id2] = {
      apiKey: str2(config.apiKey, base?.apiKey ?? ""),
      imageModel: str2(config.imageModel, base?.imageModel ?? ""),
      analysisModel: str2(config.analysisModel, base?.analysisModel ?? ""),
      ...config.baseUrl !== void 0 ? { baseUrl: str2(config.baseUrl, base?.baseUrl ?? "") } : base?.baseUrl !== void 0 ? { baseUrl: base.baseUrl } : {}
    };
  }
  const legacy = stored.provider;
  const analysisProvider = stored.analysisProvider ?? legacy ?? defaults.analysisProvider;
  return {
    imageProvider: stored.imageProvider ?? legacy ?? defaults.imageProvider,
    analysisProvider,
    // a pre-split file used one vendor for all media analysis (`chat` cannot read video)
    videoAnalysisProvider: stored.videoAnalysisProvider ?? (analysisProvider === "chat" ? "none" : analysisProvider),
    providers
  };
}
const AI_SEARCH_PROVIDERS = [
  { id: "serper", label: "Serper", keyPlaceholder: "Serper API key", imageSearch: true },
  { id: "serply", label: "Serply", keyPlaceholder: "Serply API key", imageSearch: true },
  { id: "tavily", label: "Tavily", keyPlaceholder: "tvly-...", imageSearch: false },
  { id: "parallel", label: "Parallel", keyPlaceholder: "Parallel API key", imageSearch: false },
  // exa/firecrawl: AI-search APIs without an image endpoint (like Tavily/Parallel)
  { id: "exa", label: "Exa", keyPlaceholder: "Exa API key", imageSearch: false },
  { id: "firecrawl", label: "Firecrawl", keyPlaceholder: "fc-...", imageSearch: false }
];
function defaultAiSearchSettings() {
  return {
    provider: "parallel",
    providers: {
      serper: { apiKey: "" },
      serply: { apiKey: "" },
      tavily: { apiKey: "" },
      parallel: { apiKey: "" },
      exa: { apiKey: "" },
      firecrawl: { apiKey: "" }
    }
  };
}
function resolveAiSearchSettings(stored) {
  const defaults = defaultAiSearchSettings();
  if (!stored) return defaults;
  const providers = { ...defaults.providers };
  for (const id2 of ["serper", "serply", "tavily", "parallel", "exa", "firecrawl"]) {
    const key = stored.providers?.[id2]?.apiKey;
    if (typeof key === "string") providers[id2] = { apiKey: key.trim() };
  }
  return { provider: stored.provider ?? defaults.provider, providers };
}
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
    // 3.x lineup per ai.google.dev/gemini-api/docs/models (2026-09-23). 3.8 Flash
    // is the current stable Flash Google recommends; 3.1 Pro is still preview-only.
    models: [
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.1-pro-preview",
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite"
    ],
    defaultModel: "gemini-3.8-flash",
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
function defaultAiSettings(defaultApiKeys) {
  const providers = {};
  for (const meta of AI_PROVIDERS) {
    providers[meta.id] = {
      apiKey: "",
      model: meta.defaultModel,
      baseUrl: meta.needsBaseUrl ? "" : void 0,
      cliPath: meta.needsCliPath ? "" : void 0
    };
  }
  return {
    provider: "auto",
    providers,
    media: defaultAiMediaSettings(),
    search: defaultAiSearchSettings(),
    meteredAccepted: sanitizeMeteredAccepted(void 0),
    headlessSubscriptionEnabled: false,
    headlessSubscriptionConsentVersion: 0,
    subscriptionNoticeSeen: false
  };
}
const HEADLESS_SUBSCRIPTION_CONSENT_VERSION = 2;
function headlessConsentVersionOf(value) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : 0;
}
function headlessSubscriptionOn(settings) {
  return settings.headlessSubscriptionEnabled === true && headlessConsentVersionOf(settings.headlessSubscriptionConsentVersion) >= HEADLESS_SUBSCRIPTION_CONSENT_VERSION;
}
const AI_SUBSCRIPTION_PROVIDERS = [
  "claude-code",
  "codex"
];
function sanitizeMeteredAccepted(stored) {
  const raw = isRecord(stored) ? stored : {};
  return { "claude-code": raw["claude-code"] === true, codex: raw.codex === true };
}
function readUrlSettingsOf(value) {
  if (!isRecord(value)) return void 0;
  const token = str(value.githubToken);
  return token ? { githubToken: token } : void 0;
}
const RETIRED_MODELS = {
  // chat/reasoner retired 2026-07-24 (thinking became a request parameter);
  // V4 Flash and V4 Flash Vision Exp retired 2026-09-10 in favour of V4.1
  // Flash, which carries vision natively. The vendor's own `deepseek-flash`
  // id is folded in as well so the stored value matches the listed one.
  deepseek: {
    "deepseek-chat": DEEPSEEK_V41_FLASH,
    "deepseek-reasoner": DEEPSEEK_V41_FLASH,
    "deepseek-v4-flash": DEEPSEEK_V41_FLASH,
    "deepseek-v4-flash-vision-exp": DEEPSEEK_V41_FLASH,
    "deepseek-flash": DEEPSEEK_V41_FLASH
  },
  // 5-Turbo left the Z.ai price card late 2026-08; 5.3 Flash is the cheap tier now
  glm: { "glm-5-turbo": "glm-5.3-flash" }
};
const DEFAULT_MAX_OUTPUT_TOKENS = 32768;
const MIN_MAX_OUTPUT_TOKENS = 1024;
const MAX_MAX_OUTPUT_TOKENS = 131072;
function clampMaxOutputTokens(value) {
  const n = typeof value === "number" ? Math.floor(value) : Number.NaN;
  if (!Number.isFinite(n)) return DEFAULT_MAX_OUTPUT_TOKENS;
  return Math.min(MAX_MAX_OUTPUT_TOKENS, Math.max(MIN_MAX_OUTPUT_TOKENS, n));
}
const str = (v) => typeof v === "string" ? v.trim() : "";
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function mergeProviderConfigs(defaults, stored) {
  const merged = { ...defaults };
  for (const [id2, config] of Object.entries(stored)) {
    if (isRecord(config)) merged[id2] = config;
  }
  return merged;
}
function trimConfigs(providers) {
  const trimmed = {};
  for (const [id2, config] of Object.entries(providers)) {
    if (!isRecord(config)) continue;
    trimmed[id2] = {
      ...config,
      apiKey: str(config.apiKey),
      model: str(config.model),
      ...config.baseUrl !== void 0 ? { baseUrl: str(config.baseUrl) } : {},
      ...config.cliPath !== void 0 ? { cliPath: str(config.cliPath) } : {}
    };
  }
  return trimmed;
}
function migrateRetiredModels(providers) {
  const migrated = { ...providers };
  for (const [id2, replacements] of Object.entries(RETIRED_MODELS)) {
    const config = migrated[id2];
    const replacement = config?.model ? replacements[config.model] : void 0;
    if (replacement) migrated[id2] = { ...config, model: replacement };
  }
  return migrated;
}
function resolveAiSettings(stored, defaults) {
  const settings = isRecord(stored) ? stored : {};
  const readUrl = readUrlSettingsOf(settings.readUrl ?? defaults.readUrl);
  const storedProviders = isRecord(settings.providers) ? settings.providers : void 0;
  if (!storedProviders) {
    if (settings.apiKey) {
      defaults.providers.custom = {
        apiKey: str(settings.apiKey),
        model: str(settings.model),
        baseUrl: str(settings.baseUrl) || "https://api.openai.com/v1"
      };
    }
    return resolveCustomEndpoints(readUrl ? { ...defaults, readUrl } : defaults);
  }
  return resolveCustomEndpoints({
    provider: settings.provider ?? defaults.provider,
    customEndpoints: settings.customEndpoints,
    customEndpoint: settings.customEndpoint,
    ...readUrl ? { readUrl } : {},
    // Trim before migrating: a pasted " deepseek-reasoner " must still hit
    // the retired-id remap instead of being sent to the API verbatim.
    providers: migrateRetiredModels(
      trimConfigs(mergeProviderConfigs(defaults.providers, storedProviders))
    ),
    media: resolveAiMediaSettings(settings.media ?? defaults.media),
    search: resolveAiSearchSettings(settings.search ?? defaults.search),
    meteredAccepted: sanitizeMeteredAccepted(settings.meteredAccepted ?? defaults.meteredAccepted),
    headlessSubscriptionEnabled: headlessSubscriptionOn({
      headlessSubscriptionEnabled: settings.headlessSubscriptionEnabled ?? defaults.headlessSubscriptionEnabled,
      headlessSubscriptionConsentVersion: settings.headlessSubscriptionConsentVersion ?? defaults.headlessSubscriptionConsentVersion
    }),
    headlessSubscriptionConsentVersion: headlessConsentVersionOf(
      settings.headlessSubscriptionConsentVersion ?? defaults.headlessSubscriptionConsentVersion
    ),
    subscriptionNoticeSeen: (settings.subscriptionNoticeSeen ?? defaults.subscriptionNoticeSeen) === true,
    // clamped on read: a hand-edited settings file with an absurd cap must not be
    // forwarded to the endpoint verbatim
    ...settings.maxOutputTokens !== void 0 || defaults.maxOutputTokens !== void 0 ? {
      maxOutputTokens: clampMaxOutputTokens(
        settings.maxOutputTokens ?? defaults.maxOutputTokens
      )
    } : {}
  });
}
function isSubscriptionProvider(id2) {
  return AI_SUBSCRIPTION_PROVIDERS.includes(id2);
}
function subscriptionConnection(settings, status) {
  if (!status) return null;
  if (status.state === "ready") return "subscription";
  if (status.state === "metered" && status.meteredAccepted === true && settings.meteredAccepted?.[status.provider] === true) {
    return "metered";
  }
  return null;
}
function isKeyProviderConfigured(settings, provider) {
  if (isSubscriptionProvider(provider)) return false;
  const meta = AI_PROVIDERS.find((m) => m.id === provider);
  const config = settings.providers?.[provider];
  if (!meta || !config) return false;
  if (!config.model?.trim()) return false;
  if (meta.needsBaseUrl) return !!config.baseUrl?.trim();
  return !!config.apiKey?.trim();
}
function providerSelectionOf(settings) {
  const stored = settings.provider;
  return AI_PROVIDERS.find((m) => m.id === stored)?.id ?? "auto";
}
const SUBSCRIPTION_BLOCKERS = {
  checking: { reason: "checking", errorKind: "not-connected" },
  "not-installed": { reason: "not-installed", errorKind: "not-installed" },
  "signed-out": { reason: "signed-out", errorKind: "signed-out" },
  metered: { reason: "metered-not-accepted", errorKind: "metered-not-accepted" },
  error: { reason: "error", errorKind: "not-connected" }
};
function selectAiProvider(settings, statuses) {
  const selection = providerSelectionOf(settings);
  if (selection === "auto") {
    let ready;
    for (const id2 of AI_SUBSCRIPTION_PROVIDERS) {
      const state2 = statuses[id2]?.state ?? "checking";
      if (state2 === "ready") ready = id2;
      if (state2 === "ready" || state2 === "checking") break;
    }
    return ready ? { connected: true, provider: ready, metered: false } : {
      connected: false,
      selection,
      reason: "no-subscription",
      errorKind: "not-connected"
    };
  }
  if (!isSubscriptionProvider(selection)) {
    return isKeyProviderConfigured(settings, selection) ? { connected: true, provider: selection, metered: false } : {
      connected: false,
      selection,
      provider: selection,
      reason: "not-configured",
      errorKind: "not-connected"
    };
  }
  const status = statuses[selection];
  const connection = subscriptionConnection(settings, status);
  if (connection) {
    return { connected: true, provider: selection, metered: connection === "metered" };
  }
  const state = !status || status.state === "ready" ? "checking" : status.state;
  return {
    connected: false,
    selection,
    provider: selection,
    ...SUBSCRIPTION_BLOCKERS[state],
    ...state === "error" && status?.error ? { detail: status.error } : {}
  };
}
const SUBSCRIPTION_MIN_VERSIONS = {
  "claude-code": "2.1.248",
  codex: null
};
const SUBSCRIPTION_UPDATE_COMMANDS = {
  "claude-code": "claude update",
  codex: null
};
function subscriptionVersionAtLeast(version, minimum) {
  const have = version.split(".").map(Number);
  const need = minimum.split(".").map(Number);
  for (let index = 0; index < need.length; index++) {
    const difference = (have[index] ?? 0) - (need[index] ?? 0);
    if (difference !== 0) return difference > 0;
  }
  return true;
}
function checkingSubscriptionStatus(provider) {
  return { provider, state: "checking", meteredAccepted: false };
}
function subscriptionStatusErrorKind(status) {
  if (status.state !== "error") return null;
  const text = status.error ?? "";
  if (text.startsWith("needs-update:")) return "needs-update";
  if (text.startsWith("timeout:")) return "timeout";
  return "failed";
}
function subscriptionNeedsUpdate(status) {
  if (subscriptionStatusErrorKind(status) !== "needs-update") return null;
  const minimum = SUBSCRIPTION_MIN_VERSIONS[status.provider];
  const command = SUBSCRIPTION_UPDATE_COMMANDS[status.provider];
  const version = status.version;
  if (!minimum || !command || !version) return null;
  if (subscriptionVersionAtLeast(version, minimum)) return null;
  return { version, minimum, command };
}
function checkingSubscriptionStatuses() {
  return {
    "claude-code": checkingSubscriptionStatus("claude-code"),
    codex: checkingSubscriptionStatus("codex")
  };
}
function metaOf(id2) {
  return AI_PROVIDERS.find((m) => m.id === id2);
}
({
  "claude-code": {
    meta: metaOf("claude-code")
  },
  codex: {
    meta: metaOf("codex")
  },
  anthropic: {
    meta: metaOf("anthropic")
  },
  gemini: {
    meta: metaOf("gemini")
  },
  deepseek: {
    meta: metaOf("deepseek")
  },
  openai: {
    meta: metaOf("openai")
  },
  kimi: {
    meta: metaOf("kimi")
  },
  glm: {
    meta: metaOf("glm")
  },
  qwen: {
    meta: metaOf("qwen")
  },
  doubao: {
    meta: metaOf("doubao")
  },
  mimo: {
    meta: metaOf("mimo")
  },
  hunyuan: {
    meta: metaOf("hunyuan")
  },
  ling: {
    meta: metaOf("ling")
  },
  spark: {
    meta: metaOf("spark")
  },
  longcat: {
    meta: metaOf("longcat")
  },
  minimax: {
    meta: metaOf("minimax")
  },
  xai: {
    meta: metaOf("xai")
  },
  mistral: {
    meta: metaOf("mistral")
  },
  openrouter: {
    meta: metaOf("openrouter")
  },
  requesty: {
    meta: metaOf("requesty")
  },
  opper: {
    meta: metaOf("opper")
  },
  cheaperinference: {
    meta: metaOf("cheaperinference")
  },
  atlascloud: {
    meta: metaOf("atlascloud")
  },
  "opencode-zen": {
    meta: metaOf("opencode-zen")
  },
  "opencode-go": {
    meta: metaOf("opencode-go")
  },
  custom: {
    meta: metaOf("custom")
  }
});
const zh$2 = {
  aiAssistant: "AI 助手",
  cardChecking: "正在检查…",
  cardNotInstalled: "未安装",
  cardSignedOut: "未登录",
  cardSigningIn: "正在登录…",
  cardReady: "已连接",
  cardReadyPlan: "已连接 · {plan}",
  cardMetered: "已登录，但不是订阅方式",
  cardMeteredAccepted: "使用中 · 按用量计费",
  cardError: "无法检查连接状态",
  cardErrNeedsUpdate: "此电脑上的 {provider} 程序版本过低。请更新后重新检查。",
  cardErrNeedsUpdateVersion: "此电脑上的 {provider} 程序（{version}）版本过低，需要 {minimum} 或更高版本。请在终端中运行 {command}，然后重新检查。",
  cardErrNeedsUpdatePath: "此应用运行的文件：",
  cardErrNeedsUpdateWindows: "在 WSL（Ubuntu）或其他文件夹中更新 {provider} 不会更改此文件。请在 Windows PowerShell 中运行 {command}。",
  cardErrTimeout: "{provider} 程序未及时响应。请稍后重新检查。",
  cardErrFailed: "检查 {provider} 时出现问题。请重新检查。",
  actionInstall: "安装",
  actionLogin: "登录",
  actionLoginWindow: "浏览器没有打开，或显示了代码？",
  actionRecheck: "重新检查",
  actionAcceptMetered: "仍然使用",
  actionInstallHelp: "官方安装说明",
  actionOpenSettings: "打开设置",
  actionDismiss: "关闭",
  actionSwitchAccount: "使用其他账户登录",
  actionLogout: "退出登录",
  installNote: "将在新的终端窗口中运行 {vendor} 的官方安装命令。",
  loginNote: "打开的登录页面由 {vendor} 提供。",
  signingInBrowserNote: "请在打开的浏览器中登录你的 {vendor} 账户并允许访问。完成后会自动连接。",
  signingInWindowNote: "如果浏览器没有打开，请复制刚打开的窗口中显示的网址，在浏览器中打开。浏览器显示代码时，请复制它，在该窗口中粘贴一次，然后按 Enter。粘贴的代码可能不会显示在窗口中。",
  meteredWarning: "这不是订阅，而是按实际用量收费。",
  meteredMeaning: "当前登录使用的是 API 密钥或按量付费账户，或者无法确认登录方式。选择“仍然使用”后，AI 将通过此连接运行，每次请求都会向该账户计费。",
  connectTitle: "连接 AI 即可开始使用",
  connectBody: "AI 使用你已有的 Claude 或 Codex 订阅运行，无需 API 密钥。",
  connectProviderTitle: "{provider} 连接目前无法使用",
  connectKeyBody: "{provider} 的设置尚未完成。请在设置中完成配置，或选择其他 AI。",
  errNotConnected: "尚未连接任何 AI。请先连接 Claude 或 Codex 订阅，或连接免费 AI。",
  errNotInstalled: "在这台电脑上找不到 {provider} 程序。",
  errSignedOut: "{provider} 的登录已失效。请重新登录后继续。",
  errRateLimit: "{provider} 的订阅额度已用完。",
  errRateLimitReset: "{provider} 的订阅额度已用完，将于 {time} 重置。",
  errUnsafeTools: "{provider} 程序启动时带有自身的工具，为安全起见已停止本次运行。",
  errMeteredNotAccepted: "{provider} 连接是按量付费的登录，你尚未允许使用。请在连接设置中选择“仍然使用”。",
  errNeedsUpdate: "{provider} 程序版本过低，不支持此功能。请更新后重试。",
  errHeadlessLimit: "自动调用已达到每小时上限。",
  errHeadlessLimitReset: "自动调用已达到每小时上限，{time} 后可再次使用。",
  connectFreeHint: "没有订阅？在设置中大约一分钟就能连接免费 AI。",
  actionConnectFree: "连接免费 AI",
  errFreeLimit: "今日免费额度已用完。请明天再试，或在设置中选择其他 AI。",
  errFreeLimitReset: "今日免费额度已用完。{time} 后可再次使用。",
  continueWith: "改用 {provider} 继续",
  continueMeteredNote: "{provider} 连接不是订阅：继续使用将按用量收费。",
  usageLine: "已用 {percent}% · {time} 重置",
  usageWindowFiveHour: "5 小时额度",
  usageWindowSevenDay: "7 天额度",
  noticeTitle: "使用订阅运行 AI 之前",
  noticeSend: "文档内容和对话会以你本人的账户发送给 Anthropic 或 OpenAI。每次请求也会附上设为“自动使用”的每个技能的名称、标题和说明；使用的技能内容和 AI 读取的技能文件也会一并发送。",
  noticeTraining: "这些内容是否用于 AI 训练，取决于你在该公司账户中的设置。",
  noticeCodexHistory: "本应用会关闭 Codex 的对话历史保存，但 Codex 仍可能在这台电脑上保留自己的诊断日志。",
  noticePdfWholeDocument: "在 PDF 编辑器中，AI 页面识读和文档翻译可能会发送页面图片和整份文档的文字。",
  noticeAck: "知道了",
  codexNotice: "在应用中使用 Codex 订阅并非 OpenAI 官方推荐的方式。",
  truncatedNotice: "输入内容过长，已截去一部分后发送。",
  pickerAuto: "自动",
  pickerAutoUsing: "自动 · {provider}",
  pickerAutoUsingModel: "自动 · {provider} · {model}",
  pickerDefaultModel: "默认模型",
  pickerDefaultModelNamed: "默认模型 · {model}",
  pickerSubscription: "订阅",
  pickerPaid: "付费",
  pickerPaidTitle: "按用量收费，不包含在订阅内",
  pickerNotConnected: "连接 AI",
  guideQuestion: "你现在在用哪种 AI？",
  guidePathClaudeTitle: "我有 Claude 付费订阅",
  guidePathClaudeBody: "需要 Pro 或 Max 套餐。免费的 Claude 账户无法连接。",
  guidePathCodexTitle: "我在用 ChatGPT",
  guidePathCodexBody: "用你的 ChatGPT 账户登录 OpenAI 的 Codex 程序来使用。免费套餐可用量很少。",
  guidePathFreeTitle: "都还没有",
  guidePathFreeBody: "大约一分钟就能连接免费 AI。免费使用期间，你发送的内容可能会被该公司用于改进其 AI。",
  guideBack: "选择其他方式",
  guideBadgeReady: "已连接",
  guideBadgeInstalled: "已安装",
  guideBadgeCheck: "需要检查",
  guideStepsLabel: "连接步骤",
  stepInstall: "安装程序",
  stepLogin: "登录",
  stepReady: "连接完成",
  installReturnNote: "在那个窗口中安装完成后，请回到这里。应用会自动重新检查。",
  loginHowNote: "按下后会打开浏览器。用你的 {vendor} 账户登录并点击允许，就会自动完成连接。",
  signingInStalledNote: "浏览器没有打开，或者显示了代码？请用下面的按钮打开登录窗口。把窗口中显示的网址粘贴到浏览器，或把浏览器中的代码粘贴到窗口里即可。",
  actionLoginWindowOpen: "打开登录窗口",
  actionCancelLogin: "取消登录",
  actionUpdate: "更新",
  updateNote: "按下后会在新窗口中运行 {vendor} 的官方更新。在那个窗口中更新完成后，请回到这里。",
  guideInfoHint: "还是不行？复制连接信息，发给帮助你的人。其中不包含账户和文件路径。",
  actionCopyInfo: "复制求助信息",
  copyInfoDone: "已复制"
};
const en$2 = {
  aiAssistant: "AI Assistant",
  cardChecking: "Checking…",
  cardNotInstalled: "Not installed",
  cardSignedOut: "Not signed in",
  cardSigningIn: "Signing in…",
  cardReady: "Connected",
  cardReadyPlan: "Connected · {plan}",
  cardMetered: "Signed in, but not with a subscription",
  cardMeteredAccepted: "In use · charged by usage",
  cardError: "The connection could not be checked",
  cardErrNeedsUpdate: "The {provider} program on this PC is too old. Update it, then check again.",
  cardErrNeedsUpdateVersion: "The {provider} program on this PC ({version}) is too old; {minimum} or newer is needed. Run {command} in a terminal, then check again.",
  cardErrNeedsUpdatePath: "The file this app runs:",
  cardErrNeedsUpdateWindows: "Updating {provider} inside WSL (Ubuntu) or in another folder does not change this file. Run {command} in Windows PowerShell.",
  cardErrTimeout: "The {provider} program did not answer in time. Check again in a moment.",
  cardErrFailed: "Something went wrong while checking {provider}. Check again.",
  actionInstall: "Install",
  actionLogin: "Sign in",
  actionLoginWindow: "Browser did not open, or shows a code?",
  actionRecheck: "Check again",
  actionAcceptMetered: "Use anyway",
  actionInstallHelp: "Official install guide",
  actionOpenSettings: "Open settings",
  actionDismiss: "Dismiss",
  actionSwitchAccount: "Sign in with another account",
  actionLogout: "Sign out",
  installNote: "{vendor}'s official install command runs in a new terminal window.",
  loginNote: "The sign-in page that opens is {vendor}'s own.",
  signingInBrowserNote: "Sign in to your {vendor} account in the browser that opened and allow access. It connects by itself when you are done.",
  signingInWindowNote: "If the browser did not open, copy the address shown in the window that just opened and open it in your browser. When the browser shows a code, copy it, paste it once into that window, and press Enter. The pasted code may not appear in the window.",
  meteredWarning: "This is not a subscription: you are charged for what you use.",
  meteredMeaning: 'This login is an API key or a pay-as-you-go account, or its type could not be confirmed. "Use anyway" lets AI run on this connection, and every request is billed to that account.',
  connectTitle: "Connect an AI to get started",
  connectBody: "AI runs on the Claude or Codex subscription you already have. No API key is needed.",
  connectProviderTitle: "The {provider} connection cannot be used right now",
  connectKeyBody: "The {provider} setup is not finished. Complete it in Settings, or choose another AI.",
  errNotConnected: "No AI is connected. Connect a Claude or Codex subscription, or a free AI, first.",
  errNotInstalled: "The {provider} program was not found on this PC.",
  errSignedOut: "The {provider} sign-in has expired. Sign in again to continue.",
  errRateLimit: "The {provider} subscription limit has been used up.",
  errRateLimitReset: "The {provider} subscription limit has been used up. It resets at {time}.",
  errUnsafeTools: "The {provider} program started with its own tools turned on, so the run was stopped for safety.",
  errMeteredNotAccepted: 'The {provider} connection is a pay-as-you-go login that you have not allowed yet. Choose "Use anyway" in the connection settings to use it.',
  errNeedsUpdate: "The {provider} program is too old for this feature. Update it and try again.",
  errHeadlessLimit: "The hourly limit for automatic requests has been reached.",
  errHeadlessLimitReset: "The hourly limit for automatic requests has been reached. Requests are possible again at {time}.",
  connectFreeHint: "No subscription? You can connect a free AI in Settings in about a minute.",
  actionConnectFree: "Connect a free AI",
  errFreeLimit: "Today's free allowance is used up. Try again tomorrow, or choose another AI in Settings.",
  errFreeLimitReset: "Today's free allowance is used up. You can use it again at {time}.",
  continueWith: "Continue with {provider}",
  continueMeteredNote: "The {provider} connection is not a subscription: continuing is charged by usage.",
  usageLine: "{percent}% used · resets at {time}",
  usageWindowFiveHour: "5-hour limit",
  usageWindowSevenDay: "7-day limit",
  noticeTitle: "Before you use AI with your subscription",
  noticeSend: "Document content and your conversation are sent to Anthropic or OpenAI under your own account. Each request also carries the name, title and description of every skill set to “AI decides”; skills in use, and skill files the AI reads, go along with them.",
  noticeTraining: "Whether that content is used to train AI is decided by your own account settings at that company.",
  noticeCodexHistory: "This app turns off conversation history saving in Codex, but Codex may still keep its own diagnostic logs on this PC.",
  noticePdfWholeDocument: "In the PDF editor, AI page reading and document translation may send page images and the whole text of the document.",
  noticeAck: "Got it",
  codexNotice: "Using a Codex subscription inside an app is not a method officially recommended by OpenAI.",
  truncatedNotice: "The input was too long, so part of it was cut off before sending.",
  pickerAuto: "Automatic",
  pickerAutoUsing: "Automatic · {provider}",
  pickerAutoUsingModel: "Automatic · {provider} · {model}",
  pickerDefaultModel: "Default model",
  pickerDefaultModelNamed: "Default model · {model}",
  pickerSubscription: "Subscription",
  pickerPaid: "Paid",
  pickerPaidTitle: "Charged by usage, not covered by a subscription",
  pickerNotConnected: "Connect AI",
  guideQuestion: "Which AI do you already use?",
  guidePathClaudeTitle: "I pay for Claude",
  guidePathClaudeBody: "Needs a Pro or Max plan. A free Claude account cannot connect.",
  guidePathCodexTitle: "I use ChatGPT",
  guidePathCodexBody: "Sign in to OpenAI's Codex program with your ChatGPT account. The free plan allows only a little use.",
  guidePathFreeTitle: "Neither yet",
  guidePathFreeBody: "Connect a free AI in about a minute. While you use it for free, what you send may be used to improve that company's AI.",
  guideBack: "Choose another way",
  guideBadgeReady: "Connected",
  guideBadgeInstalled: "Installed",
  guideBadgeCheck: "Needs attention",
  guideStepsLabel: "Connection steps",
  stepInstall: "Install the program",
  stepLogin: "Sign in",
  stepReady: "Connected",
  installReturnNote: "When the install has finished in that window, come back here. The app checks again by itself.",
  loginHowNote: "A browser opens when you press it. Sign in with your {vendor} account and press Allow; the connection finishes by itself.",
  signingInStalledNote: "The browser did not open, or it shows a code? Open the sign-in window with the button below. Paste the address shown there into your browser, or paste the browser's code into the window.",
  actionLoginWindowOpen: "Open the sign-in window",
  actionCancelLogin: "Cancel sign-in",
  actionUpdate: "Update",
  updateNote: "{vendor}'s official update runs in a new window when you press it. When it has finished there, come back here.",
  guideInfoHint: "Still stuck? Copy the connection details and send them to whoever is helping you. They contain no account and no file paths.",
  actionCopyInfo: "Copy details for help",
  copyInfoDone: "Copied"
};
const ja$2 = {
  aiAssistant: "AI アシスタント",
  cardChecking: "確認中…",
  cardNotInstalled: "未インストール",
  cardSignedOut: "未ログイン",
  cardSigningIn: "ログイン中…",
  cardReady: "接続済み",
  cardReadyPlan: "接続済み · {plan}",
  cardMetered: "ログイン済みですが、サブスクリプションではありません",
  cardMeteredAccepted: "使用中 · 従量課金",
  cardError: "接続を確認できませんでした",
  cardErrNeedsUpdate: "この PC の {provider} のプログラムが古すぎます。更新してから、もう一度確認してください。",
  cardErrNeedsUpdateVersion: "この PC の {provider} のプログラム（{version}）が古すぎます。{minimum} 以降が必要です。ターミナルで {command} を実行してから、もう一度確認してください。",
  cardErrNeedsUpdatePath: "このアプリが実行するファイル:",
  cardErrNeedsUpdateWindows: "WSL（Ubuntu）や別のフォルダーにある {provider} を更新しても、このファイルは変わりません。Windows PowerShell で {command} を実行してください。",
  cardErrTimeout: "{provider} のプログラムから時間内に応答がありませんでした。しばらくしてから、もう一度確認してください。",
  cardErrFailed: "{provider} の確認中に問題が発生しました。もう一度確認してください。",
  actionInstall: "インストール",
  actionLogin: "ログイン",
  actionLoginWindow: "ブラウザーが開かない、またはコードが表示されましたか？",
  actionRecheck: "再確認",
  actionAcceptMetered: "それでも使用",
  actionInstallHelp: "公式のインストール手順",
  actionOpenSettings: "設定を開く",
  actionDismiss: "閉じる",
  actionSwitchAccount: "別のアカウントでログイン",
  actionLogout: "ログアウト",
  installNote: "{vendor} の公式インストールコマンドが新しいターミナルウィンドウで実行されます。",
  loginNote: "開くログイン画面は {vendor} のものです。",
  signingInBrowserNote: "開いたブラウザーで {vendor} のアカウントにログインし、アクセスを許可してください。終わると自動で接続されます。",
  signingInWindowNote: "ブラウザーが開かなかった場合は、いま開いたウィンドウに表示されたアドレスをコピーしてブラウザーで開いてください。ブラウザーにコードが表示されたら、コピーしてそのウィンドウに一度だけ貼り付け、Enter キーを押してください。貼り付けたコードはウィンドウに表示されないことがあります。",
  meteredWarning: "サブスクリプションではなく、使った分だけ料金が発生します。",
  meteredMeaning: "API キーまたは従量課金のアカウントでログインしているか、ログイン方法を確認できませんでした。「それでも使用」を選ぶと AI がこの接続で動作し、リクエストのたびにそのアカウントへ課金されます。",
  connectTitle: "AI を接続して始めましょう",
  connectBody: "お持ちの Claude または Codex のサブスクリプションで AI を利用します。API キーは不要です。",
  connectProviderTitle: "{provider} の接続は現在使用できません",
  connectKeyBody: "{provider} の設定がまだ完了していません。設定で完了するか、別の AI を選んでください。",
  errNotConnected: "接続されている AI がありません。先に Claude または Codex のサブスクリプションか、無料の AI を接続してください。",
  errNotInstalled: "この PC で {provider} のプログラムが見つかりませんでした。",
  errSignedOut: "{provider} のログインが切れました。もう一度ログインしてから続けてください。",
  errRateLimit: "{provider} のサブスクリプションの上限に達しました。",
  errRateLimitReset: "{provider} のサブスクリプションの上限に達しました。{time} にリセットされます。",
  errUnsafeTools: "{provider} のプログラムが独自のツールを有効にしたまま起動したため、安全のため実行を停止しました。",
  errMeteredNotAccepted: "{provider} の接続は従量課金のログインで、まだ許可されていません。接続設定で「それでも使用」を選ぶと使えます。",
  errNeedsUpdate: "{provider} のプログラムが古く、この機能を利用できません。更新してからもう一度お試しください。",
  errHeadlessLimit: "自動呼び出しの 1 時間あたりの上限に達しました。",
  errHeadlessLimitReset: "自動呼び出しの 1 時間あたりの上限に達しました。{time} から再び利用できます。",
  connectFreeHint: "サブスクリプションがなくても、設定から 1 分ほどで無料の AI を接続できます。",
  actionConnectFree: "無料の AI を接続",
  errFreeLimit: "今日の無料利用分を使い切りました。明日もう一度お試しいただくか、設定で別の AI を選んでください。",
  errFreeLimitReset: "今日の無料利用分を使い切りました。{time} から再び利用できます。",
  continueWith: "{provider} で続行",
  continueMeteredNote: "{provider} の接続はサブスクリプションではありません。続行すると使った分だけ料金が発生します。",
  usageLine: "{percent}% 使用 · {time} にリセット",
  usageWindowFiveHour: "5 時間の上限",
  usageWindowSevenDay: "7 日間の上限",
  noticeTitle: "サブスクリプションで AI を使う前に",
  noticeSend: "文書の内容と会話は、ご自身のアカウントで Anthropic または OpenAI に送信されます。リクエストごとに「AI に任せる」にしたスキルの名前・タイトル・説明も送られ、使うスキルの内容と、AI が読んだスキルのファイルも一緒に送信されます。",
  noticeTraining: "その内容が AI の学習に使われるかどうかは、その会社でのご自身のアカウント設定によって決まります。",
  noticeCodexHistory: "このアプリは Codex の会話履歴の保存をオフにしますが、Codex が独自の診断ログをこの PC に残す場合があります。",
  noticePdfWholeDocument: "PDF エディターでは、AI によるページの読み取りと文書の翻訳で、ページの画像と文書全体のテキストが送信されることがあります。",
  noticeAck: "わかりました",
  codexNotice: "アプリ内で Codex のサブスクリプションを使うことは、OpenAI が公式に推奨している方法ではありません。",
  truncatedNotice: "入力が長すぎたため、一部を切り詰めて送信しました。",
  pickerAuto: "自動",
  pickerAutoUsing: "自動 · {provider}",
  pickerAutoUsingModel: "自動 · {provider} · {model}",
  pickerDefaultModel: "既定のモデル",
  pickerDefaultModelNamed: "既定のモデル · {model}",
  pickerSubscription: "サブスクリプション",
  pickerPaid: "有料",
  pickerPaidTitle: "サブスクリプション対象外で、使った分だけ課金されます",
  pickerNotConnected: "AI を接続",
  guideQuestion: "いま使っている AI はありますか？",
  guidePathClaudeTitle: "Claude の有料サブスクリプションがあります",
  guidePathClaudeBody: "Pro または Max プランが必要です。無料の Claude アカウントでは接続できません。",
  guidePathCodexTitle: "ChatGPT を使っています",
  guidePathCodexBody: "ChatGPT のアカウントで OpenAI の Codex プログラムにログインして使います。無料プランで使える量はわずかです。",
  guidePathFreeTitle: "まだありません",
  guidePathFreeBody: "無料の AI を 1 分ほどで接続できます。無料で使っている間に送った内容は、その会社の AI の改善に使われることがあります。",
  guideBack: "別の方法を選ぶ",
  guideBadgeReady: "接続済み",
  guideBadgeInstalled: "インストール済み",
  guideBadgeCheck: "要確認",
  guideStepsLabel: "接続の手順",
  stepInstall: "プログラムのインストール",
  stepLogin: "ログイン",
  stepReady: "接続完了",
  installReturnNote: "そのウィンドウでインストールが終わったら、この画面に戻ってください。アプリが自動でもう一度確認します。",
  loginHowNote: "押すとブラウザーが開きます。{vendor} のアカウントでログインして「許可」を押すと、自動で接続されます。",
  signingInStalledNote: "ブラウザーが開かない、または画面にコードが表示されましたか？下のボタンでログインウィンドウを開いてください。ウィンドウに表示されたアドレスをブラウザーに貼り付けるか、ブラウザーに表示されたコードをウィンドウに貼り付けてください。",
  actionLoginWindowOpen: "ログインウィンドウを開く",
  actionCancelLogin: "ログインをキャンセル",
  actionUpdate: "更新",
  updateNote: "押すと {vendor} の公式の更新が新しいウィンドウで実行されます。そのウィンドウで更新が終わったら、この画面に戻ってください。",
  guideInfoHint: "それでもうまくいきませんか？接続情報をコピーして、手伝ってくれる人に送ってください。アカウントとファイルのパスは含まれません。",
  actionCopyInfo: "サポート用の情報をコピー",
  copyInfoDone: "コピーしました"
};
const ko$2 = {
  aiAssistant: "AI 도우미",
  cardChecking: "확인 중…",
  cardNotInstalled: "설치되지 않음",
  cardSignedOut: "로그인 필요",
  cardSigningIn: "로그인하는 중…",
  cardReady: "연결됨",
  cardReadyPlan: "연결됨 · {plan}",
  cardMetered: "구독이 아닌 방식으로 로그인됨",
  cardMeteredAccepted: "사용 중 · 쓴 만큼 요금 발생",
  cardError: "연결을 확인하지 못했습니다",
  cardErrNeedsUpdate: "이 PC의 {provider} 프로그램 버전이 낮습니다. 업데이트한 뒤 다시 확인하세요.",
  cardErrNeedsUpdateVersion: "이 PC의 {provider} 프로그램({version})이 오래되었습니다. {minimum} 이상이 필요합니다. 터미널에서 {command}를 실행한 뒤 다시 확인하세요.",
  cardErrNeedsUpdatePath: "이 앱이 실행하는 파일:",
  cardErrNeedsUpdateWindows: "WSL(Ubuntu)이나 다른 폴더에 설치된 {provider}를 업데이트해도 이 파일은 바뀌지 않습니다. Windows PowerShell에서 {command}를 실행하세요.",
  cardErrTimeout: "{provider} 프로그램이 제때 응답하지 않았습니다. 잠시 뒤 다시 확인하세요.",
  cardErrFailed: "{provider} 연결을 확인하는 중에 문제가 생겼습니다. 다시 확인해 보세요.",
  actionInstall: "설치",
  actionLogin: "로그인",
  actionLoginWindow: "브라우저가 안 열리거나 코드가 나오나요?",
  actionRecheck: "다시 확인",
  actionAcceptMetered: "그래도 사용",
  actionInstallHelp: "공식 설치 안내",
  actionOpenSettings: "설정 열기",
  actionDismiss: "닫기",
  actionSwitchAccount: "다른 계정으로 로그인",
  actionLogout: "로그아웃",
  installNote: "{vendor}의 공식 설치 명령이 새 터미널 창에서 실행됩니다.",
  loginNote: "열리는 로그인 화면은 {vendor}의 것입니다.",
  signingInBrowserNote: "열린 브라우저에서 {vendor} 계정으로 로그인하고 허용을 누르세요. 끝나면 저절로 연결됩니다.",
  signingInWindowNote: "브라우저가 안 열렸으면 방금 열린 창에 나온 주소를 복사해 브라우저에서 여세요. 브라우저에 코드가 나오면 복사해서 그 창에 한 번 붙여 넣고 Enter를 누르세요. 붙여 넣은 코드는 창에 보이지 않을 수 있습니다.",
  meteredWarning: "구독이 아니라 쓴 만큼 요금이 나갑니다.",
  meteredMeaning: 'API 키나 종량제 계정으로 로그인되어 있거나, 로그인 방식을 확인하지 못한 상태입니다. "그래도 사용"을 누르면 이 연결로 AI를 쓰게 되고, 요청할 때마다 그 계정에 요금이 청구됩니다.',
  connectTitle: "AI를 쓰려면 먼저 연결하세요",
  connectBody: "이미 쓰고 있는 Claude 또는 Codex 구독으로 AI를 씁니다. API 키는 필요 없습니다.",
  connectProviderTitle: "{provider} 연결을 지금 쓸 수 없습니다",
  connectKeyBody: "{provider} 설정이 아직 끝나지 않았습니다. 설정에서 마무리하거나 다른 AI를 선택하세요.",
  errNotConnected: "연결된 AI가 없습니다. Claude·Codex 구독이나 무료 AI를 먼저 연결하세요.",
  errNotInstalled: "이 PC에서 {provider} 프로그램을 찾지 못했습니다.",
  errSignedOut: "{provider} 로그인이 풀렸습니다. 다시 로그인한 뒤 계속하세요.",
  errRateLimit: "{provider} 구독 한도를 모두 썼습니다.",
  errRateLimitReset: "{provider} 구독 한도를 모두 썼습니다. {time}에 초기화됩니다.",
  errUnsafeTools: "{provider} 프로그램이 자체 도구를 켠 채로 시작되어, 안전을 위해 실행을 멈췄습니다.",
  errMeteredNotAccepted: '{provider} 연결은 쓴 만큼 요금이 나가는 로그인인데 아직 허용하지 않았습니다. 연결 설정에서 "그래도 사용"을 눌러야 쓸 수 있습니다.',
  errNeedsUpdate: "{provider} 프로그램 버전이 낮아 이 기능을 쓸 수 없습니다. 업데이트한 뒤 다시 시도하세요.",
  errHeadlessLimit: "자동 호출의 시간당 한도에 도달했습니다.",
  errHeadlessLimitReset: "자동 호출의 시간당 한도에 도달했습니다. {time}부터 다시 가능합니다.",
  connectFreeHint: "구독이 없나요? 설정에서 무료 AI를 1분 안에 연결할 수 있습니다.",
  actionConnectFree: "무료 AI 연결하기",
  errFreeLimit: "오늘 쓸 수 있는 무료 사용량을 다 썼습니다. 내일 다시 쓰거나 설정에서 다른 AI를 고르세요.",
  errFreeLimitReset: "오늘 쓸 수 있는 무료 사용량을 다 썼습니다. {time}부터 다시 쓸 수 있습니다.",
  continueWith: "{provider}로 계속",
  continueMeteredNote: "{provider} 연결은 구독이 아닙니다. 계속하면 쓴 만큼 요금이 나갑니다.",
  usageLine: "{percent}% 사용 · {time}에 초기화",
  usageWindowFiveHour: "5시간 한도",
  usageWindowSevenDay: "7일 한도",
  noticeTitle: "구독으로 AI를 쓰기 전에",
  noticeSend: '문서 내용과 대화는 사용자 본인 계정으로 Anthropic 또는 OpenAI에 전송됩니다. 요청마다 "스스로 쓰기"로 둔 스킬의 이름·제목·설명이 함께 가고, 쓰는 스킬의 글과 AI가 읽은 스킬 파일도 함께 전송됩니다.',
  noticeTraining: "그 내용이 AI 학습에 쓰이는지는 해당 회사의 사용자 계정 설정에 따라 정해집니다.",
  noticeCodexHistory: "이 앱은 Codex의 대화 기록 저장을 꺼 둡니다. 다만 Codex가 자체 진단 로그를 이 PC에 남길 수 있습니다.",
  noticePdfWholeDocument: "PDF 편집기에서는 AI 페이지 읽기와 문서 번역 때 페이지 그림과 문서 전체의 글이 보내질 수 있습니다.",
  noticeAck: "확인",
  codexNotice: "앱에서 Codex 구독을 쓰는 것은 OpenAI가 공식 권장하는 방식이 아닙니다.",
  truncatedNotice: "입력이 너무 길어 일부를 잘라내고 보냈습니다.",
  pickerAuto: "자동",
  pickerAutoUsing: "자동 · {provider}",
  pickerAutoUsingModel: "자동 · {provider} · {model}",
  pickerDefaultModel: "기본 모델",
  pickerDefaultModelNamed: "기본 모델 · {model}",
  pickerSubscription: "구독",
  pickerPaid: "유료",
  pickerPaidTitle: "구독이 아니라 쓴 만큼 요금이 나가는 연결입니다",
  pickerNotConnected: "AI 연결",
  guideQuestion: "지금 쓰고 있는 AI가 있나요?",
  guidePathClaudeTitle: "Claude 유료 구독이 있어요",
  guidePathClaudeBody: "Pro 또는 Max 요금제가 있어야 합니다. 무료 Claude 계정으로는 연결되지 않습니다.",
  guidePathCodexTitle: "ChatGPT를 써요",
  guidePathCodexBody: "ChatGPT 계정으로 OpenAI의 Codex 프로그램에 로그인해서 씁니다. 무료 요금제는 쓸 수 있는 양이 적습니다.",
  guidePathFreeTitle: "아직 없어요",
  guidePathFreeBody: "무료 AI를 1분 안에 연결할 수 있습니다. 무료로 쓰는 동안 보낸 내용은 그 회사의 AI 개선에 쓰일 수 있습니다.",
  guideBack: "다른 방법 고르기",
  guideBadgeReady: "연결됨",
  guideBadgeInstalled: "설치됨",
  guideBadgeCheck: "확인 필요",
  guideStepsLabel: "연결 단계",
  stepInstall: "프로그램 설치",
  stepLogin: "로그인",
  stepReady: "연결 완료",
  installReturnNote: "창에서 설치가 끝나면 이 화면으로 돌아오세요. 앱이 저절로 다시 확인합니다.",
  loginHowNote: "누르면 브라우저가 열립니다. {vendor} 계정으로 로그인하고 허용을 누르면 저절로 연결됩니다.",
  signingInStalledNote: "브라우저가 열리지 않았거나 화면에 코드가 보이나요? 아래 버튼으로 로그인 창을 여세요. 창에 나온 주소를 브라우저에 붙여 넣거나, 브라우저에 나온 코드를 창에 붙여 넣으면 됩니다.",
  actionLoginWindowOpen: "로그인 창 열기",
  actionCancelLogin: "로그인 취소",
  actionUpdate: "업데이트",
  updateNote: "누르면 {vendor}의 공식 업데이트가 새 창에서 실행됩니다. 창에서 업데이트가 끝나면 이 화면으로 돌아오세요.",
  guideInfoHint: "그래도 안 되나요? 연결 정보를 복사해서 도와줄 사람에게 보내세요. 계정과 파일 경로는 들어가지 않습니다.",
  actionCopyInfo: "도움 요청용 정보 복사",
  copyInfoDone: "복사했습니다"
};
const fr$2 = {
  aiAssistant: "Assistant IA",
  cardChecking: "Vérification…",
  cardNotInstalled: "Non installé",
  cardSignedOut: "Non connecté",
  cardSigningIn: "Connexion en cours…",
  cardReady: "Connecté",
  cardReadyPlan: "Connecté · {plan}",
  cardMetered: "Connecté, mais pas avec un abonnement",
  cardMeteredAccepted: "En service · facturé à l’usage",
  cardError: "Impossible de vérifier la connexion",
  cardErrNeedsUpdate: "Le programme {provider} installé sur ce PC est trop ancien. Mettez-le à jour, puis vérifiez à nouveau.",
  cardErrNeedsUpdateVersion: "Le programme {provider} installé sur ce PC ({version}) est trop ancien ; la version {minimum} ou plus récente est nécessaire. Exécutez {command} dans un terminal, puis vérifiez à nouveau.",
  cardErrNeedsUpdatePath: "Fichier exécuté par cette application :",
  cardErrNeedsUpdateWindows: "Mettre à jour {provider} dans WSL (Ubuntu) ou dans un autre dossier ne modifie pas ce fichier. Exécutez {command} dans Windows PowerShell.",
  cardErrTimeout: "Le programme {provider} n'a pas répondu à temps. Vérifiez à nouveau dans un instant.",
  cardErrFailed: "Un problème est survenu lors de la vérification de {provider}. Vérifiez à nouveau.",
  actionInstall: "Installer",
  actionLogin: "Se connecter",
  actionLoginWindow: "Le navigateur ne s’est pas ouvert ou affiche un code ?",
  actionRecheck: "Vérifier à nouveau",
  actionAcceptMetered: "Utiliser quand même",
  actionInstallHelp: "Guide d’installation officiel",
  actionOpenSettings: "Ouvrir les paramètres",
  actionDismiss: "Fermer",
  actionSwitchAccount: "Se connecter avec un autre compte",
  actionLogout: "Se déconnecter",
  installNote: "La commande d’installation officielle de {vendor} s’exécute dans une nouvelle fenêtre de terminal.",
  loginNote: "La page de connexion qui s’ouvre est celle de {vendor}.",
  signingInBrowserNote: "Connectez-vous à votre compte {vendor} dans le navigateur qui s’est ouvert, puis autorisez l’accès. La connexion se fait d’elle-même une fois terminé.",
  signingInWindowNote: "Si le navigateur ne s’est pas ouvert, copiez l’adresse affichée dans la fenêtre qui vient de s’ouvrir et ouvrez-la dans votre navigateur. Quand le navigateur affiche un code, copiez-le, collez-le une seule fois dans cette fenêtre et appuyez sur Entrée. Le code collé peut ne pas s’afficher dans la fenêtre.",
  meteredWarning: "Ce n’est pas un abonnement : vous payez ce que vous consommez.",
  meteredMeaning: "Cette connexion utilise une clé API ou un compte facturé à l’usage, ou son type n’a pas pu être confirmé. « Utiliser quand même » permet à l’IA de fonctionner avec cette connexion, et chaque requête est facturée à ce compte.",
  connectTitle: "Connectez une IA pour commencer",
  connectBody: "L’IA fonctionne avec l’abonnement Claude ou Codex que vous avez déjà. Aucune clé API n’est nécessaire.",
  connectProviderTitle: "La connexion {provider} n’est pas utilisable pour le moment",
  connectKeyBody: "La configuration de {provider} n’est pas terminée. Terminez-la dans les paramètres ou choisissez une autre IA.",
  errNotConnected: "Aucune IA n’est connectée. Connectez d’abord un abonnement Claude ou Codex, ou une IA gratuite.",
  errNotInstalled: "Le programme {provider} est introuvable sur ce PC.",
  errSignedOut: "La connexion à {provider} a expiré. Reconnectez-vous pour continuer.",
  errRateLimit: "La limite de l’abonnement {provider} est atteinte.",
  errRateLimitReset: "La limite de l’abonnement {provider} est atteinte. Réinitialisation à {time}.",
  errUnsafeTools: "Le programme {provider} a démarré avec ses propres outils activés ; l’exécution a été arrêtée par sécurité.",
  errMeteredNotAccepted: "La connexion {provider} est facturée à l’usage et vous ne l’avez pas encore autorisée. Choisissez « Utiliser quand même » dans les paramètres de connexion pour l’utiliser.",
  errNeedsUpdate: "Le programme {provider} est trop ancien pour cette fonction. Mettez-le à jour puis réessayez.",
  errHeadlessLimit: "La limite horaire des requêtes automatiques est atteinte.",
  errHeadlessLimitReset: "La limite horaire des requêtes automatiques est atteinte. Les requêtes seront de nouveau possibles à {time}.",
  connectFreeHint: "Pas d’abonnement ? Vous pouvez connecter une IA gratuite dans les paramètres en une minute environ.",
  actionConnectFree: "Connecter une IA gratuite",
  errFreeLimit: "Le quota gratuit du jour est épuisé. Réessayez demain ou choisissez une autre IA dans les paramètres.",
  errFreeLimitReset: "Le quota gratuit du jour est épuisé. Vous pourrez de nouveau l’utiliser à {time}.",
  continueWith: "Continuer avec {provider}",
  continueMeteredNote: "La connexion {provider} n’est pas un abonnement : continuer est facturé à l’usage.",
  usageLine: "{percent} % utilisés · réinitialisation à {time}",
  usageWindowFiveHour: "Limite sur 5 heures",
  usageWindowSevenDay: "Limite sur 7 jours",
  noticeTitle: "Avant d’utiliser l’IA avec votre abonnement",
  noticeSend: "Le contenu du document et votre conversation sont envoyés à Anthropic ou à OpenAI sous votre propre compte. Chaque requête contient aussi le nom, le titre et la description de chaque compétence réglée sur « L’IA décide » ; les compétences utilisées et les fichiers de compétence lus par l’IA sont envoyés avec eux.",
  noticeTraining: "L’utilisation de ce contenu pour entraîner l’IA dépend des paramètres de votre propre compte auprès de cette société.",
  noticeCodexHistory: "Cette application désactive l’enregistrement de l’historique des conversations de Codex, mais Codex peut tout de même conserver ses propres journaux de diagnostic sur ce PC.",
  noticePdfWholeDocument: "Dans l’éditeur PDF, la lecture de pages par l’IA et la traduction de documents peuvent envoyer des images des pages et tout le texte du document.",
  noticeAck: "Compris",
  codexNotice: "Utiliser un abonnement Codex dans une application n’est pas une méthode officiellement recommandée par OpenAI.",
  truncatedNotice: "L’entrée était trop longue : une partie a été coupée avant l’envoi.",
  pickerAuto: "Automatique",
  pickerAutoUsing: "Automatique · {provider}",
  pickerAutoUsingModel: "Automatique · {provider} · {model}",
  pickerDefaultModel: "Modèle par défaut",
  pickerDefaultModelNamed: "Modèle par défaut · {model}",
  pickerSubscription: "Abonnement",
  pickerPaid: "Payant",
  pickerPaidTitle: "Facturé à l’usage, non couvert par un abonnement",
  pickerNotConnected: "Connecter l’IA",
  guideQuestion: "Quelle IA utilisez-vous déjà ?",
  guidePathClaudeTitle: "J’ai un abonnement Claude payant",
  guidePathClaudeBody: "Un forfait Pro ou Max est nécessaire. Un compte Claude gratuit ne peut pas se connecter.",
  guidePathCodexTitle: "J’utilise ChatGPT",
  guidePathCodexBody: "Connectez-vous au programme Codex d’OpenAI avec votre compte ChatGPT. Le forfait gratuit ne permet qu’une utilisation limitée.",
  guidePathFreeTitle: "Ni l’un ni l’autre pour l’instant",
  guidePathFreeBody: "Connectez une IA gratuite en une minute environ. Tant que vous l’utilisez gratuitement, ce que vous envoyez peut servir à améliorer l’IA de cette entreprise.",
  guideBack: "Choisir une autre méthode",
  guideBadgeReady: "Connecté",
  guideBadgeInstalled: "Installé",
  guideBadgeCheck: "À vérifier",
  guideStepsLabel: "Étapes de connexion",
  stepInstall: "Installer le programme",
  stepLogin: "Se connecter",
  stepReady: "Connecté",
  installReturnNote: "Une fois l’installation terminée dans cette fenêtre, revenez ici. L’application vérifie à nouveau d’elle-même.",
  loginHowNote: "Un navigateur s’ouvre quand vous cliquez. Connectez-vous avec votre compte {vendor} et cliquez sur Autoriser : la connexion se fait d’elle-même.",
  signingInStalledNote: "Le navigateur ne s’est pas ouvert ou affiche un code ? Ouvrez la fenêtre de connexion avec le bouton ci-dessous. Collez l’adresse qui y est affichée dans votre navigateur, ou collez le code du navigateur dans la fenêtre.",
  actionLoginWindowOpen: "Ouvrir la fenêtre de connexion",
  actionCancelLogin: "Annuler la connexion",
  actionUpdate: "Mettre à jour",
  updateNote: "La mise à jour officielle de {vendor} s’exécute dans une nouvelle fenêtre quand vous cliquez. Une fois terminée, revenez ici.",
  guideInfoHint: "Toujours bloqué ? Copiez les informations de connexion et envoyez-les à la personne qui vous aide. Elles ne contiennent ni compte ni chemin de fichier.",
  actionCopyInfo: "Copier les infos pour obtenir de l’aide",
  copyInfoDone: "Copié"
};
const de$2 = {
  aiAssistant: "KI-Assistent",
  cardChecking: "Wird geprüft…",
  cardNotInstalled: "Nicht installiert",
  cardSignedOut: "Nicht angemeldet",
  cardSigningIn: "Anmeldung läuft…",
  cardReady: "Verbunden",
  cardReadyPlan: "Verbunden · {plan}",
  cardMetered: "Angemeldet, aber nicht mit einem Abonnement",
  cardMeteredAccepted: "In Verwendung · Abrechnung nach Verbrauch",
  cardError: "Die Verbindung konnte nicht geprüft werden",
  cardErrNeedsUpdate: "Das Programm {provider} auf diesem PC ist zu alt. Aktualisieren Sie es und prüfen Sie dann erneut.",
  cardErrNeedsUpdateVersion: "Das Programm {provider} auf diesem PC ({version}) ist zu alt; benötigt wird {minimum} oder neuer. Führen Sie im Terminal {command} aus und prüfen Sie dann erneut.",
  cardErrNeedsUpdatePath: "Von dieser App ausgeführte Datei:",
  cardErrNeedsUpdateWindows: "Wenn Sie {provider} in WSL (Ubuntu) oder in einem anderen Ordner aktualisieren, ändert sich diese Datei nicht. Führen Sie {command} in Windows PowerShell aus.",
  cardErrTimeout: "Das Programm {provider} hat nicht rechtzeitig geantwortet. Prüfen Sie es gleich noch einmal.",
  cardErrFailed: "Bei der Prüfung von {provider} ist ein Problem aufgetreten. Prüfen Sie es erneut.",
  actionInstall: "Installieren",
  actionLogin: "Anmelden",
  actionLoginWindow: "Browser nicht geöffnet oder zeigt er einen Code?",
  actionRecheck: "Erneut prüfen",
  actionAcceptMetered: "Trotzdem verwenden",
  actionInstallHelp: "Offizielle Installationsanleitung",
  actionOpenSettings: "Einstellungen öffnen",
  actionDismiss: "Schließen",
  actionSwitchAccount: "Mit anderem Konto anmelden",
  actionLogout: "Abmelden",
  installNote: "Der offizielle Installationsbefehl von {vendor} wird in einem neuen Terminalfenster ausgeführt.",
  loginNote: "Die Anmeldeseite, die sich öffnet, stammt von {vendor}.",
  signingInBrowserNote: "Melden Sie sich im geöffneten Browser bei Ihrem {vendor}-Konto an und erlauben Sie den Zugriff. Danach wird die Verbindung von selbst hergestellt.",
  signingInWindowNote: "Hat sich der Browser nicht geöffnet, kopieren Sie die Adresse aus dem soeben geöffneten Fenster und öffnen Sie sie im Browser. Zeigt der Browser einen Code, kopieren Sie ihn, fügen Sie ihn einmal in dieses Fenster ein und drücken Sie die Eingabetaste. Der eingefügte Code wird im Fenster möglicherweise nicht angezeigt.",
  meteredWarning: "Das ist kein Abonnement: Abgerechnet wird nach Verbrauch.",
  meteredMeaning: "Diese Anmeldung nutzt einen API-Schlüssel oder ein Konto mit nutzungsbasierter Abrechnung, oder ihre Art ließ sich nicht feststellen. Mit „Trotzdem verwenden“ läuft die KI über diese Verbindung, und jede Anfrage wird diesem Konto berechnet.",
  connectTitle: "KI verbinden, um loszulegen",
  connectBody: "Die KI läuft über Ihr vorhandenes Claude- oder Codex-Abonnement. Ein API-Schlüssel ist nicht nötig.",
  connectProviderTitle: "Die Verbindung {provider} ist derzeit nicht nutzbar",
  connectKeyBody: "Die Einrichtung von {provider} ist noch nicht abgeschlossen. Schließen Sie sie in den Einstellungen ab oder wählen Sie eine andere KI.",
  errNotConnected: "Es ist keine KI verbunden. Verbinden Sie zuerst ein Claude- oder Codex-Abonnement oder eine kostenlose KI.",
  errNotInstalled: "Das Programm {provider} wurde auf diesem PC nicht gefunden.",
  errSignedOut: "Die Anmeldung bei {provider} ist abgelaufen. Melden Sie sich erneut an, um fortzufahren.",
  errRateLimit: "Das Limit des Abonnements {provider} ist aufgebraucht.",
  errRateLimitReset: "Das Limit des Abonnements {provider} ist aufgebraucht. Es wird um {time} zurückgesetzt.",
  errUnsafeTools: "Das Programm {provider} wurde mit eigenen aktivierten Tools gestartet; der Lauf wurde aus Sicherheitsgründen gestoppt.",
  errMeteredNotAccepted: "Die Verbindung {provider} wird nach Verbrauch abgerechnet und ist noch nicht freigegeben. Wählen Sie in den Verbindungseinstellungen „Trotzdem verwenden“, um sie zu nutzen.",
  errNeedsUpdate: "Das Programm {provider} ist für diese Funktion zu alt. Aktualisieren Sie es und versuchen Sie es erneut.",
  errHeadlessLimit: "Das Stundenlimit für automatische Anfragen ist erreicht.",
  errHeadlessLimitReset: "Das Stundenlimit für automatische Anfragen ist erreicht. Anfragen sind ab {time} wieder möglich.",
  connectFreeHint: "Kein Abonnement? In den Einstellungen verbinden Sie in etwa einer Minute eine kostenlose KI.",
  actionConnectFree: "Kostenlose KI verbinden",
  errFreeLimit: "Das kostenlose Kontingent für heute ist aufgebraucht. Versuchen Sie es morgen erneut oder wählen Sie in den Einstellungen eine andere KI.",
  errFreeLimitReset: "Das kostenlose Kontingent für heute ist aufgebraucht. Ab {time} können Sie es wieder nutzen.",
  continueWith: "Mit {provider} fortfahren",
  continueMeteredNote: "Die Verbindung {provider} ist kein Abonnement: Beim Fortfahren wird nach Verbrauch abgerechnet.",
  usageLine: "{percent} % verbraucht · Zurücksetzung um {time}",
  usageWindowFiveHour: "5-Stunden-Limit",
  usageWindowSevenDay: "7-Tage-Limit",
  noticeTitle: "Bevor Sie die KI mit Ihrem Abonnement nutzen",
  noticeSend: "Dokumentinhalte und Ihre Unterhaltung werden über Ihr eigenes Konto an Anthropic oder OpenAI gesendet. Jede Anfrage enthält außerdem Name, Titel und Beschreibung jedes Skills mit der Einstellung „KI entscheidet“; verwendete Skills und Skill-Dateien, die die KI liest, werden mitgesendet.",
  noticeTraining: "Ob diese Inhalte zum Training von KI verwendet werden, bestimmen die Einstellungen Ihres eigenen Kontos bei dem jeweiligen Unternehmen.",
  noticeCodexHistory: "Diese App schaltet das Speichern des Unterhaltungsverlaufs in Codex ab, Codex kann jedoch weiterhin eigene Diagnoseprotokolle auf diesem PC speichern.",
  noticePdfWholeDocument: "Im PDF-Editor können beim KI-Lesen von Seiten und beim Übersetzen von Dokumenten Bilder der Seiten und der gesamte Text des Dokuments gesendet werden.",
  noticeAck: "Verstanden",
  codexNotice: "Ein Codex-Abonnement in einer App zu nutzen, ist keine von OpenAI offiziell empfohlene Methode.",
  truncatedNotice: "Die Eingabe war zu lang; ein Teil wurde vor dem Senden abgeschnitten.",
  pickerAuto: "Automatisch",
  pickerAutoUsing: "Automatisch · {provider}",
  pickerAutoUsingModel: "Automatisch · {provider} · {model}",
  pickerDefaultModel: "Standardmodell",
  pickerDefaultModelNamed: "Standardmodell · {model}",
  pickerSubscription: "Abonnement",
  pickerPaid: "Kostenpflichtig",
  pickerPaidTitle: "Abrechnung nach Verbrauch, nicht durch ein Abonnement gedeckt",
  pickerNotConnected: "KI verbinden",
  guideQuestion: "Welche KI nutzen Sie bereits?",
  guidePathClaudeTitle: "Ich habe ein kostenpflichtiges Claude-Abonnement",
  guidePathClaudeBody: "Ein Pro- oder Max-Tarif ist nötig. Mit einem kostenlosen Claude-Konto ist keine Verbindung möglich.",
  guidePathCodexTitle: "Ich nutze ChatGPT",
  guidePathCodexBody: "Melden Sie sich mit Ihrem ChatGPT-Konto beim Codex-Programm von OpenAI an. Der kostenlose Tarif erlaubt nur wenig Nutzung.",
  guidePathFreeTitle: "Noch keins von beiden",
  guidePathFreeBody: "Verbinden Sie in etwa einer Minute eine kostenlose KI. Solange Sie sie kostenlos nutzen, kann das Gesendete zur Verbesserung der KI dieses Unternehmens verwendet werden.",
  guideBack: "Anderen Weg wählen",
  guideBadgeReady: "Verbunden",
  guideBadgeInstalled: "Installiert",
  guideBadgeCheck: "Prüfung nötig",
  guideStepsLabel: "Verbindungsschritte",
  stepInstall: "Programm installieren",
  stepLogin: "Anmelden",
  stepReady: "Verbunden",
  installReturnNote: "Wenn die Installation in diesem Fenster abgeschlossen ist, kehren Sie hierher zurück. Die App prüft dann von selbst erneut.",
  loginHowNote: "Beim Klicken öffnet sich ein Browser. Melden Sie sich mit Ihrem {vendor}-Konto an und klicken Sie auf Zulassen; die Verbindung wird dann von selbst hergestellt.",
  signingInStalledNote: "Hat sich der Browser nicht geöffnet, oder zeigt er einen Code? Öffnen Sie mit der Schaltfläche unten das Anmeldefenster. Fügen Sie die dort angezeigte Adresse in Ihren Browser ein, oder fügen Sie den Code aus dem Browser in das Fenster ein.",
  actionLoginWindowOpen: "Anmeldefenster öffnen",
  actionCancelLogin: "Anmeldung abbrechen",
  actionUpdate: "Aktualisieren",
  updateNote: "Beim Klicken wird das offizielle Update von {vendor} in einem neuen Fenster ausgeführt. Wenn es dort fertig ist, kehren Sie hierher zurück.",
  guideInfoHint: "Klappt es immer noch nicht? Kopieren Sie die Verbindungsdaten und senden Sie sie an die Person, die Ihnen hilft. Sie enthalten weder Konto noch Dateipfade.",
  actionCopyInfo: "Infos für Hilfe kopieren",
  copyInfoDone: "Kopiert"
};
const es$2 = {
  aiAssistant: "Asistente de IA",
  cardChecking: "Comprobando…",
  cardNotInstalled: "No instalado",
  cardSignedOut: "Sesión no iniciada",
  cardSigningIn: "Iniciando sesión…",
  cardReady: "Conectado",
  cardReadyPlan: "Conectado · {plan}",
  cardMetered: "Sesión iniciada, pero no con una suscripción",
  cardMeteredAccepted: "En uso · se cobra por consumo",
  cardError: "No se pudo comprobar la conexión",
  cardErrNeedsUpdate: "El programa {provider} de este PC es demasiado antiguo. Actualízalo y comprueba de nuevo.",
  cardErrNeedsUpdateVersion: "El programa {provider} de este PC ({version}) es demasiado antiguo; se necesita la {minimum} o posterior. Ejecuta {command} en una terminal y comprueba de nuevo.",
  cardErrNeedsUpdatePath: "Archivo que ejecuta esta aplicación:",
  cardErrNeedsUpdateWindows: "Actualizar {provider} dentro de WSL (Ubuntu) o en otra carpeta no cambia este archivo. Ejecuta {command} en Windows PowerShell.",
  cardErrTimeout: "El programa {provider} no respondió a tiempo. Comprueba de nuevo en un momento.",
  cardErrFailed: "Algo salió mal al comprobar {provider}. Comprueba de nuevo.",
  actionInstall: "Instalar",
  actionLogin: "Iniciar sesión",
  actionLoginWindow: "¿No se abrió el navegador o muestra un código?",
  actionRecheck: "Comprobar de nuevo",
  actionAcceptMetered: "Usar de todos modos",
  actionInstallHelp: "Guía oficial de instalación",
  actionOpenSettings: "Abrir ajustes",
  actionDismiss: "Cerrar",
  actionSwitchAccount: "Iniciar sesión con otra cuenta",
  actionLogout: "Cerrar sesión",
  installNote: "El comando de instalación oficial de {vendor} se ejecuta en una nueva ventana de terminal.",
  loginNote: "La página de inicio de sesión que se abre es la de {vendor}.",
  signingInBrowserNote: "Inicia sesión con tu cuenta de {vendor} en el navegador que se abrió y permite el acceso. Se conecta solo cuando termines.",
  signingInWindowNote: "Si el navegador no se abrió, copia la dirección que aparece en la ventana que se acaba de abrir y ábrela en el navegador. Cuando el navegador muestre un código, cópialo, pégalo una sola vez en esa ventana y pulsa Intro. Es posible que el código pegado no se vea en la ventana.",
  meteredWarning: "Esto no es una suscripción: se cobra según lo que uses.",
  meteredMeaning: "Este inicio de sesión usa una clave de API o una cuenta de pago por consumo, o no se pudo confirmar su tipo. «Usar de todos modos» permite que la IA funcione con esta conexión, y cada solicitud se factura a esa cuenta.",
  connectTitle: "Conecta una IA para empezar",
  connectBody: "La IA funciona con la suscripción de Claude o Codex que ya tienes. No hace falta ninguna clave de API.",
  connectProviderTitle: "La conexión de {provider} no se puede usar ahora",
  connectKeyBody: "La configuración de {provider} no está terminada. Complétala en Ajustes o elige otra IA.",
  errNotConnected: "No hay ninguna IA conectada. Conecta primero una suscripción de Claude o Codex, o una IA gratuita.",
  errNotInstalled: "No se encontró el programa {provider} en este PC.",
  errSignedOut: "La sesión de {provider} ha caducado. Vuelve a iniciar sesión para continuar.",
  errRateLimit: "Se ha agotado el límite de la suscripción de {provider}.",
  errRateLimitReset: "Se ha agotado el límite de la suscripción de {provider}. Se restablece a las {time}.",
  errUnsafeTools: "El programa {provider} se inició con sus propias herramientas activadas, así que la ejecución se detuvo por seguridad.",
  errMeteredNotAccepted: "La conexión de {provider} es de pago por consumo y aún no la has permitido. Elige «Usar de todos modos» en los ajustes de conexión para usarla.",
  errNeedsUpdate: "El programa {provider} es demasiado antiguo para esta función. Actualízalo y vuelve a intentarlo.",
  errHeadlessLimit: "Se alcanzó el límite por hora de solicitudes automáticas.",
  errHeadlessLimitReset: "Se alcanzó el límite por hora de solicitudes automáticas. Volverán a ser posibles a las {time}.",
  connectFreeHint: "¿No tienes suscripción? Puedes conectar una IA gratuita en Ajustes en un minuto aproximadamente.",
  actionConnectFree: "Conectar una IA gratuita",
  errFreeLimit: "Se agotó el uso gratuito de hoy. Vuelve a intentarlo mañana o elige otra IA en Ajustes.",
  errFreeLimitReset: "Se agotó el uso gratuito de hoy. Podrás volver a usarlo a las {time}.",
  continueWith: "Continuar con {provider}",
  continueMeteredNote: "La conexión de {provider} no es una suscripción: continuar se cobra por consumo.",
  usageLine: "{percent} % usado · se restablece a las {time}",
  usageWindowFiveHour: "Límite de 5 horas",
  usageWindowSevenDay: "Límite de 7 días",
  noticeTitle: "Antes de usar la IA con tu suscripción",
  noticeSend: "El contenido del documento y tu conversación se envían a Anthropic u OpenAI con tu propia cuenta. Cada solicitud lleva además el nombre, el título y la descripción de cada habilidad configurada como «Decide la IA»; también se envían las habilidades que se usan y los archivos de habilidad que lee la IA.",
  noticeTraining: "Que ese contenido se use para entrenar IA depende de los ajustes de tu propia cuenta en esa empresa.",
  noticeCodexHistory: "Esta aplicación desactiva el guardado del historial de conversaciones de Codex, pero Codex puede seguir guardando sus propios registros de diagnóstico en este PC.",
  noticePdfWholeDocument: "En el editor de PDF, la lectura de páginas con IA y la traducción de documentos pueden enviar imágenes de las páginas y todo el texto del documento.",
  noticeAck: "Entendido",
  codexNotice: "Usar una suscripción de Codex dentro de una aplicación no es un método recomendado oficialmente por OpenAI.",
  truncatedNotice: "La entrada era demasiado larga, así que se recortó una parte antes de enviarla.",
  pickerAuto: "Automático",
  pickerAutoUsing: "Automático · {provider}",
  pickerAutoUsingModel: "Automático · {provider} · {model}",
  pickerDefaultModel: "Modelo predeterminado",
  pickerDefaultModelNamed: "Modelo predeterminado · {model}",
  pickerSubscription: "Suscripción",
  pickerPaid: "De pago",
  pickerPaidTitle: "Se cobra por consumo, no lo cubre una suscripción",
  pickerNotConnected: "Conectar IA",
  guideQuestion: "¿Qué IA usas ya?",
  guidePathClaudeTitle: "Tengo una suscripción de pago a Claude",
  guidePathClaudeBody: "Necesitas un plan Pro o Max. Una cuenta gratuita de Claude no puede conectarse.",
  guidePathCodexTitle: "Uso ChatGPT",
  guidePathCodexBody: "Inicia sesión en el programa Codex de OpenAI con tu cuenta de ChatGPT. El plan gratuito solo permite un uso reducido.",
  guidePathFreeTitle: "Ninguna todavía",
  guidePathFreeBody: "Conecta una IA gratuita en un minuto aproximadamente. Mientras la uses gratis, lo que envíes puede usarse para mejorar la IA de esa empresa.",
  guideBack: "Elegir otra forma",
  guideBadgeReady: "Conectado",
  guideBadgeInstalled: "Instalado",
  guideBadgeCheck: "Revisar",
  guideStepsLabel: "Pasos de conexión",
  stepInstall: "Instalar el programa",
  stepLogin: "Iniciar sesión",
  stepReady: "Conectado",
  installReturnNote: "Cuando termine la instalación en esa ventana, vuelve aquí. La aplicación vuelve a comprobarlo sola.",
  loginHowNote: "Al pulsarlo se abre un navegador. Inicia sesión con tu cuenta de {vendor} y pulsa Permitir; la conexión se completa sola.",
  signingInStalledNote: "¿No se abrió el navegador o muestra un código? Abre la ventana de inicio de sesión con el botón de abajo. Pega en el navegador la dirección que aparece en ella, o pega en la ventana el código del navegador.",
  actionLoginWindowOpen: "Abrir la ventana de inicio de sesión",
  actionCancelLogin: "Cancelar inicio de sesión",
  actionUpdate: "Actualizar",
  updateNote: "Al pulsarlo, la actualización oficial de {vendor} se ejecuta en una ventana nueva. Cuando termine allí, vuelve aquí.",
  guideInfoHint: "¿Sigue sin funcionar? Copia los datos de conexión y envíalos a quien te esté ayudando. No incluyen ninguna cuenta ni rutas de archivos.",
  actionCopyInfo: "Copiar datos para pedir ayuda",
  copyInfoDone: "Copiado"
};
const th$2 = {
  aiAssistant: "ผู้ช่วย AI",
  cardChecking: "กำลังตรวจสอบ…",
  cardNotInstalled: "ยังไม่ได้ติดตั้ง",
  cardSignedOut: "ยังไม่ได้เข้าสู่ระบบ",
  cardSigningIn: "กำลังเข้าสู่ระบบ…",
  cardReady: "เชื่อมต่อแล้ว",
  cardReadyPlan: "เชื่อมต่อแล้ว · {plan}",
  cardMetered: "เข้าสู่ระบบแล้ว แต่ไม่ใช่ด้วยการสมัครสมาชิก",
  cardMeteredAccepted: "กำลังใช้งาน · คิดค่าบริการตามการใช้งาน",
  cardError: "ตรวจสอบการเชื่อมต่อไม่ได้",
  cardErrNeedsUpdate: "โปรแกรม {provider} บนพีซีเครื่องนี้เก่าเกินไป โปรดอัปเดตแล้วตรวจสอบอีกครั้ง",
  cardErrNeedsUpdateVersion: "โปรแกรม {provider} บนพีซีเครื่องนี้ ({version}) เก่าเกินไป ต้องใช้รุ่น {minimum} ขึ้นไป โปรดเรียกใช้ {command} ในเทอร์มินัลแล้วตรวจสอบอีกครั้ง",
  cardErrNeedsUpdatePath: "ไฟล์ที่แอปนี้เรียกใช้:",
  cardErrNeedsUpdateWindows: "การอัปเดต {provider} ใน WSL (Ubuntu) หรือในโฟลเดอร์อื่นจะไม่เปลี่ยนไฟล์นี้ โปรดเรียกใช้ {command} ใน Windows PowerShell",
  cardErrTimeout: "โปรแกรม {provider} ไม่ตอบกลับภายในเวลาที่กำหนด โปรดตรวจสอบอีกครั้งในอีกสักครู่",
  cardErrFailed: "เกิดปัญหาขณะตรวจสอบ {provider} โปรดตรวจสอบอีกครั้ง",
  actionInstall: "ติดตั้ง",
  actionLogin: "เข้าสู่ระบบ",
  actionLoginWindow: "เบราว์เซอร์ไม่เปิด หรือแสดงรหัสใช่ไหม",
  actionRecheck: "ตรวจสอบอีกครั้ง",
  actionAcceptMetered: "ใช้ต่อไป",
  actionInstallHelp: "คู่มือการติดตั้งอย่างเป็นทางการ",
  actionOpenSettings: "เปิดการตั้งค่า",
  actionDismiss: "ปิด",
  actionSwitchAccount: "เข้าสู่ระบบด้วยบัญชีอื่น",
  actionLogout: "ออกจากระบบ",
  installNote: "คำสั่งติดตั้งอย่างเป็นทางการของ {vendor} จะทำงานในหน้าต่างเทอร์มินัลใหม่",
  loginNote: "หน้าเข้าสู่ระบบที่เปิดขึ้นเป็นของ {vendor}",
  signingInBrowserNote: "เข้าสู่ระบบบัญชี {vendor} ในเบราว์เซอร์ที่เปิดขึ้น แล้วกดอนุญาต เมื่อเสร็จแล้วจะเชื่อมต่อให้เอง",
  signingInWindowNote: "ถ้าเบราว์เซอร์ไม่เปิด ให้คัดลอกที่อยู่ที่แสดงในหน้าต่างที่เพิ่งเปิดขึ้นไปเปิดในเบราว์เซอร์ เมื่อเบราว์เซอร์แสดงรหัส ให้คัดลอกแล้ววางในหน้าต่างนั้นครั้งเดียว จากนั้นกด Enter รหัสที่วางอาจไม่แสดงในหน้าต่าง",
  meteredWarning: "นี่ไม่ใช่การสมัครสมาชิก: คุณจะถูกคิดค่าบริการตามที่ใช้จริง",
  meteredMeaning: 'การเข้าสู่ระบบนี้ใช้คีย์ API หรือบัญชีที่จ่ายตามการใช้งาน หรือไม่สามารถยืนยันประเภทได้ เมื่อเลือก "ใช้ต่อไป" AI จะทำงานผ่านการเชื่อมต่อนี้ และทุกคำขอจะถูกเรียกเก็บจากบัญชีนั้น',
  connectTitle: "เชื่อมต่อ AI เพื่อเริ่มต้นใช้งาน",
  connectBody: "AI ทำงานด้วยการสมัครสมาชิก Claude หรือ Codex ที่คุณมีอยู่แล้ว ไม่ต้องใช้คีย์ API",
  connectProviderTitle: "การเชื่อมต่อ {provider} ยังใช้งานไม่ได้ในขณะนี้",
  connectKeyBody: "การตั้งค่า {provider} ยังไม่เสร็จสมบูรณ์ โปรดตั้งค่าให้เสร็จในการตั้งค่า หรือเลือก AI อื่น",
  errNotConnected: "ยังไม่มี AI ที่เชื่อมต่ออยู่ โปรดเชื่อมต่อการสมัครสมาชิก Claude หรือ Codex หรือ AI ฟรีก่อน",
  errNotInstalled: "ไม่พบโปรแกรม {provider} ในคอมพิวเตอร์เครื่องนี้",
  errSignedOut: "การเข้าสู่ระบบ {provider} หมดอายุแล้ว โปรดเข้าสู่ระบบอีกครั้งเพื่อดำเนินการต่อ",
  errRateLimit: "ใช้โควตาการสมัครสมาชิก {provider} ครบแล้ว",
  errRateLimitReset: "ใช้โควตาการสมัครสมาชิก {provider} ครบแล้ว โควตาจะรีเซ็ตเวลา {time}",
  errUnsafeTools: "โปรแกรม {provider} เริ่มทำงานโดยที่เครื่องมือของตัวเองยังเปิดอยู่ จึงหยุดการทำงานเพื่อความปลอดภัย",
  errMeteredNotAccepted: 'การเชื่อมต่อ {provider} คิดค่าบริการตามการใช้งาน และคุณยังไม่ได้อนุญาต เลือก "ใช้ต่อไป" ในการตั้งค่าการเชื่อมต่อเพื่อใช้งาน',
  errNeedsUpdate: "โปรแกรม {provider} เก่าเกินไปสำหรับฟีเจอร์นี้ โปรดอัปเดตแล้วลองอีกครั้ง",
  errHeadlessLimit: "ถึงขีดจำกัดต่อชั่วโมงของคำขออัตโนมัติแล้ว",
  errHeadlessLimitReset: "ถึงขีดจำกัดต่อชั่วโมงของคำขออัตโนมัติแล้ว จะส่งคำขอได้อีกครั้งเวลา {time}",
  connectFreeHint: "ไม่มีการสมัครสมาชิกใช่ไหม คุณเชื่อมต่อ AI ฟรีได้ในการตั้งค่าภายในเวลาประมาณหนึ่งนาที",
  actionConnectFree: "เชื่อมต่อ AI ฟรี",
  errFreeLimit: "ใช้สิทธิ์ใช้งานฟรีของวันนี้หมดแล้ว โปรดลองอีกครั้งพรุ่งนี้ หรือเลือก AI อื่นในการตั้งค่า",
  errFreeLimitReset: "ใช้สิทธิ์ใช้งานฟรีของวันนี้หมดแล้ว จะใช้ได้อีกครั้งเวลา {time}",
  continueWith: "ดำเนินการต่อด้วย {provider}",
  continueMeteredNote: "การเชื่อมต่อ {provider} ไม่ใช่การสมัครสมาชิก: หากดำเนินการต่อจะคิดค่าบริการตามการใช้งาน",
  usageLine: "ใช้ไปแล้ว {percent}% · รีเซ็ตเวลา {time}",
  usageWindowFiveHour: "โควตา 5 ชั่วโมง",
  usageWindowSevenDay: "โควตา 7 วัน",
  noticeTitle: "ก่อนใช้ AI ด้วยการสมัครสมาชิกของคุณ",
  noticeSend: 'เนื้อหาเอกสารและบทสนทนาจะถูกส่งไปยัง Anthropic หรือ OpenAI ภายใต้บัญชีของคุณเอง ทุกคำขอจะมีชื่อ หัวข้อ และคำอธิบายของสกิลทุกตัวที่ตั้งเป็น "ให้ AI ตัดสินใจ" ไปด้วย สกิลที่ใช้และไฟล์สกิลที่ AI อ่านก็จะถูกส่งไปด้วย',
  noticeTraining: "เนื้อหานั้นจะถูกนำไปใช้ฝึก AI หรือไม่ ขึ้นอยู่กับการตั้งค่าบัญชีของคุณเองกับบริษัทนั้น",
  noticeCodexHistory: "แอปนี้ปิดการบันทึกประวัติการสนทนาของ Codex แต่ Codex อาจยังเก็บบันทึกการวินิจฉัยของตัวเองไว้ในคอมพิวเตอร์เครื่องนี้",
  noticePdfWholeDocument: "ในตัวแก้ไข PDF การอ่านหน้าด้วย AI และการแปลเอกสารอาจส่งภาพของหน้าและข้อความทั้งหมดของเอกสาร",
  noticeAck: "รับทราบ",
  codexNotice: "การใช้การสมัครสมาชิก Codex ภายในแอปไม่ใช่วิธีที่ OpenAI แนะนำอย่างเป็นทางการ",
  truncatedNotice: "ข้อความที่ป้อนยาวเกินไป จึงตัดบางส่วนออกก่อนส่ง",
  pickerAuto: "อัตโนมัติ",
  pickerAutoUsing: "อัตโนมัติ · {provider}",
  pickerAutoUsingModel: "อัตโนมัติ · {provider} · {model}",
  pickerDefaultModel: "โมเดลเริ่มต้น",
  pickerDefaultModelNamed: "โมเดลเริ่มต้น · {model}",
  pickerSubscription: "การสมัครสมาชิก",
  pickerPaid: "มีค่าใช้จ่าย",
  pickerPaidTitle: "คิดค่าบริการตามการใช้งาน ไม่รวมอยู่ในการสมัครสมาชิก",
  pickerNotConnected: "เชื่อมต่อ AI",
  guideQuestion: "ตอนนี้คุณใช้ AI ตัวไหนอยู่",
  guidePathClaudeTitle: "ฉันสมัครสมาชิก Claude แบบชำระเงิน",
  guidePathClaudeBody: "ต้องใช้แพ็กเกจ Pro หรือ Max บัญชี Claude แบบฟรีเชื่อมต่อไม่ได้",
  guidePathCodexTitle: "ฉันใช้ ChatGPT",
  guidePathCodexBody: "เข้าสู่ระบบโปรแกรม Codex ของ OpenAI ด้วยบัญชี ChatGPT ของคุณ แพ็กเกจฟรีใช้งานได้เพียงเล็กน้อย",
  guidePathFreeTitle: "ยังไม่มีทั้งสองอย่าง",
  guidePathFreeBody: "เชื่อมต่อ AI ฟรีได้ในเวลาประมาณหนึ่งนาที ระหว่างที่ใช้ฟรี เนื้อหาที่คุณส่งอาจถูกนำไปใช้ปรับปรุง AI ของบริษัทนั้น",
  guideBack: "เลือกวิธีอื่น",
  guideBadgeReady: "เชื่อมต่อแล้ว",
  guideBadgeInstalled: "ติดตั้งแล้ว",
  guideBadgeCheck: "ต้องตรวจสอบ",
  guideStepsLabel: "ขั้นตอนการเชื่อมต่อ",
  stepInstall: "ติดตั้งโปรแกรม",
  stepLogin: "เข้าสู่ระบบ",
  stepReady: "เชื่อมต่อเสร็จสิ้น",
  installReturnNote: "เมื่อติดตั้งในหน้าต่างนั้นเสร็จแล้ว โปรดกลับมาที่หน้านี้ แอปจะตรวจสอบอีกครั้งให้เอง",
  loginHowNote: "เมื่อกดแล้วเบราว์เซอร์จะเปิดขึ้น เข้าสู่ระบบด้วยบัญชี {vendor} แล้วกดอนุญาต ระบบจะเชื่อมต่อให้เอง",
  signingInStalledNote: "เบราว์เซอร์ไม่เปิด หรือแสดงรหัสใช่ไหม เปิดหน้าต่างเข้าสู่ระบบด้วยปุ่มด้านล่าง แล้ววางที่อยู่ที่แสดงในหน้าต่างลงในเบราว์เซอร์ หรือวางรหัสที่แสดงในเบราว์เซอร์ลงในหน้าต่าง",
  actionLoginWindowOpen: "เปิดหน้าต่างเข้าสู่ระบบ",
  actionCancelLogin: "ยกเลิกการเข้าสู่ระบบ",
  actionUpdate: "อัปเดต",
  updateNote: "เมื่อกดแล้ว การอัปเดตอย่างเป็นทางการของ {vendor} จะทำงานในหน้าต่างใหม่ เมื่ออัปเดตในหน้าต่างนั้นเสร็จแล้ว โปรดกลับมาที่หน้านี้",
  guideInfoHint: "ยังใช้ไม่ได้ใช่ไหม คัดลอกข้อมูลการเชื่อมต่อแล้วส่งให้คนที่ช่วยคุณ ข้อมูลนี้ไม่มีบัญชีและเส้นทางไฟล์",
  actionCopyInfo: "คัดลอกข้อมูลเพื่อขอความช่วยเหลือ",
  copyInfoDone: "คัดลอกแล้ว"
};
const id$2 = {
  aiAssistant: "Asisten AI",
  cardChecking: "Memeriksa…",
  cardNotInstalled: "Belum terpasang",
  cardSignedOut: "Belum masuk",
  cardSigningIn: "Sedang masuk…",
  cardReady: "Terhubung",
  cardReadyPlan: "Terhubung · {plan}",
  cardMetered: "Sudah masuk, tetapi bukan dengan langganan",
  cardMeteredAccepted: "Sedang dipakai · ditagih sesuai pemakaian",
  cardError: "Koneksi tidak dapat diperiksa",
  cardErrNeedsUpdate: "Program {provider} di PC ini terlalu lama. Perbarui, lalu periksa lagi.",
  cardErrNeedsUpdateVersion: "Program {provider} di PC ini ({version}) terlalu lama; diperlukan versi {minimum} atau yang lebih baru. Jalankan {command} di terminal, lalu periksa lagi.",
  cardErrNeedsUpdatePath: "File yang dijalankan aplikasi ini:",
  cardErrNeedsUpdateWindows: "Memperbarui {provider} di dalam WSL (Ubuntu) atau di folder lain tidak mengubah file ini. Jalankan {command} di Windows PowerShell.",
  cardErrTimeout: "Program {provider} tidak menjawab tepat waktu. Periksa lagi sebentar lagi.",
  cardErrFailed: "Terjadi masalah saat memeriksa {provider}. Periksa lagi.",
  actionInstall: "Pasang",
  actionLogin: "Masuk",
  actionLoginWindow: "Browser tidak terbuka, atau menampilkan kode?",
  actionRecheck: "Periksa lagi",
  actionAcceptMetered: "Tetap gunakan",
  actionInstallHelp: "Panduan pemasangan resmi",
  actionOpenSettings: "Buka pengaturan",
  actionDismiss: "Tutup",
  actionSwitchAccount: "Masuk dengan akun lain",
  actionLogout: "Keluar",
  installNote: "Perintah pemasangan resmi dari {vendor} dijalankan di jendela terminal baru.",
  loginNote: "Halaman masuk yang terbuka adalah milik {vendor}.",
  signingInBrowserNote: "Masuk ke akun {vendor} Anda di browser yang terbuka, lalu izinkan akses. Koneksi akan tersambung sendiri setelah selesai.",
  signingInWindowNote: "Jika browser tidak terbuka, salin alamat yang tampil di jendela yang baru terbuka lalu buka di browser. Saat browser menampilkan kode, salin, tempelkan sekali ke jendela itu, lalu tekan Enter. Kode yang ditempel mungkin tidak terlihat di jendela.",
  meteredWarning: "Ini bukan langganan: Anda ditagih sesuai pemakaian.",
  meteredMeaning: 'Login ini memakai kunci API atau akun bayar sesuai pemakaian, atau jenisnya tidak dapat dipastikan. Dengan "Tetap gunakan", AI berjalan melalui koneksi ini dan setiap permintaan ditagihkan ke akun tersebut.',
  connectTitle: "Hubungkan AI untuk memulai",
  connectBody: "AI berjalan dengan langganan Claude atau Codex yang sudah Anda miliki. Kunci API tidak diperlukan.",
  connectProviderTitle: "Koneksi {provider} belum bisa dipakai saat ini",
  connectKeyBody: "Penyiapan {provider} belum selesai. Selesaikan di Pengaturan, atau pilih AI lain.",
  errNotConnected: "Belum ada AI yang terhubung. Hubungkan dulu langganan Claude atau Codex, atau AI gratis.",
  errNotInstalled: "Program {provider} tidak ditemukan di PC ini.",
  errSignedOut: "Sesi masuk {provider} sudah berakhir. Masuk lagi untuk melanjutkan.",
  errRateLimit: "Batas langganan {provider} sudah habis.",
  errRateLimitReset: "Batas langganan {provider} sudah habis. Batas diatur ulang pada {time}.",
  errUnsafeTools: "Program {provider} dimulai dengan alat bawaannya masih aktif, sehingga proses dihentikan demi keamanan.",
  errMeteredNotAccepted: 'Koneksi {provider} ditagih sesuai pemakaian dan belum Anda izinkan. Pilih "Tetap gunakan" di pengaturan koneksi untuk memakainya.',
  errNeedsUpdate: "Program {provider} terlalu lama untuk fitur ini. Perbarui lalu coba lagi.",
  errHeadlessLimit: "Batas per jam untuk permintaan otomatis sudah tercapai.",
  errHeadlessLimitReset: "Batas per jam untuk permintaan otomatis sudah tercapai. Permintaan bisa dilakukan lagi pada {time}.",
  connectFreeHint: "Tidak punya langganan? Anda bisa menghubungkan AI gratis di Pengaturan dalam sekitar satu menit.",
  actionConnectFree: "Hubungkan AI gratis",
  errFreeLimit: "Jatah gratis hari ini sudah habis. Coba lagi besok, atau pilih AI lain di Pengaturan.",
  errFreeLimitReset: "Jatah gratis hari ini sudah habis. Anda bisa memakainya lagi pada {time}.",
  continueWith: "Lanjutkan dengan {provider}",
  continueMeteredNote: "Koneksi {provider} bukan langganan: melanjutkan akan ditagih sesuai pemakaian.",
  usageLine: "{percent}% terpakai · diatur ulang pada {time}",
  usageWindowFiveHour: "Batas 5 jam",
  usageWindowSevenDay: "Batas 7 hari",
  noticeTitle: "Sebelum memakai AI dengan langganan Anda",
  noticeSend: 'Isi dokumen dan percakapan Anda dikirim ke Anthropic atau OpenAI dengan akun Anda sendiri. Setiap permintaan juga membawa nama, judul, dan deskripsi setiap skill yang disetel ke "AI yang menentukan"; skill yang dipakai dan file skill yang dibaca AI juga ikut dikirim.',
  noticeTraining: "Apakah isi itu dipakai untuk melatih AI ditentukan oleh pengaturan akun Anda sendiri di perusahaan tersebut.",
  noticeCodexHistory: "Aplikasi ini mematikan penyimpanan riwayat percakapan Codex, tetapi Codex masih dapat menyimpan log diagnostiknya sendiri di PC ini.",
  noticePdfWholeDocument: "Di editor PDF, pembacaan halaman dengan AI dan terjemahan dokumen dapat mengirim gambar halaman dan seluruh teks dokumen.",
  noticeAck: "Mengerti",
  codexNotice: "Memakai langganan Codex di dalam aplikasi bukan cara yang direkomendasikan secara resmi oleh OpenAI.",
  truncatedNotice: "Masukan terlalu panjang, sehingga sebagian dipotong sebelum dikirim.",
  pickerAuto: "Otomatis",
  pickerAutoUsing: "Otomatis · {provider}",
  pickerAutoUsingModel: "Otomatis · {provider} · {model}",
  pickerDefaultModel: "Model bawaan",
  pickerDefaultModelNamed: "Model bawaan · {model}",
  pickerSubscription: "Langganan",
  pickerPaid: "Berbayar",
  pickerPaidTitle: "Ditagih sesuai pemakaian, tidak termasuk dalam langganan",
  pickerNotConnected: "Hubungkan AI",
  guideQuestion: "AI apa yang sudah Anda gunakan?",
  guidePathClaudeTitle: "Saya punya langganan Claude berbayar",
  guidePathClaudeBody: "Perlu paket Pro atau Max. Akun Claude gratis tidak bisa terhubung.",
  guidePathCodexTitle: "Saya memakai ChatGPT",
  guidePathCodexBody: "Masuk ke program Codex dari OpenAI dengan akun ChatGPT Anda. Paket gratis hanya memberi sedikit pemakaian.",
  guidePathFreeTitle: "Belum punya keduanya",
  guidePathFreeBody: "Hubungkan AI gratis dalam sekitar satu menit. Selama Anda memakainya secara gratis, konten yang Anda kirim dapat digunakan untuk meningkatkan AI perusahaan tersebut.",
  guideBack: "Pilih cara lain",
  guideBadgeReady: "Terhubung",
  guideBadgeInstalled: "Terpasang",
  guideBadgeCheck: "Perlu dicek",
  guideStepsLabel: "Langkah koneksi",
  stepInstall: "Pasang program",
  stepLogin: "Masuk",
  stepReady: "Terhubung",
  installReturnNote: "Setelah pemasangan di jendela itu selesai, kembali ke sini. Aplikasi akan memeriksa lagi dengan sendirinya.",
  loginHowNote: "Browser akan terbuka saat Anda menekannya. Masuk dengan akun {vendor} Anda dan tekan Izinkan; koneksi akan selesai dengan sendirinya.",
  signingInStalledNote: "Browser tidak terbuka, atau menampilkan kode? Buka jendela masuk dengan tombol di bawah. Tempelkan alamat yang tampil di jendela itu ke browser, atau tempelkan kode dari browser ke jendela.",
  actionLoginWindowOpen: "Buka jendela masuk",
  actionCancelLogin: "Batalkan masuk",
  actionUpdate: "Perbarui",
  updateNote: "Saat Anda menekannya, pembaruan resmi dari {vendor} berjalan di jendela baru. Setelah selesai di sana, kembali ke sini.",
  guideInfoHint: "Masih belum berhasil? Salin info koneksi dan kirim ke orang yang membantu Anda. Info ini tidak berisi akun maupun jalur file.",
  actionCopyInfo: "Salin info untuk bantuan",
  copyInfoDone: "Disalin"
};
const ru$2 = {
  aiAssistant: "ИИ-помощник",
  cardChecking: "Проверка…",
  cardNotInstalled: "Не установлено",
  cardSignedOut: "Вход не выполнен",
  cardSigningIn: "Выполняется вход…",
  cardReady: "Подключено",
  cardReadyPlan: "Подключено · {plan}",
  cardMetered: "Вход выполнен, но не по подписке",
  cardMeteredAccepted: "Используется · оплата по расходу",
  cardError: "Не удалось проверить подключение",
  cardErrNeedsUpdate: "Программа {provider} на этом компьютере слишком старая. Обновите её и проверьте снова.",
  cardErrNeedsUpdateVersion: "Программа {provider} на этом компьютере ({version}) слишком старая; нужна версия {minimum} или новее. Выполните {command} в терминале и проверьте снова.",
  cardErrNeedsUpdatePath: "Файл, который запускает это приложение:",
  cardErrNeedsUpdateWindows: "Обновление {provider} внутри WSL (Ubuntu) или в другой папке не меняет этот файл. Выполните {command} в Windows PowerShell.",
  cardErrTimeout: "Программа {provider} не ответила вовремя. Проверьте снова чуть позже.",
  cardErrFailed: "При проверке {provider} что-то пошло не так. Проверьте снова.",
  actionInstall: "Установить",
  actionLogin: "Войти",
  actionLoginWindow: "Браузер не открылся или показывает код?",
  actionRecheck: "Проверить снова",
  actionAcceptMetered: "Всё равно использовать",
  actionInstallHelp: "Официальная инструкция по установке",
  actionOpenSettings: "Открыть настройки",
  actionDismiss: "Закрыть",
  actionSwitchAccount: "Войти с другой учётной записью",
  actionLogout: "Выйти",
  installNote: "Официальная команда установки от {vendor} будет выполнена в новом окне терминала.",
  loginNote: "Откроется страница входа, принадлежащая {vendor}.",
  signingInBrowserNote: "Войдите в свою учётную запись {vendor} в открывшемся браузере и разрешите доступ. Подключение произойдёт само, когда вы закончите.",
  signingInWindowNote: "Если браузер не открылся, скопируйте адрес из только что открывшегося окна и откройте его в браузере. Когда браузер покажет код, скопируйте его, вставьте один раз в это окно и нажмите Enter. Вставленный код может не отображаться в окне.",
  meteredWarning: "Это не подписка: плата взимается за фактическое использование.",
  meteredMeaning: "Вход выполнен с ключом API или через аккаунт с оплатой по расходу, либо способ входа не удалось определить. Вариант «Всё равно использовать» разрешает ИИ работать через это подключение, и каждый запрос оплачивается с этого аккаунта.",
  connectTitle: "Подключите ИИ, чтобы начать",
  connectBody: "ИИ работает по подписке Claude или Codex, которая у вас уже есть. Ключ API не нужен.",
  connectProviderTitle: "Подключение {provider} сейчас недоступно",
  connectKeyBody: "Настройка {provider} не завершена. Завершите её в настройках или выберите другой ИИ.",
  errNotConnected: "Ни один ИИ не подключён. Сначала подключите подписку Claude или Codex либо бесплатный ИИ.",
  errNotInstalled: "Программа {provider} не найдена на этом компьютере.",
  errSignedOut: "Вход в {provider} истёк. Войдите снова, чтобы продолжить.",
  errRateLimit: "Лимит подписки {provider} исчерпан.",
  errRateLimitReset: "Лимит подписки {provider} исчерпан. Он обновится в {time}.",
  errUnsafeTools: "Программа {provider} запустилась с включёнными собственными инструментами, поэтому выполнение остановлено в целях безопасности.",
  errMeteredNotAccepted: "Подключение {provider} оплачивается по расходу, и вы его ещё не разрешили. Чтобы пользоваться им, выберите «Всё равно использовать» в настройках подключения.",
  errNeedsUpdate: "Программа {provider} слишком старая для этой функции. Обновите её и повторите попытку.",
  errHeadlessLimit: "Достигнут почасовой лимит автоматических запросов.",
  errHeadlessLimitReset: "Достигнут почасовой лимит автоматических запросов. Они снова будут доступны в {time}.",
  connectFreeHint: "Нет подписки? Бесплатный ИИ можно подключить в настройках примерно за минуту.",
  actionConnectFree: "Подключить бесплатный ИИ",
  errFreeLimit: "Бесплатный лимит на сегодня исчерпан. Попробуйте завтра или выберите другой ИИ в настройках.",
  errFreeLimitReset: "Бесплатный лимит на сегодня исчерпан. Снова воспользоваться им можно в {time}.",
  continueWith: "Продолжить с {provider}",
  continueMeteredNote: "Подключение {provider} не является подпиской: продолжение оплачивается по расходу.",
  usageLine: "Использовано {percent}% · обновление в {time}",
  usageWindowFiveHour: "Лимит на 5 часов",
  usageWindowSevenDay: "Лимит на 7 дней",
  noticeTitle: "Прежде чем использовать ИИ по подписке",
  noticeSend: "Содержимое документа и ваша переписка отправляются в Anthropic или OpenAI от имени вашего собственного аккаунта. С каждым запросом также отправляются имя, заголовок и описание каждого навыка с настройкой «Решает ИИ»; используемые навыки и файлы навыков, которые читает ИИ, тоже отправляются.",
  noticeTraining: "Используется ли это содержимое для обучения ИИ, определяют настройки вашего аккаунта в этой компании.",
  noticeCodexHistory: "Приложение отключает сохранение истории переписки в Codex, но Codex всё же может хранить на этом компьютере собственные диагностические журналы.",
  noticePdfWholeDocument: "В редакторе PDF чтение страниц с помощью ИИ и перевод документа могут отправлять изображения страниц и весь текст документа.",
  noticeAck: "Понятно",
  codexNotice: "Использование подписки Codex внутри приложения не является способом, который официально рекомендует OpenAI.",
  truncatedNotice: "Ввод был слишком длинным, поэтому перед отправкой его часть была обрезана.",
  pickerAuto: "Автоматически",
  pickerAutoUsing: "Автоматически · {provider}",
  pickerAutoUsingModel: "Автоматически · {provider} · {model}",
  pickerDefaultModel: "Модель по умолчанию",
  pickerDefaultModelNamed: "Модель по умолчанию · {model}",
  pickerSubscription: "Подписка",
  pickerPaid: "Платно",
  pickerPaidTitle: "Оплата по расходу, не входит в подписку",
  pickerNotConnected: "Подключить ИИ",
  guideQuestion: "Каким ИИ вы уже пользуетесь?",
  guidePathClaudeTitle: "У меня платная подписка Claude",
  guidePathClaudeBody: "Нужен тариф Pro или Max. С бесплатной учётной записью Claude подключиться нельзя.",
  guidePathCodexTitle: "Я пользуюсь ChatGPT",
  guidePathCodexBody: "Войдите в программу Codex от OpenAI с учётной записью ChatGPT. Бесплатный тариф даёт лишь небольшой объём использования.",
  guidePathFreeTitle: "Пока никаким",
  guidePathFreeBody: "Бесплатный ИИ можно подключить примерно за минуту. Пока вы пользуетесь им бесплатно, отправленное вами может использоваться для улучшения ИИ этой компании.",
  guideBack: "Выбрать другой способ",
  guideBadgeReady: "Подключено",
  guideBadgeInstalled: "Установлено",
  guideBadgeCheck: "Нужна проверка",
  guideStepsLabel: "Шаги подключения",
  stepInstall: "Установка программы",
  stepLogin: "Вход",
  stepReady: "Подключено",
  installReturnNote: "Когда установка в том окне завершится, вернитесь сюда. Приложение само проверит снова.",
  loginHowNote: "После нажатия откроется браузер. Войдите с учётной записью {vendor} и нажмите «Разрешить» — подключение завершится само.",
  signingInStalledNote: "Браузер не открылся или показывает код? Откройте окно входа кнопкой ниже. Вставьте адрес из этого окна в браузер или вставьте код из браузера в окно.",
  actionLoginWindowOpen: "Открыть окно входа",
  actionCancelLogin: "Отменить вход",
  actionUpdate: "Обновить",
  updateNote: "После нажатия официальное обновление от {vendor} запустится в новом окне. Когда оно там завершится, вернитесь сюда.",
  guideInfoHint: "Всё ещё не получается? Скопируйте сведения о подключении и отправьте тому, кто вам помогает. В них нет учётной записи и путей к файлам.",
  actionCopyInfo: "Скопировать сведения для помощи",
  copyInfoDone: "Скопировано"
};
const ar$2 = {
  aiAssistant: "مساعد الذكاء الاصطناعي",
  cardChecking: "جارٍ التحقق…",
  cardNotInstalled: "غير مثبَّت",
  cardSignedOut: "لم يتم تسجيل الدخول",
  cardSigningIn: "جارٍ تسجيل الدخول…",
  cardReady: "متصل",
  cardReadyPlan: "متصل · {plan}",
  cardMetered: "تم تسجيل الدخول، لكن ليس عبر اشتراك",
  cardMeteredAccepted: "قيد الاستخدام · الرسوم حسب الاستخدام",
  cardError: "تعذّر التحقق من الاتصال",
  cardErrNeedsUpdate: "برنامج {provider} على هذا الحاسوب قديم جدًا. حدّثه ثم تحقق مرة أخرى.",
  cardErrNeedsUpdateVersion: "برنامج {provider} على هذا الحاسوب ({version}) قديم جدًا، ويلزم الإصدار {minimum} أو أحدث. شغّل {command} في الطرفية ثم تحقق مرة أخرى.",
  cardErrNeedsUpdatePath: "الملف الذي يشغّله هذا التطبيق:",
  cardErrNeedsUpdateWindows: "تحديث {provider} داخل WSL (Ubuntu) أو في مجلد آخر لا يغيّر هذا الملف. شغّل {command} في Windows PowerShell.",
  cardErrTimeout: "لم يستجب برنامج {provider} في الوقت المحدد. تحقق مرة أخرى بعد قليل.",
  cardErrFailed: "حدث خطأ أثناء التحقق من {provider}. تحقق مرة أخرى.",
  actionInstall: "تثبيت",
  actionLogin: "تسجيل الدخول",
  actionLoginWindow: "لم يُفتح المتصفح، أو يعرض رمزًا؟",
  actionRecheck: "التحقق مرة أخرى",
  actionAcceptMetered: "استخدام على أي حال",
  actionInstallHelp: "دليل التثبيت الرسمي",
  actionOpenSettings: "فتح الإعدادات",
  actionDismiss: "إغلاق",
  actionSwitchAccount: "تسجيل الدخول بحساب آخر",
  actionLogout: "تسجيل الخروج",
  installNote: "سيُنفَّذ أمر التثبيت الرسمي من {vendor} في نافذة طرفية جديدة.",
  loginNote: "صفحة تسجيل الدخول التي ستُفتح تابعة لشركة {vendor}.",
  signingInBrowserNote: "سجّل الدخول إلى حسابك في {vendor} في المتصفح الذي فُتح، ثم اسمح بالوصول. سيتم الاتصال تلقائيًا عند الانتهاء.",
  signingInWindowNote: "إذا لم يُفتح المتصفح، فانسخ العنوان الظاهر في النافذة التي فُتحت للتو وافتحه في المتصفح. وإذا عرض المتصفح رمزًا، فانسخه والصقه مرة واحدة في تلك النافذة، ثم اضغط Enter. قد لا يظهر الرمز الملصق في النافذة.",
  meteredWarning: "هذا ليس اشتراكًا: تُحتسب الرسوم بحسب ما تستخدمه.",
  meteredMeaning: "يستخدم هذا التسجيل مفتاح API أو حسابًا يُدفع فيه حسب الاستخدام، أو تعذّر تأكيد نوعه. عند اختيار «استخدام على أي حال» يعمل الذكاء الاصطناعي عبر هذا الاتصال، وتُحتسب تكلفة كل طلب على ذلك الحساب.",
  connectTitle: "اربط ذكاءً اصطناعيًا للبدء",
  connectBody: "يعمل الذكاء الاصطناعي باشتراك Claude أو Codex الذي لديك بالفعل. لا حاجة إلى مفتاح API.",
  connectProviderTitle: "اتصال {provider} غير متاح للاستخدام حاليًا",
  connectKeyBody: "لم يكتمل إعداد {provider} بعد. أكمله في الإعدادات، أو اختر ذكاءً اصطناعيًا آخر.",
  errNotConnected: "لا يوجد ذكاء اصطناعي متصل. اربط أولًا اشتراك Claude أو Codex، أو ذكاءً اصطناعيًا مجانيًا.",
  errNotInstalled: "لم يُعثر على برنامج {provider} على هذا الحاسوب.",
  errSignedOut: "انتهت صلاحية تسجيل الدخول إلى {provider}. سجّل الدخول مجددًا للمتابعة.",
  errRateLimit: "تم استنفاد حد اشتراك {provider}.",
  errRateLimitReset: "تم استنفاد حد اشتراك {provider}. سيُعاد تعيينه في {time}.",
  errUnsafeTools: "بدأ برنامج {provider} وأدواته الخاصة مفعَّلة، لذلك أُوقف التشغيل حفاظًا على الأمان.",
  errMeteredNotAccepted: "اتصال {provider} تُحتسب رسومه حسب الاستخدام ولم تسمح به بعد. اختر «استخدام على أي حال» في إعدادات الاتصال لاستخدامه.",
  errNeedsUpdate: "برنامج {provider} قديم جدًا لهذه الميزة. حدّثه ثم حاول مرة أخرى.",
  errHeadlessLimit: "تم بلوغ الحد الأقصى للطلبات التلقائية في الساعة.",
  errHeadlessLimitReset: "تم بلوغ الحد الأقصى للطلبات التلقائية في الساعة. يمكن إرسال الطلبات مجددًا في {time}.",
  connectFreeHint: "ليس لديك اشتراك؟ يمكنك ربط ذكاء اصطناعي مجاني من الإعدادات في نحو دقيقة.",
  actionConnectFree: "ربط ذكاء اصطناعي مجاني",
  errFreeLimit: "نفد رصيد الاستخدام المجاني لهذا اليوم. حاول مجددًا غدًا، أو اختر ذكاءً اصطناعيًا آخر في الإعدادات.",
  errFreeLimitReset: "نفد رصيد الاستخدام المجاني لهذا اليوم. يمكنك استخدامه مجددًا في {time}.",
  continueWith: "المتابعة باستخدام {provider}",
  continueMeteredNote: "اتصال {provider} ليس اشتراكًا: المتابعة تُحتسب رسومها حسب الاستخدام.",
  usageLine: "تم استخدام {percent}% · إعادة التعيين في {time}",
  usageWindowFiveHour: "حد 5 ساعات",
  usageWindowSevenDay: "حد 7 أيام",
  noticeTitle: "قبل استخدام الذكاء الاصطناعي باشتراكك",
  noticeSend: "يُرسَل محتوى المستند ومحادثتك إلى Anthropic أو OpenAI عبر حسابك الشخصي. ويُرسَل مع كل طلب اسم كل مهارة مضبوطة على «يقرر الذكاء الاصطناعي» وعنوانها ووصفها، وتُرسَل معها المهارات المستخدمة وملفات المهارات التي يقرؤها الذكاء الاصطناعي.",
  noticeTraining: "استخدام هذا المحتوى في تدريب الذكاء الاصطناعي تحدده إعدادات حسابك لدى تلك الشركة.",
  noticeCodexHistory: "يوقف هذا التطبيق حفظ سجل المحادثات في Codex، لكن Codex قد يحتفظ بسجلاته التشخيصية الخاصة على هذا الحاسوب.",
  noticePdfWholeDocument: "في محرر PDF، قد ترسل قراءة الصفحات بالذكاء الاصطناعي وترجمة المستندات صور الصفحات والنص الكامل للمستند.",
  noticeAck: "فهمت",
  codexNotice: "استخدام اشتراك Codex داخل تطبيق ليس طريقة موصى بها رسميًا من OpenAI.",
  truncatedNotice: "كان الإدخال طويلًا جدًا، لذا اقتُطع جزء منه قبل الإرسال.",
  pickerAuto: "تلقائي",
  pickerAutoUsing: "تلقائي · {provider}",
  pickerAutoUsingModel: "تلقائي · {provider} · {model}",
  pickerDefaultModel: "النموذج الافتراضي",
  pickerDefaultModelNamed: "النموذج الافتراضي · {model}",
  pickerSubscription: "اشتراك",
  pickerPaid: "مدفوع",
  pickerPaidTitle: "الرسوم حسب الاستخدام وغير مشمولة بالاشتراك",
  pickerNotConnected: "ربط الذكاء الاصطناعي",
  guideQuestion: "ما الذكاء الاصطناعي الذي تستخدمه بالفعل؟",
  guidePathClaudeTitle: "لديّ اشتراك مدفوع في Claude",
  guidePathClaudeBody: "يلزم وجود خطة Pro أو Max. لا يمكن الاتصال بحساب Claude مجاني.",
  guidePathCodexTitle: "أستخدم ChatGPT",
  guidePathCodexBody: "سجّل الدخول إلى برنامج Codex من OpenAI بحسابك في ChatGPT. الخطة المجانية لا تتيح إلا استخدامًا قليلًا.",
  guidePathFreeTitle: "لا أملك أيًّا منهما بعد",
  guidePathFreeBody: "اربط ذكاءً اصطناعيًا مجانيًا في نحو دقيقة. أثناء استخدامه مجانًا، قد يُستخدم ما ترسله لتحسين الذكاء الاصطناعي لدى تلك الشركة.",
  guideBack: "اختيار طريقة أخرى",
  guideBadgeReady: "متصل",
  guideBadgeInstalled: "مثبَّت",
  guideBadgeCheck: "يحتاج إلى تحقق",
  guideStepsLabel: "خطوات الاتصال",
  stepInstall: "تثبيت البرنامج",
  stepLogin: "تسجيل الدخول",
  stepReady: "اكتمل الاتصال",
  installReturnNote: "عند انتهاء التثبيت في تلك النافذة، عد إلى هنا. سيتحقق التطبيق مرة أخرى تلقائيًا.",
  loginHowNote: "عند الضغط يُفتح المتصفح. سجّل الدخول بحسابك في {vendor} واضغط «سماح»، وسيكتمل الاتصال تلقائيًا.",
  signingInStalledNote: "لم يُفتح المتصفح، أو يعرض رمزًا؟ افتح نافذة تسجيل الدخول بالزر أدناه. الصق العنوان الظاهر فيها في المتصفح، أو الصق الرمز الظاهر في المتصفح في النافذة.",
  actionLoginWindowOpen: "فتح نافذة تسجيل الدخول",
  actionCancelLogin: "إلغاء تسجيل الدخول",
  actionUpdate: "تحديث",
  updateNote: "عند الضغط يُشغَّل التحديث الرسمي من {vendor} في نافذة جديدة. عند انتهائه هناك، عد إلى هنا.",
  guideInfoHint: "ألا يزال لا يعمل؟ انسخ معلومات الاتصال وأرسلها إلى من يساعدك. لا تتضمن حسابًا ولا مسارات ملفات.",
  actionCopyInfo: "نسخ المعلومات لطلب المساعدة",
  copyInfoDone: "تم النسخ"
};
const pt$2 = {
  aiAssistant: "Assistente de IA",
  cardChecking: "Verificando…",
  cardNotInstalled: "Não instalado",
  cardSignedOut: "Sem login",
  cardSigningIn: "Entrando…",
  cardReady: "Conectado",
  cardReadyPlan: "Conectado · {plan}",
  cardMetered: "Login feito, mas não com uma assinatura",
  cardMeteredAccepted: "Em uso · cobrado por consumo",
  cardError: "Não foi possível verificar a conexão",
  cardErrNeedsUpdate: "O programa {provider} neste PC é antigo demais. Atualize-o e verifique novamente.",
  cardErrNeedsUpdateVersion: "O programa {provider} neste PC ({version}) é antigo demais; é necessária a versão {minimum} ou mais recente. Execute {command} em um terminal e verifique novamente.",
  cardErrNeedsUpdatePath: "Arquivo que este aplicativo executa:",
  cardErrNeedsUpdateWindows: "Atualizar o {provider} dentro do WSL (Ubuntu) ou em outra pasta não altera este arquivo. Execute {command} no Windows PowerShell.",
  cardErrTimeout: "O programa {provider} não respondeu a tempo. Verifique novamente em instantes.",
  cardErrFailed: "Algo deu errado ao verificar {provider}. Verifique novamente.",
  actionInstall: "Instalar",
  actionLogin: "Entrar",
  actionLoginWindow: "O navegador não abriu ou mostra um código?",
  actionRecheck: "Verificar novamente",
  actionAcceptMetered: "Usar mesmo assim",
  actionInstallHelp: "Guia oficial de instalação",
  actionOpenSettings: "Abrir configurações",
  actionDismiss: "Fechar",
  actionSwitchAccount: "Entrar com outra conta",
  actionLogout: "Sair",
  installNote: "O comando oficial de instalação da {vendor} é executado em uma nova janela de terminal.",
  loginNote: "A página de login que se abre é da própria {vendor}.",
  signingInBrowserNote: "Entre na sua conta da {vendor} no navegador que abriu e permita o acesso. A conexão é feita sozinha quando você terminar.",
  signingInWindowNote: "Se o navegador não abriu, copie o endereço mostrado na janela que acabou de abrir e abra-o no navegador. Quando o navegador mostrar um código, copie-o, cole-o uma única vez nessa janela e pressione Enter. O código colado pode não aparecer na janela.",
  meteredWarning: "Isto não é uma assinatura: você paga pelo que usar.",
  meteredMeaning: "Este login usa uma chave de API ou uma conta de pagamento por consumo, ou não foi possível confirmar o tipo. “Usar mesmo assim” permite que a IA funcione com esta conexão, e cada solicitação é cobrada dessa conta.",
  connectTitle: "Conecte uma IA para começar",
  connectBody: "A IA funciona com a assinatura do Claude ou do Codex que você já tem. Nenhuma chave de API é necessária.",
  connectProviderTitle: "A conexão {provider} não pode ser usada agora",
  connectKeyBody: "A configuração de {provider} não foi concluída. Conclua-a nas Configurações ou escolha outra IA.",
  errNotConnected: "Nenhuma IA está conectada. Conecte primeiro uma assinatura do Claude ou do Codex, ou uma IA gratuita.",
  errNotInstalled: "O programa {provider} não foi encontrado neste PC.",
  errSignedOut: "O login em {provider} expirou. Entre novamente para continuar.",
  errRateLimit: "O limite da assinatura {provider} foi atingido.",
  errRateLimitReset: "O limite da assinatura {provider} foi atingido. Ele será redefinido às {time}.",
  errUnsafeTools: "O programa {provider} foi iniciado com as próprias ferramentas ativadas, então a execução foi interrompida por segurança.",
  errMeteredNotAccepted: "A conexão {provider} é cobrada por consumo e você ainda não a permitiu. Escolha “Usar mesmo assim” nas configurações de conexão para usá-la.",
  errNeedsUpdate: "O programa {provider} é antigo demais para este recurso. Atualize-o e tente novamente.",
  errHeadlessLimit: "O limite por hora de solicitações automáticas foi atingido.",
  errHeadlessLimitReset: "O limite por hora de solicitações automáticas foi atingido. Elas voltam a ser possíveis às {time}.",
  connectFreeHint: "Não tem assinatura? Você pode conectar uma IA gratuita nas Configurações em cerca de um minuto.",
  actionConnectFree: "Conectar uma IA gratuita",
  errFreeLimit: "O uso gratuito de hoje acabou. Tente novamente amanhã ou escolha outra IA nas Configurações.",
  errFreeLimitReset: "O uso gratuito de hoje acabou. Você poderá usá-lo novamente às {time}.",
  continueWith: "Continuar com {provider}",
  continueMeteredNote: "A conexão {provider} não é uma assinatura: continuar é cobrado por consumo.",
  usageLine: "{percent}% usado · redefine às {time}",
  usageWindowFiveHour: "Limite de 5 horas",
  usageWindowSevenDay: "Limite de 7 dias",
  noticeTitle: "Antes de usar a IA com a sua assinatura",
  noticeSend: "O conteúdo do documento e a sua conversa são enviados à Anthropic ou à OpenAI pela sua própria conta. Cada solicitação leva também o nome, o título e a descrição de cada habilidade configurada como “A IA decide”; também são enviadas as habilidades em uso e os arquivos de habilidade que a IA lê.",
  noticeTraining: "Se esse conteúdo é usado para treinar IA depende das configurações da sua própria conta nessa empresa.",
  noticeCodexHistory: "Este aplicativo desativa o salvamento do histórico de conversas do Codex, mas o Codex ainda pode manter seus próprios registros de diagnóstico neste PC.",
  noticePdfWholeDocument: "No editor de PDF, a leitura de páginas com IA e a tradução de documentos podem enviar imagens das páginas e todo o texto do documento.",
  noticeAck: "Entendi",
  codexNotice: "Usar uma assinatura do Codex dentro de um aplicativo não é um método oficialmente recomendado pela OpenAI.",
  truncatedNotice: "A entrada era longa demais, então parte dela foi cortada antes do envio.",
  pickerAuto: "Automático",
  pickerAutoUsing: "Automático · {provider}",
  pickerAutoUsingModel: "Automático · {provider} · {model}",
  pickerDefaultModel: "Modelo padrão",
  pickerDefaultModelNamed: "Modelo padrão · {model}",
  pickerSubscription: "Assinatura",
  pickerPaid: "Pago",
  pickerPaidTitle: "Cobrado por consumo, não coberto por assinatura",
  pickerNotConnected: "Conectar IA",
  guideQuestion: "Qual IA você já usa?",
  guidePathClaudeTitle: "Tenho uma assinatura paga do Claude",
  guidePathClaudeBody: "É preciso ter um plano Pro ou Max. Uma conta gratuita do Claude não consegue se conectar.",
  guidePathCodexTitle: "Uso o ChatGPT",
  guidePathCodexBody: "Entre no programa Codex da OpenAI com sua conta do ChatGPT. O plano gratuito permite pouco uso.",
  guidePathFreeTitle: "Nenhuma ainda",
  guidePathFreeBody: "Conecte uma IA gratuita em cerca de um minuto. Enquanto você usa de graça, o que você envia pode ser usado para melhorar a IA dessa empresa.",
  guideBack: "Escolher outra forma",
  guideBadgeReady: "Conectado",
  guideBadgeInstalled: "Instalado",
  guideBadgeCheck: "Verificar",
  guideStepsLabel: "Etapas da conexão",
  stepInstall: "Instalar o programa",
  stepLogin: "Entrar",
  stepReady: "Conectado",
  installReturnNote: "Quando a instalação terminar naquela janela, volte para cá. O app verifica de novo sozinho.",
  loginHowNote: "Ao clicar, um navegador se abre. Entre com sua conta da {vendor} e clique em Permitir; a conexão é concluída sozinha.",
  signingInStalledNote: "O navegador não abriu ou mostra um código? Abra a janela de login com o botão abaixo. Cole no navegador o endereço mostrado na janela, ou cole na janela o código do navegador.",
  actionLoginWindowOpen: "Abrir a janela de login",
  actionCancelLogin: "Cancelar login",
  actionUpdate: "Atualizar",
  updateNote: "Ao clicar, a atualização oficial da {vendor} é executada em uma nova janela. Quando terminar lá, volte para cá.",
  guideInfoHint: "Ainda não funciona? Copie as informações da conexão e envie para quem está ajudando você. Elas não incluem conta nem caminhos de arquivos.",
  actionCopyInfo: "Copiar informações para ajuda",
  copyInfoDone: "Copiado"
};
const it$2 = {
  aiAssistant: "Assistente IA",
  cardChecking: "Verifica in corso…",
  cardNotInstalled: "Non installato",
  cardSignedOut: "Accesso non effettuato",
  cardSigningIn: "Accesso in corso…",
  cardReady: "Connesso",
  cardReadyPlan: "Connesso · {plan}",
  cardMetered: "Accesso effettuato, ma non con un abbonamento",
  cardMeteredAccepted: "In uso · addebito a consumo",
  cardError: "Impossibile verificare la connessione",
  cardErrNeedsUpdate: "Il programma {provider} su questo PC è troppo vecchio. Aggiornalo, poi verifica di nuovo.",
  cardErrNeedsUpdateVersion: "Il programma {provider} su questo PC ({version}) è troppo vecchio; serve la {minimum} o successiva. Esegui {command} in un terminale, poi verifica di nuovo.",
  cardErrNeedsUpdatePath: "File eseguito da questa app:",
  cardErrNeedsUpdateWindows: "Aggiornare {provider} dentro WSL (Ubuntu) o in un’altra cartella non modifica questo file. Esegui {command} in Windows PowerShell.",
  cardErrTimeout: "Il programma {provider} non ha risposto in tempo. Verifica di nuovo tra un momento.",
  cardErrFailed: "Si è verificato un problema durante la verifica di {provider}. Verifica di nuovo.",
  actionInstall: "Installa",
  actionLogin: "Accedi",
  actionLoginWindow: "Il browser non si è aperto o mostra un codice?",
  actionRecheck: "Verifica di nuovo",
  actionAcceptMetered: "Usa comunque",
  actionInstallHelp: "Guida ufficiale all’installazione",
  actionOpenSettings: "Apri impostazioni",
  actionDismiss: "Chiudi",
  actionSwitchAccount: "Accedi con un altro account",
  actionLogout: "Esci",
  installNote: "Il comando di installazione ufficiale di {vendor} viene eseguito in una nuova finestra del terminale.",
  loginNote: "La pagina di accesso che si apre è quella di {vendor}.",
  signingInBrowserNote: "Accedi al tuo account {vendor} nel browser che si è aperto e consenti l’accesso. La connessione avviene da sola quando hai finito.",
  signingInWindowNote: "Se il browser non si è aperto, copia l’indirizzo mostrato nella finestra appena aperta e aprilo nel browser. Quando il browser mostra un codice, copialo, incollalo una sola volta in quella finestra e premi Invio. Il codice incollato potrebbe non comparire nella finestra.",
  meteredWarning: "Non è un abbonamento: paghi in base a quanto usi.",
  meteredMeaning: "Questo accesso usa una chiave API o un account a consumo, oppure non è stato possibile confermarne il tipo. Con “Usa comunque” l’IA funziona su questa connessione e ogni richiesta viene addebitata a quell’account.",
  connectTitle: "Collega un’IA per iniziare",
  connectBody: "L’IA funziona con l’abbonamento Claude o Codex che hai già. Non serve alcuna chiave API.",
  connectProviderTitle: "La connessione {provider} non è utilizzabile al momento",
  connectKeyBody: "La configurazione di {provider} non è completa. Completala nelle Impostazioni oppure scegli un’altra IA.",
  errNotConnected: "Nessuna IA è collegata. Collega prima un abbonamento Claude o Codex, oppure un’IA gratuita.",
  errNotInstalled: "Il programma {provider} non è stato trovato su questo PC.",
  errSignedOut: "L’accesso a {provider} è scaduto. Accedi di nuovo per continuare.",
  errRateLimit: "Il limite dell’abbonamento {provider} è stato raggiunto.",
  errRateLimitReset: "Il limite dell’abbonamento {provider} è stato raggiunto. Si azzera alle {time}.",
  errUnsafeTools: "Il programma {provider} è stato avviato con i propri strumenti attivi, quindi l’esecuzione è stata interrotta per sicurezza.",
  errMeteredNotAccepted: "La connessione {provider} è a consumo e non l’hai ancora consentita. Scegli “Usa comunque” nelle impostazioni di connessione per usarla.",
  errNeedsUpdate: "Il programma {provider} è troppo vecchio per questa funzione. Aggiornalo e riprova.",
  errHeadlessLimit: "È stato raggiunto il limite orario delle richieste automatiche.",
  errHeadlessLimitReset: "È stato raggiunto il limite orario delle richieste automatiche. Saranno di nuovo possibili alle {time}.",
  connectFreeHint: "Non hai un abbonamento? Puoi collegare un’IA gratuita nelle Impostazioni in circa un minuto.",
  actionConnectFree: "Collega un’IA gratuita",
  errFreeLimit: "La quota gratuita di oggi è esaurita. Riprova domani oppure scegli un’altra IA nelle Impostazioni.",
  errFreeLimitReset: "La quota gratuita di oggi è esaurita. Potrai usarla di nuovo alle {time}.",
  continueWith: "Continua con {provider}",
  continueMeteredNote: "La connessione {provider} non è un abbonamento: continuando paghi a consumo.",
  usageLine: "{percent}% usato · si azzera alle {time}",
  usageWindowFiveHour: "Limite di 5 ore",
  usageWindowSevenDay: "Limite di 7 giorni",
  noticeTitle: "Prima di usare l’IA con il tuo abbonamento",
  noticeSend: "Il contenuto del documento e la conversazione vengono inviati ad Anthropic o a OpenAI con il tuo account personale. Ogni richiesta porta anche nome, titolo e descrizione di ogni abilità impostata su “Decide l'IA”; vengono inviate anche le abilità in uso e i file delle abilità letti dall’IA.",
  noticeTraining: "L’uso di questi contenuti per addestrare l’IA dipende dalle impostazioni del tuo account presso quell’azienda.",
  noticeCodexHistory: "Questa app disattiva il salvataggio della cronologia delle conversazioni di Codex, ma Codex può comunque conservare i propri log di diagnostica su questo PC.",
  noticePdfWholeDocument: "Nell’editor PDF, la lettura delle pagine con l’IA e la traduzione dei documenti possono inviare le immagini delle pagine e l’intero testo del documento.",
  noticeAck: "Ho capito",
  codexNotice: "Usare un abbonamento Codex all’interno di un’app non è un metodo ufficialmente consigliato da OpenAI.",
  truncatedNotice: "L’input era troppo lungo, quindi una parte è stata tagliata prima dell’invio.",
  pickerAuto: "Automatico",
  pickerAutoUsing: "Automatico · {provider}",
  pickerAutoUsingModel: "Automatico · {provider} · {model}",
  pickerDefaultModel: "Modello predefinito",
  pickerDefaultModelNamed: "Modello predefinito · {model}",
  pickerSubscription: "Abbonamento",
  pickerPaid: "A pagamento",
  pickerPaidTitle: "Addebito a consumo, non coperto da un abbonamento",
  pickerNotConnected: "Collega l’IA",
  guideQuestion: "Quale IA usi già?",
  guidePathClaudeTitle: "Ho un abbonamento Claude a pagamento",
  guidePathClaudeBody: "Serve un piano Pro o Max. Con un account Claude gratuito non è possibile collegarsi.",
  guidePathCodexTitle: "Uso ChatGPT",
  guidePathCodexBody: "Accedi al programma Codex di OpenAI con il tuo account ChatGPT. Il piano gratuito consente solo un uso limitato.",
  guidePathFreeTitle: "Nessuno dei due, per ora",
  guidePathFreeBody: "Collega un’IA gratuita in circa un minuto. Finché la usi gratis, ciò che invii può essere usato per migliorare l’IA di quell’azienda.",
  guideBack: "Scegli un altro modo",
  guideBadgeReady: "Connesso",
  guideBadgeInstalled: "Installato",
  guideBadgeCheck: "Da verificare",
  guideStepsLabel: "Passaggi di connessione",
  stepInstall: "Installa il programma",
  stepLogin: "Accedi",
  stepReady: "Connesso",
  installReturnNote: "Quando l’installazione in quella finestra è finita, torna qui. L’app verifica di nuovo da sola.",
  loginHowNote: "Premendo si apre un browser. Accedi con il tuo account {vendor} e premi Consenti: la connessione si completa da sola.",
  signingInStalledNote: "Il browser non si è aperto o mostra un codice? Apri la finestra di accesso con il pulsante qui sotto. Incolla nel browser l’indirizzo mostrato nella finestra, oppure incolla nella finestra il codice del browser.",
  actionLoginWindowOpen: "Apri la finestra di accesso",
  actionCancelLogin: "Annulla l’accesso",
  actionUpdate: "Aggiorna",
  updateNote: "Premendo, l’aggiornamento ufficiale di {vendor} viene eseguito in una nuova finestra. Quando lì è finito, torna qui.",
  guideInfoHint: "Ancora niente? Copia i dati di connessione e inviali a chi ti sta aiutando. Non contengono account né percorsi di file.",
  actionCopyInfo: "Copia i dati per l’assistenza",
  copyInfoDone: "Copiato"
};
const pl$2 = {
  aiAssistant: "Asystent AI",
  cardChecking: "Sprawdzanie…",
  cardNotInstalled: "Nie zainstalowano",
  cardSignedOut: "Nie zalogowano",
  cardSigningIn: "Logowanie…",
  cardReady: "Połączono",
  cardReadyPlan: "Połączono · {plan}",
  cardMetered: "Zalogowano, ale nie w ramach subskrypcji",
  cardMeteredAccepted: "W użyciu · opłata za zużycie",
  cardError: "Nie udało się sprawdzić połączenia",
  cardErrNeedsUpdate: "Program {provider} na tym komputerze jest zbyt stary. Zaktualizuj go, a potem sprawdź ponownie.",
  cardErrNeedsUpdateVersion: "Program {provider} na tym komputerze ({version}) jest zbyt stary; potrzebna jest wersja {minimum} lub nowsza. Uruchom {command} w terminalu, a potem sprawdź ponownie.",
  cardErrNeedsUpdatePath: "Plik uruchamiany przez tę aplikację:",
  cardErrNeedsUpdateWindows: "Aktualizacja {provider} w WSL (Ubuntu) lub w innym folderze nie zmienia tego pliku. Uruchom {command} w Windows PowerShell.",
  cardErrTimeout: "Program {provider} nie odpowiedział na czas. Sprawdź ponownie za chwilę.",
  cardErrFailed: "Podczas sprawdzania {provider} wystąpił problem. Sprawdź ponownie.",
  actionInstall: "Zainstaluj",
  actionLogin: "Zaloguj się",
  actionLoginWindow: "Przeglądarka się nie otworzyła albo pokazuje kod?",
  actionRecheck: "Sprawdź ponownie",
  actionAcceptMetered: "Użyj mimo to",
  actionInstallHelp: "Oficjalna instrukcja instalacji",
  actionOpenSettings: "Otwórz ustawienia",
  actionDismiss: "Zamknij",
  actionSwitchAccount: "Zaloguj się na inne konto",
  actionLogout: "Wyloguj się",
  installNote: "Oficjalne polecenie instalacji firmy {vendor} zostanie uruchomione w nowym oknie terminala.",
  loginNote: "Strona logowania, która się otworzy, należy do firmy {vendor}.",
  signingInBrowserNote: "Zaloguj się na swoje konto {vendor} w otwartej przeglądarce i zezwól na dostęp. Połączenie nastąpi samo, gdy skończysz.",
  signingInWindowNote: "Jeśli przeglądarka się nie otworzyła, skopiuj adres widoczny w oknie, które właśnie się otworzyło, i otwórz go w przeglądarce. Gdy przeglądarka pokaże kod, skopiuj go, wklej raz w tym oknie i naciśnij Enter. Wklejony kod może nie być widoczny w oknie.",
  meteredWarning: "To nie jest subskrypcja: płacisz za faktyczne zużycie.",
  meteredMeaning: "To logowanie korzysta z klucza API lub konta rozliczanego za zużycie albo nie udało się ustalić jego rodzaju. Po wybraniu „Użyj mimo to” AI będzie działać przez to połączenie, a każde żądanie obciąży to konto.",
  connectTitle: "Połącz AI, aby zacząć",
  connectBody: "AI działa w ramach subskrypcji Claude lub Codex, którą już masz. Klucz API nie jest potrzebny.",
  connectProviderTitle: "Połączenie {provider} jest teraz niedostępne",
  connectKeyBody: "Konfiguracja dostawcy {provider} nie została ukończona. Dokończ ją w Ustawieniach lub wybierz inne AI.",
  errNotConnected: "Żadne AI nie jest połączone. Najpierw połącz subskrypcję Claude lub Codex albo darmowe AI.",
  errNotInstalled: "Na tym komputerze nie znaleziono programu {provider}.",
  errSignedOut: "Logowanie do {provider} wygasło. Zaloguj się ponownie, aby kontynuować.",
  errRateLimit: "Limit subskrypcji {provider} został wyczerpany.",
  errRateLimitReset: "Limit subskrypcji {provider} został wyczerpany. Odnowi się o {time}.",
  errUnsafeTools: "Program {provider} uruchomił się z włączonymi własnymi narzędziami, więc ze względów bezpieczeństwa zatrzymano działanie.",
  errMeteredNotAccepted: "Połączenie {provider} jest rozliczane za zużycie i nie zostało jeszcze dopuszczone. Aby z niego korzystać, wybierz „Użyj mimo to” w ustawieniach połączenia.",
  errNeedsUpdate: "Program {provider} jest zbyt stary dla tej funkcji. Zaktualizuj go i spróbuj ponownie.",
  errHeadlessLimit: "Osiągnięto godzinny limit żądań automatycznych.",
  errHeadlessLimitReset: "Osiągnięto godzinny limit żądań automatycznych. Będą znów możliwe o {time}.",
  connectFreeHint: "Nie masz subskrypcji? W Ustawieniach połączysz darmowe AI w około minutę.",
  actionConnectFree: "Połącz darmowe AI",
  errFreeLimit: "Dzisiejszy darmowy limit został wykorzystany. Spróbuj ponownie jutro lub wybierz inne AI w Ustawieniach.",
  errFreeLimitReset: "Dzisiejszy darmowy limit został wykorzystany. Możesz znów korzystać o {time}.",
  continueWith: "Kontynuuj z {provider}",
  continueMeteredNote: "Połączenie {provider} nie jest subskrypcją: dalsza praca jest płatna za zużycie.",
  usageLine: "Wykorzystano {percent}% · odnowienie o {time}",
  usageWindowFiveHour: "Limit 5-godzinny",
  usageWindowSevenDay: "Limit 7-dniowy",
  noticeTitle: "Zanim użyjesz AI w ramach subskrypcji",
  noticeSend: "Treść dokumentu i rozmowa są wysyłane do Anthropic lub OpenAI z Twojego własnego konta. Każde żądanie zawiera też nazwę, tytuł i opis każdej umiejętności ustawionej na „Decyduje AI”; wysyłane są też używane umiejętności i pliki umiejętności odczytane przez AI.",
  noticeTraining: "To, czy te treści służą do trenowania AI, zależy od ustawień Twojego konta w danej firmie.",
  noticeCodexHistory: "Ta aplikacja wyłącza zapisywanie historii rozmów w Codex, ale Codex może nadal przechowywać własne dzienniki diagnostyczne na tym komputerze.",
  noticePdfWholeDocument: "W edytorze PDF odczytywanie stron przez AI i tłumaczenie dokumentu mogą wysyłać obrazy stron i cały tekst dokumentu.",
  noticeAck: "Rozumiem",
  codexNotice: "Korzystanie z subskrypcji Codex wewnątrz aplikacji nie jest metodą oficjalnie zalecaną przez OpenAI.",
  truncatedNotice: "Dane wejściowe były zbyt długie, więc ich część została obcięta przed wysłaniem.",
  pickerAuto: "Automatycznie",
  pickerAutoUsing: "Automatycznie · {provider}",
  pickerAutoUsingModel: "Automatycznie · {provider} · {model}",
  pickerDefaultModel: "Model domyślny",
  pickerDefaultModelNamed: "Model domyślny · {model}",
  pickerSubscription: "Subskrypcja",
  pickerPaid: "Płatne",
  pickerPaidTitle: "Opłata za zużycie, nieobjęte subskrypcją",
  pickerNotConnected: "Połącz AI",
  guideQuestion: "Z jakiego AI już korzystasz?",
  guidePathClaudeTitle: "Mam płatną subskrypcję Claude",
  guidePathClaudeBody: "Potrzebny jest plan Pro lub Max. Darmowe konto Claude nie może się połączyć.",
  guidePathCodexTitle: "Korzystam z ChatGPT",
  guidePathCodexBody: "Zaloguj się do programu Codex firmy OpenAI kontem ChatGPT. Darmowy plan pozwala tylko na niewielkie użycie.",
  guidePathFreeTitle: "Jeszcze z żadnego",
  guidePathFreeBody: "Połącz darmowe AI w około minutę. Dopóki korzystasz z niego za darmo, wysyłane treści mogą posłużyć do ulepszania AI tej firmy.",
  guideBack: "Wybierz inny sposób",
  guideBadgeReady: "Połączono",
  guideBadgeInstalled: "Zainstalowano",
  guideBadgeCheck: "Do sprawdzenia",
  guideStepsLabel: "Kroki połączenia",
  stepInstall: "Instalacja programu",
  stepLogin: "Logowanie",
  stepReady: "Połączono",
  installReturnNote: "Gdy instalacja w tamtym oknie się zakończy, wróć tutaj. Aplikacja sama sprawdzi ponownie.",
  loginHowNote: "Po kliknięciu otworzy się przeglądarka. Zaloguj się na konto {vendor} i kliknij Zezwól, a połączenie nastąpi samo.",
  signingInStalledNote: "Przeglądarka się nie otworzyła albo pokazuje kod? Otwórz okno logowania przyciskiem poniżej. Wklej adres z tego okna do przeglądarki albo wklej kod z przeglądarki do okna.",
  actionLoginWindowOpen: "Otwórz okno logowania",
  actionCancelLogin: "Anuluj logowanie",
  actionUpdate: "Zaktualizuj",
  updateNote: "Po kliknięciu oficjalna aktualizacja firmy {vendor} uruchomi się w nowym oknie. Gdy się tam zakończy, wróć tutaj.",
  guideInfoHint: "Nadal nie działa? Skopiuj informacje o połączeniu i wyślij je osobie, która Ci pomaga. Nie zawierają konta ani ścieżek plików.",
  actionCopyInfo: "Kopiuj informacje dla pomocy",
  copyInfoDone: "Skopiowano"
};
const cs$2 = {
  aiAssistant: "Asistent AI",
  cardChecking: "Probíhá kontrola…",
  cardNotInstalled: "Není nainstalováno",
  cardSignedOut: "Nepřihlášeno",
  cardSigningIn: "Probíhá přihlášení…",
  cardReady: "Připojeno",
  cardReadyPlan: "Připojeno · {plan}",
  cardMetered: "Přihlášeno, ale ne přes předplatné",
  cardMeteredAccepted: "Používá se · účtováno podle spotřeby",
  cardError: "Připojení se nepodařilo ověřit",
  cardErrNeedsUpdate: "Program {provider} v tomto počítači je příliš starý. Aktualizujte ho a zkontrolujte znovu.",
  cardErrNeedsUpdateVersion: "Program {provider} v tomto počítači ({version}) je příliš starý; je potřeba verze {minimum} nebo novější. Spusťte v terminálu {command} a zkontrolujte znovu.",
  cardErrNeedsUpdatePath: "Soubor, který tato aplikace spouští:",
  cardErrNeedsUpdateWindows: "Aktualizace programu {provider} ve WSL (Ubuntu) nebo v jiné složce tento soubor nezmění. Spusťte {command} ve Windows PowerShellu.",
  cardErrTimeout: "Program {provider} neodpověděl včas. Zkontrolujte to za chvíli znovu.",
  cardErrFailed: "Při kontrole {provider} došlo k potížím. Zkontrolujte to znovu.",
  actionInstall: "Nainstalovat",
  actionLogin: "Přihlásit se",
  actionLoginWindow: "Prohlížeč se neotevřel, nebo zobrazuje kód?",
  actionRecheck: "Zkontrolovat znovu",
  actionAcceptMetered: "Přesto použít",
  actionInstallHelp: "Oficiální návod k instalaci",
  actionOpenSettings: "Otevřít nastavení",
  actionDismiss: "Zavřít",
  actionSwitchAccount: "Přihlásit se jiným účtem",
  actionLogout: "Odhlásit se",
  installNote: "Oficiální instalační příkaz společnosti {vendor} se spustí v novém okně terminálu.",
  loginNote: "Přihlašovací stránka, která se otevře, patří společnosti {vendor}.",
  signingInBrowserNote: "V otevřeném prohlížeči se přihlaste ke svému účtu {vendor} a povolte přístup. Po dokončení se připojení vytvoří samo.",
  signingInWindowNote: "Pokud se prohlížeč neotevřel, zkopírujte adresu zobrazenou v právě otevřeném okně a otevřete ji v prohlížeči. Když prohlížeč zobrazí kód, zkopírujte ho, vložte ho jednou do toho okna a stiskněte Enter. Vložený kód se v okně nemusí zobrazit.",
  meteredWarning: "Toto není předplatné: platíte podle skutečné spotřeby.",
  meteredMeaning: "Toto přihlášení používá klíč API nebo účet s platbou podle spotřeby, případně se jeho typ nepodařilo zjistit. Volbou „Přesto použít“ poběží AI přes toto připojení a každý požadavek se naúčtuje tomuto účtu.",
  connectTitle: "Začněte připojením AI",
  connectBody: "AI běží na předplatném Claude nebo Codex, které už máte. Klíč API není potřeba.",
  connectProviderTitle: "Připojení {provider} teď nelze použít",
  connectKeyBody: "Nastavení poskytovatele {provider} není dokončeno. Dokončete ho v Nastavení, nebo zvolte jinou AI.",
  errNotConnected: "Není připojena žádná AI. Nejprve připojte předplatné Claude nebo Codex, nebo bezplatnou AI.",
  errNotInstalled: "Program {provider} nebyl na tomto počítači nalezen.",
  errSignedOut: "Přihlášení k {provider} vypršelo. Přihlaste se znovu a pokračujte.",
  errRateLimit: "Limit předplatného {provider} je vyčerpán.",
  errRateLimitReset: "Limit předplatného {provider} je vyčerpán. Obnoví se v {time}.",
  errUnsafeTools: "Program {provider} se spustil se zapnutými vlastními nástroji, proto byl běh z bezpečnostních důvodů zastaven.",
  errMeteredNotAccepted: "Připojení {provider} se účtuje podle spotřeby a zatím jste ho nepovolili. Chcete-li ho používat, zvolte v nastavení připojení „Přesto použít“.",
  errNeedsUpdate: "Program {provider} je pro tuto funkci příliš starý. Aktualizujte ho a zkuste to znovu.",
  errHeadlessLimit: "Byl dosažen hodinový limit automatických požadavků.",
  errHeadlessLimitReset: "Byl dosažen hodinový limit automatických požadavků. Znovu budou možné v {time}.",
  connectFreeHint: "Nemáte předplatné? V Nastavení můžete bezplatnou AI připojit zhruba za minutu.",
  actionConnectFree: "Připojit bezplatnou AI",
  errFreeLimit: "Dnešní bezplatný limit je vyčerpán. Zkuste to zítra, nebo v Nastavení zvolte jinou AI.",
  errFreeLimitReset: "Dnešní bezplatný limit je vyčerpán. Znovu ho můžete použít v {time}.",
  continueWith: "Pokračovat s {provider}",
  continueMeteredNote: "Připojení {provider} není předplatné: pokračování se účtuje podle spotřeby.",
  usageLine: "Využito {percent} % · obnoví se v {time}",
  usageWindowFiveHour: "5hodinový limit",
  usageWindowSevenDay: "7denní limit",
  noticeTitle: "Než začnete AI používat s předplatným",
  noticeSend: "Obsah dokumentu a konverzace se odesílají společnosti Anthropic nebo OpenAI pod vaším vlastním účtem. Každý požadavek nese také název, nadpis a popis každé dovednosti s nastavením „Rozhoduje AI“; odesílají se také použité dovednosti a soubory dovedností, které AI přečte.",
  noticeTraining: "Zda se tento obsah použije k trénování AI, určuje nastavení vašeho účtu u dané společnosti.",
  noticeCodexHistory: "Tato aplikace vypíná ukládání historie konverzací v Codexu, Codex však může v tomto počítači dál uchovávat vlastní diagnostické protokoly.",
  noticePdfWholeDocument: "V editoru PDF mohou čtení stránek pomocí AI a překlad dokumentu odesílat obrázky stránek a celý text dokumentu.",
  noticeAck: "Rozumím",
  codexNotice: "Používání předplatného Codex uvnitř aplikace není způsob, který OpenAI oficiálně doporučuje.",
  truncatedNotice: "Vstup byl příliš dlouhý, proto byla jeho část před odesláním oříznuta.",
  pickerAuto: "Automaticky",
  pickerAutoUsing: "Automaticky · {provider}",
  pickerAutoUsingModel: "Automaticky · {provider} · {model}",
  pickerDefaultModel: "Výchozí model",
  pickerDefaultModelNamed: "Výchozí model · {model}",
  pickerSubscription: "Předplatné",
  pickerPaid: "Placené",
  pickerPaidTitle: "Účtováno podle spotřeby, nekryje to předplatné",
  pickerNotConnected: "Připojit AI",
  guideQuestion: "Jakou AI už používáte?",
  guidePathClaudeTitle: "Mám placené předplatné Claude",
  guidePathClaudeBody: "Je potřeba tarif Pro nebo Max. Bezplatný účet Claude se připojit nedá.",
  guidePathCodexTitle: "Používám ChatGPT",
  guidePathCodexBody: "Přihlaste se účtem ChatGPT do programu Codex společnosti OpenAI. Bezplatný tarif umožňuje jen malé využití.",
  guidePathFreeTitle: "Zatím žádnou",
  guidePathFreeBody: "Bezplatnou AI připojíte zhruba za minutu. Dokud ji používáte zdarma, může společnost odeslaný obsah využít ke zlepšení své AI.",
  guideBack: "Zvolit jiný způsob",
  guideBadgeReady: "Připojeno",
  guideBadgeInstalled: "Nainstalováno",
  guideBadgeCheck: "Ke kontrole",
  guideStepsLabel: "Kroky připojení",
  stepInstall: "Instalace programu",
  stepLogin: "Přihlášení",
  stepReady: "Připojeno",
  installReturnNote: "Až instalace v tom okně skončí, vraťte se sem. Aplikace to sama zkontroluje znovu.",
  loginHowNote: "Po kliknutí se otevře prohlížeč. Přihlaste se účtem {vendor} a klikněte na Povolit; připojení se dokončí samo.",
  signingInStalledNote: "Prohlížeč se neotevřel, nebo zobrazuje kód? Otevřete přihlašovací okno tlačítkem níže. Vložte adresu zobrazenou v okně do prohlížeče, nebo vložte kód z prohlížeče do okna.",
  actionLoginWindowOpen: "Otevřít přihlašovací okno",
  actionCancelLogin: "Zrušit přihlášení",
  actionUpdate: "Aktualizovat",
  updateNote: "Po kliknutí se v novém okně spustí oficiální aktualizace společnosti {vendor}. Až tam skončí, vraťte se sem.",
  guideInfoHint: "Pořád to nejde? Zkopírujte informace o připojení a pošlete je tomu, kdo vám pomáhá. Neobsahují účet ani cesty k souborům.",
  actionCopyInfo: "Kopírovat informace pro pomoc",
  copyInfoDone: "Zkopírováno"
};
const nl$2 = {
  aiAssistant: "AI-assistent",
  cardChecking: "Controleren…",
  cardNotInstalled: "Niet geïnstalleerd",
  cardSignedOut: "Niet aangemeld",
  cardSigningIn: "Bezig met aanmelden…",
  cardReady: "Verbonden",
  cardReadyPlan: "Verbonden · {plan}",
  cardMetered: "Aangemeld, maar niet met een abonnement",
  cardMeteredAccepted: "In gebruik · betaald per verbruik",
  cardError: "De verbinding kon niet worden gecontroleerd",
  cardErrNeedsUpdate: "Het programma {provider} op deze pc is te oud. Werk het bij en controleer daarna opnieuw.",
  cardErrNeedsUpdateVersion: "Het programma {provider} op deze pc ({version}) is te oud; {minimum} of nieuwer is nodig. Voer {command} uit in een terminal en controleer daarna opnieuw.",
  cardErrNeedsUpdatePath: "Bestand dat deze app uitvoert:",
  cardErrNeedsUpdateWindows: "Als je {provider} in WSL (Ubuntu) of in een andere map bijwerkt, verandert dit bestand niet. Voer {command} uit in Windows PowerShell.",
  cardErrTimeout: "Het programma {provider} heeft niet op tijd gereageerd. Controleer het zo dadelijk opnieuw.",
  cardErrFailed: "Er ging iets mis bij het controleren van {provider}. Controleer het opnieuw.",
  actionInstall: "Installeren",
  actionLogin: "Aanmelden",
  actionLoginWindow: "Browser niet geopend, of toont hij een code?",
  actionRecheck: "Opnieuw controleren",
  actionAcceptMetered: "Toch gebruiken",
  actionInstallHelp: "Officiële installatiehandleiding",
  actionOpenSettings: "Instellingen openen",
  actionDismiss: "Sluiten",
  actionSwitchAccount: "Aanmelden met een ander account",
  actionLogout: "Afmelden",
  installNote: "De officiële installatieopdracht van {vendor} wordt uitgevoerd in een nieuw terminalvenster.",
  loginNote: "De aanmeldpagina die wordt geopend is van {vendor} zelf.",
  signingInBrowserNote: "Meld je in de geopende browser aan bij je {vendor}-account en sta toegang toe. De verbinding komt vanzelf tot stand als je klaar bent.",
  signingInWindowNote: "Is de browser niet geopend, kopieer dan het adres uit het venster dat net is geopend en open het in je browser. Toont de browser een code, kopieer die, plak hem één keer in dat venster en druk op Enter. De geplakte code is mogelijk niet zichtbaar in het venster.",
  meteredWarning: "Dit is geen abonnement: je betaalt voor wat je gebruikt.",
  meteredMeaning: "Deze aanmelding gebruikt een API-sleutel of een account met betaling per verbruik, of het type kon niet worden vastgesteld. Met ‘Toch gebruiken’ draait AI via deze verbinding en wordt elk verzoek bij dat account in rekening gebracht.",
  connectTitle: "Koppel een AI om te beginnen",
  connectBody: "AI draait op het Claude- of Codex-abonnement dat je al hebt. Een API-sleutel is niet nodig.",
  connectProviderTitle: "De verbinding {provider} is nu niet bruikbaar",
  connectKeyBody: "De configuratie van {provider} is nog niet af. Rond die af in Instellingen of kies een andere AI.",
  errNotConnected: "Er is geen AI verbonden. Koppel eerst een Claude- of Codex-abonnement, of een gratis AI.",
  errNotInstalled: "Het programma {provider} is niet gevonden op deze pc.",
  errSignedOut: "De aanmelding bij {provider} is verlopen. Meld je opnieuw aan om door te gaan.",
  errRateLimit: "De limiet van het abonnement {provider} is bereikt.",
  errRateLimitReset: "De limiet van het abonnement {provider} is bereikt. Deze wordt om {time} hersteld.",
  errUnsafeTools: "Het programma {provider} is gestart met eigen hulpmiddelen ingeschakeld; de uitvoering is uit veiligheid gestopt.",
  errMeteredNotAccepted: "De verbinding {provider} wordt per verbruik betaald en je hebt die nog niet toegestaan. Kies ‘Toch gebruiken’ in de verbindingsinstellingen om deze te gebruiken.",
  errNeedsUpdate: "Het programma {provider} is te oud voor deze functie. Werk het bij en probeer het opnieuw.",
  errHeadlessLimit: "De uurlimiet voor automatische verzoeken is bereikt.",
  errHeadlessLimitReset: "De uurlimiet voor automatische verzoeken is bereikt. Verzoeken zijn weer mogelijk om {time}.",
  connectFreeHint: "Geen abonnement? In Instellingen koppel je in ongeveer een minuut een gratis AI.",
  actionConnectFree: "Gratis AI koppelen",
  errFreeLimit: "Het gratis tegoed van vandaag is op. Probeer het morgen opnieuw of kies een andere AI in Instellingen.",
  errFreeLimitReset: "Het gratis tegoed van vandaag is op. Je kunt het weer gebruiken om {time}.",
  continueWith: "Doorgaan met {provider}",
  continueMeteredNote: "De verbinding {provider} is geen abonnement: doorgaan wordt per verbruik in rekening gebracht.",
  usageLine: "{percent}% gebruikt · herstelt om {time}",
  usageWindowFiveHour: "Limiet per 5 uur",
  usageWindowSevenDay: "Limiet per 7 dagen",
  noticeTitle: "Voordat je AI met je abonnement gebruikt",
  noticeSend: "De inhoud van het document en je gesprek worden onder je eigen account naar Anthropic of OpenAI verzonden. Elk verzoek bevat ook de naam, titel en beschrijving van elke vaardigheid die op ‘AI beslist’ staat; gebruikte vaardigheden en vaardigheidsbestanden die de AI leest, worden ook verzonden.",
  noticeTraining: "Of die inhoud wordt gebruikt om AI te trainen, wordt bepaald door de instellingen van je eigen account bij dat bedrijf.",
  noticeCodexHistory: "Deze app zet het opslaan van de gespreksgeschiedenis in Codex uit, maar Codex kan nog steeds eigen diagnostische logboeken op deze pc bewaren.",
  noticePdfWholeDocument: "In de pdf-editor kunnen het lezen van pagina’s met AI en het vertalen van documenten afbeeldingen van de pagina’s en de volledige tekst van het document versturen.",
  noticeAck: "Begrepen",
  codexNotice: "Een Codex-abonnement gebruiken in een app is geen methode die OpenAI officieel aanbeveelt.",
  truncatedNotice: "De invoer was te lang; een deel is afgekapt voordat deze werd verzonden.",
  pickerAuto: "Automatisch",
  pickerAutoUsing: "Automatisch · {provider}",
  pickerAutoUsingModel: "Automatisch · {provider} · {model}",
  pickerDefaultModel: "Standaardmodel",
  pickerDefaultModelNamed: "Standaardmodel · {model}",
  pickerSubscription: "Abonnement",
  pickerPaid: "Betaald",
  pickerPaidTitle: "Betaald per verbruik, valt niet onder een abonnement",
  pickerNotConnected: "AI koppelen",
  guideQuestion: "Welke AI gebruik je al?",
  guidePathClaudeTitle: "Ik heb een betaald Claude-abonnement",
  guidePathClaudeBody: "Je hebt een Pro- of Max-abonnement nodig. Met een gratis Claude-account lukt verbinden niet.",
  guidePathCodexTitle: "Ik gebruik ChatGPT",
  guidePathCodexBody: "Meld je met je ChatGPT-account aan bij het Codex-programma van OpenAI. Met het gratis abonnement kun je maar weinig gebruiken.",
  guidePathFreeTitle: "Nog geen van beide",
  guidePathFreeBody: "Koppel in ongeveer een minuut een gratis AI. Zolang je die gratis gebruikt, kan wat je verstuurt worden gebruikt om de AI van dat bedrijf te verbeteren.",
  guideBack: "Een andere manier kiezen",
  guideBadgeReady: "Verbonden",
  guideBadgeInstalled: "Geïnstalleerd",
  guideBadgeCheck: "Controleren",
  guideStepsLabel: "Verbindingsstappen",
  stepInstall: "Programma installeren",
  stepLogin: "Aanmelden",
  stepReady: "Verbonden",
  installReturnNote: "Kom hier terug als de installatie in dat venster klaar is. De app controleert dan vanzelf opnieuw.",
  loginHowNote: "Als je erop klikt, opent er een browser. Meld je aan met je {vendor}-account en klik op Toestaan; de verbinding komt vanzelf tot stand.",
  signingInStalledNote: "Browser niet geopend, of toont hij een code? Open het aanmeldvenster met de knop hieronder. Plak het adres uit dat venster in je browser, of plak de code uit de browser in het venster.",
  actionLoginWindowOpen: "Aanmeldvenster openen",
  actionCancelLogin: "Aanmelden annuleren",
  actionUpdate: "Bijwerken",
  updateNote: "Als je erop klikt, wordt de officiële update van {vendor} in een nieuw venster uitgevoerd. Kom hier terug als die daar klaar is.",
  guideInfoHint: "Lukt het nog steeds niet? Kopieer de verbindingsgegevens en stuur ze naar degene die je helpt. Er staan geen account en geen bestandspaden in.",
  actionCopyInfo: "Gegevens kopiëren voor hulp",
  copyInfoDone: "Gekopieerd"
};
const ms$2 = {
  aiAssistant: "Pembantu AI",
  cardChecking: "Sedang menyemak…",
  cardNotInstalled: "Belum dipasang",
  cardSignedOut: "Belum log masuk",
  cardSigningIn: "Sedang log masuk…",
  cardReady: "Disambungkan",
  cardReadyPlan: "Disambungkan · {plan}",
  cardMetered: "Sudah log masuk, tetapi bukan dengan langganan",
  cardMeteredAccepted: "Sedang digunakan · dicaj mengikut penggunaan",
  cardError: "Sambungan tidak dapat disemak",
  cardErrNeedsUpdate: "Program {provider} pada PC ini terlalu lama. Kemas kini, kemudian semak semula.",
  cardErrNeedsUpdateVersion: "Program {provider} pada PC ini ({version}) terlalu lama; versi {minimum} atau lebih baharu diperlukan. Jalankan {command} dalam terminal, kemudian semak semula.",
  cardErrNeedsUpdatePath: "Fail yang dijalankan oleh aplikasi ini:",
  cardErrNeedsUpdateWindows: "Mengemas kini {provider} di dalam WSL (Ubuntu) atau dalam folder lain tidak mengubah fail ini. Jalankan {command} dalam Windows PowerShell.",
  cardErrTimeout: "Program {provider} tidak menjawab dalam masa yang ditetapkan. Semak semula sebentar lagi.",
  cardErrFailed: "Masalah berlaku semasa menyemak {provider}. Semak semula.",
  actionInstall: "Pasang",
  actionLogin: "Log masuk",
  actionLoginWindow: "Pelayar tidak dibuka, atau menunjukkan kod?",
  actionRecheck: "Semak semula",
  actionAcceptMetered: "Guna juga",
  actionInstallHelp: "Panduan pemasangan rasmi",
  actionOpenSettings: "Buka tetapan",
  actionDismiss: "Tutup",
  actionSwitchAccount: "Log masuk dengan akaun lain",
  actionLogout: "Log keluar",
  installNote: "Arahan pemasangan rasmi {vendor} dijalankan dalam tetingkap terminal baharu.",
  loginNote: "Halaman log masuk yang dibuka ialah milik {vendor}.",
  signingInBrowserNote: "Log masuk ke akaun {vendor} anda dalam pelayar yang dibuka, kemudian benarkan akses. Sambungan akan dibuat sendiri apabila selesai.",
  signingInWindowNote: "Jika pelayar tidak dibuka, salin alamat yang ditunjukkan dalam tetingkap yang baru dibuka dan bukanya dalam pelayar. Apabila pelayar menunjukkan kod, salin dan tampalkannya sekali ke tetingkap itu, kemudian tekan Enter. Kod yang ditampal mungkin tidak kelihatan dalam tetingkap.",
  meteredWarning: "Ini bukan langganan: anda dicaj mengikut penggunaan.",
  meteredMeaning: 'Log masuk ini menggunakan kunci API atau akaun bayar ikut guna, atau jenisnya tidak dapat disahkan. Dengan "Guna juga", AI berjalan melalui sambungan ini dan setiap permintaan dicaj kepada akaun tersebut.',
  connectTitle: "Sambungkan AI untuk bermula",
  connectBody: "AI berjalan dengan langganan Claude atau Codex yang anda sudah ada. Kunci API tidak diperlukan.",
  connectProviderTitle: "Sambungan {provider} tidak boleh digunakan sekarang",
  connectKeyBody: "Persediaan {provider} belum selesai. Lengkapkannya dalam Tetapan, atau pilih AI lain.",
  errNotConnected: "Tiada AI yang disambungkan. Sambungkan langganan Claude atau Codex, atau AI percuma, dahulu.",
  errNotInstalled: "Program {provider} tidak ditemui pada PC ini.",
  errSignedOut: "Log masuk {provider} telah tamat. Log masuk semula untuk meneruskan.",
  errRateLimit: "Had langganan {provider} telah habis digunakan.",
  errRateLimitReset: "Had langganan {provider} telah habis digunakan. Had ditetapkan semula pada {time}.",
  errUnsafeTools: "Program {provider} bermula dengan alatnya sendiri masih aktif, jadi proses dihentikan demi keselamatan.",
  errMeteredNotAccepted: 'Sambungan {provider} dicaj mengikut penggunaan dan anda belum membenarkannya. Pilih "Guna juga" dalam tetapan sambungan untuk menggunakannya.',
  errNeedsUpdate: "Program {provider} terlalu lama untuk ciri ini. Kemas kini dan cuba lagi.",
  errHeadlessLimit: "Had sejam bagi permintaan automatik telah dicapai.",
  errHeadlessLimitReset: "Had sejam bagi permintaan automatik telah dicapai. Permintaan boleh dibuat semula pada {time}.",
  connectFreeHint: "Tiada langganan? Anda boleh menyambungkan AI percuma dalam Tetapan dalam masa kira-kira seminit.",
  actionConnectFree: "Sambungkan AI percuma",
  errFreeLimit: "Peruntukan percuma hari ini telah habis. Cuba lagi esok, atau pilih AI lain dalam Tetapan.",
  errFreeLimitReset: "Peruntukan percuma hari ini telah habis. Anda boleh menggunakannya semula pada {time}.",
  continueWith: "Teruskan dengan {provider}",
  continueMeteredNote: "Sambungan {provider} bukan langganan: meneruskan akan dicaj mengikut penggunaan.",
  usageLine: "{percent}% digunakan · ditetapkan semula pada {time}",
  usageWindowFiveHour: "Had 5 jam",
  usageWindowSevenDay: "Had 7 hari",
  noticeTitle: "Sebelum menggunakan AI dengan langganan anda",
  noticeSend: 'Kandungan dokumen dan perbualan anda dihantar kepada Anthropic atau OpenAI di bawah akaun anda sendiri. Setiap permintaan juga membawa nama, tajuk dan penerangan setiap kemahiran yang ditetapkan kepada "AI tentukan"; kemahiran yang digunakan dan fail kemahiran yang dibaca oleh AI turut dihantar.',
  noticeTraining: "Sama ada kandungan itu digunakan untuk melatih AI ditentukan oleh tetapan akaun anda sendiri di syarikat tersebut.",
  noticeCodexHistory: "Aplikasi ini mematikan penyimpanan sejarah perbualan Codex, tetapi Codex mungkin masih menyimpan log diagnostiknya sendiri pada PC ini.",
  noticePdfWholeDocument: "Dalam editor PDF, bacaan halaman dengan AI dan terjemahan dokumen mungkin menghantar imej halaman dan seluruh teks dokumen.",
  noticeAck: "Faham",
  codexNotice: "Menggunakan langganan Codex di dalam aplikasi bukan kaedah yang disyorkan secara rasmi oleh OpenAI.",
  truncatedNotice: "Input terlalu panjang, jadi sebahagiannya dipotong sebelum dihantar.",
  pickerAuto: "Automatik",
  pickerAutoUsing: "Automatik · {provider}",
  pickerAutoUsingModel: "Automatik · {provider} · {model}",
  pickerDefaultModel: "Model lalai",
  pickerDefaultModelNamed: "Model lalai · {model}",
  pickerSubscription: "Langganan",
  pickerPaid: "Berbayar",
  pickerPaidTitle: "Dicaj mengikut penggunaan, tidak diliputi langganan",
  pickerNotConnected: "Sambungkan AI",
  guideQuestion: "AI mana yang sudah anda gunakan?",
  guidePathClaudeTitle: "Saya ada langganan Claude berbayar",
  guidePathClaudeBody: "Memerlukan pelan Pro atau Max. Akaun Claude percuma tidak boleh disambungkan.",
  guidePathCodexTitle: "Saya guna ChatGPT",
  guidePathCodexBody: "Log masuk ke program Codex OpenAI dengan akaun ChatGPT anda. Pelan percuma hanya membenarkan sedikit penggunaan.",
  guidePathFreeTitle: "Belum ada kedua-duanya",
  guidePathFreeBody: "Sambungkan AI percuma dalam masa kira-kira seminit. Semasa anda menggunakannya secara percuma, kandungan yang anda hantar mungkin digunakan untuk menambah baik AI syarikat itu.",
  guideBack: "Pilih cara lain",
  guideBadgeReady: "Disambungkan",
  guideBadgeInstalled: "Dipasang",
  guideBadgeCheck: "Perlu disemak",
  guideStepsLabel: "Langkah sambungan",
  stepInstall: "Pasang program",
  stepLogin: "Log masuk",
  stepReady: "Disambungkan",
  installReturnNote: "Apabila pemasangan dalam tetingkap itu selesai, kembali ke sini. Aplikasi akan menyemak semula dengan sendiri.",
  loginHowNote: "Pelayar akan dibuka apabila anda menekannya. Log masuk dengan akaun {vendor} anda dan tekan Benarkan; sambungan akan selesai dengan sendiri.",
  signingInStalledNote: "Pelayar tidak dibuka, atau menunjukkan kod? Buka tetingkap log masuk dengan butang di bawah. Tampalkan alamat yang ditunjukkan dalam tetingkap itu ke pelayar, atau tampalkan kod daripada pelayar ke tetingkap.",
  actionLoginWindowOpen: "Buka tetingkap log masuk",
  actionCancelLogin: "Batalkan log masuk",
  actionUpdate: "Kemas kini",
  updateNote: "Apabila anda menekannya, kemas kini rasmi {vendor} dijalankan dalam tetingkap baharu. Apabila selesai di sana, kembali ke sini.",
  guideInfoHint: "Masih tidak berjaya? Salin maklumat sambungan dan hantar kepada orang yang membantu anda. Maklumat ini tidak mengandungi akaun atau laluan fail.",
  actionCopyInfo: "Salin maklumat untuk bantuan",
  copyInfoDone: "Disalin"
};
const he$2 = {
  aiAssistant: "עוזר AI",
  cardChecking: "בודק…",
  cardNotInstalled: "לא מותקן",
  cardSignedOut: "לא מחובר לחשבון",
  cardSigningIn: "מתבצעת כניסה…",
  cardReady: "מחובר",
  cardReadyPlan: "מחובר · {plan}",
  cardMetered: "בוצעה כניסה, אך לא באמצעות מינוי",
  cardMeteredAccepted: "בשימוש · חיוב לפי שימוש",
  cardError: "לא ניתן היה לבדוק את החיבור",
  cardErrNeedsUpdate: "התוכנה {provider} במחשב הזה ישנה מדי. עדכנו אותה ואז בדקו שוב.",
  cardErrNeedsUpdateVersion: "התוכנה {provider} במחשב הזה ({version}) ישנה מדי; נדרשת גרסה {minimum} ומעלה. הריצו {command} בטרמינל ואז בדקו שוב.",
  cardErrNeedsUpdatePath: "הקובץ שהאפליקציה הזו מריצה:",
  cardErrNeedsUpdateWindows: "עדכון {provider} בתוך WSL (Ubuntu) או בתיקייה אחרת לא משנה את הקובץ הזה. הריצו {command} ב-Windows PowerShell.",
  cardErrTimeout: "התוכנה {provider} לא ענתה בזמן. בדקו שוב בעוד רגע.",
  cardErrFailed: "משהו השתבש במהלך הבדיקה של {provider}. בדקו שוב.",
  actionInstall: "התקנה",
  actionLogin: "כניסה",
  actionLoginWindow: "הדפדפן לא נפתח, או שהוא מציג קוד?",
  actionRecheck: "בדיקה חוזרת",
  actionAcceptMetered: "להשתמש בכל זאת",
  actionInstallHelp: "מדריך ההתקנה הרשמי",
  actionOpenSettings: "פתיחת ההגדרות",
  actionDismiss: "סגירה",
  actionSwitchAccount: "כניסה עם חשבון אחר",
  actionLogout: "יציאה מהחשבון",
  installNote: "פקודת ההתקנה הרשמית של {vendor} תופעל בחלון מסוף חדש.",
  loginNote: "דף הכניסה שייפתח הוא של {vendor}.",
  signingInBrowserNote: "היכנסו לחשבון {vendor} שלכם בדפדפן שנפתח ואשרו את הגישה. החיבור יתבצע מעצמו כשתסיימו.",
  signingInWindowNote: "אם הדפדפן לא נפתח, העתיקו את הכתובת שמופיעה בחלון שנפתח זה עתה ופתחו אותה בדפדפן. כשהדפדפן מציג קוד, העתיקו אותו, הדביקו אותו פעם אחת בחלון הזה והקישו Enter. ייתכן שהקוד המודבק לא יופיע בחלון.",
  meteredWarning: "זה אינו מינוי: החיוב הוא לפי השימוש בפועל.",
  meteredMeaning: 'הכניסה הזו משתמשת במפתח API או בחשבון בתשלום לפי שימוש, או שלא ניתן היה לאמת את סוגה. בחירה ב"להשתמש בכל זאת" מאפשרת לבינה המלאכותית לפעול דרך החיבור הזה, וכל בקשה תחויב בחשבון הזה.',
  connectTitle: "חברו בינה מלאכותית כדי להתחיל",
  connectBody: "הבינה המלאכותית פועלת עם מינוי Claude או Codex שכבר יש לכם. אין צורך במפתח API.",
  connectProviderTitle: "החיבור {provider} אינו זמין לשימוש כרגע",
  connectKeyBody: "ההגדרה של {provider} עדיין לא הושלמה. השלימו אותה בהגדרות או בחרו בינה מלאכותית אחרת.",
  errNotConnected: "אין בינה מלאכותית מחוברת. חברו תחילה מינוי Claude או Codex, או בינה מלאכותית בחינם.",
  errNotInstalled: "התוכנה {provider} לא נמצאה במחשב הזה.",
  errSignedOut: "תוקף הכניסה אל {provider} פג. היכנסו שוב כדי להמשיך.",
  errRateLimit: "מכסת המינוי של {provider} נוצלה במלואה.",
  errRateLimitReset: "מכסת המינוי של {provider} נוצלה במלואה. היא תתאפס ב-{time}.",
  errUnsafeTools: "התוכנה {provider} הופעלה כשהכלים שלה עצמה פעילים, ולכן ההרצה נעצרה מטעמי בטיחות.",
  errMeteredNotAccepted: 'החיבור {provider} מחויב לפי שימוש ועדיין לא אישרתם אותו. כדי להשתמש בו, בחרו "להשתמש בכל זאת" בהגדרות החיבור.',
  errNeedsUpdate: "התוכנה {provider} ישנה מדי עבור התכונה הזו. עדכנו אותה ונסו שוב.",
  errHeadlessLimit: "הושגה המכסה השעתית של בקשות אוטומטיות.",
  errHeadlessLimitReset: "הושגה המכסה השעתית של בקשות אוטומטיות. אפשר יהיה לשלוח בקשות שוב ב-{time}.",
  connectFreeHint: "אין לכם מינוי? אפשר לחבר בינה מלאכותית בחינם בהגדרות תוך כדקה.",
  actionConnectFree: "חיבור בינה מלאכותית בחינם",
  errFreeLimit: "המכסה החינמית להיום נוצלה. נסו שוב מחר, או בחרו בינה מלאכותית אחרת בהגדרות.",
  errFreeLimitReset: "המכסה החינמית להיום נוצלה. אפשר יהיה להשתמש בה שוב ב-{time}.",
  continueWith: "המשך עם {provider}",
  continueMeteredNote: "החיבור {provider} אינו מינוי: המשך העבודה יחויב לפי שימוש.",
  usageLine: "נוצלו {percent}% · איפוס ב-{time}",
  usageWindowFiveHour: "מכסה ל-5 שעות",
  usageWindowSevenDay: "מכסה ל-7 ימים",
  noticeTitle: "לפני השימוש בבינה המלאכותית עם המינוי שלכם",
  noticeSend: 'תוכן המסמך והשיחה נשלחים אל Anthropic או אל OpenAI באמצעות החשבון האישי שלכם. כל בקשה כוללת גם את השם, הכותרת והתיאור של כל מיומנות שמוגדרת "ה-AI מחליט"; גם המיומנויות שבשימוש וקובצי המיומנויות שהבינה המלאכותית קוראת נשלחים יחד איתם.',
  noticeTraining: "השאלה אם התוכן הזה ישמש לאימון בינה מלאכותית נקבעת בהגדרות החשבון שלכם באותה חברה.",
  noticeCodexHistory: "האפליקציה מכבה את שמירת היסטוריית השיחות ב-Codex, אך ייתכן ש-Codex עדיין ישמור יומני אבחון משלו במחשב הזה.",
  noticePdfWholeDocument: "בעורך ה-PDF, קריאת עמודים בעזרת AI ותרגום מסמכים עשויים לשלוח תמונות של העמודים ואת כל הטקסט של המסמך.",
  noticeAck: "הבנתי",
  codexNotice: "שימוש במינוי Codex בתוך אפליקציה אינו שיטה ש-OpenAI ממליצה עליה באופן רשמי.",
  truncatedNotice: "הקלט היה ארוך מדי, ולכן חלק ממנו נחתך לפני השליחה.",
  pickerAuto: "אוטומטי",
  pickerAutoUsing: "אוטומטי · {provider}",
  pickerAutoUsingModel: "אוטומטי · {provider} · {model}",
  pickerDefaultModel: "מודל ברירת מחדל",
  pickerDefaultModelNamed: "מודל ברירת מחדל · {model}",
  pickerSubscription: "מינוי",
  pickerPaid: "בתשלום",
  pickerPaidTitle: "חיוב לפי שימוש, לא כלול במינוי",
  pickerNotConnected: "חיבור בינה מלאכותית",
  guideQuestion: "באיזו בינה מלאכותית אתם כבר משתמשים?",
  guidePathClaudeTitle: "יש לי מינוי Claude בתשלום",
  guidePathClaudeBody: "נדרשת תוכנית Pro או Max. אי אפשר להתחבר עם חשבון Claude חינמי.",
  guidePathCodexTitle: "יש לי ChatGPT",
  guidePathCodexBody: "נכנסים לתוכנת Codex של OpenAI עם חשבון ChatGPT. בתוכנית החינמית אפשר להשתמש רק מעט.",
  guidePathFreeTitle: "עדיין אין לי",
  guidePathFreeBody: "אפשר לחבר בינה מלאכותית בחינם תוך כדקה. בזמן השימוש בחינם, התוכן שתשלחו עשוי לשמש לשיפור הבינה המלאכותית של אותה חברה.",
  guideBack: "בחירת דרך אחרת",
  guideBadgeReady: "מחובר",
  guideBadgeInstalled: "מותקן",
  guideBadgeCheck: "דורש בדיקה",
  guideStepsLabel: "שלבי החיבור",
  stepInstall: "התקנת התוכנה",
  stepLogin: "כניסה",
  stepReady: "החיבור הושלם",
  installReturnNote: "כשההתקנה בחלון ההוא תסתיים, חזרו לכאן. האפליקציה תבדוק שוב מעצמה.",
  loginHowNote: "בלחיצה ייפתח דפדפן. היכנסו עם חשבון {vendor} שלכם ולחצו על אישור, והחיבור יושלם מעצמו.",
  signingInStalledNote: "הדפדפן לא נפתח, או שהוא מציג קוד? פתחו את חלון הכניסה בכפתור שלמטה. הדביקו בדפדפן את הכתובת שמופיעה בחלון, או הדביקו בחלון את הקוד מהדפדפן.",
  actionLoginWindowOpen: "פתיחת חלון הכניסה",
  actionCancelLogin: "ביטול הכניסה",
  actionUpdate: "עדכון",
  updateNote: "בלחיצה, העדכון הרשמי של {vendor} יופעל בחלון חדש. כשהוא יסתיים שם, חזרו לכאן.",
  guideInfoHint: "עדיין לא עובד? העתיקו את פרטי החיבור ושלחו אותם למי שעוזר לכם. אין בהם חשבון ולא נתיבי קבצים.",
  actionCopyInfo: "העתקת פרטים לקבלת עזרה",
  copyInfoDone: "הועתק"
};
const hi$2 = {
  aiAssistant: "AI सहायक",
  cardChecking: "जाँच हो रही है…",
  cardNotInstalled: "इंस्टॉल नहीं है",
  cardSignedOut: "साइन इन नहीं है",
  cardSigningIn: "साइन इन हो रहा है…",
  cardReady: "कनेक्ट है",
  cardReadyPlan: "कनेक्ट है · {plan}",
  cardMetered: "साइन इन है, पर सदस्यता से नहीं",
  cardMeteredAccepted: "उपयोग में · उपयोग के अनुसार शुल्क",
  cardError: "कनेक्शन की जाँच नहीं हो सकी",
  cardErrNeedsUpdate: "इस पीसी पर {provider} प्रोग्राम बहुत पुराना है। इसे अपडेट करके फिर से जाँचें।",
  cardErrNeedsUpdateVersion: "इस पीसी पर {provider} प्रोग्राम ({version}) बहुत पुराना है; {minimum} या उससे नया संस्करण चाहिए। टर्मिनल में {command} चलाएँ, फिर से जाँचें।",
  cardErrNeedsUpdatePath: "यह ऐप जो फ़ाइल चलाता है:",
  cardErrNeedsUpdateWindows: "WSL (Ubuntu) में या किसी दूसरे फ़ोल्डर में {provider} अपडेट करने से यह फ़ाइल नहीं बदलती। Windows PowerShell में {command} चलाएँ।",
  cardErrTimeout: "{provider} प्रोग्राम ने समय पर जवाब नहीं दिया। थोड़ी देर बाद फिर से जाँचें।",
  cardErrFailed: "{provider} की जाँच करते समय कोई समस्या हुई। फिर से जाँचें।",
  actionInstall: "इंस्टॉल करें",
  actionLogin: "साइन इन करें",
  actionLoginWindow: "ब्राउज़र नहीं खुला, या कोई कोड दिखा रहा है?",
  actionRecheck: "फिर से जाँचें",
  actionAcceptMetered: "फिर भी उपयोग करें",
  actionInstallHelp: "आधिकारिक इंस्टॉल गाइड",
  actionOpenSettings: "सेटिंग खोलें",
  actionDismiss: "बंद करें",
  actionSwitchAccount: "किसी दूसरे खाते से साइन इन करें",
  actionLogout: "साइन आउट करें",
  installNote: "{vendor} का आधिकारिक इंस्टॉल कमांड एक नई टर्मिनल विंडो में चलेगा।",
  loginNote: "जो साइन-इन पेज खुलेगा वह {vendor} का अपना है।",
  signingInBrowserNote: "खुले हुए ब्राउज़र में अपने {vendor} खाते में साइन इन करें और अनुमति दें। पूरा होते ही कनेक्शन अपने आप हो जाएगा।",
  signingInWindowNote: "अगर ब्राउज़र नहीं खुला, तो अभी खुली विंडो में दिखा पता कॉपी करके ब्राउज़र में खोलें। जब ब्राउज़र कोई कोड दिखाए, तो उसे कॉपी करके उसी विंडो में एक बार पेस्ट करें और Enter दबाएँ। हो सकता है कि पेस्ट किया गया कोड विंडो में न दिखे।",
  meteredWarning: "यह सदस्यता नहीं है: जितना उपयोग करेंगे उतना शुल्क लगेगा।",
  meteredMeaning: 'यह साइन-इन API कुंजी या उपयोग के अनुसार भुगतान वाले खाते से है, या इसका प्रकार पक्का नहीं हो सका। "फिर भी उपयोग करें" चुनने पर AI इसी कनेक्शन से चलेगा और हर अनुरोध का शुल्क उसी खाते से लिया जाएगा।',
  connectTitle: "शुरू करने के लिए AI कनेक्ट करें",
  connectBody: "AI आपकी मौजूदा Claude या Codex सदस्यता पर चलता है। किसी API कुंजी की ज़रूरत नहीं है।",
  connectProviderTitle: "{provider} कनेक्शन का अभी उपयोग नहीं किया जा सकता",
  connectKeyBody: "{provider} का सेटअप अभी पूरा नहीं हुआ है। इसे सेटिंग में पूरा करें या कोई दूसरा AI चुनें।",
  errNotConnected: "कोई AI कनेक्ट नहीं है। पहले Claude या Codex सदस्यता, या कोई मुफ़्त AI कनेक्ट करें।",
  errNotInstalled: "इस PC पर {provider} प्रोग्राम नहीं मिला।",
  errSignedOut: "{provider} का साइन-इन समाप्त हो गया है। जारी रखने के लिए फिर से साइन इन करें।",
  errRateLimit: "{provider} सदस्यता की सीमा पूरी हो गई है।",
  errRateLimitReset: "{provider} सदस्यता की सीमा पूरी हो गई है। यह {time} पर रीसेट होगी।",
  errUnsafeTools: "{provider} प्रोग्राम अपने टूल चालू रखकर शुरू हुआ, इसलिए सुरक्षा के लिए यह रन रोक दिया गया।",
  errMeteredNotAccepted: '{provider} कनेक्शन पर उपयोग के अनुसार शुल्क लगता है और आपने अभी इसकी अनुमति नहीं दी है। इसका उपयोग करने के लिए कनेक्शन सेटिंग में "फिर भी उपयोग करें" चुनें।',
  errNeedsUpdate: "{provider} प्रोग्राम इस सुविधा के लिए बहुत पुराना है। इसे अपडेट करके फिर से कोशिश करें।",
  errHeadlessLimit: "स्वचालित अनुरोधों की प्रति घंटा सीमा पूरी हो गई है।",
  errHeadlessLimitReset: "स्वचालित अनुरोधों की प्रति घंटा सीमा पूरी हो गई है। {time} से अनुरोध फिर संभव होंगे।",
  connectFreeHint: "सदस्यता नहीं है? आप सेटिंग में लगभग एक मिनट में मुफ़्त AI कनेक्ट कर सकते हैं।",
  actionConnectFree: "मुफ़्त AI कनेक्ट करें",
  errFreeLimit: "आज का मुफ़्त उपयोग समाप्त हो गया है। कल दोबारा कोशिश करें, या सेटिंग में कोई दूसरा AI चुनें।",
  errFreeLimitReset: "आज का मुफ़्त उपयोग समाप्त हो गया है। आप {time} से इसे फिर उपयोग कर सकते हैं।",
  continueWith: "{provider} के साथ जारी रखें",
  continueMeteredNote: "{provider} कनेक्शन सदस्यता नहीं है: जारी रखने पर उपयोग के अनुसार शुल्क लगेगा।",
  usageLine: "{percent}% उपयोग हुआ · {time} पर रीसेट",
  usageWindowFiveHour: "5 घंटे की सीमा",
  usageWindowSevenDay: "7 दिन की सीमा",
  noticeTitle: "अपनी सदस्यता से AI का उपयोग करने से पहले",
  noticeSend: 'दस्तावेज़ की सामग्री और आपकी बातचीत आपके अपने खाते से Anthropic या OpenAI को भेजी जाती है। हर अनुरोध के साथ "AI तय करे" पर रखे हर कौशल का नाम, शीर्षक और विवरण भी जाता है; उपयोग किए गए कौशल और AI द्वारा पढ़ी गई कौशल फ़ाइलें भी साथ में भेजी जाती हैं।',
  noticeTraining: "उस सामग्री का उपयोग AI के प्रशिक्षण में होगा या नहीं, यह उस कंपनी में आपके अपने खाते की सेटिंग से तय होता है।",
  noticeCodexHistory: "यह ऐप Codex में बातचीत का इतिहास सहेजना बंद कर देता है, लेकिन Codex फिर भी अपने डायग्नोस्टिक लॉग इस PC पर रख सकता है।",
  noticePdfWholeDocument: "PDF संपादक में, AI से पेज पढ़ने और दस्तावेज़ के अनुवाद में पेजों की छवियाँ और दस्तावेज़ का पूरा टेक्स्ट भेजा जा सकता है।",
  noticeAck: "समझ गया",
  codexNotice: "किसी ऐप के अंदर Codex सदस्यता का उपयोग करना OpenAI द्वारा आधिकारिक रूप से सुझाया गया तरीका नहीं है।",
  truncatedNotice: "इनपुट बहुत लंबा था, इसलिए भेजने से पहले उसका कुछ हिस्सा काट दिया गया।",
  pickerAuto: "स्वचालित",
  pickerAutoUsing: "स्वचालित · {provider}",
  pickerAutoUsingModel: "स्वचालित · {provider} · {model}",
  pickerDefaultModel: "डिफ़ॉल्ट मॉडल",
  pickerDefaultModelNamed: "डिफ़ॉल्ट मॉडल · {model}",
  pickerSubscription: "सदस्यता",
  pickerPaid: "सशुल्क",
  pickerPaidTitle: "उपयोग के अनुसार शुल्क, सदस्यता में शामिल नहीं",
  pickerNotConnected: "AI कनेक्ट करें",
  guideQuestion: "आप पहले से कौन-सा AI उपयोग करते हैं?",
  guidePathClaudeTitle: "मेरे पास Claude की पेड सदस्यता है",
  guidePathClaudeBody: "Pro या Max प्लान ज़रूरी है। मुफ़्त Claude खाते से कनेक्ट नहीं होता।",
  guidePathCodexTitle: "मेरे पास ChatGPT है",
  guidePathCodexBody: "अपने ChatGPT खाते से OpenAI के Codex प्रोग्राम में साइन इन करके इसका उपयोग करें। मुफ़्त प्लान में बहुत कम उपयोग मिलता है।",
  guidePathFreeTitle: "अभी कोई नहीं",
  guidePathFreeBody: "लगभग एक मिनट में मुफ़्त AI कनेक्ट करें। मुफ़्त में उपयोग करते समय आप जो भेजते हैं, उसका उपयोग उस कंपनी के AI को बेहतर बनाने में हो सकता है।",
  guideBack: "दूसरा तरीका चुनें",
  guideBadgeReady: "कनेक्ट है",
  guideBadgeInstalled: "इंस्टॉल है",
  guideBadgeCheck: "जाँच ज़रूरी",
  guideStepsLabel: "कनेक्ट करने के चरण",
  stepInstall: "प्रोग्राम इंस्टॉल करें",
  stepLogin: "साइन इन करें",
  stepReady: "कनेक्ट हो गया",
  installReturnNote: "उस विंडो में इंस्टॉल पूरा होने पर इस स्क्रीन पर लौट आएँ। ऐप अपने आप फिर से जाँच करेगा।",
  loginHowNote: "दबाने पर ब्राउज़र खुलेगा। अपने {vendor} खाते से साइन इन करें और अनुमति दें दबाएँ; कनेक्शन अपने आप पूरा हो जाएगा।",
  signingInStalledNote: "ब्राउज़र नहीं खुला, या कोई कोड दिखा रहा है? नीचे दिए बटन से साइन-इन विंडो खोलें। विंडो में दिखा पता ब्राउज़र में पेस्ट करें, या ब्राउज़र में दिखा कोड विंडो में पेस्ट करें।",
  actionLoginWindowOpen: "साइन-इन विंडो खोलें",
  actionCancelLogin: "साइन इन रद्द करें",
  actionUpdate: "अपडेट करें",
  updateNote: "दबाने पर {vendor} का आधिकारिक अपडेट एक नई विंडो में चलेगा। वहाँ अपडेट पूरा होने पर इस स्क्रीन पर लौट आएँ।",
  guideInfoHint: "फिर भी नहीं हो रहा? कनेक्शन की जानकारी कॉपी करके मदद करने वाले व्यक्ति को भेजें। इसमें खाता और फ़ाइल पथ शामिल नहीं होते।",
  actionCopyInfo: "मदद के लिए जानकारी कॉपी करें",
  copyInfoDone: "कॉपी हो गया"
};
const zhTW$2 = {
  aiAssistant: "AI 助理",
  cardChecking: "正在檢查…",
  cardNotInstalled: "尚未安裝",
  cardSignedOut: "尚未登入",
  cardSigningIn: "正在登入…",
  cardReady: "已連線",
  cardReadyPlan: "已連線 · {plan}",
  cardMetered: "已登入，但不是訂閱方式",
  cardMeteredAccepted: "使用中 · 依用量計費",
  cardError: "無法檢查連線狀態",
  cardErrNeedsUpdate: "這台電腦上的 {provider} 程式版本過舊。請更新後重新檢查。",
  cardErrNeedsUpdateVersion: "這台電腦上的 {provider} 程式（{version}）版本過舊，需要 {minimum} 或更新版本。請在終端機中執行 {command}，然後重新檢查。",
  cardErrNeedsUpdatePath: "此應用程式執行的檔案：",
  cardErrNeedsUpdateWindows: "在 WSL（Ubuntu）或其他資料夾中更新 {provider} 不會變更此檔案。請在 Windows PowerShell 中執行 {command}。",
  cardErrTimeout: "{provider} 程式未及時回應。請稍後重新檢查。",
  cardErrFailed: "檢查 {provider} 時發生問題。請重新檢查。",
  actionInstall: "安裝",
  actionLogin: "登入",
  actionLoginWindow: "瀏覽器沒有開啟，或顯示了代碼？",
  actionRecheck: "重新檢查",
  actionAcceptMetered: "仍要使用",
  actionInstallHelp: "官方安裝說明",
  actionOpenSettings: "開啟設定",
  actionDismiss: "關閉",
  actionSwitchAccount: "使用其他帳戶登入",
  actionLogout: "登出",
  installNote: "將在新的終端機視窗中執行 {vendor} 的官方安裝指令。",
  loginNote: "開啟的登入頁面由 {vendor} 提供。",
  signingInBrowserNote: "請在開啟的瀏覽器中登入你的 {vendor} 帳戶並允許存取。完成後會自動連線。",
  signingInWindowNote: "如果瀏覽器沒有開啟，請複製剛開啟的視窗中顯示的網址，在瀏覽器中開啟。瀏覽器顯示代碼時，請複製並在該視窗中貼上一次，然後按 Enter。貼上的代碼可能不會顯示在視窗中。",
  meteredWarning: "這不是訂閱，而是依實際用量收費。",
  meteredMeaning: "目前是以 API 金鑰或依用量付費的帳戶登入，或無法確認登入方式。選擇「仍要使用」後，AI 會透過這個連線執行，每次要求都會向該帳戶計費。",
  connectTitle: "連結 AI 即可開始使用",
  connectBody: "AI 會以你現有的 Claude 或 Codex 訂閱執行，不需要 API 金鑰。",
  connectProviderTitle: "{provider} 連線目前無法使用",
  connectKeyBody: "{provider} 的設定尚未完成。請在設定中完成，或選擇其他 AI。",
  errNotConnected: "尚未連結任何 AI。請先連結 Claude 或 Codex 訂閱，或連結免費 AI。",
  errNotInstalled: "在這台電腦上找不到 {provider} 程式。",
  errSignedOut: "{provider} 的登入已失效。請重新登入後繼續。",
  errRateLimit: "{provider} 的訂閱額度已用完。",
  errRateLimitReset: "{provider} 的訂閱額度已用完，將於 {time} 重設。",
  errUnsafeTools: "{provider} 程式啟動時帶有自身的工具，為了安全已停止這次執行。",
  errMeteredNotAccepted: "{provider} 連線是依用量付費的登入，你尚未允許使用。請在連線設定中選擇「仍要使用」。",
  errNeedsUpdate: "{provider} 程式版本過舊，不支援此功能。請更新後再試一次。",
  errHeadlessLimit: "自動呼叫已達每小時上限。",
  errHeadlessLimitReset: "自動呼叫已達每小時上限，{time} 後可再次使用。",
  connectFreeHint: "沒有訂閱？在設定中大約一分鐘就能連結免費 AI。",
  actionConnectFree: "連結免費 AI",
  errFreeLimit: "今日免費額度已用完。請明天再試，或在設定中選擇其他 AI。",
  errFreeLimitReset: "今日免費額度已用完。{time} 後可再次使用。",
  continueWith: "改用 {provider} 繼續",
  continueMeteredNote: "{provider} 連線不是訂閱：繼續使用將依用量收費。",
  usageLine: "已用 {percent}% · {time} 重設",
  usageWindowFiveHour: "5 小時額度",
  usageWindowSevenDay: "7 天額度",
  noticeTitle: "以訂閱使用 AI 之前",
  noticeSend: "文件內容和對話會以你本人的帳戶傳送給 Anthropic 或 OpenAI。每次請求也會附上設為「自動使用」的每個技能的名稱、標題和說明；使用的技能內容和 AI 讀取的技能檔案也會一併傳送。",
  noticeTraining: "這些內容是否用於 AI 訓練，取決於你在該公司帳戶中的設定。",
  noticeCodexHistory: "本應用程式會關閉 Codex 的對話記錄儲存，但 Codex 仍可能在這台電腦上保留自己的診斷記錄檔。",
  noticePdfWholeDocument: "在 PDF 編輯器中，AI 頁面讀取和文件翻譯可能會傳送頁面圖片和整份文件的文字。",
  noticeAck: "知道了",
  codexNotice: "在應用程式中使用 Codex 訂閱並非 OpenAI 官方建議的方式。",
  truncatedNotice: "輸入內容過長，已截去一部分後傳送。",
  pickerAuto: "自動",
  pickerAutoUsing: "自動 · {provider}",
  pickerAutoUsingModel: "自動 · {provider} · {model}",
  pickerDefaultModel: "預設模型",
  pickerDefaultModelNamed: "預設模型 · {model}",
  pickerSubscription: "訂閱",
  pickerPaid: "付費",
  pickerPaidTitle: "依用量收費，不包含在訂閱內",
  pickerNotConnected: "連結 AI",
  guideQuestion: "你現在在用哪種 AI？",
  guidePathClaudeTitle: "我有 Claude 付費訂閱",
  guidePathClaudeBody: "需要 Pro 或 Max 方案。免費的 Claude 帳戶無法連線。",
  guidePathCodexTitle: "我在用 ChatGPT",
  guidePathCodexBody: "用你的 ChatGPT 帳戶登入 OpenAI 的 Codex 程式來使用。免費方案可用量很少。",
  guidePathFreeTitle: "兩者都還沒有",
  guidePathFreeBody: "大約一分鐘就能連結免費 AI。免費使用期間，你傳送的內容可能會被該公司用來改進其 AI。",
  guideBack: "選擇其他方式",
  guideBadgeReady: "已連線",
  guideBadgeInstalled: "已安裝",
  guideBadgeCheck: "需要檢查",
  guideStepsLabel: "連線步驟",
  stepInstall: "安裝程式",
  stepLogin: "登入",
  stepReady: "連線完成",
  installReturnNote: "在該視窗中安裝完成後，請回到這裡。應用程式會自動重新檢查。",
  loginHowNote: "按下後會開啟瀏覽器。用你的 {vendor} 帳戶登入並按下允許，就會自動完成連線。",
  signingInStalledNote: "瀏覽器沒有開啟，或顯示了代碼？請用下方的按鈕開啟登入視窗。將視窗中顯示的網址貼到瀏覽器，或將瀏覽器中的代碼貼到視窗中即可。",
  actionLoginWindowOpen: "開啟登入視窗",
  actionCancelLogin: "取消登入",
  actionUpdate: "更新",
  updateNote: "按下後會在新視窗中執行 {vendor} 的官方更新。在該視窗中更新完成後，請回到這裡。",
  guideInfoHint: "還是不行？複製連線資訊，傳給協助你的人。其中不包含帳戶和檔案路徑。",
  actionCopyInfo: "複製求助資訊",
  copyInfoDone: "已複製"
};
const vi$2 = {
  aiAssistant: "Trợ lý AI",
  cardChecking: "Đang kiểm tra…",
  cardNotInstalled: "Chưa cài đặt",
  cardSignedOut: "Chưa đăng nhập",
  cardSigningIn: "Đang đăng nhập…",
  cardReady: "Đã kết nối",
  cardReadyPlan: "Đã kết nối · {plan}",
  cardMetered: "Đã đăng nhập nhưng không phải bằng gói đăng ký",
  cardMeteredAccepted: "Đang dùng · tính phí theo mức sử dụng",
  cardError: "Không kiểm tra được kết nối",
  cardErrNeedsUpdate: "Chương trình {provider} trên máy tính này quá cũ. Hãy cập nhật rồi kiểm tra lại.",
  cardErrNeedsUpdateVersion: "Chương trình {provider} trên máy tính này ({version}) quá cũ; cần phiên bản {minimum} trở lên. Hãy chạy {command} trong terminal rồi kiểm tra lại.",
  cardErrNeedsUpdatePath: "Tệp mà ứng dụng này chạy:",
  cardErrNeedsUpdateWindows: "Cập nhật {provider} trong WSL (Ubuntu) hoặc ở thư mục khác không làm thay đổi tệp này. Hãy chạy {command} trong Windows PowerShell.",
  cardErrTimeout: "Chương trình {provider} không trả lời kịp thời. Hãy kiểm tra lại sau giây lát.",
  cardErrFailed: "Đã xảy ra sự cố khi kiểm tra {provider}. Hãy kiểm tra lại.",
  actionInstall: "Cài đặt",
  actionLogin: "Đăng nhập",
  actionLoginWindow: "Trình duyệt không mở, hoặc hiện một mã?",
  actionRecheck: "Kiểm tra lại",
  actionAcceptMetered: "Vẫn sử dụng",
  actionInstallHelp: "Hướng dẫn cài đặt chính thức",
  actionOpenSettings: "Mở cài đặt",
  actionDismiss: "Đóng",
  actionSwitchAccount: "Đăng nhập bằng tài khoản khác",
  actionLogout: "Đăng xuất",
  installNote: "Lệnh cài đặt chính thức của {vendor} sẽ chạy trong một cửa sổ terminal mới.",
  loginNote: "Trang đăng nhập được mở ra là của {vendor}.",
  signingInBrowserNote: "Đăng nhập vào tài khoản {vendor} của bạn trong trình duyệt vừa mở và cho phép truy cập. Khi xong, kết nối sẽ tự hoàn tất.",
  signingInWindowNote: "Nếu trình duyệt không mở, hãy sao chép địa chỉ hiện trong cửa sổ vừa mở rồi mở nó trong trình duyệt. Khi trình duyệt hiện một mã, hãy sao chép, dán một lần vào cửa sổ đó rồi nhấn Enter. Mã đã dán có thể không hiện trong cửa sổ.",
  meteredWarning: "Đây không phải gói đăng ký: bạn bị tính phí theo mức sử dụng.",
  meteredMeaning: 'Lần đăng nhập này dùng khóa API hoặc tài khoản trả phí theo mức sử dụng, hoặc không xác định được loại đăng nhập. Chọn "Vẫn sử dụng" để AI chạy qua kết nối này, và mỗi yêu cầu sẽ được tính vào tài khoản đó.',
  connectTitle: "Kết nối AI để bắt đầu",
  connectBody: "AI chạy bằng gói đăng ký Claude hoặc Codex mà bạn đã có. Không cần khóa API.",
  connectProviderTitle: "Kết nối {provider} hiện chưa dùng được",
  connectKeyBody: "Thiết lập {provider} chưa hoàn tất. Hãy hoàn tất trong Cài đặt hoặc chọn AI khác.",
  errNotConnected: "Chưa có AI nào được kết nối. Hãy kết nối gói đăng ký Claude hoặc Codex, hoặc một AI miễn phí trước.",
  errNotInstalled: "Không tìm thấy chương trình {provider} trên máy tính này.",
  errSignedOut: "Phiên đăng nhập {provider} đã hết hạn. Hãy đăng nhập lại để tiếp tục.",
  errRateLimit: "Đã dùng hết giới hạn của gói đăng ký {provider}.",
  errRateLimitReset: "Đã dùng hết giới hạn của gói đăng ký {provider}. Giới hạn sẽ được đặt lại lúc {time}.",
  errUnsafeTools: "Chương trình {provider} khởi động khi các công cụ riêng của nó vẫn bật, nên lượt chạy đã bị dừng để đảm bảo an toàn.",
  errMeteredNotAccepted: 'Kết nối {provider} bị tính phí theo mức sử dụng và bạn chưa cho phép. Chọn "Vẫn sử dụng" trong phần cài đặt kết nối để dùng.',
  errNeedsUpdate: "Chương trình {provider} quá cũ nên không dùng được tính năng này. Hãy cập nhật rồi thử lại.",
  errHeadlessLimit: "Đã đạt giới hạn mỗi giờ cho các yêu cầu tự động.",
  errHeadlessLimitReset: "Đã đạt giới hạn mỗi giờ cho các yêu cầu tự động. Có thể gửi lại yêu cầu lúc {time}.",
  connectFreeHint: "Chưa có gói đăng ký? Bạn có thể kết nối AI miễn phí trong Cài đặt chỉ trong khoảng một phút.",
  actionConnectFree: "Kết nối AI miễn phí",
  errFreeLimit: "Đã dùng hết lượt miễn phí hôm nay. Hãy thử lại vào ngày mai hoặc chọn AI khác trong Cài đặt.",
  errFreeLimitReset: "Đã dùng hết lượt miễn phí hôm nay. Bạn có thể dùng lại lúc {time}.",
  continueWith: "Tiếp tục với {provider}",
  continueMeteredNote: "Kết nối {provider} không phải gói đăng ký: tiếp tục sẽ bị tính phí theo mức sử dụng.",
  usageLine: "Đã dùng {percent}% · đặt lại lúc {time}",
  usageWindowFiveHour: "Giới hạn 5 giờ",
  usageWindowSevenDay: "Giới hạn 7 ngày",
  noticeTitle: "Trước khi dùng AI bằng gói đăng ký của bạn",
  noticeSend: 'Nội dung tài liệu và cuộc trò chuyện được gửi đến Anthropic hoặc OpenAI bằng chính tài khoản của bạn. Mỗi yêu cầu còn kèm tên, tiêu đề và mô tả của mọi kỹ năng đặt ở "AI tự quyết định"; kỹ năng đang dùng và các tệp kỹ năng mà AI đọc cũng được gửi kèm.',
  noticeTraining: "Nội dung đó có được dùng để huấn luyện AI hay không tùy thuộc vào cài đặt tài khoản của bạn tại công ty đó.",
  noticeCodexHistory: "Ứng dụng này tắt việc lưu lịch sử trò chuyện của Codex, nhưng Codex vẫn có thể lưu nhật ký chẩn đoán riêng trên máy tính này.",
  noticePdfWholeDocument: "Trong trình chỉnh sửa PDF, tính năng đọc trang bằng AI và dịch tài liệu có thể gửi hình ảnh các trang và toàn bộ văn bản của tài liệu.",
  noticeAck: "Đã hiểu",
  codexNotice: "Dùng gói đăng ký Codex bên trong một ứng dụng không phải là cách được OpenAI chính thức khuyến nghị.",
  truncatedNotice: "Nội dung nhập quá dài nên một phần đã bị cắt bớt trước khi gửi.",
  pickerAuto: "Tự động",
  pickerAutoUsing: "Tự động · {provider}",
  pickerAutoUsingModel: "Tự động · {provider} · {model}",
  pickerDefaultModel: "Mô hình mặc định",
  pickerDefaultModelNamed: "Mô hình mặc định · {model}",
  pickerSubscription: "Gói đăng ký",
  pickerPaid: "Trả phí",
  pickerPaidTitle: "Tính phí theo mức sử dụng, không nằm trong gói đăng ký",
  pickerNotConnected: "Kết nối AI",
  guideQuestion: "Bạn đang dùng AI nào?",
  guidePathClaudeTitle: "Tôi có gói đăng ký Claude trả phí",
  guidePathClaudeBody: "Cần có gói Pro hoặc Max. Tài khoản Claude miễn phí không kết nối được.",
  guidePathCodexTitle: "Tôi dùng ChatGPT",
  guidePathCodexBody: "Đăng nhập vào chương trình Codex của OpenAI bằng tài khoản ChatGPT của bạn. Gói miễn phí chỉ cho dùng một ít.",
  guidePathFreeTitle: "Tôi chưa có cái nào",
  guidePathFreeBody: "Kết nối AI miễn phí trong khoảng một phút. Trong thời gian dùng miễn phí, nội dung bạn gửi có thể được dùng để cải thiện AI của công ty đó.",
  guideBack: "Chọn cách khác",
  guideBadgeReady: "Đã kết nối",
  guideBadgeInstalled: "Đã cài đặt",
  guideBadgeCheck: "Cần kiểm tra",
  guideStepsLabel: "Các bước kết nối",
  stepInstall: "Cài đặt chương trình",
  stepLogin: "Đăng nhập",
  stepReady: "Đã kết nối",
  installReturnNote: "Khi cài đặt trong cửa sổ đó xong, hãy quay lại màn hình này. Ứng dụng sẽ tự kiểm tra lại.",
  loginHowNote: "Khi bạn nhấn, trình duyệt sẽ mở ra. Đăng nhập bằng tài khoản {vendor} của bạn rồi nhấn Cho phép, kết nối sẽ tự hoàn tất.",
  signingInStalledNote: "Trình duyệt không mở, hoặc hiện một mã? Hãy mở cửa sổ đăng nhập bằng nút bên dưới. Dán địa chỉ hiện trong cửa sổ vào trình duyệt, hoặc dán mã hiện trong trình duyệt vào cửa sổ.",
  actionLoginWindowOpen: "Mở cửa sổ đăng nhập",
  actionCancelLogin: "Hủy đăng nhập",
  actionUpdate: "Cập nhật",
  updateNote: "Khi bạn nhấn, bản cập nhật chính thức của {vendor} sẽ chạy trong một cửa sổ mới. Khi cập nhật xong ở đó, hãy quay lại màn hình này.",
  guideInfoHint: "Vẫn chưa được? Hãy sao chép thông tin kết nối và gửi cho người đang giúp bạn. Thông tin này không chứa tài khoản hay đường dẫn tệp.",
  actionCopyInfo: "Sao chép thông tin để nhờ hỗ trợ",
  copyInfoDone: "Đã sao chép"
};
const AI_SUBSCRIPTION_STRINGS = defineStrings({
  zh: zh$2,
  en: en$2,
  ja: ja$2,
  ko: ko$2,
  fr: fr$2,
  de: de$2,
  es: es$2,
  th: th$2,
  id: id$2,
  ru: ru$2,
  ar: ar$2,
  pt: pt$2,
  it: it$2,
  pl: pl$2,
  cs: cs$2,
  nl: nl$2,
  ms: ms$2,
  he: he$2,
  hi: hi$2,
  "zh-TW": zhTW$2,
  vi: vi$2
});
const aiSubscriptionText = createI18n(AI_SUBSCRIPTION_STRINGS);
const SUBSCRIPTION_NAMES = {
  "claude-code": "Claude",
  codex: "Codex"
};
const SUBSCRIPTION_VENDORS = {
  "claude-code": "Anthropic",
  codex: "OpenAI"
};
function aiSubscriptionProviderName(provider) {
  return SUBSCRIPTION_NAMES[provider];
}
function aiSubscriptionVendorName(provider) {
  return SUBSCRIPTION_VENDORS[provider];
}
function aiProviderDisplayName(provider) {
  if (isSubscriptionProvider(provider)) return SUBSCRIPTION_NAMES[provider];
  return AI_PROVIDERS.find((m) => m.id === provider)?.label ?? "AI";
}
const AI_SUBSCRIPTION_ACCOUNT_ACTIONS = [
  "switch-account",
  "logout"
];
function isAiSubscriptionAccountAction(action) {
  return AI_SUBSCRIPTION_ACCOUNT_ACTIONS.includes(action);
}
const AI_SIGNING_IN_STALLED_MS = 25e3;
const LINK_ACTIONS = [
  "install-help",
  "login-window",
  "cancel-login"
];
function linksOf(actions) {
  return actions.filter((action) => LINK_ACTIONS.includes(action));
}
const STATUS_ERROR_KEYS = {
  "needs-update": "cardErrNeedsUpdate",
  timeout: "cardErrTimeout",
  failed: "cardErrFailed"
};
function aiSubscriptionCardView(status, options = {}) {
  const terminalWindows = options.terminalWindows !== false;
  if (status.signingIn) return signingInCardView(status, terminalWindows, options);
  const view = connectionCardView(status);
  if (status.state === "not-installed" && !terminalWindows) {
    return { ...view, noteKeys: [], actions: ["install-help"], links: ["install-help"] };
  }
  if (view.detailKey && subscriptionStatusErrorKind(status) === "needs-update") {
    const pathed = view.programPath && terminalWindows ? { ...view, pathNoteKeys: ["cardErrNeedsUpdateWindows"] } : view;
    if (!options.update || !terminalWindows) return pathed;
    return {
      ...pathed,
      noteKeys: [...pathed.noteKeys, "updateNote"],
      actions: ["update", ...pathed.actions]
    };
  }
  if (status.state !== "ready" && status.state !== "metered") return view;
  const account = options.account ? status.account?.trim() || void 0 : void 0;
  return {
    ...view,
    ...account ? { account, statusKey: view.statusKey === "cardReadyPlan" ? "cardReady" : view.statusKey } : {},
    actions: options.accountActions ? [...view.actions, ...AI_SUBSCRIPTION_ACCOUNT_ACTIONS] : view.actions
  };
}
function signingInCardView(status, terminalWindows, options) {
  const browser = status.signingIn === "browser";
  const window2 = browser && terminalWindows;
  const stalled = window2 && options.signingInStalled === true;
  const actions = [
    ...window2 ? ["login-window"] : [],
    ...options.cancelLogin ? ["cancel-login"] : []
  ];
  return {
    provider: status.provider,
    state: status.state,
    tone: "neutral",
    statusKey: "cardSigningIn",
    noteKeys: browser ? ["signingInBrowserNote", ...stalled ? ["signingInStalledNote"] : []] : ["signingInWindowNote"],
    actions,
    links: linksOf(actions).filter((action) => !(stalled && action === "login-window"))
  };
}
function connectionCardView(status) {
  const view = connectionCardParts(status);
  return { ...view, links: linksOf(view.actions) };
}
function connectionCardParts(status) {
  const base = { provider: status.provider, state: status.state };
  switch (status.state) {
    case "checking":
      return { ...base, tone: "neutral", statusKey: "cardChecking", noteKeys: [], actions: [] };
    case "not-installed":
      return {
        ...base,
        tone: "neutral",
        statusKey: "cardNotInstalled",
        noteKeys: ["installNote", "installReturnNote"],
        actions: ["install", "install-help"]
      };
    case "signed-out":
      return {
        ...base,
        tone: "neutral",
        statusKey: "cardSignedOut",
        noteKeys: ["loginHowNote", "loginNote"],
        actions: ["login"]
      };
    case "ready": {
      const planName = status.planName?.trim() || void 0;
      return {
        ...base,
        tone: "ok",
        statusKey: planName ? "cardReadyPlan" : "cardReady",
        planName,
        noteKeys: [],
        actions: []
      };
    }
    case "metered":
      return status.meteredAccepted ? {
        ...base,
        tone: "warning",
        statusKey: "cardMeteredAccepted",
        noteKeys: ["meteredWarning"],
        actions: []
      } : {
        ...base,
        tone: "warning",
        statusKey: "cardMetered",
        noteKeys: ["meteredWarning", "meteredMeaning"],
        actions: ["accept-metered"]
      };
    case "error": {
      const outdated = subscriptionNeedsUpdate(status);
      const programPath = outdated ? status.programPath?.trim() || void 0 : void 0;
      return {
        ...base,
        tone: "error",
        statusKey: "cardError",
        noteKeys: [],
        ...outdated ? { detailKey: "cardErrNeedsUpdateVersion", detailParams: outdated } : { detailKey: STATUS_ERROR_KEYS[subscriptionStatusErrorKind(status) ?? "failed"] },
        ...programPath ? { programPath } : {},
        actions: ["recheck"]
      };
    }
  }
}
function aiSubscriptionStatusOf(statuses, provider) {
  return statuses[provider] ?? { provider, state: "checking", meteredAccepted: false };
}
function aiConnectPromptView(choice) {
  if (choice.connected) return null;
  if (!choice.provider) {
    return {
      titleKey: "connectTitle",
      bodyKey: "connectBody",
      providers: AI_SUBSCRIPTION_PROVIDERS,
      settings: false,
      free: true
    };
  }
  const providerName = aiProviderDisplayName(choice.provider);
  if (isSubscriptionProvider(choice.provider)) {
    return {
      titleKey: "connectProviderTitle",
      providerName,
      providers: [choice.provider],
      settings: false,
      free: false
    };
  }
  return {
    titleKey: "connectProviderTitle",
    bodyKey: "connectKeyBody",
    providerName,
    providers: [],
    settings: true,
    free: false
  };
}
const AI_BLOCKED_RUN_KINDS = [
  "rate-limit",
  "signed-out",
  "not-installed",
  "needs-update",
  "metered-not-accepted",
  "unsafe-tools",
  "not-connected",
  "free-limit"
];
function isAiBlockedRunKind(kind) {
  return AI_BLOCKED_RUN_KINDS.includes(kind);
}
function aiContinueOption(settings, statuses, blocked) {
  const others = AI_SUBSCRIPTION_PROVIDERS.filter((id2) => id2 !== blocked);
  const connectionOf = (id2) => subscriptionConnection(settings, statuses[id2]);
  const ready = others.find((id2) => connectionOf(id2) === "subscription");
  if (ready) return { provider: ready, metered: false };
  const metered = others.find((id2) => connectionOf(id2) === "metered");
  return metered ? { provider: metered, metered: true } : null;
}
function formatAiResetTime(lang, resetsAt, now = Date.now()) {
  const at = new Date(resetsAt);
  const today = new Date(now);
  const sameDay = at.getFullYear() === today.getFullYear() && at.getMonth() === today.getMonth() && at.getDate() === today.getDate();
  return new Intl.DateTimeFormat(
    htmlLang(lang),
    sameDay ? { hour: "numeric", minute: "2-digit" } : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
  ).format(at);
}
function aiRunErrorText(lang, cause, now) {
  const hasTime = typeof cause.resetsAt === "number" && Number.isFinite(cause.resetsAt);
  const time = hasTime ? formatAiResetTime(lang, cause.resetsAt, now) : "";
  const provider = aiProviderDisplayName(
    cause.provider ?? (cause.kind === "unsafe-tools" ? "claude-code" : void 0)
  );
  switch (cause.kind) {
    case "not-connected":
      return aiSubscriptionText(lang, "errNotConnected");
    case "not-installed":
      return aiSubscriptionText(lang, "errNotInstalled", { provider });
    case "signed-out":
      return aiSubscriptionText(lang, "errSignedOut", { provider });
    case "rate-limit":
      return hasTime ? aiSubscriptionText(lang, "errRateLimitReset", { provider, time }) : aiSubscriptionText(lang, "errRateLimit", { provider });
    case "unsafe-tools":
      return aiSubscriptionText(lang, "errUnsafeTools", { provider });
    case "metered-not-accepted":
      return aiSubscriptionText(lang, "errMeteredNotAccepted", { provider });
    case "needs-update":
      return aiSubscriptionText(lang, "errNeedsUpdate", { provider });
    case "headless-limit":
      return hasTime ? aiSubscriptionText(lang, "errHeadlessLimitReset", { time }) : aiSubscriptionText(lang, "errHeadlessLimit");
    case "free-limit":
      return hasTime ? aiSubscriptionText(lang, "errFreeLimitReset", { time }) : aiSubscriptionText(lang, "errFreeLimit");
    default:
      return void 0;
  }
}
const AI_CONNECT_PATHS = [...AI_SUBSCRIPTION_PROVIDERS, "free"];
const PATH_TEXT = {
  "claude-code": { titleKey: "guidePathClaudeTitle", bodyKey: "guidePathClaudeBody" },
  codex: { titleKey: "guidePathCodexTitle", bodyKey: "guidePathCodexBody" },
  free: { titleKey: "guidePathFreeTitle", bodyKey: "guidePathFreeBody" }
};
function badgeOf(status) {
  if (status.signingIn) return "cardSigningIn";
  switch (status.state) {
    case "ready":
      return "guideBadgeReady";
    case "signed-out":
    case "metered":
      return "guideBadgeInstalled";
    case "error":
      return "guideBadgeCheck";
    default:
      return void 0;
  }
}
function aiConnectGuideView(statuses, chosen, freeConnected = false) {
  const all = AI_SUBSCRIPTION_PROVIDERS.map(
    (provider) => aiSubscriptionStatusOf(statuses, provider)
  );
  const open = chosen === "ask" ? null : chosen ?? all.find((status) => status.signingIn)?.provider ?? all.find((status) => status.state === "ready")?.provider ?? (freeConnected ? "free" : null);
  const options = AI_CONNECT_PATHS.map((path) => {
    const badgeKey = path === "free" ? freeConnected ? "guideBadgeReady" : void 0 : badgeOf(aiSubscriptionStatusOf(statuses, path));
    return { path, ...PATH_TEXT[path], ...badgeKey ? { badgeKey } : {} };
  });
  return { open, options };
}
const AI_CONNECT_STEPS = ["install", "login", "ready"];
const AI_CONNECT_STEP_KEYS = {
  install: "stepInstall",
  login: "stepLogin",
  ready: "stepReady"
};
function aiConnectStepsView(status) {
  const current = currentStep(status);
  const at = current ? AI_CONNECT_STEPS.indexOf(current) : -1;
  return {
    current,
    steps: AI_CONNECT_STEPS.map((id2, index) => ({
      id: id2,
      done: current === "ready" || index < at
    }))
  };
}
function currentStep(status) {
  if (status.signingIn) return "login";
  switch (status.state) {
    case "checking":
      return null;
    case "not-installed":
      return "install";
    case "error":
      return subscriptionStatusErrorKind(status) === "needs-update" ? "install" : "login";
    case "ready":
      return "ready";
    default:
      return "login";
  }
}
const VERSION_SHAPE = /^[\w.+-]{1,40}$/;
function aiConnectInfoText(statuses, context = {}) {
  const lines = AI_SUBSCRIPTION_PROVIDERS.map((provider) => {
    const status = aiSubscriptionStatusOf(statuses, provider);
    const parts = [`state=${status.state}`];
    const kind = subscriptionStatusErrorKind(status);
    if (kind) parts.push(`error=${kind}`);
    if (status.version && VERSION_SHAPE.test(status.version))
      parts.push(`version=${status.version}`);
    if (status.signingIn) parts.push(`signing-in=${status.signingIn}`);
    if (status.state === "metered") parts.push(`accepted=${status.meteredAccepted}`);
    return `${provider}: ${parts.join(" ")}`;
  });
  if (context.platform) lines.push(`platform: ${oneLine(context.platform)}`);
  if (context.userAgent) lines.push(`app: ${oneLine(context.userAgent)}`);
  return lines.join("\n");
}
function oneLine(text) {
  return text.replace(/\s+/g, " ").trim().slice(0, 300);
}
const zh$1 = {
  windowTitle: "智能体",
  homeCardSub: "在文件夹中用 Claude Code 或 Codex 工作",
  intro: "智能体会在你选择的文件夹中运行你的 Claude Code 或 Codex。它可以读取其中的文件、创建新文件、使用你的技能、运行脚本，并修改在 GenOffice 中打开的文档。",
  folderLabel: "项目文件夹",
  folderPick: "选择文件夹…",
  folderNone: "尚未选择文件夹",
  recentLabel: "最近的文件夹",
  providerLabel: "程序",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "在 Windows 上，你允许的命令会在没有隔离的情况下运行，可能访问整台电脑和互联网。",
  providerCodexNote: "命令在 Codex 的隔离空间中运行：只能写入项目文件夹，且无法访问互联网。",
  providerBlocked: "暂不可用：目前还无法阻止 Codex 读取它自己的登录文件。",
  connChecking: "正在检查连接…",
  connUnavailable: "未连接。请在“设置 → AI”中登录。",
  connMetered: "正在使用你已允许的按量计费登录。",
  modeLabel: "何时询问你",
  modeAskCommands: "每次运行命令前询问",
  modeAskCommandsDesc: "项目文件夹中的文件读写直接进行。运行命令或脚本前会先询问。",
  modeAskWrites: "写入文件和运行命令前都询问",
  modeAskWritesDesc: "只有读取直接进行。写入文件和运行命令前都会先询问。",
  modeTrust: "信任此项目",
  modeTrustDesc: "不再询问。Codex 仍只在隔离空间中操作；Claude Code 由其自带的审查模型代替你检查每个操作。",
  warningTitle: "开始之前",
  warningCommands: "智能体运行的命令可以修改文件并使用互联网。别人发给你的文档中可能含有隐藏的指令。",
  warningRedaction: "你对 AI 隐藏的部分只在 GenOffice 中打开的文档里保持隐藏。智能体直接从文件夹读取的文件会原样发送。",
  warningUsage: "智能体分多个步骤工作，比 AI 面板消耗更多订阅额度。",
  warningAccept: "我已了解",
  start: "开始",
  starting: "正在开始…",
  stop: "停止",
  newSession: "新会话",
  send: "发送",
  inputPlaceholder: "要让智能体做什么？",
  you: "你",
  agent: "智能体",
  startedLine: "已在 {folder} 中启动 {program}",
  skillsLine: "可使用 {n} 个技能",
  skillsLineOne: "可使用 {n} 个技能",
  toolRunning: "进行中",
  toolDone: "完成",
  toolFailed: "失败",
  toolDenied: "已拒绝",
  actRead: "读取",
  actWrite: "写入",
  actCommand: "运行",
  actAppTool: "修改打开的文档",
  actSkill: "使用技能",
  actOther: "使用工具",
  openFile: "打开",
  permTitle: "智能体请求：",
  permCommand: "运行此命令",
  permWrite: "写入此文件",
  permRead: "读取项目文件夹以外的文件",
  permOther: "使用工具“{tool}”",
  permReason: "原因：{reason}",
  permAllow: "允许",
  permDeny: "拒绝",
  turnFailed: "智能体未能完成此请求。",
  ended: "会话已结束。",
  errBadFolder: "无法使用此文件夹。请选择你自己的工作文件夹：不能是整个驱动器、用户主文件夹，或登录与应用数据所在的文件夹。",
  errNotConnected: "此程序未连接。请在“设置 → AI”中登录后重试。",
  errNotAccepted: "请先阅读并确认上面的说明。",
  errUnsafeTools: "程序启动时带有应用未提供的工具，因此已被停止。",
  errRateLimit: "订阅额度已用完。请稍后再试。",
  errSignedOut: "程序已退出登录。请在“设置 → AI”中登录。",
  errMetered: "程序使用的是你未允许的按量计费登录。",
  errSandboxUnavailable: "在这台电脑上，Codex 无法打开用于隔离命令的沙盒，因此没有启动。请将 Windows 更新到最新版本，或改用 Claude Code。",
  errNeedsUpdate: "程序版本过旧，无法使用智能体模式。请更新后重试。",
  errNotInstalled: "未安装此程序。",
  errGeneric: "出现问题。请重试。"
};
const en$1 = {
  windowTitle: "Agent",
  homeCardSub: "Work in a folder with Claude Code or Codex",
  intro: "The agent runs your Claude Code or Codex in a folder you choose. It can read the files there, create new ones, use your skills, run scripts and change documents open in GenOffice.",
  folderLabel: "Project folder",
  folderPick: "Choose a folder…",
  folderNone: "No folder chosen",
  recentLabel: "Recent folders",
  providerLabel: "Program",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "On Windows, commands you allow run without isolation and can reach your whole PC and the internet.",
  providerCodexNote: "Commands run in Codex’s isolated space: only the project folder can be written, and there is no internet.",
  providerBlocked: "Not available yet: Codex cannot yet be kept from reading its own sign-in file.",
  connChecking: "Checking the connection…",
  connUnavailable: "Not connected. Sign in under Settings → AI.",
  connMetered: "Signed in with a pay-per-use login you accepted.",
  modeLabel: "When to ask you",
  modeAskCommands: "Ask before every command",
  modeAskCommandsDesc: "Reading and writing files in the project folder goes ahead. Running a command or script asks first.",
  modeAskWrites: "Ask before writing and commands",
  modeAskWritesDesc: "Only reading goes ahead. Writing a file and running a command both ask first.",
  modeTrust: "Trust this project",
  modeTrustDesc: "Nothing asks. Codex still stays in its isolated space; Claude Code’s own reviewer checks each action instead of you.",
  warningTitle: "Before you start",
  warningCommands: "Commands the agent runs can change files and use the internet. A document someone sent you can contain hidden instructions.",
  warningRedaction: "Parts you hid from AI stay hidden only in documents open in GenOffice. Files the agent reads from the folder are sent as they are.",
  warningUsage: "An agent works in many steps and uses more of your subscription than the AI panel.",
  warningAccept: "I understand",
  start: "Start",
  starting: "Starting…",
  stop: "Stop",
  newSession: "New session",
  send: "Send",
  inputPlaceholder: "What should the agent do?",
  you: "You",
  agent: "Agent",
  startedLine: "{program} started in {folder}",
  skillsLine: "{n} skills available",
  skillsLineOne: "{n} skill available",
  toolRunning: "Working",
  toolDone: "Done",
  toolFailed: "Failed",
  toolDenied: "Declined",
  actRead: "Read",
  actWrite: "Write",
  actCommand: "Run",
  actAppTool: "Edit an open document",
  actSkill: "Use a skill",
  actOther: "Use a tool",
  openFile: "Open",
  permTitle: "The agent asks to:",
  permCommand: "Run this command",
  permWrite: "Write this file",
  permRead: "Read a file outside the project folder",
  permOther: "Use the tool “{tool}”",
  permReason: "Reason: {reason}",
  permAllow: "Allow",
  permDeny: "Decline",
  turnFailed: "The agent could not finish this request.",
  ended: "The session has ended.",
  errBadFolder: "This folder cannot be used. Choose a folder of your own work: not a drive, not your home folder, and not a folder of sign-in or app data.",
  errNotConnected: "This program is not connected. Sign in under Settings → AI and try again.",
  errNotAccepted: "Read the notes above and confirm them first.",
  errUnsafeTools: "The program started with tools the app did not give it, so it was stopped.",
  errRateLimit: "Your subscription limit is used up. Try again later.",
  errSignedOut: "The program is signed out. Sign in under Settings → AI.",
  errMetered: "The program is signed in with a pay-per-use login you have not accepted.",
  errSandboxUnavailable: "Codex cannot open the sandbox that keeps its commands contained on this PC, so it did not start. Update Windows, or choose Claude Code.",
  errNeedsUpdate: "The program is too old for agent mode. Update it and try again.",
  errNotInstalled: "The program is not installed.",
  errGeneric: "Something went wrong. Try again."
};
const ja$1 = {
  windowTitle: "エージェント",
  homeCardSub: "フォルダーで Claude Code や Codex を使って作業",
  intro: "エージェントは、選んだフォルダーで Claude Code または Codex を実行します。フォルダー内のファイルを読み、新しいファイルを作り、スキルを使い、スクリプトを実行し、GenOffice で開いている文書を編集できます。",
  folderLabel: "プロジェクトフォルダー",
  folderPick: "フォルダーを選ぶ…",
  folderNone: "フォルダーが選ばれていません",
  recentLabel: "最近のフォルダー",
  providerLabel: "プログラム",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "Windows では、許可したコマンドは隔離されずに実行され、PC 全体とインターネットにアクセスできます。",
  providerCodexNote: "コマンドは Codex の隔離された環境で実行されます。書き込めるのはプロジェクトフォルダーだけで、インターネットには接続できません。",
  providerBlocked: "まだ使えません。Codex が自分のログインファイルを読めないようにする方法がまだ見つかっていません。",
  connChecking: "接続を確認しています…",
  connUnavailable: "接続されていません。設定 → AI でサインインしてください。",
  connMetered: "許可した従量課金のログインで接続しています。",
  modeLabel: "確認するタイミング",
  modeAskCommands: "コマンドの実行ごとに確認",
  modeAskCommandsDesc: "プロジェクトフォルダー内のファイルの読み書きはそのまま進めます。コマンドやスクリプトの実行は先に確認します。",
  modeAskWrites: "書き込みとコマンドの実行ごとに確認",
  modeAskWritesDesc: "読み取りだけはそのまま進めます。ファイルの書き込みとコマンドの実行は、どちらも先に確認します。",
  modeTrust: "このプロジェクトを信頼する",
  modeTrustDesc: "確認しません。Codex はそれでも隔離された環境の中だけで動きます。Claude Code は、あなたの代わりに自身のチェック機能が操作ごとに確認します。",
  warningTitle: "始める前に",
  warningCommands: "エージェントが実行するコマンドは、ファイルを変更したりインターネットを使ったりできます。他の人から受け取った文書には、隠れた指示が含まれていることがあります。",
  warningRedaction: "AI から隠した部分が隠れたままなのは、GenOffice で開いている文書の中だけです。エージェントがフォルダーから直接読むファイルは、そのまま送られます。",
  warningUsage: "エージェントは何段階にも分けて作業するため、AI パネルよりも多くプランの上限を使います。",
  warningAccept: "理解しました",
  start: "開始",
  starting: "開始しています…",
  stop: "停止",
  newSession: "新しいセッション",
  send: "送信",
  inputPlaceholder: "エージェントに何をさせますか？",
  you: "あなた",
  agent: "エージェント",
  startedLine: "{folder} で {program} を開始しました",
  skillsLine: "{n} 個のスキルを使えます",
  skillsLineOne: "{n} 個のスキルを使えます",
  toolRunning: "作業中",
  toolDone: "完了",
  toolFailed: "失敗",
  toolDenied: "拒否済み",
  actRead: "読み取り",
  actWrite: "書き込み",
  actCommand: "実行",
  actAppTool: "開いている文書を編集",
  actSkill: "スキルを使用",
  actOther: "ツールを使用",
  openFile: "開く",
  permTitle: "エージェントが次の許可を求めています：",
  permCommand: "このコマンドを実行",
  permWrite: "このファイルに書き込み",
  permRead: "プロジェクトフォルダー外のファイルを読み取り",
  permOther: "ツール「{tool}」を使用",
  permReason: "理由：{reason}",
  permAllow: "許可",
  permDeny: "拒否",
  turnFailed: "エージェントはこの依頼を完了できませんでした。",
  ended: "セッションは終了しました。",
  errBadFolder: "このフォルダーは使えません。自分の作業用フォルダーを選んでください。ドライブ全体、ホームフォルダー、サインイン情報やアプリのデータのフォルダーは選べません。",
  errNotConnected: "このプログラムは接続されていません。設定 → AI でサインインしてから、もう一度お試しください。",
  errNotAccepted: "先に上の注意事項を読んで確認してください。",
  errUnsafeTools: "プログラムがアプリの渡していないツールを持った状態で起動したため、停止しました。",
  errRateLimit: "プランの上限に達しました。しばらくしてからもう一度お試しください。",
  errSignedOut: "プログラムがサインアウトしています。設定 → AI でサインインしてください。",
  errMetered: "プログラムが、許可していない従量課金のログインでサインインしています。",
  errSandboxUnavailable: "このPCでは、Codex がコマンドを閉じ込めるサンドボックスを開けないため、起動しませんでした。Windows を最新に更新するか、Claude Code を選んでください。",
  errNeedsUpdate: "プログラムが古いため、エージェントモードを使えません。更新してから、もう一度お試しください。",
  errNotInstalled: "プログラムがインストールされていません。",
  errGeneric: "問題が発生しました。もう一度お試しください。"
};
const ko$1 = {
  windowTitle: "에이전트",
  homeCardSub: "폴더에서 Claude Code·Codex로 일하기",
  intro: "에이전트는 고른 폴더에서 Claude Code나 Codex를 실행합니다. 폴더 안의 파일을 읽고, 새 파일을 만들고, 스킬을 쓰고, 스크립트를 실행하고, GenOffice에 열린 문서를 고칠 수 있습니다.",
  folderLabel: "프로젝트 폴더",
  folderPick: "폴더 고르기…",
  folderNone: "고른 폴더가 없습니다",
  recentLabel: "최근 폴더",
  providerLabel: "프로그램",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "Windows에서는 허락한 명령이 격리 없이 실행되어 PC 전체와 인터넷에 닿을 수 있습니다.",
  providerCodexNote: "명령은 Codex의 격리 공간에서 실행됩니다. 프로젝트 폴더에만 쓸 수 있고 인터넷은 막힙니다.",
  providerBlocked: "아직 쓸 수 없습니다. Codex가 자기 로그인 파일을 읽지 못하게 막는 방법을 아직 찾지 못했습니다.",
  connChecking: "연결을 확인하는 중…",
  connUnavailable: "연결되지 않았습니다. 설정 → AI에서 로그인하세요.",
  connMetered: "허용해 둔 종량제 로그인으로 연결되어 있습니다.",
  modeLabel: "언제 물을까요",
  modeAskCommands: "명령 실행마다 묻기",
  modeAskCommandsDesc: "프로젝트 폴더의 파일 읽기와 쓰기는 바로 합니다. 명령이나 스크립트 실행은 먼저 묻습니다.",
  modeAskWrites: "파일 쓰기와 명령 실행마다 묻기",
  modeAskWritesDesc: "읽기만 바로 합니다. 파일 쓰기와 명령 실행은 둘 다 먼저 묻습니다.",
  modeTrust: "이 프로젝트는 믿고 맡기기",
  modeTrustDesc: "묻지 않습니다. Codex는 그래도 격리 공간 안에서만 움직이고, Claude Code는 자체 검사 모델이 행동마다 대신 확인합니다.",
  warningTitle: "시작하기 전에",
  warningCommands: "에이전트가 실행하는 명령은 파일을 바꾸고 인터넷을 쓸 수 있습니다. 남에게 받은 문서에는 숨은 지시가 들어 있을 수 있습니다.",
  warningRedaction: "AI에게서 가린 부분은 GenOffice에 열린 문서에서만 가려집니다. 에이전트가 폴더에서 직접 읽는 파일은 그대로 보내집니다.",
  warningUsage: "에이전트는 여러 단계로 일하므로 AI 창보다 구독 한도를 많이 씁니다.",
  warningAccept: "이해했습니다",
  start: "시작",
  starting: "시작하는 중…",
  stop: "멈추기",
  newSession: "새로 시작",
  send: "보내기",
  inputPlaceholder: "에이전트에게 무엇을 시킬까요?",
  you: "나",
  agent: "에이전트",
  startedLine: "{program}을(를) {folder}에서 시작했습니다",
  skillsLine: "스킬 {n}개를 쓸 수 있습니다",
  skillsLineOne: "스킬 {n}개를 쓸 수 있습니다",
  toolRunning: "진행 중",
  toolDone: "완료",
  toolFailed: "실패",
  toolDenied: "거절됨",
  actRead: "읽기",
  actWrite: "쓰기",
  actCommand: "실행",
  actAppTool: "열린 문서 고치기",
  actSkill: "스킬 사용",
  actOther: "도구 사용",
  openFile: "열기",
  permTitle: "에이전트가 허락을 구합니다:",
  permCommand: "이 명령을 실행",
  permWrite: "이 파일에 쓰기",
  permRead: "프로젝트 폴더 밖의 파일 읽기",
  permOther: "“{tool}” 도구 사용",
  permReason: "이유: {reason}",
  permAllow: "허락",
  permDeny: "거절",
  turnFailed: "에이전트가 이 요청을 끝내지 못했습니다.",
  ended: "세션이 끝났습니다.",
  errBadFolder: "이 폴더는 쓸 수 없습니다. 작업하는 폴더를 고르세요. 드라이브 전체, 사용자 폴더 전체, 로그인·앱 데이터 폴더는 안 됩니다.",
  errNotConnected: "이 프로그램은 연결되어 있지 않습니다. 설정 → AI에서 로그인한 뒤 다시 시도하세요.",
  errNotAccepted: "위의 안내를 읽고 먼저 확인해 주세요.",
  errUnsafeTools: "프로그램이 앱이 주지 않은 도구를 가진 채 시작해서 멈췄습니다.",
  errRateLimit: "구독 한도를 다 썼습니다. 나중에 다시 시도하세요.",
  errSignedOut: "프로그램이 로그아웃되어 있습니다. 설정 → AI에서 로그인하세요.",
  errMetered: "프로그램이 허용하지 않은 종량제 로그인으로 되어 있습니다.",
  errSandboxUnavailable: "이 PC에서는 Codex가 명령을 가둘 격리 공간을 열 수 없어서 시작하지 않았습니다. Windows를 최신으로 업데이트하거나 Claude Code를 고르세요.",
  errNeedsUpdate: "프로그램이 에이전트 모드를 쓰기에는 오래되었습니다. 업데이트한 뒤 다시 시도하세요.",
  errNotInstalled: "프로그램이 설치되어 있지 않습니다.",
  errGeneric: "문제가 생겼습니다. 다시 시도하세요."
};
const fr$1 = {
  windowTitle: "Agent",
  homeCardSub: "Travailler dans un dossier avec Claude Code ou Codex",
  intro: "L’agent exécute votre Claude Code ou Codex dans un dossier de votre choix. Il peut y lire les fichiers, en créer de nouveaux, utiliser vos compétences, exécuter des scripts et modifier les documents ouverts dans GenOffice.",
  folderLabel: "Dossier du projet",
  folderPick: "Choisir un dossier…",
  folderNone: "Aucun dossier choisi",
  recentLabel: "Dossiers récents",
  providerLabel: "Programme",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "Sous Windows, les commandes que vous autorisez s’exécutent sans isolement et peuvent accéder à tout votre PC et à Internet.",
  providerCodexNote: "Les commandes s’exécutent dans l’espace isolé de Codex : seul le dossier du projet peut être modifié, et il n’y a pas d’accès à Internet.",
  providerBlocked: "Pas encore disponible : on ne peut pas encore empêcher Codex de lire son propre fichier de connexion.",
  connChecking: "Vérification de la connexion…",
  connUnavailable: "Non connecté. Connectez-vous dans Paramètres → IA.",
  connMetered: "Connecté avec une connexion payante à l’usage que vous avez acceptée.",
  modeLabel: "Quand vous demander",
  modeAskCommands: "Demander avant chaque commande",
  modeAskCommandsDesc: "La lecture et l’écriture de fichiers dans le dossier du projet se font directement. Avant d’exécuter une commande ou un script, l’agent vous demande.",
  modeAskWrites: "Demander avant l’écriture et les commandes",
  modeAskWritesDesc: "Seule la lecture se fait directement. Avant d’écrire un fichier ou d’exécuter une commande, l’agent vous demande.",
  modeTrust: "Faire confiance à ce projet",
  modeTrustDesc: "Plus aucune question. Codex reste quand même dans son espace isolé ; pour Claude Code, son propre vérificateur contrôle chaque action à votre place.",
  warningTitle: "Avant de commencer",
  warningCommands: "Les commandes lancées par l’agent peuvent modifier des fichiers et utiliser Internet. Un document que quelqu’un vous a envoyé peut contenir des instructions cachées.",
  warningRedaction: "Les parties masquées pour l’AI ne le restent que dans les documents ouverts dans GenOffice. Les fichiers que l’agent lit dans le dossier sont envoyés tels quels.",
  warningUsage: "Un agent travaille en plusieurs étapes et consomme davantage votre abonnement que le panneau AI.",
  warningAccept: "J’ai compris",
  start: "Démarrer",
  starting: "Démarrage…",
  stop: "Arrêter",
  newSession: "Nouvelle session",
  send: "Envoyer",
  inputPlaceholder: "Que doit faire l’agent ?",
  you: "Vous",
  agent: "Agent",
  startedLine: "{program} démarré dans {folder}",
  skillsLine: "{n} compétences disponibles",
  skillsLineOne: "{n} compétence disponible",
  toolRunning: "En cours",
  toolDone: "Terminé",
  toolFailed: "Échec",
  toolDenied: "Refusé",
  actRead: "Lire",
  actWrite: "Écrire",
  actCommand: "Exécuter",
  actAppTool: "Modifier un document ouvert",
  actSkill: "Utiliser une compétence",
  actOther: "Utiliser un outil",
  openFile: "Ouvrir",
  permTitle: "L’agent demande à :",
  permCommand: "Exécuter cette commande",
  permWrite: "Écrire dans ce fichier",
  permRead: "Lire un fichier hors du dossier du projet",
  permOther: "Utiliser l’outil « {tool} »",
  permReason: "Raison : {reason}",
  permAllow: "Autoriser",
  permDeny: "Refuser",
  turnFailed: "L’agent n’a pas pu terminer cette demande.",
  ended: "La session est terminée.",
  errBadFolder: "Ce dossier ne peut pas être utilisé. Choisissez un dossier contenant votre propre travail : pas un lecteur entier, pas votre dossier personnel, ni un dossier de données de connexion ou d’application.",
  errNotConnected: "Ce programme n’est pas connecté. Connectez-vous dans Paramètres → IA, puis réessayez.",
  errNotAccepted: "Lisez d’abord les remarques ci-dessus et confirmez-les.",
  errUnsafeTools: "Le programme a démarré avec des outils que l’application ne lui a pas donnés ; il a donc été arrêté.",
  errRateLimit: "La limite de votre abonnement est atteinte. Réessayez plus tard.",
  errSignedOut: "Le programme est déconnecté. Connectez-vous dans Paramètres → IA.",
  errMetered: "Le programme est connecté avec une connexion payante à l’usage que vous n’avez pas acceptée.",
  errSandboxUnavailable: "Codex ne peut pas ouvrir sur ce PC le bac à sable qui isole ses commandes ; il n'a donc pas démarré. Mettez Windows à jour ou choisissez Claude Code.",
  errNeedsUpdate: "Le programme est trop ancien pour le mode agent. Mettez-le à jour, puis réessayez.",
  errNotInstalled: "Le programme n’est pas installé.",
  errGeneric: "Un problème est survenu. Réessayez."
};
const de$1 = {
  windowTitle: "Agent",
  homeCardSub: "In einem Ordner mit Claude Code oder Codex arbeiten",
  intro: "Der Agent führt Ihr Claude Code oder Codex in einem Ordner Ihrer Wahl aus. Er kann die Dateien darin lesen, neue erstellen, Ihre Skills nutzen, Skripte ausführen und in GenOffice geöffnete Dokumente ändern.",
  folderLabel: "Projektordner",
  folderPick: "Ordner wählen…",
  folderNone: "Kein Ordner gewählt",
  recentLabel: "Zuletzt verwendete Ordner",
  providerLabel: "Programm",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "Unter Windows laufen Befehle, die Sie erlauben, ohne Abschottung und können auf Ihren ganzen PC und das Internet zugreifen.",
  providerCodexNote: "Befehle laufen im abgeschotteten Bereich von Codex: Nur in den Projektordner kann geschrieben werden, und es gibt kein Internet.",
  providerBlocked: "Noch nicht verfügbar: Codex kann noch nicht daran gehindert werden, seine eigene Anmeldedatei zu lesen.",
  connChecking: "Verbindung wird geprüft…",
  connUnavailable: "Nicht verbunden. Melden Sie sich unter Einstellungen → KI an.",
  connMetered: "Angemeldet mit einem nutzungsabhängig abgerechneten Login, den Sie akzeptiert haben.",
  modeLabel: "Wann nachfragen",
  modeAskCommands: "Vor jedem Befehl fragen",
  modeAskCommandsDesc: "Dateien im Projektordner werden ohne Rückfrage gelesen und geschrieben. Vor dem Ausführen eines Befehls oder Skripts wird gefragt.",
  modeAskWrites: "Vor Schreiben und Befehlen fragen",
  modeAskWritesDesc: "Nur Lesen geschieht ohne Rückfrage. Vor dem Schreiben einer Datei und vor jedem Befehl wird gefragt.",
  modeTrust: "Diesem Projekt vertrauen",
  modeTrustDesc: "Es wird nicht mehr gefragt. Codex bleibt trotzdem in seinem abgeschotteten Bereich; bei Claude Code prüft dessen eigener Prüfer jede Aktion an Ihrer Stelle.",
  warningTitle: "Bevor Sie beginnen",
  warningCommands: "Befehle, die der Agent ausführt, können Dateien ändern und das Internet nutzen. Ein Dokument, das Ihnen jemand geschickt hat, kann versteckte Anweisungen enthalten.",
  warningRedaction: "Teile, die Sie vor der AI verborgen haben, bleiben nur in Dokumenten verborgen, die in GenOffice geöffnet sind. Dateien, die der Agent aus dem Ordner liest, werden unverändert gesendet.",
  warningUsage: "Ein Agent arbeitet in vielen Schritten und verbraucht mehr von Ihrem Abo als der AI-Bereich.",
  warningAccept: "Verstanden",
  start: "Starten",
  starting: "Wird gestartet…",
  stop: "Stoppen",
  newSession: "Neue Sitzung",
  send: "Senden",
  inputPlaceholder: "Was soll der Agent tun?",
  you: "Sie",
  agent: "Agent",
  startedLine: "{program} in {folder} gestartet",
  skillsLine: "{n} Skills verfügbar",
  skillsLineOne: "{n} Skill verfügbar",
  toolRunning: "Läuft",
  toolDone: "Fertig",
  toolFailed: "Fehlgeschlagen",
  toolDenied: "Abgelehnt",
  actRead: "Lesen",
  actWrite: "Schreiben",
  actCommand: "Ausführen",
  actAppTool: "Geöffnetes Dokument bearbeiten",
  actSkill: "Skill verwenden",
  actOther: "Werkzeug verwenden",
  openFile: "Öffnen",
  permTitle: "Der Agent bittet darum:",
  permCommand: "Diesen Befehl ausführen",
  permWrite: "In diese Datei schreiben",
  permRead: "Eine Datei außerhalb des Projektordners lesen",
  permOther: "Das Werkzeug „{tool}“ verwenden",
  permReason: "Grund: {reason}",
  permAllow: "Erlauben",
  permDeny: "Ablehnen",
  turnFailed: "Der Agent konnte diese Anfrage nicht abschließen.",
  ended: "Die Sitzung ist beendet.",
  errBadFolder: "Dieser Ordner kann nicht verwendet werden. Wählen Sie einen Ordner mit Ihrer eigenen Arbeit: kein ganzes Laufwerk, nicht Ihren Benutzerordner und keinen Ordner mit Anmelde- oder App-Daten.",
  errNotConnected: "Dieses Programm ist nicht verbunden. Melden Sie sich unter Einstellungen → KI an und versuchen Sie es erneut.",
  errNotAccepted: "Lesen und bestätigen Sie zuerst die Hinweise oben.",
  errUnsafeTools: "Das Programm wurde mit Werkzeugen gestartet, die die App ihm nicht gegeben hat, und wurde deshalb gestoppt.",
  errRateLimit: "Das Limit Ihres Abos ist aufgebraucht. Versuchen Sie es später erneut.",
  errSignedOut: "Das Programm ist abgemeldet. Melden Sie sich unter Einstellungen → KI an.",
  errMetered: "Das Programm ist mit einem nutzungsabhängig abgerechneten Login angemeldet, den Sie nicht akzeptiert haben.",
  errSandboxUnavailable: "Codex kann auf diesem PC die Sandbox, die seine Befehle abschottet, nicht öffnen und wurde daher nicht gestartet. Aktualisieren Sie Windows oder wählen Sie Claude Code.",
  errNeedsUpdate: "Das Programm ist zu alt für den Agentenmodus. Aktualisieren Sie es und versuchen Sie es erneut.",
  errNotInstalled: "Das Programm ist nicht installiert.",
  errGeneric: "Etwas ist schiefgelaufen. Versuchen Sie es erneut."
};
const es$1 = {
  windowTitle: "Agente",
  homeCardSub: "Trabaja en una carpeta con Claude Code o Codex",
  intro: "El agente ejecuta tu Claude Code o Codex en la carpeta que elijas. Puede leer los archivos que hay en ella, crear otros nuevos, usar tus habilidades, ejecutar scripts y modificar los documentos abiertos en GenOffice.",
  folderLabel: "Carpeta del proyecto",
  folderPick: "Elegir una carpeta…",
  folderNone: "No se ha elegido ninguna carpeta",
  recentLabel: "Carpetas recientes",
  providerLabel: "Programa",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "En Windows, los comandos que permites se ejecutan sin aislamiento y pueden acceder a todo tu PC y a internet.",
  providerCodexNote: "Los comandos se ejecutan en el espacio aislado de Codex: solo se puede escribir en la carpeta del proyecto y no hay acceso a internet.",
  providerBlocked: "Aún no disponible: todavía no se puede impedir que Codex lea su propio archivo de inicio de sesión.",
  connChecking: "Comprobando la conexión…",
  connUnavailable: "No conectado. Inicia sesión en Configuración → IA.",
  connMetered: "Conectado con un inicio de sesión de pago por uso que aceptaste.",
  modeLabel: "Cuándo preguntarte",
  modeAskCommands: "Preguntar antes de cada comando",
  modeAskCommandsDesc: "Leer y escribir archivos en la carpeta del proyecto se hace sin preguntar. Antes de ejecutar un comando o un script, se te pregunta.",
  modeAskWrites: "Preguntar antes de escribir y de ejecutar comandos",
  modeAskWritesDesc: "Solo la lectura se hace sin preguntar. Antes de escribir un archivo o de ejecutar un comando, se te pregunta.",
  modeTrust: "Confiar en este proyecto",
  modeTrustDesc: "No se pregunta nada. Codex sigue dentro de su espacio aislado; en Claude Code, su propio revisor comprueba cada acción en tu lugar.",
  warningTitle: "Antes de empezar",
  warningCommands: "Los comandos que ejecuta el agente pueden cambiar archivos y usar internet. Un documento que alguien te haya enviado puede contener instrucciones ocultas.",
  warningRedaction: "Las partes que ocultaste a la AI solo quedan ocultas en los documentos abiertos en GenOffice. Los archivos que el agente lee de la carpeta se envían tal cual.",
  warningUsage: "Un agente trabaja en muchos pasos y gasta más de tu suscripción que el panel de AI.",
  warningAccept: "Entendido",
  start: "Iniciar",
  starting: "Iniciando…",
  stop: "Detener",
  newSession: "Nueva sesión",
  send: "Enviar",
  inputPlaceholder: "¿Qué debe hacer el agente?",
  you: "Tú",
  agent: "Agente",
  startedLine: "{program} se inició en {folder}",
  skillsLine: "{n} habilidades disponibles",
  skillsLineOne: "{n} habilidad disponible",
  toolRunning: "En curso",
  toolDone: "Hecho",
  toolFailed: "Error",
  toolDenied: "Rechazado",
  actRead: "Leer",
  actWrite: "Escribir",
  actCommand: "Ejecutar",
  actAppTool: "Editar un documento abierto",
  actSkill: "Usar una habilidad",
  actOther: "Usar una herramienta",
  openFile: "Abrir",
  permTitle: "El agente pide permiso para:",
  permCommand: "Ejecutar este comando",
  permWrite: "Escribir en este archivo",
  permRead: "Leer un archivo fuera de la carpeta del proyecto",
  permOther: "Usar la herramienta «{tool}»",
  permReason: "Motivo: {reason}",
  permAllow: "Permitir",
  permDeny: "Rechazar",
  turnFailed: "El agente no pudo terminar esta solicitud.",
  ended: "La sesión ha terminado.",
  errBadFolder: "No se puede usar esta carpeta. Elige una carpeta con tu propio trabajo: no una unidad entera, ni tu carpeta personal, ni una carpeta de datos de inicio de sesión o de aplicaciones.",
  errNotConnected: "Este programa no está conectado. Inicia sesión en Configuración → IA y vuelve a intentarlo.",
  errNotAccepted: "Primero lee las notas de arriba y confírmalas.",
  errUnsafeTools: "El programa se inició con herramientas que la aplicación no le dio, así que se detuvo.",
  errRateLimit: "Has agotado el límite de tu suscripción. Vuelve a intentarlo más tarde.",
  errSignedOut: "El programa no tiene la sesión iniciada. Inicia sesión en Configuración → IA.",
  errMetered: "El programa tiene iniciada una sesión de pago por uso que no aceptaste.",
  errSandboxUnavailable: "Codex no puede abrir en este PC el entorno aislado que contiene sus comandos, así que no se inició. Actualiza Windows o elige Claude Code.",
  errNeedsUpdate: "El programa es demasiado antiguo para el modo agente. Actualízalo y vuelve a intentarlo.",
  errNotInstalled: "El programa no está instalado.",
  errGeneric: "Algo salió mal. Vuelve a intentarlo."
};
const th$1 = {
  windowTitle: "เอเจนต์",
  homeCardSub: "ทำงานในโฟลเดอร์ด้วย Claude Code หรือ Codex",
  intro: "เอเจนต์จะเรียกใช้ Claude Code หรือ Codex ของคุณในโฟลเดอร์ที่คุณเลือก โดยสามารถอ่านไฟล์ในโฟลเดอร์นั้น สร้างไฟล์ใหม่ ใช้สกิลของคุณ เรียกใช้สคริปต์ และแก้ไขเอกสารที่เปิดอยู่ใน GenOffice ได้",
  folderLabel: "โฟลเดอร์โปรเจกต์",
  folderPick: "เลือกโฟลเดอร์…",
  folderNone: "ยังไม่ได้เลือกโฟลเดอร์",
  recentLabel: "โฟลเดอร์ล่าสุด",
  providerLabel: "โปรแกรม",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "บน Windows คำสั่งที่คุณอนุญาตจะทำงานโดยไม่มีการแยกพื้นที่ และเข้าถึงทั้งพีซีของคุณและอินเทอร์เน็ตได้",
  providerCodexNote: "คำสั่งจะทำงานในพื้นที่แยกของ Codex เขียนได้เฉพาะในโฟลเดอร์โปรเจกต์ และใช้อินเทอร์เน็ตไม่ได้",
  providerBlocked: "ยังใช้ไม่ได้: ยังไม่สามารถกัน Codex ไม่ให้อ่านไฟล์ลงชื่อเข้าใช้ของตัวเองได้",
  connChecking: "กำลังตรวจสอบการเชื่อมต่อ…",
  connUnavailable: "ยังไม่ได้เชื่อมต่อ ลงชื่อเข้าใช้ที่ การตั้งค่า → AI",
  connMetered: "ลงชื่อเข้าใช้ด้วยบัญชีแบบจ่ายตามการใช้งานที่คุณยอมรับไว้",
  modeLabel: "จะให้ถามคุณเมื่อใด",
  modeAskCommands: "ถามก่อนทุกคำสั่ง",
  modeAskCommandsDesc: "การอ่านและเขียนไฟล์ในโฟลเดอร์โปรเจกต์ทำได้ทันที การเรียกใช้คำสั่งหรือสคริปต์จะถามก่อน",
  modeAskWrites: "ถามก่อนเขียนไฟล์และเรียกใช้คำสั่ง",
  modeAskWritesDesc: "ทำได้ทันทีเฉพาะการอ่าน การเขียนไฟล์และการเรียกใช้คำสั่งจะถามก่อนทั้งคู่",
  modeTrust: "เชื่อถือโปรเจกต์นี้",
  modeTrustDesc: "ไม่ถามอะไรเลย Codex ยังคงทำงานอยู่ในพื้นที่แยกของตัวเอง ส่วน Claude Code จะใช้ตัวตรวจสอบของตัวเองตรวจแต่ละการกระทำแทนคุณ",
  warningTitle: "ก่อนเริ่มต้น",
  warningCommands: "คำสั่งที่เอเจนต์เรียกใช้สามารถเปลี่ยนแปลงไฟล์และใช้อินเทอร์เน็ตได้ เอกสารที่ผู้อื่นส่งมาให้อาจมีคำสั่งแอบแฝงอยู่",
  warningRedaction: "ส่วนที่คุณซ่อนจาก AI จะถูกซ่อนเฉพาะในเอกสารที่เปิดอยู่ใน GenOffice เท่านั้น ไฟล์ที่เอเจนต์อ่านจากโฟลเดอร์จะถูกส่งไปตามเดิม",
  warningUsage: "เอเจนต์ทำงานหลายขั้นตอน จึงใช้โควตาการสมัครสมาชิกของคุณมากกว่าแผง AI",
  warningAccept: "เข้าใจแล้ว",
  start: "เริ่ม",
  starting: "กำลังเริ่ม…",
  stop: "หยุด",
  newSession: "เซสชันใหม่",
  send: "ส่ง",
  inputPlaceholder: "ต้องการให้เอเจนต์ทำอะไร",
  you: "คุณ",
  agent: "เอเจนต์",
  startedLine: "เริ่ม {program} ใน {folder} แล้ว",
  skillsLine: "มีสกิลให้ใช้ {n} รายการ",
  skillsLineOne: "มีสกิลให้ใช้ {n} รายการ",
  toolRunning: "กำลังทำงาน",
  toolDone: "เสร็จแล้ว",
  toolFailed: "ล้มเหลว",
  toolDenied: "ปฏิเสธแล้ว",
  actRead: "อ่าน",
  actWrite: "เขียน",
  actCommand: "เรียกใช้",
  actAppTool: "แก้ไขเอกสารที่เปิดอยู่",
  actSkill: "ใช้สกิล",
  actOther: "ใช้เครื่องมือ",
  openFile: "เปิด",
  permTitle: "เอเจนต์ขออนุญาต:",
  permCommand: "เรียกใช้คำสั่งนี้",
  permWrite: "เขียนไฟล์นี้",
  permRead: "อ่านไฟล์นอกโฟลเดอร์โปรเจกต์",
  permOther: "ใช้เครื่องมือ “{tool}”",
  permReason: "เหตุผล: {reason}",
  permAllow: "อนุญาต",
  permDeny: "ปฏิเสธ",
  turnFailed: "เอเจนต์ทำคำขอนี้ไม่สำเร็จ",
  ended: "เซสชันสิ้นสุดแล้ว",
  errBadFolder: "ใช้โฟลเดอร์นี้ไม่ได้ โปรดเลือกโฟลเดอร์งานของคุณเอง ที่ไม่ใช่ทั้งไดรฟ์ ไม่ใช่โฟลเดอร์หลักของผู้ใช้ และไม่ใช่โฟลเดอร์ข้อมูลการลงชื่อเข้าใช้หรือข้อมูลแอป",
  errNotConnected: "โปรแกรมนี้ยังไม่ได้เชื่อมต่อ ลงชื่อเข้าใช้ที่ การตั้งค่า → AI แล้วลองอีกครั้ง",
  errNotAccepted: "โปรดอ่านข้อควรทราบด้านบนและยืนยันก่อน",
  errUnsafeTools: "โปรแกรมเริ่มทำงานพร้อมเครื่องมือที่แอปไม่ได้ให้ไว้ จึงถูกหยุด",
  errRateLimit: "ใช้โควตาการสมัครสมาชิกหมดแล้ว ลองอีกครั้งภายหลัง",
  errSignedOut: "โปรแกรมออกจากระบบอยู่ ลงชื่อเข้าใช้ที่ การตั้งค่า → AI",
  errMetered: "โปรแกรมลงชื่อเข้าใช้ด้วยบัญชีแบบจ่ายตามการใช้งานที่คุณยังไม่ได้ยอมรับ",
  errSandboxUnavailable: "Codex เปิดแซนด์บ็อกซ์ที่ใช้กักคำสั่งบนพีซีเครื่องนี้ไม่ได้ จึงไม่ได้เริ่มทำงาน โปรดอัปเดต Windows หรือเลือก Claude Code",
  errNeedsUpdate: "โปรแกรมเก่าเกินไปสำหรับโหมดเอเจนต์ อัปเดตแล้วลองอีกครั้ง",
  errNotInstalled: "ยังไม่ได้ติดตั้งโปรแกรม",
  errGeneric: "เกิดข้อผิดพลาด ลองอีกครั้ง"
};
const id$1 = {
  windowTitle: "Agen",
  homeCardSub: "Bekerja di folder dengan Claude Code atau Codex",
  intro: "Agen menjalankan Claude Code atau Codex Anda di folder yang Anda pilih. Agen dapat membaca file di sana, membuat file baru, memakai skill Anda, menjalankan skrip, dan mengubah dokumen yang terbuka di GenOffice.",
  folderLabel: "Folder proyek",
  folderPick: "Pilih folder…",
  folderNone: "Belum ada folder yang dipilih",
  recentLabel: "Folder terbaru",
  providerLabel: "Program",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "Di Windows, perintah yang Anda izinkan berjalan tanpa isolasi dan dapat menjangkau seluruh PC Anda serta internet.",
  providerCodexNote: "Perintah berjalan di ruang terisolasi Codex: hanya folder proyek yang dapat ditulisi, dan tidak ada internet.",
  providerBlocked: "Belum tersedia: Codex belum dapat dicegah membaca file masuknya sendiri.",
  connChecking: "Memeriksa koneksi…",
  connUnavailable: "Tidak terhubung. Masuk di Pengaturan → AI.",
  connMetered: "Masuk dengan login bayar per pemakaian yang sudah Anda setujui.",
  modeLabel: "Kapan bertanya kepada Anda",
  modeAskCommands: "Tanya sebelum setiap perintah",
  modeAskCommandsDesc: "Membaca dan menulis file di folder proyek langsung dilakukan. Sebelum menjalankan perintah atau skrip, agen bertanya dulu.",
  modeAskWrites: "Tanya sebelum menulis dan menjalankan perintah",
  modeAskWritesDesc: "Hanya membaca yang langsung dilakukan. Sebelum menulis file dan sebelum menjalankan perintah, agen bertanya dulu.",
  modeTrust: "Percayai proyek ini",
  modeTrustDesc: "Tidak ada pertanyaan. Codex tetap berada di ruang terisolasinya; pada Claude Code, pemeriksanya sendiri yang memeriksa setiap tindakan menggantikan Anda.",
  warningTitle: "Sebelum mulai",
  warningCommands: "Perintah yang dijalankan agen dapat mengubah file dan memakai internet. Dokumen yang dikirim orang lain kepada Anda bisa berisi instruksi tersembunyi.",
  warningRedaction: "Bagian yang Anda sembunyikan dari AI hanya tetap tersembunyi di dokumen yang terbuka di GenOffice. File yang dibaca agen dari folder dikirim apa adanya.",
  warningUsage: "Agen bekerja dalam banyak langkah dan memakai lebih banyak kuota langganan Anda dibandingkan panel AI.",
  warningAccept: "Saya mengerti",
  start: "Mulai",
  starting: "Memulai…",
  stop: "Hentikan",
  newSession: "Sesi baru",
  send: "Kirim",
  inputPlaceholder: "Apa yang harus dilakukan agen?",
  you: "Anda",
  agent: "Agen",
  startedLine: "{program} dimulai di {folder}",
  skillsLine: "{n} skill tersedia",
  skillsLineOne: "{n} skill tersedia",
  toolRunning: "Sedang berjalan",
  toolDone: "Selesai",
  toolFailed: "Gagal",
  toolDenied: "Ditolak",
  actRead: "Baca",
  actWrite: "Tulis",
  actCommand: "Jalankan",
  actAppTool: "Edit dokumen yang terbuka",
  actSkill: "Pakai skill",
  actOther: "Pakai alat",
  openFile: "Buka",
  permTitle: "Agen meminta izin untuk:",
  permCommand: "Menjalankan perintah ini",
  permWrite: "Menulis file ini",
  permRead: "Membaca file di luar folder proyek",
  permOther: "Memakai alat “{tool}”",
  permReason: "Alasan: {reason}",
  permAllow: "Izinkan",
  permDeny: "Tolak",
  turnFailed: "Agen tidak dapat menyelesaikan permintaan ini.",
  ended: "Sesi telah berakhir.",
  errBadFolder: "Folder ini tidak dapat dipakai. Pilih folder berisi pekerjaan Anda sendiri: bukan seluruh drive, bukan folder pengguna Anda, dan bukan folder data login atau data aplikasi.",
  errNotConnected: "Program ini tidak terhubung. Masuk di Pengaturan → AI, lalu coba lagi.",
  errNotAccepted: "Baca catatan di atas dan konfirmasikan terlebih dahulu.",
  errUnsafeTools: "Program dimulai dengan alat yang tidak diberikan aplikasi, jadi program dihentikan.",
  errRateLimit: "Kuota langganan Anda sudah habis. Coba lagi nanti.",
  errSignedOut: "Program sudah keluar dari akun. Masuk di Pengaturan → AI.",
  errMetered: "Program masuk dengan login bayar per pemakaian yang belum Anda setujui.",
  errSandboxUnavailable: "Codex tidak dapat membuka sandbox yang mengurung perintahnya di PC ini, jadi tidak dijalankan. Perbarui Windows, atau pilih Claude Code.",
  errNeedsUpdate: "Versi program terlalu lama untuk mode agen. Perbarui program, lalu coba lagi.",
  errNotInstalled: "Program belum terpasang.",
  errGeneric: "Terjadi masalah. Coba lagi."
};
const ru$1 = {
  windowTitle: "Агент",
  homeCardSub: "Работа в папке с Claude Code или Codex",
  intro: "Агент запускает ваш Claude Code или Codex в выбранной вами папке. Он может читать файлы в ней, создавать новые, использовать ваши навыки, запускать скрипты и изменять документы, открытые в GenOffice.",
  folderLabel: "Папка проекта",
  folderPick: "Выбрать папку…",
  folderNone: "Папка не выбрана",
  recentLabel: "Недавние папки",
  providerLabel: "Программа",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "В Windows разрешённые вами команды выполняются без изоляции и могут получить доступ ко всему компьютеру и интернету.",
  providerCodexNote: "Команды выполняются в изолированной среде Codex: записывать можно только в папку проекта, доступа к интернету нет.",
  providerBlocked: "Пока недоступно: пока нельзя запретить Codex читать собственный файл входа.",
  connChecking: "Проверка подключения…",
  connUnavailable: "Нет подключения. Войдите в разделе Настройки → ИИ.",
  connMetered: "Выполнен вход с оплатой по факту использования, которую вы разрешили.",
  modeLabel: "Когда спрашивать вас",
  modeAskCommands: "Спрашивать перед каждой командой",
  modeAskCommandsDesc: "Чтение и запись файлов в папке проекта выполняются сразу. Перед запуском команды или скрипта агент спросит.",
  modeAskWrites: "Спрашивать перед записью и командами",
  modeAskWritesDesc: "Сразу выполняется только чтение. Перед записью файла и перед запуском команды агент спросит.",
  modeTrust: "Доверять этому проекту",
  modeTrustDesc: "Агент ничего не спрашивает. Codex всё равно остаётся в своей изолированной среде; у Claude Code каждое действие вместо вас проверяет его собственный проверяющий.",
  warningTitle: "Прежде чем начать",
  warningCommands: "Команды, которые запускает агент, могут изменять файлы и использовать интернет. Документ, который вам кто-то прислал, может содержать скрытые инструкции.",
  warningRedaction: "Скрытые от AI части остаются скрытыми только в документах, открытых в GenOffice. Файлы, которые агент читает из папки, отправляются как есть.",
  warningUsage: "Агент работает в несколько шагов и расходует больше лимита подписки, чем панель AI.",
  warningAccept: "Понятно",
  start: "Начать",
  starting: "Запуск…",
  stop: "Остановить",
  newSession: "Новый сеанс",
  send: "Отправить",
  inputPlaceholder: "Что должен сделать агент?",
  you: "Вы",
  agent: "Агент",
  startedLine: "{program} запущен в папке {folder}",
  skillsLine: "Доступно навыков: {n}",
  skillsLineOne: "Доступен {n} навык",
  toolRunning: "Выполняется",
  toolDone: "Готово",
  toolFailed: "Ошибка",
  toolDenied: "Отклонено",
  actRead: "Чтение",
  actWrite: "Запись",
  actCommand: "Запуск",
  actAppTool: "Изменение открытого документа",
  actSkill: "Использование навыка",
  actOther: "Использование инструмента",
  openFile: "Открыть",
  permTitle: "Агент просит разрешения:",
  permCommand: "Выполнить эту команду",
  permWrite: "Записать этот файл",
  permRead: "Прочитать файл вне папки проекта",
  permOther: "Использовать инструмент «{tool}»",
  permReason: "Причина: {reason}",
  permAllow: "Разрешить",
  permDeny: "Отклонить",
  turnFailed: "Агенту не удалось выполнить этот запрос.",
  ended: "Сеанс завершён.",
  errBadFolder: "Эту папку нельзя использовать. Выберите папку со своей работой: не весь диск, не домашнюю папку и не папку с данными входа или приложений.",
  errNotConnected: "Эта программа не подключена. Войдите в разделе Настройки → ИИ и повторите попытку.",
  errNotAccepted: "Сначала прочитайте примечания выше и подтвердите их.",
  errUnsafeTools: "Программа запустилась с инструментами, которые приложение ей не давало, поэтому она остановлена.",
  errRateLimit: "Лимит подписки исчерпан. Повторите попытку позже.",
  errSignedOut: "Программа вышла из учётной записи. Войдите в разделе Настройки → ИИ.",
  errMetered: "В программе выполнен вход с оплатой по факту использования, которую вы не разрешали.",
  errSandboxUnavailable: "Codex не может открыть на этом компьютере песочницу, которая изолирует его команды, поэтому он не запущен. Обновите Windows или выберите Claude Code.",
  errNeedsUpdate: "Программа слишком старая для режима агента. Обновите её и повторите попытку.",
  errNotInstalled: "Программа не установлена.",
  errGeneric: "Что-то пошло не так. Повторите попытку."
};
const ar$1 = {
  windowTitle: "الوكيل",
  homeCardSub: "العمل في مجلد باستخدام Claude Code أو Codex",
  intro: "يشغّل الوكيل Claude Code أو Codex الخاص بك في مجلد تختاره. ويمكنه قراءة الملفات الموجودة فيه، وإنشاء ملفات جديدة، واستخدام مهاراتك، وتشغيل البرامج النصية، وتعديل المستندات المفتوحة في GenOffice.",
  folderLabel: "مجلد المشروع",
  folderPick: "اختر مجلدًا…",
  folderNone: "لم يتم اختيار مجلد",
  recentLabel: "المجلدات الأخيرة",
  providerLabel: "البرنامج",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "على Windows، تعمل الأوامر التي تسمح بها دون عزل، ويمكنها الوصول إلى جهازك كله وإلى الإنترنت.",
  providerCodexNote: "تعمل الأوامر في المساحة المعزولة الخاصة بـ Codex: لا يمكن الكتابة إلا في مجلد المشروع، ولا يتوفر اتصال بالإنترنت.",
  providerBlocked: "غير متاح بعد: لا يمكن حتى الآن منع Codex من قراءة ملف تسجيل الدخول الخاص به.",
  connChecking: "جارٍ التحقق من الاتصال…",
  connUnavailable: "غير متصل. سجّل الدخول من الإعدادات → الذكاء الاصطناعي.",
  connMetered: "تم تسجيل الدخول بحساب الدفع حسب الاستخدام الذي وافقت عليه.",
  modeLabel: "متى يسألك",
  modeAskCommands: "السؤال قبل كل أمر",
  modeAskCommandsDesc: "تتم قراءة الملفات وكتابتها في مجلد المشروع مباشرة. أما تشغيل أمر أو برنامج نصي فيسألك أولًا.",
  modeAskWrites: "السؤال قبل الكتابة والأوامر",
  modeAskWritesDesc: "القراءة وحدها تتم مباشرة. أما كتابة ملف وتشغيل أمر فكلاهما يسألك أولًا.",
  modeTrust: "الثقة بهذا المشروع",
  modeTrustDesc: "لا يُطرح أي سؤال. يبقى Codex مع ذلك داخل مساحته المعزولة؛ أما في Claude Code فيتحقق المراجع الخاص به من كل إجراء بدلًا منك.",
  warningTitle: "قبل أن تبدأ",
  warningCommands: "يمكن للأوامر التي يشغّلها الوكيل أن تغيّر الملفات وتستخدم الإنترنت. وقد يحتوي مستند أرسله إليك شخص ما على تعليمات مخفية.",
  warningRedaction: "الأجزاء التي أخفيتها عن AI تبقى مخفية فقط في المستندات المفتوحة في GenOffice. أما الملفات التي يقرؤها الوكيل من المجلد فتُرسَل كما هي.",
  warningUsage: "يعمل الوكيل على خطوات كثيرة ويستهلك من اشتراكك أكثر مما تستهلكه لوحة AI.",
  warningAccept: "فهمت",
  start: "بدء",
  starting: "جارٍ البدء…",
  stop: "إيقاف",
  newSession: "جلسة جديدة",
  send: "إرسال",
  inputPlaceholder: "ماذا تريد من الوكيل أن يفعل؟",
  you: "أنت",
  agent: "الوكيل",
  startedLine: "بدأ {program} في {folder}",
  skillsLine: "المهارات المتاحة: {n}",
  skillsLineOne: "{n} مهارة متاحة",
  toolRunning: "قيد التنفيذ",
  toolDone: "تم",
  toolFailed: "فشل",
  toolDenied: "مرفوض",
  actRead: "قراءة",
  actWrite: "كتابة",
  actCommand: "تشغيل",
  actAppTool: "تعديل مستند مفتوح",
  actSkill: "استخدام مهارة",
  actOther: "استخدام أداة",
  openFile: "فتح",
  permTitle: "يطلب الوكيل الإذن بـ:",
  permCommand: "تشغيل هذا الأمر",
  permWrite: "الكتابة في هذا الملف",
  permRead: "قراءة ملف خارج مجلد المشروع",
  permOther: "استخدام الأداة «{tool}»",
  permReason: "السبب: {reason}",
  permAllow: "سماح",
  permDeny: "رفض",
  turnFailed: "لم يتمكن الوكيل من إنهاء هذا الطلب.",
  ended: "انتهت الجلسة.",
  errBadFolder: "لا يمكن استخدام هذا المجلد. اختر مجلدًا لعملك الخاص: ليس محركًا كاملًا، ولا مجلدك الرئيسي، ولا مجلدًا لبيانات تسجيل الدخول أو بيانات التطبيقات.",
  errNotConnected: "هذا البرنامج غير متصل. سجّل الدخول من الإعدادات → الذكاء الاصطناعي ثم حاول مرة أخرى.",
  errNotAccepted: "اقرأ الملاحظات أعلاه وأكّدها أولًا.",
  errUnsafeTools: "بدأ البرنامج بأدوات لم يمنحها له التطبيق، لذا تم إيقافه.",
  errRateLimit: "استنفدت حد اشتراكك. حاول مرة أخرى لاحقًا.",
  errSignedOut: "البرنامج غير مسجّل الدخول. سجّل الدخول من الإعدادات → الذكاء الاصطناعي.",
  errMetered: "البرنامج مسجّل الدخول بحساب الدفع حسب الاستخدام لم توافق عليه.",
  errSandboxUnavailable: "لا يستطيع Codex فتح بيئة العزل التي تحصر أوامره على هذا الحاسوب، لذلك لم يبدأ. حدّث Windows أو اختر Claude Code.",
  errNeedsUpdate: "البرنامج قديم جدًا لوضع الوكيل. حدّثه ثم حاول مرة أخرى.",
  errNotInstalled: "البرنامج غير مثبّت.",
  errGeneric: "حدث خطأ ما. حاول مرة أخرى."
};
const pt$1 = {
  windowTitle: "Agente",
  homeCardSub: "Trabalhe em uma pasta com Claude Code ou Codex",
  intro: "O agente executa o seu Claude Code ou Codex em uma pasta que você escolher. Ele pode ler os arquivos dessa pasta, criar novos, usar suas habilidades, executar scripts e alterar documentos abertos no GenOffice.",
  folderLabel: "Pasta do projeto",
  folderPick: "Escolher uma pasta…",
  folderNone: "Nenhuma pasta escolhida",
  recentLabel: "Pastas recentes",
  providerLabel: "Programa",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "No Windows, os comandos que você permite são executados sem isolamento e podem acessar todo o seu PC e a internet.",
  providerCodexNote: "Os comandos são executados no espaço isolado do Codex: só a pasta do projeto pode ser alterada, e não há acesso à internet.",
  providerBlocked: "Ainda não disponível: ainda não é possível impedir que o Codex leia o próprio arquivo de login.",
  connChecking: "Verificando a conexão…",
  connUnavailable: "Não conectado. Faça login em Configurações → IA.",
  connMetered: "Conectado com um login de pagamento por uso que você aceitou.",
  modeLabel: "Quando perguntar a você",
  modeAskCommands: "Perguntar antes de cada comando",
  modeAskCommandsDesc: "Ler e gravar arquivos na pasta do projeto acontece direto. Antes de executar um comando ou script, o agente pergunta.",
  modeAskWrites: "Perguntar antes de gravar e de executar comandos",
  modeAskWritesDesc: "Só a leitura acontece direto. Antes de gravar um arquivo e antes de executar um comando, o agente pergunta.",
  modeTrust: "Confiar neste projeto",
  modeTrustDesc: "Nada é perguntado. O Codex continua no seu espaço isolado; no Claude Code, o próprio revisor dele verifica cada ação no seu lugar.",
  warningTitle: "Antes de começar",
  warningCommands: "Os comandos que o agente executa podem alterar arquivos e usar a internet. Um documento que alguém enviou a você pode conter instruções ocultas.",
  warningRedaction: "As partes que você ocultou da AI só ficam ocultas nos documentos abertos no GenOffice. Os arquivos que o agente lê da pasta são enviados como estão.",
  warningUsage: "Um agente trabalha em muitas etapas e usa mais da sua assinatura do que o painel de AI.",
  warningAccept: "Entendi",
  start: "Iniciar",
  starting: "Iniciando…",
  stop: "Parar",
  newSession: "Nova sessão",
  send: "Enviar",
  inputPlaceholder: "O que o agente deve fazer?",
  you: "Você",
  agent: "Agente",
  startedLine: "{program} iniciado em {folder}",
  skillsLine: "{n} habilidades disponíveis",
  skillsLineOne: "{n} habilidade disponível",
  toolRunning: "Em andamento",
  toolDone: "Concluído",
  toolFailed: "Falhou",
  toolDenied: "Recusado",
  actRead: "Ler",
  actWrite: "Gravar",
  actCommand: "Executar",
  actAppTool: "Editar um documento aberto",
  actSkill: "Usar uma habilidade",
  actOther: "Usar uma ferramenta",
  openFile: "Abrir",
  permTitle: "O agente pede permissão para:",
  permCommand: "Executar este comando",
  permWrite: "Gravar este arquivo",
  permRead: "Ler um arquivo fora da pasta do projeto",
  permOther: "Usar a ferramenta “{tool}”",
  permReason: "Motivo: {reason}",
  permAllow: "Permitir",
  permDeny: "Recusar",
  turnFailed: "O agente não conseguiu concluir este pedido.",
  ended: "A sessão terminou.",
  errBadFolder: "Esta pasta não pode ser usada. Escolha uma pasta com o seu próprio trabalho: não uma unidade inteira, nem a sua pasta pessoal, nem uma pasta de dados de login ou de aplicativos.",
  errNotConnected: "Este programa não está conectado. Faça login em Configurações → IA e tente novamente.",
  errNotAccepted: "Leia as observações acima e confirme-as primeiro.",
  errUnsafeTools: "O programa foi iniciado com ferramentas que o aplicativo não forneceu, por isso foi parado.",
  errRateLimit: "O limite da sua assinatura acabou. Tente novamente mais tarde.",
  errSignedOut: "O programa está desconectado. Faça login em Configurações → IA.",
  errMetered: "O programa está conectado com um login de pagamento por uso que você não aceitou.",
  errSandboxUnavailable: "O Codex não consegue abrir neste PC a área isolada que contém os seus comandos, por isso não foi iniciado. Atualize o Windows ou escolha o Claude Code.",
  errNeedsUpdate: "O programa é antigo demais para o modo agente. Atualize-o e tente novamente.",
  errNotInstalled: "O programa não está instalado.",
  errGeneric: "Algo deu errado. Tente novamente."
};
const it$1 = {
  windowTitle: "Agente",
  homeCardSub: "Lavora in una cartella con Claude Code o Codex",
  intro: "L’agente esegue il tuo Claude Code o Codex in una cartella che scegli tu. Può leggere i file che contiene, crearne di nuovi, usare le tue skill, eseguire script e modificare i documenti aperti in GenOffice.",
  folderLabel: "Cartella del progetto",
  folderPick: "Scegli una cartella…",
  folderNone: "Nessuna cartella scelta",
  recentLabel: "Cartelle recenti",
  providerLabel: "Programma",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "Su Windows i comandi che consenti vengono eseguiti senza isolamento e possono raggiungere tutto il PC e internet.",
  providerCodexNote: "I comandi vengono eseguiti nello spazio isolato di Codex: si può scrivere solo nella cartella del progetto e non c’è accesso a internet.",
  providerBlocked: "Non ancora disponibile: non è ancora possibile impedire a Codex di leggere il proprio file di accesso.",
  connChecking: "Verifica della connessione…",
  connUnavailable: "Non connesso. Accedi da Impostazioni → IA.",
  connMetered: "Connesso con un accesso a consumo che hai accettato.",
  modeLabel: "Quando chiederti conferma",
  modeAskCommands: "Chiedi prima di ogni comando",
  modeAskCommandsDesc: "La lettura e la scrittura dei file nella cartella del progetto avvengono subito. Prima di eseguire un comando o uno script, l’agente chiede.",
  modeAskWrites: "Chiedi prima di scrivere e di eseguire comandi",
  modeAskWritesDesc: "Solo la lettura avviene subito. Prima di scrivere un file e prima di eseguire un comando, l’agente chiede.",
  modeTrust: "Fidati di questo progetto",
  modeTrustDesc: "Non viene chiesto nulla. Codex resta comunque nel suo spazio isolato; per Claude Code è il suo stesso revisore a controllare ogni azione al posto tuo.",
  warningTitle: "Prima di iniziare",
  warningCommands: "I comandi eseguiti dall’agente possono modificare file e usare internet. Un documento che ti ha mandato qualcuno può contenere istruzioni nascoste.",
  warningRedaction: "Le parti che hai nascosto all’AI restano nascoste solo nei documenti aperti in GenOffice. I file che l’agente legge dalla cartella vengono inviati così come sono.",
  warningUsage: "Un agente lavora in molti passaggi e consuma più del tuo abbonamento rispetto al pannello AI.",
  warningAccept: "Ho capito",
  start: "Avvia",
  starting: "Avvio…",
  stop: "Interrompi",
  newSession: "Nuova sessione",
  send: "Invia",
  inputPlaceholder: "Che cosa deve fare l’agente?",
  you: "Tu",
  agent: "Agente",
  startedLine: "{program} avviato in {folder}",
  skillsLine: "{n} skill disponibili",
  skillsLineOne: "{n} skill disponibile",
  toolRunning: "In corso",
  toolDone: "Fatto",
  toolFailed: "Non riuscito",
  toolDenied: "Rifiutato",
  actRead: "Leggi",
  actWrite: "Scrivi",
  actCommand: "Esegui",
  actAppTool: "Modifica un documento aperto",
  actSkill: "Usa una skill",
  actOther: "Usa uno strumento",
  openFile: "Apri",
  permTitle: "L’agente chiede di:",
  permCommand: "Eseguire questo comando",
  permWrite: "Scrivere in questo file",
  permRead: "Leggere un file fuori dalla cartella del progetto",
  permOther: "Usare lo strumento «{tool}»",
  permReason: "Motivo: {reason}",
  permAllow: "Consenti",
  permDeny: "Rifiuta",
  turnFailed: "L’agente non è riuscito a completare questa richiesta.",
  ended: "La sessione è terminata.",
  errBadFolder: "Questa cartella non può essere usata. Scegli una cartella con il tuo lavoro: non un’intera unità, non la tua cartella utente e non una cartella di dati di accesso o delle app.",
  errNotConnected: "Questo programma non è connesso. Accedi da Impostazioni → IA e riprova.",
  errNotAccepted: "Leggi prima le note qui sopra e confermale.",
  errUnsafeTools: "Il programma si è avviato con strumenti che l’app non gli ha dato, quindi è stato fermato.",
  errRateLimit: "Il limite del tuo abbonamento è esaurito. Riprova più tardi.",
  errSignedOut: "Il programma è disconnesso. Accedi da Impostazioni → IA.",
  errMetered: "Il programma è connesso con un accesso a consumo che non hai accettato.",
  errSandboxUnavailable: "Codex non riesce ad aprire su questo PC la sandbox che isola i suoi comandi, quindi non è stato avviato. Aggiorna Windows oppure scegli Claude Code.",
  errNeedsUpdate: "Il programma è troppo vecchio per la modalità agente. Aggiornalo e riprova.",
  errNotInstalled: "Il programma non è installato.",
  errGeneric: "Si è verificato un problema. Riprova."
};
const pl$1 = {
  windowTitle: "Agent",
  homeCardSub: "Pracuj w folderze z Claude Code lub Codex",
  intro: "Agent uruchamia Twój Claude Code lub Codex w wybranym przez Ciebie folderze. Może czytać znajdujące się tam pliki, tworzyć nowe, korzystać z Twoich umiejętności, uruchamiać skrypty i zmieniać dokumenty otwarte w GenOffice.",
  folderLabel: "Folder projektu",
  folderPick: "Wybierz folder…",
  folderNone: "Nie wybrano folderu",
  recentLabel: "Ostatnie foldery",
  providerLabel: "Program",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "W systemie Windows polecenia, na które pozwolisz, działają bez izolacji i mają dostęp do całego komputera oraz internetu.",
  providerCodexNote: "Polecenia działają w izolowanej przestrzeni Codex: zapisywać można tylko w folderze projektu i nie ma dostępu do internetu.",
  providerBlocked: "Jeszcze niedostępne: nie da się jeszcze zablokować Codexowi odczytu własnego pliku logowania.",
  connChecking: "Sprawdzanie połączenia…",
  connUnavailable: "Brak połączenia. Zaloguj się w Ustawienia → AI.",
  connMetered: "Zalogowano kontem rozliczanym za użycie, zaakceptowanym przez Ciebie.",
  modeLabel: "Kiedy pytać",
  modeAskCommands: "Pytaj przed każdym poleceniem",
  modeAskCommandsDesc: "Odczyt i zapis plików w folderze projektu odbywa się od razu. Przed uruchomieniem polecenia lub skryptu agent zapyta.",
  modeAskWrites: "Pytaj przed zapisem i poleceniami",
  modeAskWritesDesc: "Od razu odbywa się tylko odczyt. Przed zapisem pliku i przed uruchomieniem polecenia agent zapyta.",
  modeTrust: "Ufaj temu projektowi",
  modeTrustDesc: "Agent o nic nie pyta. Codex nadal pozostaje w swojej izolowanej przestrzeni; w Claude Code każdą czynność zamiast Ciebie sprawdza jego własny weryfikator.",
  warningTitle: "Zanim zaczniesz",
  warningCommands: "Polecenia uruchamiane przez agenta mogą zmieniać pliki i korzystać z internetu. Dokument, który ktoś Ci przysłał, może zawierać ukryte instrukcje.",
  warningRedaction: "Fragmenty ukryte przed AI pozostają ukryte tylko w dokumentach otwartych w GenOffice. Pliki, które agent czyta z folderu, są wysyłane bez zmian.",
  warningUsage: "Agent pracuje w wielu krokach i zużywa więcej limitu subskrypcji niż panel AI.",
  warningAccept: "Rozumiem",
  start: "Rozpocznij",
  starting: "Uruchamianie…",
  stop: "Zatrzymaj",
  newSession: "Nowa sesja",
  send: "Wyślij",
  inputPlaceholder: "Co ma zrobić agent?",
  you: "Ty",
  agent: "Agent",
  startedLine: "Uruchomiono {program} w folderze {folder}",
  skillsLine: "Dostępne umiejętności: {n}",
  skillsLineOne: "Dostępna {n} umiejętność",
  toolRunning: "W toku",
  toolDone: "Gotowe",
  toolFailed: "Niepowodzenie",
  toolDenied: "Odrzucono",
  actRead: "Odczyt",
  actWrite: "Zapis",
  actCommand: "Uruchomienie",
  actAppTool: "Edycja otwartego dokumentu",
  actSkill: "Użycie umiejętności",
  actOther: "Użycie narzędzia",
  openFile: "Otwórz",
  permTitle: "Agent prosi o zgodę na:",
  permCommand: "Uruchomienie tego polecenia",
  permWrite: "Zapis do tego pliku",
  permRead: "Odczyt pliku spoza folderu projektu",
  permOther: "Użycie narzędzia „{tool}”",
  permReason: "Powód: {reason}",
  permAllow: "Zezwól",
  permDeny: "Odrzuć",
  turnFailed: "Agent nie mógł dokończyć tego zadania.",
  ended: "Sesja została zakończona.",
  errBadFolder: "Tego folderu nie można użyć. Wybierz folder ze swoją pracą: nie cały dysk, nie folder domowy i nie folder z danymi logowania lub aplikacji.",
  errNotConnected: "Ten program nie jest połączony. Zaloguj się w Ustawienia → AI i spróbuj ponownie.",
  errNotAccepted: "Najpierw przeczytaj powyższe uwagi i je potwierdź.",
  errUnsafeTools: "Program uruchomił się z narzędziami, których aplikacja mu nie dała, więc został zatrzymany.",
  errRateLimit: "Limit subskrypcji został wyczerpany. Spróbuj ponownie później.",
  errSignedOut: "Program jest wylogowany. Zaloguj się w Ustawienia → AI.",
  errMetered: "Program jest zalogowany kontem rozliczanym za użycie, na które nie wyrażono zgody.",
  errSandboxUnavailable: "Codex nie może otworzyć na tym komputerze piaskownicy, która izoluje jego polecenia, więc nie został uruchomiony. Zaktualizuj system Windows albo wybierz Claude Code.",
  errNeedsUpdate: "Program jest zbyt stary na tryb agenta. Zaktualizuj go i spróbuj ponownie.",
  errNotInstalled: "Program nie jest zainstalowany.",
  errGeneric: "Coś poszło nie tak. Spróbuj ponownie."
};
const cs$1 = {
  windowTitle: "Agent",
  homeCardSub: "Práce ve složce s Claude Code nebo Codex",
  intro: "Agent spouští váš Claude Code nebo Codex ve složce, kterou si vyberete. Může číst soubory v ní, vytvářet nové, používat vaše dovednosti, spouštět skripty a měnit dokumenty otevřené v GenOffice.",
  folderLabel: "Složka projektu",
  folderPick: "Vybrat složku…",
  folderNone: "Není vybrána žádná složka",
  recentLabel: "Nedávné složky",
  providerLabel: "Program",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "Ve Windows běží příkazy, které povolíte, bez izolace a mají přístup k celému počítači i k internetu.",
  providerCodexNote: "Příkazy běží v izolovaném prostoru programu Codex: zapisovat lze jen do složky projektu a internet není k dispozici.",
  providerBlocked: "Zatím nedostupné: Codexu zatím nelze zabránit ve čtení vlastního přihlašovacího souboru.",
  connChecking: "Kontroluje se připojení…",
  connUnavailable: "Nepřipojeno. Přihlaste se v Nastavení → AI.",
  connMetered: "Přihlášeno placeným přihlášením podle spotřeby, které jste přijali.",
  modeLabel: "Kdy se vás ptát",
  modeAskCommands: "Ptát se před každým příkazem",
  modeAskCommandsDesc: "Čtení a zápis souborů ve složce projektu proběhne hned. Před spuštěním příkazu nebo skriptu se agent zeptá.",
  modeAskWrites: "Ptát se před zápisem a příkazy",
  modeAskWritesDesc: "Hned proběhne jen čtení. Před zápisem souboru i před spuštěním příkazu se agent zeptá.",
  modeTrust: "Důvěřovat tomuto projektu",
  modeTrustDesc: "Na nic se neptá. Codex přesto zůstává ve svém izolovaném prostoru; u Claude Code kontroluje každou akci místo vás jeho vlastní kontrolor.",
  warningTitle: "Než začnete",
  warningCommands: "Příkazy, které agent spouští, mohou měnit soubory a používat internet. Dokument, který vám někdo poslal, může obsahovat skryté pokyny.",
  warningRedaction: "Části skryté před AI zůstávají skryté jen v dokumentech otevřených v GenOffice. Soubory, které agent čte ze složky, se odesílají tak, jak jsou.",
  warningUsage: "Agent pracuje v mnoha krocích a spotřebuje víc z vašeho předplatného než panel AI.",
  warningAccept: "Rozumím",
  start: "Spustit",
  starting: "Spouští se…",
  stop: "Zastavit",
  newSession: "Nová relace",
  send: "Odeslat",
  inputPlaceholder: "Co má agent udělat?",
  you: "Vy",
  agent: "Agent",
  startedLine: "{program} spuštěn ve složce {folder}",
  skillsLine: "Dostupné dovednosti: {n}",
  skillsLineOne: "Dostupná {n} dovednost",
  toolRunning: "Probíhá",
  toolDone: "Hotovo",
  toolFailed: "Nezdařilo se",
  toolDenied: "Odmítnuto",
  actRead: "Čtení",
  actWrite: "Zápis",
  actCommand: "Spuštění",
  actAppTool: "Úprava otevřeného dokumentu",
  actSkill: "Použití dovednosti",
  actOther: "Použití nástroje",
  openFile: "Otevřít",
  permTitle: "Agent žádá o svolení:",
  permCommand: "Spustit tento příkaz",
  permWrite: "Zapsat do tohoto souboru",
  permRead: "Číst soubor mimo složku projektu",
  permOther: "Použít nástroj „{tool}“",
  permReason: "Důvod: {reason}",
  permAllow: "Povolit",
  permDeny: "Odmítnout",
  turnFailed: "Agent tento požadavek nedokončil.",
  ended: "Relace skončila.",
  errBadFolder: "Tuto složku nelze použít. Vyberte složku s vlastní prací: ne celý disk, ne domovskou složku a ne složku s přihlašovacími nebo aplikačními daty.",
  errNotConnected: "Tento program není připojen. Přihlaste se v Nastavení → AI a zkuste to znovu.",
  errNotAccepted: "Nejprve si přečtěte upozornění výše a potvrďte je.",
  errUnsafeTools: "Program se spustil s nástroji, které mu aplikace nedala, a proto byl zastaven.",
  errRateLimit: "Limit předplatného je vyčerpán. Zkuste to později.",
  errSignedOut: "Program je odhlášen. Přihlaste se v Nastavení → AI.",
  errMetered: "Program je přihlášen placeným přihlášením podle spotřeby, které jste nepřijali.",
  errSandboxUnavailable: "Codex na tomto počítači nemůže otevřít izolované prostředí pro své příkazy, a proto se nespustil. Aktualizujte Windows, nebo zvolte Claude Code.",
  errNeedsUpdate: "Program je pro režim agenta příliš starý. Aktualizujte ho a zkuste to znovu.",
  errNotInstalled: "Program není nainstalován.",
  errGeneric: "Něco se pokazilo. Zkuste to znovu."
};
const nl$1 = {
  windowTitle: "Agent",
  homeCardSub: "Werk in een map met Claude Code of Codex",
  intro: "De agent voert je Claude Code of Codex uit in een map die je kiest. Hij kan de bestanden daarin lezen, nieuwe maken, je skills gebruiken, scripts uitvoeren en documenten wijzigen die in GenOffice geopend zijn.",
  folderLabel: "Projectmap",
  folderPick: "Kies een map…",
  folderNone: "Geen map gekozen",
  recentLabel: "Recente mappen",
  providerLabel: "Programma",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "Op Windows worden opdrachten die je toestaat zonder afscherming uitgevoerd en kunnen ze bij je hele pc en het internet.",
  providerCodexNote: "Opdrachten worden uitgevoerd in de afgeschermde ruimte van Codex: alleen in de projectmap kan worden geschreven en er is geen internet.",
  providerBlocked: "Nog niet beschikbaar: Codex kan nog niet worden verhinderd zijn eigen aanmeldbestand te lezen.",
  connChecking: "Verbinding controleren…",
  connUnavailable: "Niet verbonden. Meld je aan via Instellingen → AI.",
  connMetered: "Aangemeld met een login met betalen per gebruik die je hebt geaccepteerd.",
  modeLabel: "Wanneer je iets vragen",
  modeAskCommands: "Vragen voor elke opdracht",
  modeAskCommandsDesc: "Bestanden in de projectmap lezen en schrijven gebeurt direct. Voor het uitvoeren van een opdracht of script wordt eerst gevraagd.",
  modeAskWrites: "Vragen voor schrijven en opdrachten",
  modeAskWritesDesc: "Alleen lezen gebeurt direct. Voor het schrijven van een bestand en voor het uitvoeren van een opdracht wordt eerst gevraagd.",
  modeTrust: "Dit project vertrouwen",
  modeTrustDesc: "Er wordt niets gevraagd. Codex blijft wel in zijn afgeschermde ruimte; bij Claude Code controleert zijn eigen controleur elke actie in jouw plaats.",
  warningTitle: "Voordat je begint",
  warningCommands: "Opdrachten die de agent uitvoert, kunnen bestanden wijzigen en het internet gebruiken. Een document dat iemand je heeft gestuurd, kan verborgen instructies bevatten.",
  warningRedaction: "Delen die je voor AI hebt verborgen, blijven alleen verborgen in documenten die in GenOffice geopend zijn. Bestanden die de agent uit de map leest, worden ongewijzigd verstuurd.",
  warningUsage: "Een agent werkt in veel stappen en gebruikt meer van je abonnement dan het AI-paneel.",
  warningAccept: "Begrepen",
  start: "Starten",
  starting: "Starten…",
  stop: "Stoppen",
  newSession: "Nieuwe sessie",
  send: "Versturen",
  inputPlaceholder: "Wat moet de agent doen?",
  you: "Jij",
  agent: "Agent",
  startedLine: "{program} gestart in {folder}",
  skillsLine: "{n} skills beschikbaar",
  skillsLineOne: "{n} skill beschikbaar",
  toolRunning: "Bezig",
  toolDone: "Klaar",
  toolFailed: "Mislukt",
  toolDenied: "Geweigerd",
  actRead: "Lezen",
  actWrite: "Schrijven",
  actCommand: "Uitvoeren",
  actAppTool: "Een geopend document bewerken",
  actSkill: "Een skill gebruiken",
  actOther: "Een hulpmiddel gebruiken",
  openFile: "Openen",
  permTitle: "De agent vraagt om:",
  permCommand: "Deze opdracht uitvoeren",
  permWrite: "Dit bestand schrijven",
  permRead: "Een bestand buiten de projectmap lezen",
  permOther: "Het hulpmiddel ‘{tool}’ gebruiken",
  permReason: "Reden: {reason}",
  permAllow: "Toestaan",
  permDeny: "Weigeren",
  turnFailed: "De agent kon dit verzoek niet afronden.",
  ended: "De sessie is beëindigd.",
  errBadFolder: "Deze map kan niet worden gebruikt. Kies een map met je eigen werk: geen hele schijf, niet je gebruikersmap en geen map met aanmeld- of app-gegevens.",
  errNotConnected: "Dit programma is niet verbonden. Meld je aan via Instellingen → AI en probeer het opnieuw.",
  errNotAccepted: "Lees eerst de opmerkingen hierboven en bevestig ze.",
  errUnsafeTools: "Het programma startte met hulpmiddelen die de app het niet had gegeven en is daarom gestopt.",
  errRateLimit: "De limiet van je abonnement is op. Probeer het later opnieuw.",
  errSignedOut: "Het programma is afgemeld. Meld je aan via Instellingen → AI.",
  errMetered: "Het programma is aangemeld met een login met betalen per gebruik die je niet hebt geaccepteerd.",
  errSandboxUnavailable: "Codex kan op deze pc de sandbox die zijn opdrachten afschermt niet openen en is daarom niet gestart. Werk Windows bij of kies Claude Code.",
  errNeedsUpdate: "Het programma is te oud voor de agentmodus. Werk het bij en probeer het opnieuw.",
  errNotInstalled: "Het programma is niet geïnstalleerd.",
  errGeneric: "Er ging iets mis. Probeer het opnieuw."
};
const ms$1 = {
  windowTitle: "Ejen",
  homeCardSub: "Bekerja dalam folder dengan Claude Code atau Codex",
  intro: "Ejen menjalankan Claude Code atau Codex anda dalam folder yang anda pilih. Ejen boleh membaca fail di dalamnya, mencipta fail baharu, menggunakan kemahiran anda, menjalankan skrip dan mengubah dokumen yang dibuka dalam GenOffice.",
  folderLabel: "Folder projek",
  folderPick: "Pilih folder…",
  folderNone: "Tiada folder dipilih",
  recentLabel: "Folder terkini",
  providerLabel: "Program",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "Pada Windows, arahan yang anda benarkan berjalan tanpa pengasingan dan boleh mencapai seluruh PC anda serta internet.",
  providerCodexNote: "Arahan berjalan dalam ruang terasing Codex: hanya folder projek yang boleh ditulis, dan tiada internet.",
  providerBlocked: "Belum tersedia: Codex belum dapat dihalang daripada membaca fail log masuknya sendiri.",
  connChecking: "Menyemak sambungan…",
  connUnavailable: "Tidak bersambung. Log masuk di Tetapan → AI.",
  connMetered: "Log masuk dengan akaun bayar ikut penggunaan yang telah anda terima.",
  modeLabel: "Bila hendak bertanya kepada anda",
  modeAskCommands: "Tanya sebelum setiap arahan",
  modeAskCommandsDesc: "Membaca dan menulis fail dalam folder projek dilakukan terus. Sebelum menjalankan arahan atau skrip, ejen akan bertanya dahulu.",
  modeAskWrites: "Tanya sebelum menulis dan menjalankan arahan",
  modeAskWritesDesc: "Hanya membaca dilakukan terus. Sebelum menulis fail dan sebelum menjalankan arahan, ejen akan bertanya dahulu.",
  modeTrust: "Percayai projek ini",
  modeTrustDesc: "Tiada apa-apa ditanya. Codex tetap kekal dalam ruang terasingnya; bagi Claude Code, penyemaknya sendiri memeriksa setiap tindakan bagi pihak anda.",
  warningTitle: "Sebelum anda mula",
  warningCommands: "Arahan yang dijalankan oleh ejen boleh mengubah fail dan menggunakan internet. Dokumen yang dihantar oleh orang lain kepada anda mungkin mengandungi arahan tersembunyi.",
  warningRedaction: "Bahagian yang anda sembunyikan daripada AI hanya kekal tersembunyi dalam dokumen yang dibuka dalam GenOffice. Fail yang dibaca oleh ejen dari folder dihantar seadanya.",
  warningUsage: "Ejen bekerja dalam banyak langkah dan menggunakan lebih banyak kuota langganan anda berbanding panel AI.",
  warningAccept: "Saya faham",
  start: "Mula",
  starting: "Memulakan…",
  stop: "Henti",
  newSession: "Sesi baharu",
  send: "Hantar",
  inputPlaceholder: "Apakah yang perlu dilakukan oleh ejen?",
  you: "Anda",
  agent: "Ejen",
  startedLine: "{program} dimulakan dalam {folder}",
  skillsLine: "{n} kemahiran tersedia",
  skillsLineOne: "{n} kemahiran tersedia",
  toolRunning: "Sedang berjalan",
  toolDone: "Selesai",
  toolFailed: "Gagal",
  toolDenied: "Ditolak",
  actRead: "Baca",
  actWrite: "Tulis",
  actCommand: "Jalankan",
  actAppTool: "Sunting dokumen yang dibuka",
  actSkill: "Guna kemahiran",
  actOther: "Guna alat",
  openFile: "Buka",
  permTitle: "Ejen meminta kebenaran untuk:",
  permCommand: "Menjalankan arahan ini",
  permWrite: "Menulis fail ini",
  permRead: "Membaca fail di luar folder projek",
  permOther: "Menggunakan alat “{tool}”",
  permReason: "Sebab: {reason}",
  permAllow: "Benarkan",
  permDeny: "Tolak",
  turnFailed: "Ejen tidak dapat menyelesaikan permintaan ini.",
  ended: "Sesi telah tamat.",
  errBadFolder: "Folder ini tidak boleh digunakan. Pilih folder kerja anda sendiri: bukan keseluruhan pemacu, bukan folder rumah anda dan bukan folder data log masuk atau data aplikasi.",
  errNotConnected: "Program ini tidak bersambung. Log masuk di Tetapan → AI dan cuba lagi.",
  errNotAccepted: "Baca nota di atas dan sahkan dahulu.",
  errUnsafeTools: "Program dimulakan dengan alat yang tidak diberikan oleh aplikasi, jadi ia dihentikan.",
  errRateLimit: "Had langganan anda telah habis. Cuba lagi kemudian.",
  errSignedOut: "Program telah log keluar. Log masuk di Tetapan → AI.",
  errMetered: "Program log masuk dengan akaun bayar ikut penggunaan yang belum anda terima.",
  errSandboxUnavailable: "Codex tidak dapat membuka kotak pasir yang mengurung arahannya pada PC ini, jadi ia tidak dimulakan. Kemas kini Windows, atau pilih Claude Code.",
  errNeedsUpdate: "Program terlalu lama untuk mod ejen. Kemas kini dan cuba lagi.",
  errNotInstalled: "Program tidak dipasang.",
  errGeneric: "Berlaku masalah. Cuba lagi."
};
const he$1 = {
  windowTitle: "סוכן",
  homeCardSub: "עבודה בתיקייה עם Claude Code או Codex",
  intro: "הסוכן מפעיל את Claude Code או Codex שלך בתיקייה שתבחר. הוא יכול לקרוא את הקבצים שבה, ליצור קבצים חדשים, להשתמש במיומנויות שלך, להריץ סקריפטים ולשנות מסמכים הפתוחים ב-GenOffice.",
  folderLabel: "תיקיית הפרויקט",
  folderPick: "בחירת תיקייה…",
  folderNone: "לא נבחרה תיקייה",
  recentLabel: "תיקיות אחרונות",
  providerLabel: "תוכנה",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "ב-Windows, פקודות שתאשר רצות ללא בידוד ויכולות לגשת לכל המחשב שלך ולאינטרנט.",
  providerCodexNote: "הפקודות רצות במרחב המבודד של Codex: אפשר לכתוב רק לתיקיית הפרויקט, ואין גישה לאינטרנט.",
  providerBlocked: "עדיין לא זמין: עדיין אי אפשר למנוע מ-Codex לקרוא את קובץ ההתחברות שלו.",
  connChecking: "בודק את החיבור…",
  connUnavailable: "לא מחובר. יש להתחבר בהגדרות → AI.",
  connMetered: "מחובר באמצעות כניסה בתשלום לפי שימוש שאישרת.",
  modeLabel: "מתי לשאול אותך",
  modeAskCommands: "לשאול לפני כל פקודה",
  modeAskCommandsDesc: "קריאה וכתיבה של קבצים בתיקיית הפרויקט מתבצעות מיד. לפני הרצת פקודה או סקריפט הסוכן ישאל.",
  modeAskWrites: "לשאול לפני כתיבה ופקודות",
  modeAskWritesDesc: "רק קריאה מתבצעת מיד. לפני כתיבת קובץ ולפני הרצת פקודה הסוכן ישאל.",
  modeTrust: "לסמוך על הפרויקט הזה",
  modeTrustDesc: "אין שאלות. Codex עדיין נשאר במרחב המבודד שלו; ב-Claude Code, הבודק המובנה שלו בודק כל פעולה במקומך.",
  warningTitle: "לפני שמתחילים",
  warningCommands: "פקודות שהסוכן מריץ יכולות לשנות קבצים ולהשתמש באינטרנט. מסמך שמישהו שלח לך עלול להכיל הוראות נסתרות.",
  warningRedaction: "חלקים שהסתרת מ-AI נשארים מוסתרים רק במסמכים הפתוחים ב-GenOffice. קבצים שהסוכן קורא מהתיקייה נשלחים כפי שהם.",
  warningUsage: "סוכן עובד בצעדים רבים ומנצל יותר מהמנוי שלך מאשר חלונית ה-AI.",
  warningAccept: "הבנתי",
  start: "התחלה",
  starting: "מתחיל…",
  stop: "עצירה",
  newSession: "סשן חדש",
  send: "שליחה",
  inputPlaceholder: "מה הסוכן צריך לעשות?",
  you: "את/ה",
  agent: "סוכן",
  startedLine: "{program} הופעל בתיקייה {folder}",
  skillsLine: "{n} מיומנויות זמינות",
  skillsLineOne: "{n} מיומנות זמינה",
  toolRunning: "בביצוע",
  toolDone: "הושלם",
  toolFailed: "נכשל",
  toolDenied: "נדחה",
  actRead: "קריאה",
  actWrite: "כתיבה",
  actCommand: "הרצה",
  actAppTool: "עריכת מסמך פתוח",
  actSkill: "שימוש במיומנות",
  actOther: "שימוש בכלי",
  openFile: "פתיחה",
  permTitle: "הסוכן מבקש:",
  permCommand: "להריץ את הפקודה הזו",
  permWrite: "לכתוב לקובץ הזה",
  permRead: "לקרוא קובץ מחוץ לתיקיית הפרויקט",
  permOther: 'להשתמש בכלי "{tool}"',
  permReason: "סיבה: {reason}",
  permAllow: "אישור",
  permDeny: "דחייה",
  turnFailed: "הסוכן לא הצליח להשלים את הבקשה.",
  ended: "הסשן הסתיים.",
  errBadFolder: "אי אפשר להשתמש בתיקייה הזו. יש לבחור תיקייה של העבודה שלך: לא כונן שלם, לא תיקיית הבית שלך ולא תיקייה של נתוני התחברות או נתוני אפליקציות.",
  errNotConnected: "התוכנה הזו לא מחוברת. יש להתחבר בהגדרות → AI ולנסות שוב.",
  errNotAccepted: "יש לקרוא את ההערות שלמעלה ולאשר אותן קודם.",
  errUnsafeTools: "התוכנה הופעלה עם כלים שהאפליקציה לא נתנה לה, ולכן היא נעצרה.",
  errRateLimit: "מכסת המנוי שלך נוצלה. אפשר לנסות שוב מאוחר יותר.",
  errSignedOut: "התוכנה מנותקת מהחשבון. יש להתחבר בהגדרות → AI.",
  errMetered: "התוכנה מחוברת באמצעות כניסה בתשלום לפי שימוש שלא אישרת.",
  errSandboxUnavailable: "Codex לא יכול לפתוח במחשב הזה את ארגז החול שמבודד את הפקודות שלו, ולכן הוא לא הופעל. עדכנו את Windows או בחרו ב-Claude Code.",
  errNeedsUpdate: "התוכנה ישנה מדי למצב סוכן. יש לעדכן אותה ולנסות שוב.",
  errNotInstalled: "התוכנה לא מותקנת.",
  errGeneric: "משהו השתבש. אפשר לנסות שוב."
};
const hi$1 = {
  windowTitle: "एजेंट",
  homeCardSub: "किसी फ़ोल्डर में Claude Code या Codex के साथ काम करें",
  intro: "एजेंट आपके चुने हुए फ़ोल्डर में आपका Claude Code या Codex चलाता है। यह वहाँ की फ़ाइलें पढ़ सकता है, नई फ़ाइलें बना सकता है, आपकी स्किल इस्तेमाल कर सकता है, स्क्रिप्ट चला सकता है और GenOffice में खुले दस्तावेज़ बदल सकता है।",
  folderLabel: "प्रोजेक्ट फ़ोल्डर",
  folderPick: "फ़ोल्डर चुनें…",
  folderNone: "कोई फ़ोल्डर नहीं चुना गया",
  recentLabel: "हाल के फ़ोल्डर",
  providerLabel: "प्रोग्राम",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "Windows पर, आपकी अनुमति वाले कमांड बिना अलगाव के चलते हैं और आपके पूरे पीसी और इंटरनेट तक पहुँच सकते हैं।",
  providerCodexNote: "कमांड Codex के अलग किए गए स्थान में चलते हैं: केवल प्रोजेक्ट फ़ोल्डर में लिखा जा सकता है, और इंटरनेट उपलब्ध नहीं है।",
  providerBlocked: "अभी उपलब्ध नहीं: अभी Codex को उसकी अपनी साइन-इन फ़ाइल पढ़ने से रोका नहीं जा सकता।",
  connChecking: "कनेक्शन जाँचा जा रहा है…",
  connUnavailable: "कनेक्ट नहीं है। सेटिंग्स → AI में साइन इन करें।",
  connMetered: "आपके स्वीकार किए गए, उपयोग के हिसाब से भुगतान वाले लॉगिन से साइन इन है।",
  modeLabel: "आपसे कब पूछें",
  modeAskCommands: "हर कमांड से पहले पूछें",
  modeAskCommandsDesc: "प्रोजेक्ट फ़ोल्डर में फ़ाइलें पढ़ना और लिखना सीधे होता है। कमांड या स्क्रिप्ट चलाने से पहले पूछा जाता है।",
  modeAskWrites: "लिखने और कमांड से पहले पूछें",
  modeAskWritesDesc: "केवल पढ़ना सीधे होता है। फ़ाइल लिखने और कमांड चलाने, दोनों से पहले पूछा जाता है।",
  modeTrust: "इस प्रोजेक्ट पर भरोसा करें",
  modeTrustDesc: "कुछ नहीं पूछा जाता। Codex फिर भी अपने अलग किए गए स्थान में ही रहता है; Claude Code में उसका अपना समीक्षक आपकी जगह हर कार्रवाई जाँचता है।",
  warningTitle: "शुरू करने से पहले",
  warningCommands: "एजेंट जो कमांड चलाता है, वे फ़ाइलें बदल सकते हैं और इंटरनेट इस्तेमाल कर सकते हैं। किसी के भेजे गए दस्तावेज़ में छिपे हुए निर्देश हो सकते हैं।",
  warningRedaction: "आपने AI से जो हिस्से छिपाए हैं, वे केवल GenOffice में खुले दस्तावेज़ों में छिपे रहते हैं। एजेंट फ़ोल्डर से जो फ़ाइलें पढ़ता है, वे जैसी हैं वैसी ही भेजी जाती हैं।",
  warningUsage: "एजेंट कई चरणों में काम करता है और AI पैनल की तुलना में आपकी सदस्यता की सीमा ज़्यादा इस्तेमाल करता है।",
  warningAccept: "समझ लिया",
  start: "शुरू करें",
  starting: "शुरू हो रहा है…",
  stop: "रोकें",
  newSession: "नया सत्र",
  send: "भेजें",
  inputPlaceholder: "एजेंट को क्या करना है?",
  you: "आप",
  agent: "एजेंट",
  startedLine: "{program} को {folder} में शुरू किया गया",
  skillsLine: "{n} स्किल उपलब्ध हैं",
  skillsLineOne: "{n} स्किल उपलब्ध है",
  toolRunning: "चल रहा है",
  toolDone: "हो गया",
  toolFailed: "विफल",
  toolDenied: "अस्वीकार किया गया",
  actRead: "पढ़ें",
  actWrite: "लिखें",
  actCommand: "चलाएँ",
  actAppTool: "खुला दस्तावेज़ संपादित करें",
  actSkill: "स्किल इस्तेमाल करें",
  actOther: "टूल इस्तेमाल करें",
  openFile: "खोलें",
  permTitle: "एजेंट यह करना चाहता है:",
  permCommand: "यह कमांड चलाना",
  permWrite: "यह फ़ाइल लिखना",
  permRead: "प्रोजेक्ट फ़ोल्डर के बाहर की फ़ाइल पढ़ना",
  permOther: "“{tool}” टूल इस्तेमाल करना",
  permReason: "कारण: {reason}",
  permAllow: "अनुमति दें",
  permDeny: "अस्वीकार करें",
  turnFailed: "एजेंट यह अनुरोध पूरा नहीं कर सका।",
  ended: "सत्र समाप्त हो गया है।",
  errBadFolder: "यह फ़ोल्डर इस्तेमाल नहीं किया जा सकता। अपने काम का फ़ोल्डर चुनें: पूरी ड्राइव नहीं, आपका होम फ़ोल्डर नहीं, और साइन-इन या ऐप डेटा वाला फ़ोल्डर नहीं।",
  errNotConnected: "यह प्रोग्राम कनेक्ट नहीं है। सेटिंग्स → AI में साइन इन करें और फिर से कोशिश करें।",
  errNotAccepted: "पहले ऊपर दी गई बातें पढ़ें और उनकी पुष्टि करें।",
  errUnsafeTools: "प्रोग्राम ऐसे टूल के साथ शुरू हुआ जो ऐप ने उसे नहीं दिए थे, इसलिए उसे रोक दिया गया।",
  errRateLimit: "आपकी सदस्यता की सीमा खत्म हो गई है। बाद में फिर से कोशिश करें।",
  errSignedOut: "प्रोग्राम साइन आउट है। सेटिंग्स → AI में साइन इन करें।",
  errMetered: "प्रोग्राम उपयोग के हिसाब से भुगतान वाले ऐसे लॉगिन से साइन इन है जिसे आपने स्वीकार नहीं किया है।",
  errSandboxUnavailable: "इस पीसी पर Codex अपने कमांड को अलग रखने वाला सैंडबॉक्स नहीं खोल सकता, इसलिए वह शुरू नहीं हुआ। Windows को अपडेट करें या Claude Code चुनें।",
  errNeedsUpdate: "प्रोग्राम एजेंट मोड के लिए बहुत पुराना है। इसे अपडेट करें और फिर से कोशिश करें।",
  errNotInstalled: "प्रोग्राम इंस्टॉल नहीं है।",
  errGeneric: "कुछ गड़बड़ हो गई। फिर से कोशिश करें।"
};
const zhTW$1 = {
  windowTitle: "代理程式",
  homeCardSub: "在資料夾中使用 Claude Code 或 Codex 工作",
  intro: "代理程式會在你選擇的資料夾中執行你的 Claude Code 或 Codex。它可以讀取其中的檔案、建立新檔案、使用你的技能、執行指令碼，並修改在 GenOffice 中開啟的文件。",
  folderLabel: "專案資料夾",
  folderPick: "選擇資料夾…",
  folderNone: "尚未選擇資料夾",
  recentLabel: "最近使用的資料夾",
  providerLabel: "程式",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "在 Windows 上，你允許的指令會在沒有隔離的情況下執行，可能存取整台電腦和網際網路。",
  providerCodexNote: "指令在 Codex 的隔離空間中執行：只能寫入專案資料夾，且無法連上網際網路。",
  providerBlocked: "暫不可用：目前還無法阻止 Codex 讀取它自己的登入檔案。",
  connChecking: "正在檢查連線…",
  connUnavailable: "未連線。請在「設定 → AI」中登入。",
  connMetered: "正在使用你已允許的按用量計費登入。",
  modeLabel: "何時詢問你",
  modeAskCommands: "每次執行指令前詢問",
  modeAskCommandsDesc: "專案資料夾中的檔案讀寫會直接進行。執行指令或指令碼前會先詢問。",
  modeAskWrites: "寫入檔案和執行指令前都詢問",
  modeAskWritesDesc: "只有讀取會直接進行。寫入檔案和執行指令前都會先詢問。",
  modeTrust: "信任此專案",
  modeTrustDesc: "不再詢問。Codex 仍只在隔離空間中動作；Claude Code 則由其內建的審查模型代替你檢查每個動作。",
  warningTitle: "開始之前",
  warningCommands: "代理程式執行的指令可以修改檔案並使用網際網路。別人傳給你的文件中可能含有隱藏的指示。",
  warningRedaction: "你對 AI 隱藏的部分，只在 GenOffice 中開啟的文件裡保持隱藏。代理程式直接從資料夾讀取的檔案會原樣傳送。",
  warningUsage: "代理程式分成多個步驟工作，比 AI 面板消耗更多方案額度。",
  warningAccept: "我了解了",
  start: "開始",
  starting: "正在開始…",
  stop: "停止",
  newSession: "新工作階段",
  send: "傳送",
  inputPlaceholder: "要讓代理程式做什麼？",
  you: "你",
  agent: "代理程式",
  startedLine: "已在 {folder} 中啟動 {program}",
  skillsLine: "可使用 {n} 個技能",
  skillsLineOne: "可使用 {n} 個技能",
  toolRunning: "進行中",
  toolDone: "完成",
  toolFailed: "失敗",
  toolDenied: "已拒絕",
  actRead: "讀取",
  actWrite: "寫入",
  actCommand: "執行",
  actAppTool: "修改開啟的文件",
  actSkill: "使用技能",
  actOther: "使用工具",
  openFile: "開啟",
  permTitle: "代理程式要求：",
  permCommand: "執行此指令",
  permWrite: "寫入此檔案",
  permRead: "讀取專案資料夾以外的檔案",
  permOther: "使用工具「{tool}」",
  permReason: "原因：{reason}",
  permAllow: "允許",
  permDeny: "拒絕",
  turnFailed: "代理程式無法完成此要求。",
  ended: "工作階段已結束。",
  errBadFolder: "無法使用此資料夾。請選擇你自己的工作資料夾：不能是整個磁碟機、使用者主資料夾，或存放登入與應用程式資料的資料夾。",
  errNotConnected: "此程式未連線。請在「設定 → AI」中登入後再試一次。",
  errNotAccepted: "請先閱讀並確認上方的說明。",
  errUnsafeTools: "程式啟動時帶有應用程式未提供的工具，因此已停止。",
  errRateLimit: "方案額度已用完。請稍後再試。",
  errSignedOut: "程式已登出。請在「設定 → AI」中登入。",
  errMetered: "程式使用的是你未允許的按用量計費登入。",
  errSandboxUnavailable: "在這台電腦上，Codex 無法開啟用來隔離指令的沙箱，因此沒有啟動。請將 Windows 更新到最新版本，或改用 Claude Code。",
  errNeedsUpdate: "程式版本過舊，無法使用代理程式模式。請更新後再試一次。",
  errNotInstalled: "未安裝此程式。",
  errGeneric: "發生問題。請再試一次。"
};
const vi$1 = {
  windowTitle: "Tác tử",
  homeCardSub: "Làm việc trong thư mục với Claude Code hoặc Codex",
  intro: "Tác tử chạy Claude Code hoặc Codex của bạn trong thư mục bạn chọn. Nó có thể đọc các tệp trong đó, tạo tệp mới, dùng các kỹ năng của bạn, chạy tập lệnh và sửa các tài liệu đang mở trong GenOffice.",
  folderLabel: "Thư mục dự án",
  folderPick: "Chọn thư mục…",
  folderNone: "Chưa chọn thư mục",
  recentLabel: "Thư mục gần đây",
  providerLabel: "Chương trình",
  providerClaude: "Claude Code",
  providerCodex: "Codex",
  providerClaudeNote: "Trên Windows, các lệnh bạn cho phép sẽ chạy không cách ly và có thể truy cập toàn bộ máy tính của bạn cùng internet.",
  providerCodexNote: "Các lệnh chạy trong không gian cách ly của Codex: chỉ có thể ghi vào thư mục dự án và không có internet.",
  providerBlocked: "Chưa dùng được: hiện chưa thể ngăn Codex đọc tệp đăng nhập của chính nó.",
  connChecking: "Đang kiểm tra kết nối…",
  connUnavailable: "Chưa kết nối. Hãy đăng nhập trong Cài đặt → AI.",
  connMetered: "Đã đăng nhập bằng tài khoản trả tiền theo mức dùng mà bạn đã chấp nhận.",
  modeLabel: "Khi nào hỏi bạn",
  modeAskCommands: "Hỏi trước mỗi lệnh",
  modeAskCommandsDesc: "Việc đọc và ghi tệp trong thư mục dự án được làm ngay. Trước khi chạy lệnh hoặc tập lệnh, tác tử sẽ hỏi.",
  modeAskWrites: "Hỏi trước khi ghi và chạy lệnh",
  modeAskWritesDesc: "Chỉ việc đọc được làm ngay. Trước khi ghi tệp và trước khi chạy lệnh, tác tử đều sẽ hỏi.",
  modeTrust: "Tin tưởng dự án này",
  modeTrustDesc: "Không hỏi gì cả. Codex vẫn chỉ ở trong không gian cách ly của nó; với Claude Code, bộ kiểm tra riêng của nó sẽ thay bạn kiểm tra từng hành động.",
  warningTitle: "Trước khi bắt đầu",
  warningCommands: "Các lệnh tác tử chạy có thể thay đổi tệp và dùng internet. Tài liệu người khác gửi cho bạn có thể chứa chỉ dẫn ẩn.",
  warningRedaction: "Những phần bạn đã ẩn khỏi AI chỉ được ẩn trong các tài liệu đang mở trong GenOffice. Các tệp tác tử đọc từ thư mục sẽ được gửi nguyên trạng.",
  warningUsage: "Tác tử làm việc qua nhiều bước nên dùng nhiều hạn mức gói đăng ký của bạn hơn bảng AI.",
  warningAccept: "Tôi đã hiểu",
  start: "Bắt đầu",
  starting: "Đang bắt đầu…",
  stop: "Dừng",
  newSession: "Phiên mới",
  send: "Gửi",
  inputPlaceholder: "Bạn muốn tác tử làm gì?",
  you: "Bạn",
  agent: "Tác tử",
  startedLine: "Đã khởi động {program} trong {folder}",
  skillsLine: "Có {n} kỹ năng để dùng",
  skillsLineOne: "Có {n} kỹ năng để dùng",
  toolRunning: "Đang làm",
  toolDone: "Xong",
  toolFailed: "Thất bại",
  toolDenied: "Đã từ chối",
  actRead: "Đọc",
  actWrite: "Ghi",
  actCommand: "Chạy",
  actAppTool: "Sửa tài liệu đang mở",
  actSkill: "Dùng kỹ năng",
  actOther: "Dùng công cụ",
  openFile: "Mở",
  permTitle: "Tác tử xin phép:",
  permCommand: "Chạy lệnh này",
  permWrite: "Ghi tệp này",
  permRead: "Đọc một tệp bên ngoài thư mục dự án",
  permOther: "Dùng công cụ “{tool}”",
  permReason: "Lý do: {reason}",
  permAllow: "Cho phép",
  permDeny: "Từ chối",
  turnFailed: "Tác tử không thể hoàn thành yêu cầu này.",
  ended: "Phiên đã kết thúc.",
  errBadFolder: "Không thể dùng thư mục này. Hãy chọn thư mục công việc của riêng bạn: không phải cả ổ đĩa, không phải thư mục người dùng và không phải thư mục chứa dữ liệu đăng nhập hay dữ liệu ứng dụng.",
  errNotConnected: "Chương trình này chưa được kết nối. Hãy đăng nhập trong Cài đặt → AI rồi thử lại.",
  errNotAccepted: "Hãy đọc các lưu ý ở trên và xác nhận trước.",
  errUnsafeTools: "Chương trình khởi động cùng các công cụ mà ứng dụng không cấp, nên đã bị dừng.",
  errRateLimit: "Bạn đã dùng hết hạn mức gói đăng ký. Hãy thử lại sau.",
  errSignedOut: "Chương trình đã đăng xuất. Hãy đăng nhập trong Cài đặt → AI.",
  errMetered: "Chương trình đang đăng nhập bằng tài khoản trả tiền theo mức dùng mà bạn chưa chấp nhận.",
  errSandboxUnavailable: "Codex không thể mở hộp cát dùng để cô lập các lệnh của nó trên máy tính này nên đã không khởi động. Hãy cập nhật Windows hoặc chọn Claude Code.",
  errNeedsUpdate: "Chương trình quá cũ để dùng chế độ tác tử. Hãy cập nhật rồi thử lại.",
  errNotInstalled: "Chương trình chưa được cài đặt.",
  errGeneric: "Đã xảy ra lỗi. Hãy thử lại."
};
const agentStrings = defineStrings({
  zh: zh$1,
  en: en$1,
  ja: ja$1,
  ko: ko$1,
  fr: fr$1,
  de: de$1,
  es: es$1,
  th: th$1,
  id: id$1,
  ru: ru$1,
  ar: ar$1,
  pt: pt$1,
  it: it$1,
  pl: pl$1,
  cs: cs$1,
  nl: nl$1,
  ms: ms$1,
  he: he$1,
  hi: hi$1,
  "zh-TW": zhTW$1,
  vi: vi$1
});
const translate$1 = createI18n(agentStrings);
function agentText(lang, key, params) {
  return translate$1(lang, key, params);
}
const zh = {
  navLabel: "技能",
  intro: "技能是交给 AI 的工作说明。已开启的技能可在 AI 窗口中用 / 或 $ 调用，AI 也会在需要时自行使用。",
  helpLink: "查看帮助",
  searchLabel: "查找技能",
  searchPlaceholder: "按标题、名称、说明查找",
  add: "添加",
  addFolder: "从文件夹",
  addZip: "从 zip 文件",
  addGitHub: "从 GitHub 链接",
  create: "新建",
  loading: "正在加载…",
  empty: "还没有技能。请用上方的“添加”或“新建”开始。",
  noMatch: "没有与“{query}”匹配的技能。",
  sourceBuiltin: "内置",
  sourceApp: "我的技能",
  sourceAppGitHub: "我的技能 · GitHub",
  sourceUser: "Claude 技能文件夹",
  sourcePluginGroup: "Claude 插件",
  sourcePlugin: "Claude 插件 · {plugin}",
  sourceCodex: "Codex 技能文件夹",
  switchLabel: "开启 {title}",
  invokeLabel: "{title}：使用时机",
  invokeAuto: "自动使用",
  invokeManual: "仅调用时",
  badgeTemplate: "含模板",
  badgeScripts: "含脚本 · 在智能体窗口中完整运行",
  badgeAgentOnly: "仅限智能体窗口",
  unreadableNoFrontmatter: "缺少前置信息",
  unreadableBadName: "名称不符合规则",
  unreadableTooLarge: "过大",
  unreadableUnreadable: "无法读取",
  unreadableNote: "无法使用：{reason}",
  moreLabel: "{title} 的更多操作",
  actView: "查看内容",
  actEdit: "直接修改",
  actCopy: "复制到我的技能",
  actExport: "导出（zip）",
  actCheckUpdate: "检查更新",
  actOpenFolder: "打开文件夹",
  actRemove: "移到回收站",
  actHide: "隐藏",
  hiddenFooter: "已隐藏的内置技能 {n} 个",
  unhide: "重新显示",
  confirmRemove: "要把技能“{title}”移到回收站吗？可以从回收站恢复。",
  confirmHide: "要隐藏内置技能“{title}”吗？隐藏后会关闭，可在列表底部重新显示。",
  cancel: "取消",
  close: "关闭",
  copied: "已创建副本，并关闭了原技能",
  confirmOverwrite: "我的技能中已有同名技能（{name}）。要覆盖吗？",
  overwrite: "覆盖",
  exportNotice: "模板文档会一并打包。请确认文档中没有个人信息",
  exportContinue: "继续",
  exported: "已导出：{path}",
  upToDate: "已是最新",
  checking: "正在检查…",
  updateTitle: "更新 {title}",
  updateIntro: "GitHub 上的内容有变化。",
  updateFiles: "有变化的文件",
  changeAdded: "新增",
  changeRemoved: "删除",
  changeModified: "修改",
  updateLocalEdits: "你所做的修改将会丢失",
  updateApply: "更新",
  updated: "已更新",
  editorNew: "新技能",
  editorEdit: "修改技能",
  editorView: "技能内容",
  fieldTitle: "标题",
  fieldDescription: "说明",
  fieldDescriptionHint: "AI 会根据这段说明决定是否使用该技能",
  fieldBody: "正文",
  advanced: "高级",
  fieldName: "名称",
  nameHint: "小写英文字母、数字和连字符（-），最多 64 个字符",
  nameAuto: "根据标题生成的名称：{name}",
  files: "附带文件",
  filesNone: "没有附带文件",
  filesHint: "附带文件请打开文件夹修改",
  save: "保存",
  saved: "已保存",
  createHint: "也可以在 AI 窗口中说“帮我做一个这样的技能”来创建",
  nameEmpty: "请输入名称",
  nameTooLong: "名称最多 64 个字符",
  nameCharacters: "只能使用小写英文字母、数字和连字符（-）",
  nameHyphenEdge: "名称不能以连字符开头或结尾",
  nameDoubleHyphen: "不能连续使用两个连字符",
  nameReserved: "此名称不可使用",
  nameTaken: "我的技能中已有同名技能",
  githubTitle: "从 GitHub 链接添加",
  githubLabel: "GitHub 地址",
  githubPlaceholder: "https://github.com/所有者/仓库",
  githubHint: "仅支持公开仓库。请填写仓库、文件夹或 SKILL.md 的地址，或“所有者/仓库”。",
  githubFind: "查找",
  githubFetching: "正在从 GitHub 下载…",
  importReading: "正在读取技能…",
  previewTitle: "要安装的技能",
  previewFromFolder: "在文件夹中找到 {n} 个技能",
  previewFromZip: "在 zip 文件中找到 {n} 个技能",
  previewFromGitHub: "在 {repo}（{ref}）中找到 {n} 个技能",
  previewSize: "{n} 个文件 · {size}",
  previewScripts: "含脚本",
  previewUrls: "网址 {n} 个",
  previewLicense: "许可证文件：{name}",
  previewRootLicense: "仓库许可证文件：{name}",
  previewWarning: "只安装来自可信来源的技能。技能会向 AI 下达指令，在智能体窗口中还可以运行脚本。",
  previewInstallLabel: "安装 {title}",
  collision: "我的技能中有同名技能：",
  collisionReplace: "替换",
  collisionSkip: "跳过",
  problemDuplicate: "此处还有同名技能，无法安装",
  problemCannot: "无法安装：{reason}",
  install: "安装",
  installed: "已安装 {n} 个技能",
  chooseCollision: "请为每个重名的技能选择替换或跳过",
  failNoSkills: "没有找到技能",
  failRepoNotFound: "找不到该仓库，或仓库未公开",
  failRateLimited: "GitHub 暂时限制了请求，请稍后再试",
  failNetwork: "无法连接",
  failTooLarge: "过大",
  failUnsafe: "未通过安全检查，没有安装任何内容",
  failBadAddress: "这不是 GitHub 地址",
  failBusy: "另一个导入或更新检查仍在进行",
  failNotFound: "找不到该技能",
  failNotAllowed: "无法在此窗口中执行",
  failNotInstallable: "此技能无法安装",
  failNotGitHub: "此技能不是从 GitHub 安装的",
  failTrash: "无法将旧技能移到回收站，因此保留原样，没有替换任何内容",
  failHidden: "隐藏的内置技能需要先重新显示才能开启",
  failEmptyTitle: "请输入标题",
  failEmptyDescription: "请输入说明",
  failEmptyBody: "请输入正文",
  failBadName: "名称不符合规则",
  failGeneric: "操作未完成，请重试"
};
const en = {
  navLabel: "Skills",
  intro: "A skill is a set of work instructions for the AI. Call a skill you have turned on with / or $ in the AI panel, or let the AI use it on its own when it needs it.",
  helpLink: "Open help",
  searchLabel: "Find skills",
  searchPlaceholder: "Search by title, name or description",
  add: "Add",
  addFolder: "From a folder",
  addZip: "From a zip file",
  addGitHub: "From a GitHub link",
  create: "New skill",
  loading: "Loading…",
  empty: "No skills yet. Start with Add or New skill above.",
  noMatch: 'No skills match "{query}".',
  sourceBuiltin: "Built-in",
  sourceApp: "My skills",
  sourceAppGitHub: "My skills · GitHub",
  sourceUser: "Claude skills folder",
  sourcePluginGroup: "Claude plugins",
  sourcePlugin: "Claude plugin · {plugin}",
  sourceCodex: "Codex skills folder",
  switchLabel: "Turn on {title}",
  invokeLabel: "{title}: when it is used",
  invokeAuto: "AI decides",
  invokeManual: "Only when called",
  badgeTemplate: "Has a template",
  badgeScripts: "Has scripts · works fully in the agent window",
  badgeAgentOnly: "Agent window only",
  unreadableNoFrontmatter: "no front matter",
  unreadableBadName: "name does not fit the rules",
  unreadableTooLarge: "too large",
  unreadableUnreadable: "cannot be read",
  unreadableNote: "Cannot be used: {reason}",
  moreLabel: "More for {title}",
  actView: "View contents",
  actEdit: "Edit",
  actCopy: "Copy to my skills",
  actExport: "Export (zip)",
  actCheckUpdate: "Check for updates",
  actOpenFolder: "Open folder",
  actRemove: "Move to trash",
  actHide: "Hide",
  hiddenFooter: "{n} hidden built-in skills",
  unhide: "Show again",
  confirmRemove: 'Move the skill "{title}" to the trash? You can restore it from there.',
  confirmHide: 'Hide the built-in skill "{title}"? A hidden skill is turned off; you can show it again at the bottom of the list.',
  cancel: "Cancel",
  close: "Close",
  copied: "Made a copy and turned the original skill off",
  confirmOverwrite: "My skills already has a skill named {name}. Replace it?",
  overwrite: "Replace",
  exportNotice: "The template document goes into the file too. Check that it holds no personal information",
  exportContinue: "Continue",
  exported: "Exported: {path}",
  upToDate: "Up to date",
  checking: "Checking…",
  updateTitle: "Update {title}",
  updateIntro: "The skill has changed on GitHub.",
  updateFiles: "Changed files",
  changeAdded: "added",
  changeRemoved: "removed",
  changeModified: "changed",
  updateLocalEdits: "Your own edits will be lost",
  updateApply: "Update",
  updated: "Updated",
  editorNew: "New skill",
  editorEdit: "Edit skill",
  editorView: "Skill contents",
  fieldTitle: "Title",
  fieldDescription: "Description",
  fieldDescriptionHint: "The AI reads this to decide when to use the skill",
  fieldBody: "Instructions",
  advanced: "Advanced",
  fieldName: "Name",
  nameHint: "Lowercase letters, digits and hyphens (-), up to 64 characters",
  nameAuto: "Name from the title: {name}",
  files: "Files in the skill",
  filesNone: "No other files",
  filesHint: "Open the folder to change these files",
  save: "Save",
  saved: "Saved",
  createHint: 'You can also ask in the AI panel: "make me a skill that…"',
  nameEmpty: "Enter a name",
  nameTooLong: "Names can be up to 64 characters",
  nameCharacters: "Only lowercase letters, digits and hyphens (-)",
  nameHyphenEdge: "A name cannot start or end with a hyphen",
  nameDoubleHyphen: "A name cannot have two hyphens in a row",
  nameReserved: "This name cannot be used",
  nameTaken: "My skills already has a skill with this name",
  githubTitle: "Add from a GitHub link",
  githubLabel: "GitHub address",
  githubPlaceholder: "https://github.com/owner/repo",
  githubHint: 'Public repositories only. Paste a repository, folder or SKILL.md address, or "owner/repo".',
  githubFind: "Find",
  githubFetching: "Downloading from GitHub…",
  importReading: "Reading the skills…",
  previewTitle: "Skills to install",
  previewFromFolder: "{n} skills found in the folder",
  previewFromZip: "{n} skills found in the zip file",
  previewFromGitHub: "{n} skills found in {repo} ({ref})",
  previewSize: "{n} files · {size}",
  previewScripts: "Has scripts",
  previewUrls: "{n} web addresses",
  previewLicense: "License file: {name}",
  previewRootLicense: "Repository license file: {name}",
  previewWarning: "Install skills only from sources you trust. A skill gives the AI instructions, and in the agent window it can run scripts.",
  previewInstallLabel: "Install {title}",
  collision: "My skills has a skill with the same name:",
  collisionReplace: "Replace",
  collisionSkip: "Skip",
  problemDuplicate: "Cannot be installed: another skill here has the same name",
  problemCannot: "Cannot be installed: {reason}",
  install: "Install",
  installed: "Installed {n} skills",
  chooseCollision: "Choose Replace or Skip for each skill whose name is taken",
  failNoSkills: "No skills found",
  failRepoNotFound: "The repository was not found or is not public",
  failRateLimited: "GitHub is holding requests back for a moment. Try again shortly",
  failNetwork: "Could not connect",
  failTooLarge: "Too large",
  failUnsafe: "It failed the safety check. Nothing was installed",
  failBadAddress: "That is not a GitHub address",
  failBusy: "Another import or update check is still running",
  failNotFound: "The skill was not found",
  failNotAllowed: "This cannot be done from this window",
  failNotInstallable: "This skill cannot be installed",
  failNotGitHub: "This skill was not installed from GitHub",
  failTrash: "The old skill could not be moved to the trash, so it was kept and nothing was replaced",
  failHidden: "Show a hidden built-in skill again before turning it on",
  failEmptyTitle: "Enter a title",
  failEmptyDescription: "Enter a description",
  failEmptyBody: "Enter the instructions",
  failBadName: "The name does not fit the rules",
  failGeneric: "That did not work. Try again"
};
const ja = {
  navLabel: "スキル",
  intro: "スキルは AI に渡す作業手順書です。オンにしたスキルは AI パネルで / または $ で呼び出せるほか、必要なときに AI が自分で使います。",
  helpLink: "ヘルプを開く",
  searchLabel: "スキルを検索",
  searchPlaceholder: "タイトル・名前・説明で検索",
  add: "追加",
  addFolder: "フォルダーから",
  addZip: "zip ファイルから",
  addGitHub: "GitHub リンクから",
  create: "新規作成",
  loading: "読み込み中…",
  empty: "スキルはまだありません。上の「追加」または「新規作成」から始めてください。",
  noMatch: "「{query}」に一致するスキルはありません。",
  sourceBuiltin: "標準",
  sourceApp: "マイスキル",
  sourceAppGitHub: "マイスキル · GitHub",
  sourceUser: "Claude スキルフォルダー",
  sourcePluginGroup: "Claude プラグイン",
  sourcePlugin: "Claude プラグイン · {plugin}",
  sourceCodex: "Codex スキルフォルダー",
  switchLabel: "{title} をオンにする",
  invokeLabel: "{title}: 使うタイミング",
  invokeAuto: "AI に任せる",
  invokeManual: "呼び出したときだけ",
  badgeTemplate: "テンプレートあり",
  badgeScripts: "スクリプトあり · エージェントウィンドウで完全に動作",
  badgeAgentOnly: "エージェントウィンドウ専用",
  unreadableNoFrontmatter: "フロントマターがない",
  unreadableBadName: "名前がルールに合わない",
  unreadableTooLarge: "大きすぎる",
  unreadableUnreadable: "読み込めない",
  unreadableNote: "使用できません: {reason}",
  moreLabel: "{title} のその他の操作",
  actView: "内容を見る",
  actEdit: "編集",
  actCopy: "マイスキルにコピー",
  actExport: "エクスポート (zip)",
  actCheckUpdate: "更新を確認",
  actOpenFolder: "フォルダーを開く",
  actRemove: "ごみ箱に移動",
  actHide: "非表示にする",
  hiddenFooter: "非表示の標準スキル {n} 件",
  unhide: "再表示",
  confirmRemove: "スキル「{title}」をごみ箱に移動しますか？ごみ箱から元に戻せます。",
  confirmHide: "標準スキル「{title}」を非表示にしますか？非表示のスキルはオフになり、一覧のいちばん下から再表示できます。",
  cancel: "キャンセル",
  close: "閉じる",
  copied: "コピーを作成し、元のスキルをオフにしました",
  confirmOverwrite: "マイスキルに同じ名前 ({name}) のスキルがすでにあります。置き換えますか？",
  overwrite: "置き換える",
  exportNotice: "テンプレート文書もファイルに含まれます。個人情報が入っていないか確認してください",
  exportContinue: "続ける",
  exported: "エクスポートしました: {path}",
  upToDate: "最新です",
  checking: "確認中…",
  updateTitle: "{title} を更新",
  updateIntro: "GitHub 上でスキルが変更されています。",
  updateFiles: "変更されたファイル",
  changeAdded: "追加",
  changeRemoved: "削除",
  changeModified: "変更",
  updateLocalEdits: "自分で加えた編集は失われます",
  updateApply: "更新",
  updated: "更新しました",
  editorNew: "新しいスキル",
  editorEdit: "スキルを編集",
  editorView: "スキルの内容",
  fieldTitle: "タイトル",
  fieldDescription: "説明",
  fieldDescriptionHint: "AI はこの説明を読んで、スキルを使うかどうかを判断します",
  fieldBody: "本文",
  advanced: "詳細設定",
  fieldName: "名前",
  nameHint: "英小文字・数字・ハイフン (-) で 64 文字まで",
  nameAuto: "タイトルから決めた名前: {name}",
  files: "スキル内のファイル",
  filesNone: "ほかのファイルはありません",
  filesHint: "これらのファイルを変更するには、フォルダーを開いてください",
  save: "保存",
  saved: "保存しました",
  createHint: "AI パネルで「こんなスキルを作って」と頼んで作ることもできます",
  nameEmpty: "名前を入力してください",
  nameTooLong: "名前は 64 文字までです",
  nameCharacters: "使えるのは英小文字・数字・ハイフン (-) だけです",
  nameHyphenEdge: "名前の先頭や末尾にハイフンは使えません",
  nameDoubleHyphen: "ハイフンを 2 つ続けて使うことはできません",
  nameReserved: "この名前は使えません",
  nameTaken: "マイスキルに同じ名前のスキルがすでにあります",
  githubTitle: "GitHub リンクから追加",
  githubLabel: "GitHub のアドレス",
  githubPlaceholder: "https://github.com/所有者/リポジトリ",
  githubHint: "公開リポジトリのみ対応しています。リポジトリ、フォルダー、SKILL.md のアドレス、または「所有者/リポジトリ」を貼り付けてください。",
  githubFind: "検索",
  githubFetching: "GitHub からダウンロード中…",
  importReading: "スキルを読み込み中…",
  previewTitle: "インストールするスキル",
  previewFromFolder: "フォルダー内に {n} 件のスキルが見つかりました",
  previewFromZip: "zip ファイル内に {n} 件のスキルが見つかりました",
  previewFromGitHub: "{repo} ({ref}) に {n} 件のスキルが見つかりました",
  previewSize: "{n} ファイル · {size}",
  previewScripts: "スクリプトあり",
  previewUrls: "Web アドレス {n} 件",
  previewLicense: "ライセンスファイル: {name}",
  previewRootLicense: "リポジトリのライセンスファイル: {name}",
  previewWarning: "信頼できる提供元のスキルだけをインストールしてください。スキルは AI に指示を与え、エージェントウィンドウではスクリプトを実行できます。",
  previewInstallLabel: "{title} をインストール",
  collision: "マイスキルに同じ名前のスキルがあります:",
  collisionReplace: "置き換える",
  collisionSkip: "スキップ",
  problemDuplicate: "インストールできません: 同じ名前のスキルがほかにもあります",
  problemCannot: "インストールできません: {reason}",
  install: "インストール",
  installed: "{n} 件のスキルをインストールしました",
  chooseCollision: "名前が重複するスキルごとに「置き換える」か「スキップ」を選んでください",
  failNoSkills: "スキルが見つかりませんでした",
  failRepoNotFound: "リポジトリが見つからないか、公開されていません",
  failRateLimited: "GitHub が一時的にリクエストを制限しています。しばらくしてからもう一度お試しください",
  failNetwork: "接続できませんでした",
  failTooLarge: "大きすぎます",
  failUnsafe: "安全チェックを通過しませんでした。何もインストールしていません",
  failBadAddress: "GitHub のアドレスではありません",
  failBusy: "ほかの取り込みまたは更新の確認がまだ実行中です",
  failNotFound: "スキルが見つかりません",
  failNotAllowed: "このウィンドウではこの操作はできません",
  failNotInstallable: "このスキルはインストールできません",
  failNotGitHub: "このスキルは GitHub からインストールしたものではありません",
  failTrash: "古いスキルをごみ箱に移動できなかったため、そのまま残し、何も置き換えていません",
  failHidden: "非表示の標準スキルは、再表示してからオンにしてください",
  failEmptyTitle: "タイトルを入力してください",
  failEmptyDescription: "説明を入力してください",
  failEmptyBody: "本文を入力してください",
  failBadName: "名前がルールに合っていません",
  failGeneric: "うまくいきませんでした。もう一度お試しください"
};
const ko = {
  navLabel: "스킬",
  intro: "스킬은 AI에게 주는 작업 설명서입니다. 켜 둔 스킬은 AI 창에서 / 또는 $로 부르거나, AI가 필요할 때 스스로 씁니다.",
  helpLink: "도움말 보기",
  searchLabel: "스킬 찾기",
  searchPlaceholder: "제목, 이름, 설명으로 찾기",
  add: "추가",
  addFolder: "폴더에서",
  addZip: "zip 파일에서",
  addGitHub: "깃허브 링크로",
  create: "새로 만들기",
  loading: "불러오는 중…",
  empty: "아직 스킬이 없습니다. 위의 추가나 새로 만들기로 시작하세요.",
  noMatch: '"{query}"에 맞는 스킬이 없습니다.',
  sourceBuiltin: "기본",
  sourceApp: "내 스킬",
  sourceAppGitHub: "내 스킬 · 깃허브",
  sourceUser: "Claude 스킬 폴더",
  sourcePluginGroup: "Claude 플러그인",
  sourcePlugin: "Claude 플러그인 · {plugin}",
  sourceCodex: "Codex 스킬 폴더",
  switchLabel: "{title} 켜기",
  invokeLabel: "{title}: 쓰는 때",
  invokeAuto: "스스로 쓰기",
  invokeManual: "부를 때만",
  badgeTemplate: "양식 포함",
  badgeScripts: "스크립트 포함 · 에이전트 창에서 완전히 동작",
  badgeAgentOnly: "에이전트 창 전용",
  unreadableNoFrontmatter: "앞머리 없음",
  unreadableBadName: "이름이 맞지 않음",
  unreadableTooLarge: "너무 큼",
  unreadableUnreadable: "읽을 수 없음",
  unreadableNote: "쓸 수 없습니다: {reason}",
  moreLabel: "{title} 더보기",
  actView: "내용 보기",
  actEdit: "직접 고치기",
  actCopy: "내 스킬로 사본 만들기",
  actExport: "내보내기(zip)",
  actCheckUpdate: "업데이트 확인",
  actOpenFolder: "폴더 열기",
  actRemove: "휴지통으로",
  actHide: "숨기기",
  hiddenFooter: "숨긴 기본 스킬 {n}개",
  unhide: "다시 보이기",
  confirmRemove: '"{title}" 스킬을 휴지통으로 옮길까요? 휴지통에서 되살릴 수 있습니다.',
  confirmHide: '"{title}" 기본 스킬을 숨길까요? 숨긴 스킬은 꺼지고, 목록 맨 아래에서 다시 보이게 할 수 있습니다.',
  cancel: "취소",
  close: "닫기",
  copied: "사본을 만들고 원래 스킬은 껐습니다",
  confirmOverwrite: "내 스킬에 같은 이름({name})의 스킬이 이미 있습니다. 덮어쓸까요?",
  overwrite: "덮어쓰기",
  exportNotice: "양식 문서가 함께 들어갑니다. 문서에 개인정보가 없는지 확인하세요",
  exportContinue: "계속",
  exported: "내보냈습니다: {path}",
  upToDate: "최신입니다",
  checking: "확인하는 중…",
  updateTitle: "{title} 업데이트",
  updateIntro: "깃허브에 바뀐 내용이 있습니다.",
  updateFiles: "바뀐 파일",
  changeAdded: "추가",
  changeRemoved: "삭제",
  changeModified: "바뀜",
  updateLocalEdits: "고친 내용이 사라집니다",
  updateApply: "업데이트",
  updated: "업데이트했습니다",
  editorNew: "새 스킬",
  editorEdit: "스킬 고치기",
  editorView: "스킬 내용",
  fieldTitle: "제목",
  fieldDescription: "설명",
  fieldDescriptionHint: "AI는 이 설명을 보고 스킬을 쓸지 정합니다",
  fieldBody: "본문",
  advanced: "고급",
  fieldName: "이름",
  nameHint: "영문 소문자, 숫자, 하이픈(-)으로 64자까지",
  nameAuto: "제목으로 정한 이름: {name}",
  files: "딸린 파일",
  filesNone: "딸린 파일이 없습니다",
  filesHint: "딸린 파일은 폴더를 열어 고칩니다",
  save: "저장",
  saved: "저장했습니다",
  createHint: 'AI 창에서 "이런 스킬 만들어 줘"라고 말해도 만들 수 있습니다',
  nameEmpty: "이름을 적으세요",
  nameTooLong: "이름은 64자까지입니다",
  nameCharacters: "영문 소문자, 숫자, 하이픈(-)만 쓸 수 있습니다",
  nameHyphenEdge: "하이픈으로 시작하거나 끝날 수 없습니다",
  nameDoubleHyphen: "하이픈을 두 번 잇달아 쓸 수 없습니다",
  nameReserved: "쓸 수 없는 이름입니다",
  nameTaken: "같은 이름의 내 스킬이 이미 있습니다",
  githubTitle: "깃허브 링크로 추가",
  githubLabel: "깃허브 주소",
  githubPlaceholder: "https://github.com/소유자/저장소",
  githubHint: '공개 저장소만 받습니다. 저장소, 폴더, SKILL.md 주소나 "소유자/저장소"를 넣으세요.',
  githubFind: "찾기",
  githubFetching: "깃허브에서 받는 중…",
  importReading: "스킬을 읽는 중…",
  previewTitle: "설치할 스킬",
  previewFromFolder: "폴더에서 찾은 스킬 {n}개",
  previewFromZip: "zip 파일에서 찾은 스킬 {n}개",
  previewFromGitHub: "{repo} ({ref})에서 찾은 스킬 {n}개",
  previewSize: "파일 {n}개 · {size}",
  previewScripts: "스크립트 포함",
  previewUrls: "웹 주소 {n}개",
  previewLicense: "라이선스 파일: {name}",
  previewRootLicense: "저장소 라이선스 파일: {name}",
  previewWarning: "믿을 수 있는 곳에서 받은 스킬만 설치하세요. 스킬은 AI에게 지시를 주고, 에이전트 창에서는 스크립트를 실행할 수 있습니다.",
  previewInstallLabel: "{title} 설치",
  collision: "같은 이름의 내 스킬이 있습니다:",
  collisionReplace: "바꾸기",
  collisionSkip: "건너뛰기",
  problemDuplicate: "같은 이름이 또 있어 설치할 수 없습니다",
  problemCannot: "설치할 수 없습니다: {reason}",
  install: "설치",
  installed: "스킬 {n}개를 설치했습니다",
  chooseCollision: "이름이 겹치는 스킬마다 바꾸기나 건너뛰기를 고르세요",
  failNoSkills: "스킬을 찾지 못했습니다",
  failRepoNotFound: "저장소를 찾을 수 없거나 공개되지 않았습니다",
  failRateLimited: "깃허브가 잠시 요청을 막았습니다. 잠시 뒤 다시 해 보세요",
  failNetwork: "연결하지 못했습니다",
  failTooLarge: "너무 큽니다",
  failUnsafe: "안전 검사에 걸렸습니다. 아무것도 설치하지 않았습니다",
  failBadAddress: "깃허브 주소 모양이 아닙니다",
  failBusy: "다른 가져오기나 업데이트 확인이 아직 진행 중입니다",
  failNotFound: "스킬을 찾을 수 없습니다",
  failNotAllowed: "이 창에서는 할 수 없습니다",
  failNotInstallable: "설치할 수 없는 스킬입니다",
  failNotGitHub: "깃허브에서 설치한 스킬이 아닙니다",
  failTrash: "이전 스킬을 휴지통으로 옮기지 못해 그대로 두었고, 아무것도 바꾸지 않았습니다",
  failHidden: "숨긴 기본 스킬은 다시 보이게 한 뒤 켤 수 있습니다",
  failEmptyTitle: "제목을 적으세요",
  failEmptyDescription: "설명을 적으세요",
  failEmptyBody: "본문을 적으세요",
  failBadName: "이름이 규칙에 맞지 않습니다",
  failGeneric: "하지 못했습니다. 다시 해 보세요"
};
const fr = {
  navLabel: "Compétences",
  intro: "Une compétence est un ensemble d’instructions de travail pour l’IA. Appelez une compétence activée avec / ou $ dans le panneau IA, ou laissez l’IA l’utiliser d’elle-même quand elle en a besoin.",
  helpLink: "Ouvrir l’aide",
  searchLabel: "Rechercher des compétences",
  searchPlaceholder: "Rechercher par titre, nom ou description",
  add: "Ajouter",
  addFolder: "Depuis un dossier",
  addZip: "Depuis un fichier zip",
  addGitHub: "Depuis un lien GitHub",
  create: "Nouvelle compétence",
  loading: "Chargement…",
  empty: "Aucune compétence pour l’instant. Commencez avec Ajouter ou Nouvelle compétence ci-dessus.",
  noMatch: "Aucune compétence ne correspond à « {query} ».",
  sourceBuiltin: "Intégrées",
  sourceApp: "Mes compétences",
  sourceAppGitHub: "Mes compétences · GitHub",
  sourceUser: "Dossier des compétences Claude",
  sourcePluginGroup: "Plugins Claude",
  sourcePlugin: "Plugin Claude · {plugin}",
  sourceCodex: "Dossier des compétences Codex",
  switchLabel: "Activer {title}",
  invokeLabel: "{title} : quand l’utiliser",
  invokeAuto: "L’IA décide",
  invokeManual: "Seulement sur appel",
  badgeTemplate: "Contient un modèle",
  badgeScripts: "Contient des scripts · fonctionne pleinement dans la fenêtre de l’agent",
  badgeAgentOnly: "Fenêtre de l’agent uniquement",
  unreadableNoFrontmatter: "pas d’en-tête",
  unreadableBadName: "le nom ne respecte pas les règles",
  unreadableTooLarge: "trop volumineuse",
  unreadableUnreadable: "illisible",
  unreadableNote: "Inutilisable : {reason}",
  moreLabel: "Plus d’options pour {title}",
  actView: "Voir le contenu",
  actEdit: "Modifier",
  actCopy: "Copier dans mes compétences",
  actExport: "Exporter (zip)",
  actCheckUpdate: "Rechercher des mises à jour",
  actOpenFolder: "Ouvrir le dossier",
  actRemove: "Mettre à la corbeille",
  actHide: "Masquer",
  hiddenFooter: "{n} compétences intégrées masquées",
  unhide: "Afficher à nouveau",
  confirmRemove: "Mettre la compétence « {title} » à la corbeille ? Vous pourrez la restaurer depuis la corbeille.",
  confirmHide: "Masquer la compétence intégrée « {title} » ? Une compétence masquée est désactivée ; vous pouvez l’afficher à nouveau en bas de la liste.",
  cancel: "Annuler",
  close: "Fermer",
  copied: "Copie créée, la compétence d’origine a été désactivée",
  confirmOverwrite: "Mes compétences contient déjà une compétence nommée {name}. La remplacer ?",
  overwrite: "Remplacer",
  exportNotice: "Le document modèle est aussi inclus dans le fichier. Vérifiez qu’il ne contient aucune information personnelle",
  exportContinue: "Continuer",
  exported: "Exportée : {path}",
  upToDate: "À jour",
  checking: "Vérification…",
  updateTitle: "Mettre à jour {title}",
  updateIntro: "La compétence a été modifiée sur GitHub.",
  updateFiles: "Fichiers modifiés",
  changeAdded: "ajouté",
  changeRemoved: "supprimé",
  changeModified: "modifié",
  updateLocalEdits: "Vos propres modifications seront perdues",
  updateApply: "Mettre à jour",
  updated: "Mise à jour effectuée",
  editorNew: "Nouvelle compétence",
  editorEdit: "Modifier la compétence",
  editorView: "Contenu de la compétence",
  fieldTitle: "Titre",
  fieldDescription: "Description",
  fieldDescriptionHint: "L’IA lit ce texte pour décider quand utiliser la compétence",
  fieldBody: "Instructions",
  advanced: "Avancé",
  fieldName: "Nom",
  nameHint: "Lettres minuscules, chiffres et traits d’union (-), 64 caractères maximum",
  nameAuto: "Nom tiré du titre : {name}",
  files: "Fichiers de la compétence",
  filesNone: "Aucun autre fichier",
  filesHint: "Ouvrez le dossier pour modifier ces fichiers",
  save: "Enregistrer",
  saved: "Enregistrée",
  createHint: "Vous pouvez aussi demander dans le panneau IA : « crée-moi une compétence qui… »",
  nameEmpty: "Saisissez un nom",
  nameTooLong: "Le nom ne peut pas dépasser 64 caractères",
  nameCharacters: "Uniquement des lettres minuscules, des chiffres et des traits d’union (-)",
  nameHyphenEdge: "Le nom ne peut pas commencer ni finir par un trait d’union",
  nameDoubleHyphen: "Le nom ne peut pas contenir deux traits d’union à la suite",
  nameReserved: "Ce nom ne peut pas être utilisé",
  nameTaken: "Mes compétences contient déjà une compétence portant ce nom",
  githubTitle: "Ajouter depuis un lien GitHub",
  githubLabel: "Adresse GitHub",
  githubPlaceholder: "https://github.com/propriétaire/dépôt",
  githubHint: "Dépôts publics uniquement. Collez l’adresse d’un dépôt, d’un dossier ou d’un SKILL.md, ou « propriétaire/dépôt ».",
  githubFind: "Rechercher",
  githubFetching: "Téléchargement depuis GitHub…",
  importReading: "Lecture des compétences…",
  previewTitle: "Compétences à installer",
  previewFromFolder: "{n} compétences trouvées dans le dossier",
  previewFromZip: "{n} compétences trouvées dans le fichier zip",
  previewFromGitHub: "{n} compétences trouvées dans {repo} ({ref})",
  previewSize: "{n} fichiers · {size}",
  previewScripts: "Contient des scripts",
  previewUrls: "{n} adresses web",
  previewLicense: "Fichier de licence : {name}",
  previewRootLicense: "Fichier de licence du dépôt : {name}",
  previewWarning: "N’installez que des compétences provenant de sources de confiance. Une compétence donne des instructions à l’IA et, dans la fenêtre de l’agent, elle peut exécuter des scripts.",
  previewInstallLabel: "Installer {title}",
  collision: "Mes compétences contient une compétence du même nom :",
  collisionReplace: "Remplacer",
  collisionSkip: "Ignorer",
  problemDuplicate: "Installation impossible : une autre compétence ici porte le même nom",
  problemCannot: "Installation impossible : {reason}",
  install: "Installer",
  installed: "{n} compétences installées",
  chooseCollision: "Choisissez Remplacer ou Ignorer pour chaque compétence dont le nom est déjà pris",
  failNoSkills: "Aucune compétence trouvée",
  failRepoNotFound: "Le dépôt est introuvable ou n’est pas public",
  failRateLimited: "GitHub limite les requêtes pour le moment. Réessayez dans un instant",
  failNetwork: "Connexion impossible",
  failTooLarge: "Trop volumineux",
  failUnsafe: "Le contrôle de sécurité a échoué. Rien n’a été installé",
  failBadAddress: "Ce n’est pas une adresse GitHub",
  failBusy: "Une autre importation ou vérification des mises à jour est encore en cours",
  failNotFound: "Compétence introuvable",
  failNotAllowed: "Impossible depuis cette fenêtre",
  failNotInstallable: "Cette compétence ne peut pas être installée",
  failNotGitHub: "Cette compétence n’a pas été installée depuis GitHub",
  failTrash: "L’ancienne compétence n’a pas pu être mise à la corbeille : elle a été conservée et rien n’a été remplacé",
  failHidden: "Affichez à nouveau la compétence intégrée masquée avant de l’activer",
  failEmptyTitle: "Saisissez un titre",
  failEmptyDescription: "Saisissez une description",
  failEmptyBody: "Saisissez les instructions",
  failBadName: "Le nom ne respecte pas les règles",
  failGeneric: "Cela n’a pas fonctionné. Réessayez"
};
const de = {
  navLabel: "Skills",
  intro: "Ein Skill ist eine Arbeitsanleitung für die KI. Rufen Sie einen eingeschalteten Skill im KI-Bereich mit / oder $ auf, oder lassen Sie die KI ihn selbst nutzen, wenn sie ihn braucht.",
  helpLink: "Hilfe öffnen",
  searchLabel: "Skills suchen",
  searchPlaceholder: "Nach Titel, Name oder Beschreibung suchen",
  add: "Hinzufügen",
  addFolder: "Aus einem Ordner",
  addZip: "Aus einer zip-Datei",
  addGitHub: "Über einen GitHub-Link",
  create: "Neuer Skill",
  loading: "Wird geladen…",
  empty: "Noch keine Skills. Beginnen Sie oben mit Hinzufügen oder Neuer Skill.",
  noMatch: "Keine Skills passen zu „{query}“.",
  sourceBuiltin: "Integriert",
  sourceApp: "Meine Skills",
  sourceAppGitHub: "Meine Skills · GitHub",
  sourceUser: "Claude-Skills-Ordner",
  sourcePluginGroup: "Claude-Plugins",
  sourcePlugin: "Claude-Plugin · {plugin}",
  sourceCodex: "Codex-Skills-Ordner",
  switchLabel: "{title} einschalten",
  invokeLabel: "{title}: wann er genutzt wird",
  invokeAuto: "KI entscheidet",
  invokeManual: "Nur auf Aufruf",
  badgeTemplate: "Mit Vorlage",
  badgeScripts: "Mit Skripten · funktioniert vollständig im Agent-Fenster",
  badgeAgentOnly: "Nur im Agent-Fenster",
  unreadableNoFrontmatter: "kein Front Matter",
  unreadableBadName: "Name entspricht nicht den Regeln",
  unreadableTooLarge: "zu groß",
  unreadableUnreadable: "nicht lesbar",
  unreadableNote: "Nicht nutzbar: {reason}",
  moreLabel: "Mehr zu {title}",
  actView: "Inhalt ansehen",
  actEdit: "Bearbeiten",
  actCopy: "In meine Skills kopieren",
  actExport: "Exportieren (zip)",
  actCheckUpdate: "Nach Updates suchen",
  actOpenFolder: "Ordner öffnen",
  actRemove: "In den Papierkorb",
  actHide: "Ausblenden",
  hiddenFooter: "{n} ausgeblendete integrierte Skills",
  unhide: "Wieder einblenden",
  confirmRemove: "Den Skill „{title}“ in den Papierkorb verschieben? Sie können ihn dort wiederherstellen.",
  confirmHide: "Den integrierten Skill „{title}“ ausblenden? Ein ausgeblendeter Skill ist ausgeschaltet; Sie können ihn unten in der Liste wieder einblenden.",
  cancel: "Abbrechen",
  close: "Schließen",
  copied: "Kopie erstellt und den ursprünglichen Skill ausgeschaltet",
  confirmOverwrite: "In Meine Skills gibt es bereits einen Skill namens {name}. Ersetzen?",
  overwrite: "Ersetzen",
  exportNotice: "Das Vorlagendokument kommt mit in die Datei. Prüfen Sie, dass es keine persönlichen Daten enthält",
  exportContinue: "Weiter",
  exported: "Exportiert: {path}",
  upToDate: "Aktuell",
  checking: "Wird geprüft…",
  updateTitle: "{title} aktualisieren",
  updateIntro: "Der Skill wurde auf GitHub geändert.",
  updateFiles: "Geänderte Dateien",
  changeAdded: "hinzugefügt",
  changeRemoved: "entfernt",
  changeModified: "geändert",
  updateLocalEdits: "Ihre eigenen Änderungen gehen verloren",
  updateApply: "Aktualisieren",
  updated: "Aktualisiert",
  editorNew: "Neuer Skill",
  editorEdit: "Skill bearbeiten",
  editorView: "Skill-Inhalt",
  fieldTitle: "Titel",
  fieldDescription: "Beschreibung",
  fieldDescriptionHint: "Die KI liest dies, um zu entscheiden, wann sie den Skill nutzt",
  fieldBody: "Anleitung",
  advanced: "Erweitert",
  fieldName: "Name",
  nameHint: "Kleinbuchstaben, Ziffern und Bindestriche (-), höchstens 64 Zeichen",
  nameAuto: "Name aus dem Titel: {name}",
  files: "Dateien im Skill",
  filesNone: "Keine weiteren Dateien",
  filesHint: "Öffnen Sie den Ordner, um diese Dateien zu ändern",
  save: "Speichern",
  saved: "Gespeichert",
  createHint: "Sie können auch im KI-Bereich fragen: „Erstelle mir einen Skill, der …“",
  nameEmpty: "Geben Sie einen Namen ein",
  nameTooLong: "Namen dürfen höchstens 64 Zeichen lang sein",
  nameCharacters: "Nur Kleinbuchstaben, Ziffern und Bindestriche (-)",
  nameHyphenEdge: "Ein Name darf nicht mit einem Bindestrich beginnen oder enden",
  nameDoubleHyphen: "Ein Name darf keine zwei Bindestriche hintereinander enthalten",
  nameReserved: "Dieser Name kann nicht verwendet werden",
  nameTaken: "In Meine Skills gibt es bereits einen Skill mit diesem Namen",
  githubTitle: "Über einen GitHub-Link hinzufügen",
  githubLabel: "GitHub-Adresse",
  githubPlaceholder: "https://github.com/inhaber/repository",
  githubHint: "Nur öffentliche Repositorys. Fügen Sie die Adresse eines Repositorys, Ordners oder einer SKILL.md ein, oder „inhaber/repository“.",
  githubFind: "Suchen",
  githubFetching: "Wird von GitHub heruntergeladen…",
  importReading: "Skills werden gelesen…",
  previewTitle: "Zu installierende Skills",
  previewFromFolder: "{n} Skills im Ordner gefunden",
  previewFromZip: "{n} Skills in der zip-Datei gefunden",
  previewFromGitHub: "{n} Skills in {repo} ({ref}) gefunden",
  previewSize: "{n} Dateien · {size}",
  previewScripts: "Mit Skripten",
  previewUrls: "{n} Webadressen",
  previewLicense: "Lizenzdatei: {name}",
  previewRootLicense: "Lizenzdatei des Repositorys: {name}",
  previewWarning: "Installieren Sie Skills nur aus Quellen, denen Sie vertrauen. Ein Skill gibt der KI Anweisungen und kann im Agent-Fenster Skripte ausführen.",
  previewInstallLabel: "{title} installieren",
  collision: "In Meine Skills gibt es einen Skill mit demselben Namen:",
  collisionReplace: "Ersetzen",
  collisionSkip: "Überspringen",
  problemDuplicate: "Kann nicht installiert werden: Ein anderer Skill hier hat denselben Namen",
  problemCannot: "Kann nicht installiert werden: {reason}",
  install: "Installieren",
  installed: "{n} Skills installiert",
  chooseCollision: "Wählen Sie für jeden Skill mit belegtem Namen Ersetzen oder Überspringen",
  failNoSkills: "Keine Skills gefunden",
  failRepoNotFound: "Das Repository wurde nicht gefunden oder ist nicht öffentlich",
  failRateLimited: "GitHub hält Anfragen gerade kurz zurück. Versuchen Sie es gleich noch einmal",
  failNetwork: "Keine Verbindung möglich",
  failTooLarge: "Zu groß",
  failUnsafe: "Die Sicherheitsprüfung ist fehlgeschlagen. Es wurde nichts installiert",
  failBadAddress: "Das ist keine GitHub-Adresse",
  failBusy: "Ein anderer Import oder eine Update-Prüfung läuft noch",
  failNotFound: "Der Skill wurde nicht gefunden",
  failNotAllowed: "Das ist in diesem Fenster nicht möglich",
  failNotInstallable: "Dieser Skill kann nicht installiert werden",
  failNotGitHub: "Dieser Skill wurde nicht von GitHub installiert",
  failTrash: "Der alte Skill konnte nicht in den Papierkorb verschoben werden. Er bleibt erhalten, nichts wurde ersetzt",
  failHidden: "Blenden Sie einen ausgeblendeten integrierten Skill erst wieder ein, bevor Sie ihn einschalten",
  failEmptyTitle: "Geben Sie einen Titel ein",
  failEmptyDescription: "Geben Sie eine Beschreibung ein",
  failEmptyBody: "Geben Sie die Anleitung ein",
  failBadName: "Der Name entspricht nicht den Regeln",
  failGeneric: "Das hat nicht geklappt. Versuchen Sie es noch einmal"
};
const es = {
  navLabel: "Habilidades",
  intro: "Una habilidad es un conjunto de instrucciones de trabajo para la IA. Llama a una habilidad activada con / o $ en el panel de IA, o deja que la IA la use por su cuenta cuando la necesite.",
  helpLink: "Abrir la ayuda",
  searchLabel: "Buscar habilidades",
  searchPlaceholder: "Buscar por título, nombre o descripción",
  add: "Añadir",
  addFolder: "Desde una carpeta",
  addZip: "Desde un archivo zip",
  addGitHub: "Desde un enlace de GitHub",
  create: "Nueva habilidad",
  loading: "Cargando…",
  empty: "Aún no hay habilidades. Empieza con Añadir o Nueva habilidad, arriba.",
  noMatch: "Ninguna habilidad coincide con «{query}».",
  sourceBuiltin: "Integradas",
  sourceApp: "Mis habilidades",
  sourceAppGitHub: "Mis habilidades · GitHub",
  sourceUser: "Carpeta de habilidades de Claude",
  sourcePluginGroup: "Complementos de Claude",
  sourcePlugin: "Complemento de Claude · {plugin}",
  sourceCodex: "Carpeta de habilidades de Codex",
  switchLabel: "Activar {title}",
  invokeLabel: "{title}: cuándo se usa",
  invokeAuto: "Decide la IA",
  invokeManual: "Solo cuando se llama",
  badgeTemplate: "Incluye plantilla",
  badgeScripts: "Incluye scripts · funciona por completo en la ventana del agente",
  badgeAgentOnly: "Solo en la ventana del agente",
  unreadableNoFrontmatter: "sin encabezado",
  unreadableBadName: "el nombre no cumple las reglas",
  unreadableTooLarge: "demasiado grande",
  unreadableUnreadable: "no se puede leer",
  unreadableNote: "No se puede usar: {reason}",
  moreLabel: "Más opciones de {title}",
  actView: "Ver contenido",
  actEdit: "Editar",
  actCopy: "Copiar a mis habilidades",
  actExport: "Exportar (zip)",
  actCheckUpdate: "Buscar actualizaciones",
  actOpenFolder: "Abrir carpeta",
  actRemove: "Mover a la papelera",
  actHide: "Ocultar",
  hiddenFooter: "{n} habilidades integradas ocultas",
  unhide: "Volver a mostrar",
  confirmRemove: "¿Mover la habilidad «{title}» a la papelera? Podrás restaurarla desde allí.",
  confirmHide: "¿Ocultar la habilidad integrada «{title}»? Una habilidad oculta queda desactivada; puedes volver a mostrarla al final de la lista.",
  cancel: "Cancelar",
  close: "Cerrar",
  copied: "Se creó una copia y se desactivó la habilidad original",
  confirmOverwrite: "Mis habilidades ya tiene una habilidad llamada {name}. ¿Reemplazarla?",
  overwrite: "Reemplazar",
  exportNotice: "El documento de plantilla también va en el archivo. Comprueba que no contenga información personal",
  exportContinue: "Continuar",
  exported: "Exportada: {path}",
  upToDate: "Está al día",
  checking: "Comprobando…",
  updateTitle: "Actualizar {title}",
  updateIntro: "La habilidad ha cambiado en GitHub.",
  updateFiles: "Archivos cambiados",
  changeAdded: "añadido",
  changeRemoved: "eliminado",
  changeModified: "cambiado",
  updateLocalEdits: "Se perderán tus propios cambios",
  updateApply: "Actualizar",
  updated: "Actualizada",
  editorNew: "Nueva habilidad",
  editorEdit: "Editar habilidad",
  editorView: "Contenido de la habilidad",
  fieldTitle: "Título",
  fieldDescription: "Descripción",
  fieldDescriptionHint: "La IA lee esto para decidir cuándo usar la habilidad",
  fieldBody: "Instrucciones",
  advanced: "Avanzado",
  fieldName: "Nombre",
  nameHint: "Letras minúsculas, números y guiones (-), hasta 64 caracteres",
  nameAuto: "Nombre tomado del título: {name}",
  files: "Archivos de la habilidad",
  filesNone: "No hay otros archivos",
  filesHint: "Abre la carpeta para cambiar estos archivos",
  save: "Guardar",
  saved: "Guardada",
  createHint: "También puedes pedirlo en el panel de IA: «hazme una habilidad que…»",
  nameEmpty: "Escribe un nombre",
  nameTooLong: "El nombre puede tener hasta 64 caracteres",
  nameCharacters: "Solo letras minúsculas, números y guiones (-)",
  nameHyphenEdge: "El nombre no puede empezar ni terminar con un guion",
  nameDoubleHyphen: "El nombre no puede tener dos guiones seguidos",
  nameReserved: "Este nombre no se puede usar",
  nameTaken: "Mis habilidades ya tiene una habilidad con este nombre",
  githubTitle: "Añadir desde un enlace de GitHub",
  githubLabel: "Dirección de GitHub",
  githubPlaceholder: "https://github.com/propietario/repositorio",
  githubHint: "Solo repositorios públicos. Pega la dirección de un repositorio, una carpeta o un SKILL.md, o «propietario/repositorio».",
  githubFind: "Buscar",
  githubFetching: "Descargando desde GitHub…",
  importReading: "Leyendo las habilidades…",
  previewTitle: "Habilidades que se instalarán",
  previewFromFolder: "{n} habilidades encontradas en la carpeta",
  previewFromZip: "{n} habilidades encontradas en el archivo zip",
  previewFromGitHub: "{n} habilidades encontradas en {repo} ({ref})",
  previewSize: "{n} archivos · {size}",
  previewScripts: "Incluye scripts",
  previewUrls: "{n} direcciones web",
  previewLicense: "Archivo de licencia: {name}",
  previewRootLicense: "Archivo de licencia del repositorio: {name}",
  previewWarning: "Instala habilidades solo de fuentes de confianza. Una habilidad da instrucciones a la IA y, en la ventana del agente, puede ejecutar scripts.",
  previewInstallLabel: "Instalar {title}",
  collision: "Mis habilidades tiene una habilidad con el mismo nombre:",
  collisionReplace: "Reemplazar",
  collisionSkip: "Omitir",
  problemDuplicate: "No se puede instalar: otra habilidad de aquí tiene el mismo nombre",
  problemCannot: "No se puede instalar: {reason}",
  install: "Instalar",
  installed: "Se instalaron {n} habilidades",
  chooseCollision: "Elige Reemplazar u Omitir para cada habilidad cuyo nombre ya está en uso",
  failNoSkills: "No se encontraron habilidades",
  failRepoNotFound: "No se encontró el repositorio o no es público",
  failRateLimited: "GitHub está frenando las solicitudes por un momento. Inténtalo de nuevo en breve",
  failNetwork: "No se pudo conectar",
  failTooLarge: "Demasiado grande",
  failUnsafe: "No superó la comprobación de seguridad. No se instaló nada",
  failBadAddress: "No es una dirección de GitHub",
  failBusy: "Todavía hay otra importación o comprobación de actualizaciones en curso",
  failNotFound: "No se encontró la habilidad",
  failNotAllowed: "No se puede hacer desde esta ventana",
  failNotInstallable: "Esta habilidad no se puede instalar",
  failNotGitHub: "Esta habilidad no se instaló desde GitHub",
  failTrash: "No se pudo mover la habilidad anterior a la papelera, así que se conservó y no se reemplazó nada",
  failHidden: "Vuelve a mostrar la habilidad integrada oculta antes de activarla",
  failEmptyTitle: "Escribe un título",
  failEmptyDescription: "Escribe una descripción",
  failEmptyBody: "Escribe las instrucciones",
  failBadName: "El nombre no cumple las reglas",
  failGeneric: "No funcionó. Inténtalo de nuevo"
};
const th = {
  navLabel: "สกิล",
  intro: "สกิลคือชุดคำแนะนำการทำงานสำหรับ AI เรียกสกิลที่เปิดไว้ได้ด้วย / หรือ $ ในแผง AI หรือให้ AI ใช้เองเมื่อจำเป็น",
  helpLink: "เปิดวิธีใช้",
  searchLabel: "ค้นหาสกิล",
  searchPlaceholder: "ค้นหาจากชื่อเรื่อง ชื่อ หรือคำอธิบาย",
  add: "เพิ่ม",
  addFolder: "จากโฟลเดอร์",
  addZip: "จากไฟล์ zip",
  addGitHub: "จากลิงก์ GitHub",
  create: "สร้างสกิลใหม่",
  loading: "กำลังโหลด…",
  empty: "ยังไม่มีสกิล เริ่มต้นด้วย เพิ่ม หรือ สร้างสกิลใหม่ ด้านบน",
  noMatch: 'ไม่มีสกิลที่ตรงกับ "{query}"',
  sourceBuiltin: "ในตัว",
  sourceApp: "สกิลของฉัน",
  sourceAppGitHub: "สกิลของฉัน · GitHub",
  sourceUser: "โฟลเดอร์สกิลของ Claude",
  sourcePluginGroup: "ปลั๊กอินของ Claude",
  sourcePlugin: "ปลั๊กอินของ Claude · {plugin}",
  sourceCodex: "โฟลเดอร์สกิลของ Codex",
  switchLabel: "เปิด {title}",
  invokeLabel: "{title}: ใช้เมื่อใด",
  invokeAuto: "ให้ AI ตัดสินใจ",
  invokeManual: "เฉพาะเมื่อเรียก",
  badgeTemplate: "มีแม่แบบ",
  badgeScripts: "มีสคริปต์ · ทำงานได้เต็มที่ในหน้าต่างเอเจนต์",
  badgeAgentOnly: "เฉพาะหน้าต่างเอเจนต์",
  unreadableNoFrontmatter: "ไม่มีส่วนหัวข้อมูล",
  unreadableBadName: "ชื่อไม่ตรงตามกฎ",
  unreadableTooLarge: "ใหญ่เกินไป",
  unreadableUnreadable: "อ่านไม่ได้",
  unreadableNote: "ใช้ไม่ได้: {reason}",
  moreLabel: "ตัวเลือกเพิ่มเติมสำหรับ {title}",
  actView: "ดูเนื้อหา",
  actEdit: "แก้ไข",
  actCopy: "คัดลอกไปยังสกิลของฉัน",
  actExport: "ส่งออก (zip)",
  actCheckUpdate: "ตรวจหาอัปเดต",
  actOpenFolder: "เปิดโฟลเดอร์",
  actRemove: "ย้ายไปถังขยะ",
  actHide: "ซ่อน",
  hiddenFooter: "สกิลในตัวที่ซ่อนไว้ {n} รายการ",
  unhide: "แสดงอีกครั้ง",
  confirmRemove: 'ย้ายสกิล "{title}" ไปถังขยะไหม คุณกู้คืนได้จากถังขยะ',
  confirmHide: 'ซ่อนสกิลในตัว "{title}" ไหม สกิลที่ซ่อนจะถูกปิด และคุณแสดงอีกครั้งได้ที่ด้านล่างสุดของรายการ',
  cancel: "ยกเลิก",
  close: "ปิด",
  copied: "สร้างสำเนาแล้ว และปิดสกิลต้นฉบับไว้",
  confirmOverwrite: "สกิลของฉันมีสกิลชื่อ {name} อยู่แล้ว จะแทนที่ไหม",
  overwrite: "แทนที่",
  exportNotice: "เอกสารแม่แบบจะรวมอยู่ในไฟล์ด้วย ตรวจสอบว่าไม่มีข้อมูลส่วนตัวอยู่ในนั้น",
  exportContinue: "ดำเนินการต่อ",
  exported: "ส่งออกแล้ว: {path}",
  upToDate: "เป็นเวอร์ชันล่าสุดแล้ว",
  checking: "กำลังตรวจสอบ…",
  updateTitle: "อัปเดต {title}",
  updateIntro: "สกิลนี้มีการเปลี่ยนแปลงบน GitHub",
  updateFiles: "ไฟล์ที่เปลี่ยน",
  changeAdded: "เพิ่ม",
  changeRemoved: "ลบ",
  changeModified: "เปลี่ยน",
  updateLocalEdits: "การแก้ไขของคุณเองจะหายไป",
  updateApply: "อัปเดต",
  updated: "อัปเดตแล้ว",
  editorNew: "สกิลใหม่",
  editorEdit: "แก้ไขสกิล",
  editorView: "เนื้อหาสกิล",
  fieldTitle: "ชื่อเรื่อง",
  fieldDescription: "คำอธิบาย",
  fieldDescriptionHint: "AI อ่านคำอธิบายนี้เพื่อตัดสินใจว่าจะใช้สกิลเมื่อใด",
  fieldBody: "คำแนะนำ",
  advanced: "ขั้นสูง",
  fieldName: "ชื่อ",
  nameHint: "ตัวพิมพ์เล็กภาษาอังกฤษ ตัวเลข และขีดกลาง (-) ไม่เกิน 64 ตัวอักษร",
  nameAuto: "ชื่อจากชื่อเรื่อง: {name}",
  files: "ไฟล์ในสกิล",
  filesNone: "ไม่มีไฟล์อื่น",
  filesHint: "เปิดโฟลเดอร์เพื่อแก้ไขไฟล์เหล่านี้",
  save: "บันทึก",
  saved: "บันทึกแล้ว",
  createHint: 'คุณสั่งในแผง AI ได้ด้วย เช่น "ช่วยสร้างสกิลที่…"',
  nameEmpty: "ป้อนชื่อ",
  nameTooLong: "ชื่อยาวได้ไม่เกิน 64 ตัวอักษร",
  nameCharacters: "ใช้ได้เฉพาะตัวพิมพ์เล็กภาษาอังกฤษ ตัวเลข และขีดกลาง (-)",
  nameHyphenEdge: "ชื่อขึ้นต้นหรือลงท้ายด้วยขีดกลางไม่ได้",
  nameDoubleHyphen: "ชื่อมีขีดกลางสองตัวติดกันไม่ได้",
  nameReserved: "ใช้ชื่อนี้ไม่ได้",
  nameTaken: "สกิลของฉันมีสกิลชื่อนี้อยู่แล้ว",
  githubTitle: "เพิ่มจากลิงก์ GitHub",
  githubLabel: "ที่อยู่ GitHub",
  githubPlaceholder: "https://github.com/เจ้าของ/คลัง",
  githubHint: 'รองรับเฉพาะคลังสาธารณะ วางที่อยู่ของคลัง โฟลเดอร์ หรือ SKILL.md หรือ "เจ้าของ/คลัง"',
  githubFind: "ค้นหา",
  githubFetching: "กำลังดาวน์โหลดจาก GitHub…",
  importReading: "กำลังอ่านสกิล…",
  previewTitle: "สกิลที่จะติดตั้ง",
  previewFromFolder: "พบสกิล {n} รายการในโฟลเดอร์",
  previewFromZip: "พบสกิล {n} รายการในไฟล์ zip",
  previewFromGitHub: "พบสกิล {n} รายการใน {repo} ({ref})",
  previewSize: "{n} ไฟล์ · {size}",
  previewScripts: "มีสคริปต์",
  previewUrls: "ที่อยู่เว็บ {n} รายการ",
  previewLicense: "ไฟล์สัญญาอนุญาต: {name}",
  previewRootLicense: "ไฟล์สัญญาอนุญาตของคลัง: {name}",
  previewWarning: "ติดตั้งสกิลจากแหล่งที่คุณเชื่อถือเท่านั้น สกิลจะสั่งงาน AI และในหน้าต่างเอเจนต์สามารถเรียกใช้สคริปต์ได้",
  previewInstallLabel: "ติดตั้ง {title}",
  collision: "สกิลของฉันมีสกิลชื่อเดียวกันอยู่:",
  collisionReplace: "แทนที่",
  collisionSkip: "ข้าม",
  problemDuplicate: "ติดตั้งไม่ได้: มีสกิลอื่นในนี้ที่ชื่อเดียวกัน",
  problemCannot: "ติดตั้งไม่ได้: {reason}",
  install: "ติดตั้ง",
  installed: "ติดตั้งสกิล {n} รายการแล้ว",
  chooseCollision: "เลือก แทนที่ หรือ ข้าม สำหรับสกิลแต่ละรายการที่ชื่อซ้ำ",
  failNoSkills: "ไม่พบสกิล",
  failRepoNotFound: "ไม่พบคลัง หรือคลังไม่ได้เป็นสาธารณะ",
  failRateLimited: "GitHub ระงับคำขอไว้ชั่วคราว ลองใหม่อีกครั้งในอีกสักครู่",
  failNetwork: "เชื่อมต่อไม่ได้",
  failTooLarge: "ใหญ่เกินไป",
  failUnsafe: "ไม่ผ่านการตรวจสอบความปลอดภัย ไม่ได้ติดตั้งอะไรเลย",
  failBadAddress: "นี่ไม่ใช่ที่อยู่ GitHub",
  failBusy: "การนำเข้าหรือการตรวจหาอัปเดตอื่นยังทำงานอยู่",
  failNotFound: "ไม่พบสกิล",
  failNotAllowed: "ทำจากหน้าต่างนี้ไม่ได้",
  failNotInstallable: "ติดตั้งสกิลนี้ไม่ได้",
  failNotGitHub: "สกิลนี้ไม่ได้ติดตั้งจาก GitHub",
  failTrash: "ย้ายสกิลเดิมไปถังขยะไม่ได้ จึงเก็บไว้ตามเดิมและไม่ได้แทนที่อะไร",
  failHidden: "แสดงสกิลในตัวที่ซ่อนไว้อีกครั้งก่อนเปิดใช้",
  failEmptyTitle: "ป้อนชื่อเรื่อง",
  failEmptyDescription: "ป้อนคำอธิบาย",
  failEmptyBody: "ป้อนคำแนะนำ",
  failBadName: "ชื่อไม่ตรงตามกฎ",
  failGeneric: "ไม่สำเร็จ ลองอีกครั้ง"
};
const id = {
  navLabel: "Skill",
  intro: "Skill adalah sekumpulan petunjuk kerja untuk AI. Panggil skill yang sudah Anda aktifkan dengan / atau $ di panel AI, atau biarkan AI memakainya sendiri saat diperlukan.",
  helpLink: "Buka bantuan",
  searchLabel: "Cari skill",
  searchPlaceholder: "Cari menurut judul, nama, atau deskripsi",
  add: "Tambah",
  addFolder: "Dari folder",
  addZip: "Dari file zip",
  addGitHub: "Dari tautan GitHub",
  create: "Skill baru",
  loading: "Memuat…",
  empty: "Belum ada skill. Mulai dengan Tambah atau Skill baru di atas.",
  noMatch: 'Tidak ada skill yang cocok dengan "{query}".',
  sourceBuiltin: "Bawaan",
  sourceApp: "Skill saya",
  sourceAppGitHub: "Skill saya · GitHub",
  sourceUser: "Folder skill Claude",
  sourcePluginGroup: "Plugin Claude",
  sourcePlugin: "Plugin Claude · {plugin}",
  sourceCodex: "Folder skill Codex",
  switchLabel: "Aktifkan {title}",
  invokeLabel: "{title}: kapan dipakai",
  invokeAuto: "AI yang menentukan",
  invokeManual: "Hanya saat dipanggil",
  badgeTemplate: "Ada templat",
  badgeScripts: "Ada skrip · berfungsi penuh di jendela agen",
  badgeAgentOnly: "Hanya jendela agen",
  unreadableNoFrontmatter: "tidak ada front matter",
  unreadableBadName: "nama tidak sesuai aturan",
  unreadableTooLarge: "terlalu besar",
  unreadableUnreadable: "tidak dapat dibaca",
  unreadableNote: "Tidak dapat dipakai: {reason}",
  moreLabel: "Lainnya untuk {title}",
  actView: "Lihat isi",
  actEdit: "Edit",
  actCopy: "Salin ke skill saya",
  actExport: "Ekspor (zip)",
  actCheckUpdate: "Periksa pembaruan",
  actOpenFolder: "Buka folder",
  actRemove: "Pindahkan ke tempat sampah",
  actHide: "Sembunyikan",
  hiddenFooter: "{n} skill bawaan disembunyikan",
  unhide: "Tampilkan lagi",
  confirmRemove: 'Pindahkan skill "{title}" ke tempat sampah? Anda dapat memulihkannya dari sana.',
  confirmHide: 'Sembunyikan skill bawaan "{title}"? Skill yang disembunyikan akan dinonaktifkan; Anda dapat menampilkannya lagi di bagian bawah daftar.',
  cancel: "Batal",
  close: "Tutup",
  copied: "Salinan dibuat dan skill aslinya dinonaktifkan",
  confirmOverwrite: "Skill saya sudah memiliki skill bernama {name}. Ganti?",
  overwrite: "Ganti",
  exportNotice: "Dokumen templat juga ikut masuk ke file. Pastikan dokumen itu tidak berisi informasi pribadi",
  exportContinue: "Lanjutkan",
  exported: "Diekspor: {path}",
  upToDate: "Sudah terbaru",
  checking: "Memeriksa…",
  updateTitle: "Perbarui {title}",
  updateIntro: "Skill ini telah berubah di GitHub.",
  updateFiles: "File yang berubah",
  changeAdded: "ditambahkan",
  changeRemoved: "dihapus",
  changeModified: "diubah",
  updateLocalEdits: "Suntingan Anda sendiri akan hilang",
  updateApply: "Perbarui",
  updated: "Diperbarui",
  editorNew: "Skill baru",
  editorEdit: "Edit skill",
  editorView: "Isi skill",
  fieldTitle: "Judul",
  fieldDescription: "Deskripsi",
  fieldDescriptionHint: "AI membaca ini untuk memutuskan kapan memakai skill",
  fieldBody: "Petunjuk",
  advanced: "Lanjutan",
  fieldName: "Nama",
  nameHint: "Huruf kecil, angka, dan tanda hubung (-), maksimal 64 karakter",
  nameAuto: "Nama dari judul: {name}",
  files: "File dalam skill",
  filesNone: "Tidak ada file lain",
  filesHint: "Buka folder untuk mengubah file-file ini",
  save: "Simpan",
  saved: "Disimpan",
  createHint: 'Anda juga bisa meminta di panel AI: "buatkan skill yang…"',
  nameEmpty: "Masukkan nama",
  nameTooLong: "Nama maksimal 64 karakter",
  nameCharacters: "Hanya huruf kecil, angka, dan tanda hubung (-)",
  nameHyphenEdge: "Nama tidak boleh diawali atau diakhiri tanda hubung",
  nameDoubleHyphen: "Nama tidak boleh memuat dua tanda hubung berturut-turut",
  nameReserved: "Nama ini tidak dapat dipakai",
  nameTaken: "Skill saya sudah memiliki skill dengan nama ini",
  githubTitle: "Tambah dari tautan GitHub",
  githubLabel: "Alamat GitHub",
  githubPlaceholder: "https://github.com/pemilik/repositori",
  githubHint: 'Hanya repositori publik. Tempel alamat repositori, folder, atau SKILL.md, atau "pemilik/repositori".',
  githubFind: "Cari",
  githubFetching: "Mengunduh dari GitHub…",
  importReading: "Membaca skill…",
  previewTitle: "Skill yang akan dipasang",
  previewFromFolder: "{n} skill ditemukan di folder",
  previewFromZip: "{n} skill ditemukan di file zip",
  previewFromGitHub: "{n} skill ditemukan di {repo} ({ref})",
  previewSize: "{n} file · {size}",
  previewScripts: "Ada skrip",
  previewUrls: "{n} alamat web",
  previewLicense: "File lisensi: {name}",
  previewRootLicense: "File lisensi repositori: {name}",
  previewWarning: "Pasang skill hanya dari sumber yang Anda percayai. Skill memberi AI instruksi, dan di jendela agen skill dapat menjalankan skrip.",
  previewInstallLabel: "Pasang {title}",
  collision: "Skill saya memiliki skill dengan nama yang sama:",
  collisionReplace: "Ganti",
  collisionSkip: "Lewati",
  problemDuplicate: "Tidak dapat dipasang: ada skill lain di sini dengan nama yang sama",
  problemCannot: "Tidak dapat dipasang: {reason}",
  install: "Pasang",
  installed: "{n} skill dipasang",
  chooseCollision: "Pilih Ganti atau Lewati untuk setiap skill yang namanya sudah dipakai",
  failNoSkills: "Tidak ada skill yang ditemukan",
  failRepoNotFound: "Repositori tidak ditemukan atau tidak publik",
  failRateLimited: "GitHub sedang menahan permintaan sebentar. Coba lagi sesaat lagi",
  failNetwork: "Tidak dapat terhubung",
  failTooLarge: "Terlalu besar",
  failUnsafe: "Tidak lolos pemeriksaan keamanan. Tidak ada yang dipasang",
  failBadAddress: "Itu bukan alamat GitHub",
  failBusy: "Impor atau pemeriksaan pembaruan lain masih berjalan",
  failNotFound: "Skill tidak ditemukan",
  failNotAllowed: "Ini tidak dapat dilakukan dari jendela ini",
  failNotInstallable: "Skill ini tidak dapat dipasang",
  failNotGitHub: "Skill ini tidak dipasang dari GitHub",
  failTrash: "Skill lama tidak dapat dipindahkan ke tempat sampah, jadi skill itu disimpan dan tidak ada yang diganti",
  failHidden: "Tampilkan lagi skill bawaan yang disembunyikan sebelum mengaktifkannya",
  failEmptyTitle: "Masukkan judul",
  failEmptyDescription: "Masukkan deskripsi",
  failEmptyBody: "Masukkan petunjuk",
  failBadName: "Nama tidak sesuai aturan",
  failGeneric: "Tidak berhasil. Coba lagi"
};
const ru = {
  navLabel: "Навыки",
  intro: "Навык — это набор рабочих инструкций для ИИ. Включённый навык можно вызвать через / или $ в панели ИИ, или ИИ сам применит его, когда это нужно.",
  helpLink: "Открыть справку",
  searchLabel: "Поиск навыков",
  searchPlaceholder: "Поиск по заголовку, имени или описанию",
  add: "Добавить",
  addFolder: "Из папки",
  addZip: "Из zip-файла",
  addGitHub: "По ссылке GitHub",
  create: "Новый навык",
  loading: "Загрузка…",
  empty: "Навыков пока нет. Начните с кнопки «Добавить» или «Новый навык» выше.",
  noMatch: "Нет навыков по запросу «{query}».",
  sourceBuiltin: "Встроенные",
  sourceApp: "Мои навыки",
  sourceAppGitHub: "Мои навыки · GitHub",
  sourceUser: "Папка навыков Claude",
  sourcePluginGroup: "Плагины Claude",
  sourcePlugin: "Плагин Claude · {plugin}",
  sourceCodex: "Папка навыков Codex",
  switchLabel: "Включить {title}",
  invokeLabel: "{title}: когда применять",
  invokeAuto: "Решает ИИ",
  invokeManual: "Только по вызову",
  badgeTemplate: "Есть шаблон",
  badgeScripts: "Есть скрипты · полностью работает в окне агента",
  badgeAgentOnly: "Только в окне агента",
  unreadableNoFrontmatter: "нет блока метаданных",
  unreadableBadName: "имя не соответствует правилам",
  unreadableTooLarge: "слишком большой",
  unreadableUnreadable: "не удаётся прочитать",
  unreadableNote: "Нельзя использовать: {reason}",
  moreLabel: "Ещё для {title}",
  actView: "Посмотреть содержимое",
  actEdit: "Изменить",
  actCopy: "Копировать в мои навыки",
  actExport: "Экспорт (zip)",
  actCheckUpdate: "Проверить обновления",
  actOpenFolder: "Открыть папку",
  actRemove: "В корзину",
  actHide: "Скрыть",
  hiddenFooter: "Скрытые встроенные навыки: {n}",
  unhide: "Показать снова",
  confirmRemove: "Переместить навык «{title}» в корзину? Его можно будет восстановить оттуда.",
  confirmHide: "Скрыть встроенный навык «{title}»? Скрытый навык отключается; вернуть его можно внизу списка.",
  cancel: "Отмена",
  close: "Закрыть",
  copied: "Копия создана, исходный навык отключён",
  confirmOverwrite: "В моих навыках уже есть навык с именем {name}. Заменить его?",
  overwrite: "Заменить",
  exportNotice: "В файл попадёт и документ-шаблон. Убедитесь, что в нём нет личных данных",
  exportContinue: "Продолжить",
  exported: "Экспортировано: {path}",
  upToDate: "Последняя версия",
  checking: "Проверка…",
  updateTitle: "Обновление: {title}",
  updateIntro: "Навык изменился на GitHub.",
  updateFiles: "Изменённые файлы",
  changeAdded: "добавлен",
  changeRemoved: "удалён",
  changeModified: "изменён",
  updateLocalEdits: "Ваши правки будут потеряны",
  updateApply: "Обновить",
  updated: "Обновлено",
  editorNew: "Новый навык",
  editorEdit: "Изменение навыка",
  editorView: "Содержимое навыка",
  fieldTitle: "Заголовок",
  fieldDescription: "Описание",
  fieldDescriptionHint: "По этому описанию ИИ решает, когда применять навык",
  fieldBody: "Инструкции",
  advanced: "Дополнительно",
  fieldName: "Имя",
  nameHint: "Строчные латинские буквы, цифры и дефисы (-), до 64 символов",
  nameAuto: "Имя из заголовка: {name}",
  files: "Файлы навыка",
  filesNone: "Других файлов нет",
  filesHint: "Чтобы изменить эти файлы, откройте папку",
  save: "Сохранить",
  saved: "Сохранено",
  createHint: "Можно также попросить в панели ИИ: «создай навык, который…»",
  nameEmpty: "Введите имя",
  nameTooLong: "Имя может быть не длиннее 64 символов",
  nameCharacters: "Только строчные латинские буквы, цифры и дефисы (-)",
  nameHyphenEdge: "Имя не может начинаться или заканчиваться дефисом",
  nameDoubleHyphen: "В имени не может быть двух дефисов подряд",
  nameReserved: "Это имя использовать нельзя",
  nameTaken: "В моих навыках уже есть навык с таким именем",
  githubTitle: "Добавить по ссылке GitHub",
  githubLabel: "Адрес на GitHub",
  githubPlaceholder: "https://github.com/владелец/репозиторий",
  githubHint: "Только публичные репозитории. Вставьте адрес репозитория, папки или SKILL.md либо «владелец/репозиторий».",
  githubFind: "Найти",
  githubFetching: "Загрузка с GitHub…",
  importReading: "Чтение навыков…",
  previewTitle: "Навыки для установки",
  previewFromFolder: "Найдено навыков в папке: {n}",
  previewFromZip: "Найдено навыков в zip-файле: {n}",
  previewFromGitHub: "Найдено навыков в {repo} ({ref}): {n}",
  previewSize: "Файлов: {n} · {size}",
  previewScripts: "Есть скрипты",
  previewUrls: "Веб-адресов: {n}",
  previewLicense: "Файл лицензии: {name}",
  previewRootLicense: "Файл лицензии репозитория: {name}",
  previewWarning: "Устанавливайте навыки только из надёжных источников. Навык даёт ИИ инструкции, а в окне агента может запускать скрипты.",
  previewInstallLabel: "Установить {title}",
  collision: "В моих навыках есть навык с таким же именем:",
  collisionReplace: "Заменить",
  collisionSkip: "Пропустить",
  problemDuplicate: "Нельзя установить: здесь есть другой навык с тем же именем",
  problemCannot: "Нельзя установить: {reason}",
  install: "Установить",
  installed: "Установлено навыков: {n}",
  chooseCollision: "Для каждого навыка с занятым именем выберите «Заменить» или «Пропустить»",
  failNoSkills: "Навыки не найдены",
  failRepoNotFound: "Репозиторий не найден или не является публичным",
  failRateLimited: "GitHub временно ограничил запросы. Повторите попытку чуть позже",
  failNetwork: "Не удалось подключиться",
  failTooLarge: "Слишком большой размер",
  failUnsafe: "Проверка безопасности не пройдена. Ничего не установлено",
  failBadAddress: "Это не адрес GitHub",
  failBusy: "Ещё выполняется другой импорт или проверка обновлений",
  failNotFound: "Навык не найден",
  failNotAllowed: "Это нельзя сделать из этого окна",
  failNotInstallable: "Этот навык нельзя установить",
  failNotGitHub: "Этот навык установлен не из GitHub",
  failTrash: "Не удалось переместить старый навык в корзину, поэтому он сохранён и ничего не заменено",
  failHidden: "Чтобы включить скрытый встроенный навык, сначала покажите его снова",
  failEmptyTitle: "Введите заголовок",
  failEmptyDescription: "Введите описание",
  failEmptyBody: "Введите инструкции",
  failBadName: "Имя не соответствует правилам",
  failGeneric: "Не получилось. Попробуйте ещё раз"
};
const ar = {
  navLabel: "المهارات",
  intro: "المهارة مجموعة تعليمات عمل للذكاء الاصطناعي. استدعِ المهارة المفعّلة باستخدام / أو $ في لوحة الذكاء الاصطناعي، أو دع الذكاء الاصطناعي يستخدمها بنفسه عند الحاجة.",
  helpLink: "فتح المساعدة",
  searchLabel: "البحث عن المهارات",
  searchPlaceholder: "ابحث بالعنوان أو الاسم أو الوصف",
  add: "إضافة",
  addFolder: "من مجلد",
  addZip: "من ملف zip",
  addGitHub: "من رابط GitHub",
  create: "مهارة جديدة",
  loading: "جارٍ التحميل…",
  empty: "لا توجد مهارات بعد. ابدأ بزر «إضافة» أو «مهارة جديدة» في الأعلى.",
  noMatch: "لا توجد مهارات تطابق «{query}».",
  sourceBuiltin: "مدمجة",
  sourceApp: "مهاراتي",
  sourceAppGitHub: "مهاراتي · GitHub",
  sourceUser: "مجلد مهارات Claude",
  sourcePluginGroup: "إضافات Claude",
  sourcePlugin: "إضافة Claude · {plugin}",
  sourceCodex: "مجلد مهارات Codex",
  switchLabel: "تفعيل {title}",
  invokeLabel: "{title}: وقت الاستخدام",
  invokeAuto: "يقرر الذكاء الاصطناعي",
  invokeManual: "عند الاستدعاء فقط",
  badgeTemplate: "يتضمن قالبًا",
  badgeScripts: "يتضمن نصوصًا برمجية · يعمل بالكامل في نافذة الوكيل",
  badgeAgentOnly: "نافذة الوكيل فقط",
  unreadableNoFrontmatter: "لا توجد ترويسة بيانات وصفية",
  unreadableBadName: "الاسم لا يطابق القواعد",
  unreadableTooLarge: "كبيرة جدًا",
  unreadableUnreadable: "تتعذر قراءتها",
  unreadableNote: "لا يمكن استخدامها: {reason}",
  moreLabel: "المزيد لـ {title}",
  actView: "عرض المحتوى",
  actEdit: "تعديل",
  actCopy: "نسخ إلى مهاراتي",
  actExport: "تصدير (zip)",
  actCheckUpdate: "التحقق من التحديثات",
  actOpenFolder: "فتح المجلد",
  actRemove: "نقل إلى سلة المهملات",
  actHide: "إخفاء",
  hiddenFooter: "المهارات المدمجة المخفية: {n}",
  unhide: "إظهار مجددًا",
  confirmRemove: "هل تريد نقل المهارة «{title}» إلى سلة المهملات؟ يمكنك استعادتها من هناك.",
  confirmHide: "هل تريد إخفاء المهارة المدمجة «{title}»؟ تُعطَّل المهارة المخفية، ويمكنك إظهارها مجددًا من أسفل القائمة.",
  cancel: "إلغاء",
  close: "إغلاق",
  copied: "أُنشئت نسخة وعُطّلت المهارة الأصلية",
  confirmOverwrite: "توجد في مهاراتي مهارة باسم {name}. هل تريد استبدالها؟",
  overwrite: "استبدال",
  exportNotice: "سيُضمَّن مستند القالب في الملف أيضًا. تأكد من خلوّه من أي معلومات شخصية",
  exportContinue: "متابعة",
  exported: "تم التصدير: {path}",
  upToDate: "محدّثة",
  checking: "جارٍ التحقق…",
  updateTitle: "تحديث {title}",
  updateIntro: "تغيّرت المهارة على GitHub.",
  updateFiles: "الملفات المتغيرة",
  changeAdded: "مضاف",
  changeRemoved: "محذوف",
  changeModified: "معدّل",
  updateLocalEdits: "ستضيع تعديلاتك",
  updateApply: "تحديث",
  updated: "تم التحديث",
  editorNew: "مهارة جديدة",
  editorEdit: "تعديل المهارة",
  editorView: "محتوى المهارة",
  fieldTitle: "العنوان",
  fieldDescription: "الوصف",
  fieldDescriptionHint: "يقرأ الذكاء الاصطناعي هذا الوصف ليقرر متى يستخدم المهارة",
  fieldBody: "التعليمات",
  advanced: "متقدم",
  fieldName: "الاسم",
  nameHint: "أحرف لاتينية صغيرة وأرقام وشرطات (-)، حتى 64 حرفًا",
  nameAuto: "الاسم المأخوذ من العنوان: {name}",
  files: "ملفات المهارة",
  filesNone: "لا توجد ملفات أخرى",
  filesHint: "افتح المجلد لتغيير هذه الملفات",
  save: "حفظ",
  saved: "تم الحفظ",
  createHint: "يمكنك أيضًا أن تطلب في لوحة الذكاء الاصطناعي: «أنشئ لي مهارة…»",
  nameEmpty: "أدخل اسمًا",
  nameTooLong: "يمكن أن يصل الاسم إلى 64 حرفًا",
  nameCharacters: "أحرف لاتينية صغيرة وأرقام وشرطات (-) فقط",
  nameHyphenEdge: "لا يمكن أن يبدأ الاسم أو ينتهي بشرطة",
  nameDoubleHyphen: "لا يمكن أن يحتوي الاسم على شرطتين متتاليتين",
  nameReserved: "لا يمكن استخدام هذا الاسم",
  nameTaken: "توجد في مهاراتي مهارة بهذا الاسم",
  githubTitle: "إضافة من رابط GitHub",
  githubLabel: "عنوان GitHub",
  githubPlaceholder: "https://github.com/المالك/المستودع",
  githubHint: "المستودعات العامة فقط. الصق عنوان مستودع أو مجلد أو SKILL.md، أو «المالك/المستودع».",
  githubFind: "بحث",
  githubFetching: "جارٍ التنزيل من GitHub…",
  importReading: "جارٍ قراءة المهارات…",
  previewTitle: "المهارات المراد تثبيتها",
  previewFromFolder: "المهارات التي عُثر عليها في المجلد: {n}",
  previewFromZip: "المهارات التي عُثر عليها في ملف zip: {n}",
  previewFromGitHub: "المهارات التي عُثر عليها في {repo} ({ref}): {n}",
  previewSize: "الملفات: {n} · {size}",
  previewScripts: "يتضمن نصوصًا برمجية",
  previewUrls: "عناوين الويب: {n}",
  previewLicense: "ملف الترخيص: {name}",
  previewRootLicense: "ملف ترخيص المستودع: {name}",
  previewWarning: "ثبّت المهارات من مصادر تثق بها فقط. تعطي المهارة تعليمات للذكاء الاصطناعي، ويمكنها تشغيل نصوص برمجية في نافذة الوكيل.",
  previewInstallLabel: "تثبيت {title}",
  collision: "توجد في مهاراتي مهارة بالاسم نفسه:",
  collisionReplace: "استبدال",
  collisionSkip: "تخطي",
  problemDuplicate: "لا يمكن تثبيتها: توجد هنا مهارة أخرى بالاسم نفسه",
  problemCannot: "لا يمكن تثبيتها: {reason}",
  install: "تثبيت",
  installed: "تم تثبيت المهارات: {n}",
  chooseCollision: "اختر «استبدال» أو «تخطي» لكل مهارة اسمها مستخدم",
  failNoSkills: "لم يُعثر على مهارات",
  failRepoNotFound: "المستودع غير موجود أو غير عام",
  failRateLimited: "يؤخر GitHub الطلبات مؤقتًا. حاول مجددًا بعد قليل",
  failNetwork: "تعذر الاتصال",
  failTooLarge: "الحجم كبير جدًا",
  failUnsafe: "لم يجتز فحص الأمان. لم يُثبَّت أي شيء",
  failBadAddress: "هذا ليس عنوان GitHub",
  failBusy: "لا تزال عملية استيراد أو تحقق من التحديثات أخرى قيد التشغيل",
  failNotFound: "لم يُعثر على المهارة",
  failNotAllowed: "لا يمكن تنفيذ ذلك من هذه النافذة",
  failNotInstallable: "لا يمكن تثبيت هذه المهارة",
  failNotGitHub: "لم تُثبَّت هذه المهارة من GitHub",
  failTrash: "تعذّر نقل المهارة القديمة إلى سلة المهملات، فبقيت كما هي ولم يُستبدل شيء",
  failHidden: "أظهر المهارة المدمجة المخفية مجددًا قبل تفعيلها",
  failEmptyTitle: "أدخل عنوانًا",
  failEmptyDescription: "أدخل وصفًا",
  failEmptyBody: "أدخل التعليمات",
  failBadName: "الاسم لا يطابق القواعد",
  failGeneric: "لم ينجح ذلك. حاول مجددًا"
};
const pt = {
  navLabel: "Habilidades",
  intro: "Uma habilidade é um conjunto de instruções de trabalho para a IA. Chame uma habilidade ativada com / ou $ no painel de IA, ou deixe a IA usá-la por conta própria quando precisar.",
  helpLink: "Abrir ajuda",
  searchLabel: "Buscar habilidades",
  searchPlaceholder: "Buscar por título, nome ou descrição",
  add: "Adicionar",
  addFolder: "De uma pasta",
  addZip: "De um arquivo zip",
  addGitHub: "De um link do GitHub",
  create: "Nova habilidade",
  loading: "Carregando…",
  empty: "Nenhuma habilidade ainda. Comece com Adicionar ou Nova habilidade acima.",
  noMatch: 'Nenhuma habilidade corresponde a "{query}".',
  sourceBuiltin: "Integradas",
  sourceApp: "Minhas habilidades",
  sourceAppGitHub: "Minhas habilidades · GitHub",
  sourceUser: "Pasta de habilidades do Claude",
  sourcePluginGroup: "Plugins do Claude",
  sourcePlugin: "Plugin do Claude · {plugin}",
  sourceCodex: "Pasta de habilidades do Codex",
  switchLabel: "Ativar {title}",
  invokeLabel: "{title}: quando usar",
  invokeAuto: "A IA decide",
  invokeManual: "Só quando chamada",
  badgeTemplate: "Tem modelo",
  badgeScripts: "Tem scripts · funciona por completo na janela do agente",
  badgeAgentOnly: "Só na janela do agente",
  unreadableNoFrontmatter: "sem cabeçalho de metadados",
  unreadableBadName: "o nome não segue as regras",
  unreadableTooLarge: "grande demais",
  unreadableUnreadable: "não pode ser lida",
  unreadableNote: "Não pode ser usada: {reason}",
  moreLabel: "Mais opções de {title}",
  actView: "Ver conteúdo",
  actEdit: "Editar",
  actCopy: "Copiar para minhas habilidades",
  actExport: "Exportar (zip)",
  actCheckUpdate: "Verificar atualizações",
  actOpenFolder: "Abrir pasta",
  actRemove: "Mover para a lixeira",
  actHide: "Ocultar",
  hiddenFooter: "Habilidades integradas ocultas: {n}",
  unhide: "Mostrar de novo",
  confirmRemove: 'Mover a habilidade "{title}" para a lixeira? Você pode restaurá-la de lá.',
  confirmHide: 'Ocultar a habilidade integrada "{title}"? Uma habilidade oculta fica desativada; você pode mostrá-la de novo no fim da lista.',
  cancel: "Cancelar",
  close: "Fechar",
  copied: "Cópia criada e habilidade original desativada",
  confirmOverwrite: "Minhas habilidades já tem uma habilidade chamada {name}. Substituir?",
  overwrite: "Substituir",
  exportNotice: "O documento de modelo também vai no arquivo. Verifique se ele não contém informações pessoais",
  exportContinue: "Continuar",
  exported: "Exportado: {path}",
  upToDate: "Atualizada",
  checking: "Verificando…",
  updateTitle: "Atualizar {title}",
  updateIntro: "A habilidade mudou no GitHub.",
  updateFiles: "Arquivos alterados",
  changeAdded: "adicionado",
  changeRemoved: "removido",
  changeModified: "alterado",
  updateLocalEdits: "Suas edições serão perdidas",
  updateApply: "Atualizar",
  updated: "Atualizada",
  editorNew: "Nova habilidade",
  editorEdit: "Editar habilidade",
  editorView: "Conteúdo da habilidade",
  fieldTitle: "Título",
  fieldDescription: "Descrição",
  fieldDescriptionHint: "A IA lê isto para decidir quando usar a habilidade",
  fieldBody: "Instruções",
  advanced: "Avançado",
  fieldName: "Nome",
  nameHint: "Letras minúsculas, números e hifens (-), até 64 caracteres",
  nameAuto: "Nome a partir do título: {name}",
  files: "Arquivos da habilidade",
  filesNone: "Nenhum outro arquivo",
  filesHint: "Abra a pasta para alterar esses arquivos",
  save: "Salvar",
  saved: "Salvo",
  createHint: 'Você também pode pedir no painel de IA: "crie uma habilidade que…"',
  nameEmpty: "Digite um nome",
  nameTooLong: "O nome pode ter até 64 caracteres",
  nameCharacters: "Somente letras minúsculas, números e hifens (-)",
  nameHyphenEdge: "O nome não pode começar nem terminar com hífen",
  nameDoubleHyphen: "O nome não pode ter dois hifens seguidos",
  nameReserved: "Este nome não pode ser usado",
  nameTaken: "Minhas habilidades já tem uma habilidade com este nome",
  githubTitle: "Adicionar de um link do GitHub",
  githubLabel: "Endereço do GitHub",
  githubPlaceholder: "https://github.com/dono/repositorio",
  githubHint: 'Somente repositórios públicos. Cole o endereço de um repositório, pasta ou SKILL.md, ou "dono/repositorio".',
  githubFind: "Buscar",
  githubFetching: "Baixando do GitHub…",
  importReading: "Lendo as habilidades…",
  previewTitle: "Habilidades a instalar",
  previewFromFolder: "{n} habilidades encontradas na pasta",
  previewFromZip: "{n} habilidades encontradas no arquivo zip",
  previewFromGitHub: "{n} habilidades encontradas em {repo} ({ref})",
  previewSize: "{n} arquivos · {size}",
  previewScripts: "Tem scripts",
  previewUrls: "{n} endereços da web",
  previewLicense: "Arquivo de licença: {name}",
  previewRootLicense: "Arquivo de licença do repositório: {name}",
  previewWarning: "Instale habilidades somente de fontes confiáveis. Uma habilidade dá instruções à IA e, na janela do agente, pode executar scripts.",
  previewInstallLabel: "Instalar {title}",
  collision: "Minhas habilidades tem uma habilidade com o mesmo nome:",
  collisionReplace: "Substituir",
  collisionSkip: "Pular",
  problemDuplicate: "Não pode ser instalada: outra habilidade aqui tem o mesmo nome",
  problemCannot: "Não pode ser instalada: {reason}",
  install: "Instalar",
  installed: "{n} habilidades instaladas",
  chooseCollision: "Escolha Substituir ou Pular para cada habilidade com nome já usado",
  failNoSkills: "Nenhuma habilidade encontrada",
  failRepoNotFound: "O repositório não foi encontrado ou não é público",
  failRateLimited: "O GitHub está segurando as solicitações por um momento. Tente de novo daqui a pouco",
  failNetwork: "Não foi possível conectar",
  failTooLarge: "Grande demais",
  failUnsafe: "Não passou na verificação de segurança. Nada foi instalado",
  failBadAddress: "Isso não é um endereço do GitHub",
  failBusy: "Outra importação ou verificação de atualizações ainda está em andamento",
  failNotFound: "A habilidade não foi encontrada",
  failNotAllowed: "Isso não pode ser feito nesta janela",
  failNotInstallable: "Esta habilidade não pode ser instalada",
  failNotGitHub: "Esta habilidade não foi instalada do GitHub",
  failTrash: "Não foi possível mover a habilidade anterior para a lixeira, então ela foi mantida e nada foi substituído",
  failHidden: "Mostre de novo a habilidade integrada oculta antes de ativá-la",
  failEmptyTitle: "Digite um título",
  failEmptyDescription: "Digite uma descrição",
  failEmptyBody: "Digite as instruções",
  failBadName: "O nome não segue as regras",
  failGeneric: "Não deu certo. Tente de novo"
};
const it = {
  navLabel: "Abilità",
  intro: "Un'abilità è un insieme di istruzioni di lavoro per l'IA. Richiama un'abilità attiva con / o $ nel pannello IA, oppure lascia che l'IA la usi da sola quando serve.",
  helpLink: "Apri la guida",
  searchLabel: "Cerca abilità",
  searchPlaceholder: "Cerca per titolo, nome o descrizione",
  add: "Aggiungi",
  addFolder: "Da una cartella",
  addZip: "Da un file zip",
  addGitHub: "Da un link GitHub",
  create: "Nuova abilità",
  loading: "Caricamento…",
  empty: "Ancora nessuna abilità. Inizia con Aggiungi o Nuova abilità qui sopra.",
  noMatch: "Nessuna abilità corrisponde a «{query}».",
  sourceBuiltin: "Integrate",
  sourceApp: "Le mie abilità",
  sourceAppGitHub: "Le mie abilità · GitHub",
  sourceUser: "Cartella abilità di Claude",
  sourcePluginGroup: "Plugin di Claude",
  sourcePlugin: "Plugin di Claude · {plugin}",
  sourceCodex: "Cartella abilità di Codex",
  switchLabel: "Attiva {title}",
  invokeLabel: "{title}: quando si usa",
  invokeAuto: "Decide l'IA",
  invokeManual: "Solo se richiamata",
  badgeTemplate: "Con modello",
  badgeScripts: "Con script · funziona del tutto nella finestra dell'agente",
  badgeAgentOnly: "Solo finestra dell'agente",
  unreadableNoFrontmatter: "intestazione dei metadati assente",
  unreadableBadName: "il nome non rispetta le regole",
  unreadableTooLarge: "troppo grande",
  unreadableUnreadable: "non leggibile",
  unreadableNote: "Non utilizzabile: {reason}",
  moreLabel: "Altro per {title}",
  actView: "Vedi contenuto",
  actEdit: "Modifica",
  actCopy: "Copia nelle mie abilità",
  actExport: "Esporta (zip)",
  actCheckUpdate: "Cerca aggiornamenti",
  actOpenFolder: "Apri cartella",
  actRemove: "Sposta nel cestino",
  actHide: "Nascondi",
  hiddenFooter: "Abilità integrate nascoste: {n}",
  unhide: "Mostra di nuovo",
  confirmRemove: "Spostare l'abilità «{title}» nel cestino? Potrai ripristinarla da lì.",
  confirmHide: "Nascondere l'abilità integrata «{title}»? Un'abilità nascosta viene disattivata; puoi mostrarla di nuovo in fondo all'elenco.",
  cancel: "Annulla",
  close: "Chiudi",
  copied: "Copia creata e abilità originale disattivata",
  confirmOverwrite: "Tra le mie abilità ce n'è già una chiamata {name}. Sostituirla?",
  overwrite: "Sostituisci",
  exportNotice: "Nel file finisce anche il documento modello. Verifica che non contenga dati personali",
  exportContinue: "Continua",
  exported: "Esportato: {path}",
  upToDate: "Aggiornata",
  checking: "Verifica in corso…",
  updateTitle: "Aggiorna {title}",
  updateIntro: "L'abilità è cambiata su GitHub.",
  updateFiles: "File modificati",
  changeAdded: "aggiunto",
  changeRemoved: "rimosso",
  changeModified: "modificato",
  updateLocalEdits: "Le tue modifiche andranno perse",
  updateApply: "Aggiorna",
  updated: "Aggiornata",
  editorNew: "Nuova abilità",
  editorEdit: "Modifica abilità",
  editorView: "Contenuto dell'abilità",
  fieldTitle: "Titolo",
  fieldDescription: "Descrizione",
  fieldDescriptionHint: "L'IA legge questo testo per decidere quando usare l'abilità",
  fieldBody: "Istruzioni",
  advanced: "Avanzate",
  fieldName: "Nome",
  nameHint: "Lettere minuscole, cifre e trattini (-), fino a 64 caratteri",
  nameAuto: "Nome dal titolo: {name}",
  files: "File dell'abilità",
  filesNone: "Nessun altro file",
  filesHint: "Apri la cartella per modificare questi file",
  save: "Salva",
  saved: "Salvato",
  createHint: "Puoi anche chiedere nel pannello IA: «creami un'abilità che…»",
  nameEmpty: "Inserisci un nome",
  nameTooLong: "Il nome può avere al massimo 64 caratteri",
  nameCharacters: "Solo lettere minuscole, cifre e trattini (-)",
  nameHyphenEdge: "Il nome non può iniziare o finire con un trattino",
  nameDoubleHyphen: "Il nome non può contenere due trattini di seguito",
  nameReserved: "Questo nome non si può usare",
  nameTaken: "Tra le mie abilità ce n'è già una con questo nome",
  githubTitle: "Aggiungi da un link GitHub",
  githubLabel: "Indirizzo GitHub",
  githubPlaceholder: "https://github.com/proprietario/repository",
  githubHint: "Solo repository pubblici. Incolla l'indirizzo di un repository, di una cartella o di SKILL.md, oppure «proprietario/repository».",
  githubFind: "Cerca",
  githubFetching: "Download da GitHub…",
  importReading: "Lettura delle abilità…",
  previewTitle: "Abilità da installare",
  previewFromFolder: "Abilità trovate nella cartella: {n}",
  previewFromZip: "Abilità trovate nel file zip: {n}",
  previewFromGitHub: "Abilità trovate in {repo} ({ref}): {n}",
  previewSize: "File: {n} · {size}",
  previewScripts: "Con script",
  previewUrls: "Indirizzi web: {n}",
  previewLicense: "File di licenza: {name}",
  previewRootLicense: "File di licenza del repository: {name}",
  previewWarning: "Installa abilità solo da fonti affidabili. Un'abilità dà istruzioni all'IA e nella finestra dell'agente può eseguire script.",
  previewInstallLabel: "Installa {title}",
  collision: "Tra le mie abilità ce n'è una con lo stesso nome:",
  collisionReplace: "Sostituisci",
  collisionSkip: "Salta",
  problemDuplicate: "Non installabile: un'altra abilità qui ha lo stesso nome",
  problemCannot: "Non installabile: {reason}",
  install: "Installa",
  installed: "Abilità installate: {n}",
  chooseCollision: "Scegli Sostituisci o Salta per ogni abilità con un nome già usato",
  failNoSkills: "Nessuna abilità trovata",
  failRepoNotFound: "Il repository non è stato trovato o non è pubblico",
  failRateLimited: "GitHub sta trattenendo le richieste per un momento. Riprova tra poco",
  failNetwork: "Impossibile connettersi",
  failTooLarge: "Troppo grande",
  failUnsafe: "Il controllo di sicurezza non è stato superato. Non è stato installato nulla",
  failBadAddress: "Non è un indirizzo GitHub",
  failBusy: "È ancora in corso un'altra importazione o verifica degli aggiornamenti",
  failNotFound: "L'abilità non è stata trovata",
  failNotAllowed: "Non si può fare da questa finestra",
  failNotInstallable: "Questa abilità non può essere installata",
  failNotGitHub: "Questa abilità non è stata installata da GitHub",
  failTrash: "Non è stato possibile spostare l’abilità precedente nel cestino, quindi è stata mantenuta e non è stato sostituito nulla",
  failHidden: "Mostra di nuovo l'abilità integrata nascosta prima di attivarla",
  failEmptyTitle: "Inserisci un titolo",
  failEmptyDescription: "Inserisci una descrizione",
  failEmptyBody: "Inserisci le istruzioni",
  failBadName: "Il nome non rispetta le regole",
  failGeneric: "Operazione non riuscita. Riprova"
};
const pl = {
  navLabel: "Umiejętności",
  intro: "Umiejętność to zestaw instrukcji roboczych dla AI. Włączoną umiejętność wywołasz przez / lub $ w panelu AI, a AI może też użyć jej samo, gdy jej potrzebuje.",
  helpLink: "Otwórz pomoc",
  searchLabel: "Szukaj umiejętności",
  searchPlaceholder: "Szukaj po tytule, nazwie lub opisie",
  add: "Dodaj",
  addFolder: "Z folderu",
  addZip: "Z pliku zip",
  addGitHub: "Z linku GitHub",
  create: "Nowa umiejętność",
  loading: "Wczytywanie…",
  empty: "Nie masz jeszcze umiejętności. Zacznij od przycisku Dodaj lub Nowa umiejętność powyżej.",
  noMatch: "Brak umiejętności pasujących do „{query}”.",
  sourceBuiltin: "Wbudowane",
  sourceApp: "Moje umiejętności",
  sourceAppGitHub: "Moje umiejętności · GitHub",
  sourceUser: "Folder umiejętności Claude",
  sourcePluginGroup: "Wtyczki Claude",
  sourcePlugin: "Wtyczka Claude · {plugin}",
  sourceCodex: "Folder umiejętności Codex",
  switchLabel: "Włącz {title}",
  invokeLabel: "{title}: kiedy używać",
  invokeAuto: "Decyduje AI",
  invokeManual: "Tylko na wezwanie",
  badgeTemplate: "Zawiera szablon",
  badgeScripts: "Zawiera skrypty · w pełni działa w oknie agenta",
  badgeAgentOnly: "Tylko okno agenta",
  unreadableNoFrontmatter: "brak nagłówka z metadanymi",
  unreadableBadName: "nazwa nie spełnia zasad",
  unreadableTooLarge: "za duża",
  unreadableUnreadable: "nie można odczytać",
  unreadableNote: "Nie można użyć: {reason}",
  moreLabel: "Więcej dla {title}",
  actView: "Pokaż zawartość",
  actEdit: "Edytuj",
  actCopy: "Kopiuj do moich umiejętności",
  actExport: "Eksportuj (zip)",
  actCheckUpdate: "Sprawdź aktualizacje",
  actOpenFolder: "Otwórz folder",
  actRemove: "Przenieś do kosza",
  actHide: "Ukryj",
  hiddenFooter: "Ukryte wbudowane umiejętności: {n}",
  unhide: "Pokaż ponownie",
  confirmRemove: "Przenieść umiejętność „{title}” do kosza? Możesz ją stamtąd przywrócić.",
  confirmHide: "Ukryć wbudowaną umiejętność „{title}”? Ukryta umiejętność zostaje wyłączona; możesz ją ponownie pokazać na dole listy.",
  cancel: "Anuluj",
  close: "Zamknij",
  copied: "Utworzono kopię i wyłączono oryginalną umiejętność",
  confirmOverwrite: "W moich umiejętnościach jest już umiejętność o nazwie {name}. Zastąpić ją?",
  overwrite: "Zastąp",
  exportNotice: "Do pliku trafi też dokument szablonu. Sprawdź, czy nie zawiera danych osobowych",
  exportContinue: "Dalej",
  exported: "Wyeksportowano: {path}",
  upToDate: "Aktualna",
  checking: "Sprawdzanie…",
  updateTitle: "Aktualizacja: {title}",
  updateIntro: "Umiejętność zmieniła się w serwisie GitHub.",
  updateFiles: "Zmienione pliki",
  changeAdded: "dodano",
  changeRemoved: "usunięto",
  changeModified: "zmieniono",
  updateLocalEdits: "Twoje zmiany zostaną utracone",
  updateApply: "Aktualizuj",
  updated: "Zaktualizowano",
  editorNew: "Nowa umiejętność",
  editorEdit: "Edycja umiejętności",
  editorView: "Zawartość umiejętności",
  fieldTitle: "Tytuł",
  fieldDescription: "Opis",
  fieldDescriptionHint: "AI czyta ten opis, aby zdecydować, kiedy użyć umiejętności",
  fieldBody: "Instrukcje",
  advanced: "Zaawansowane",
  fieldName: "Nazwa",
  nameHint: "Małe litery łacińskie, cyfry i łączniki (-), do 64 znaków",
  nameAuto: "Nazwa z tytułu: {name}",
  files: "Pliki umiejętności",
  filesNone: "Brak innych plików",
  filesHint: "Aby zmienić te pliki, otwórz folder",
  save: "Zapisz",
  saved: "Zapisano",
  createHint: "Możesz też poprosić w panelu AI: „utwórz umiejętność, która…”",
  nameEmpty: "Wpisz nazwę",
  nameTooLong: "Nazwa może mieć do 64 znaków",
  nameCharacters: "Tylko małe litery łacińskie, cyfry i łączniki (-)",
  nameHyphenEdge: "Nazwa nie może zaczynać się ani kończyć łącznikiem",
  nameDoubleHyphen: "Nazwa nie może zawierać dwóch łączników z rzędu",
  nameReserved: "Tej nazwy nie można użyć",
  nameTaken: "W moich umiejętnościach jest już umiejętność o tej nazwie",
  githubTitle: "Dodaj z linku GitHub",
  githubLabel: "Adres GitHub",
  githubPlaceholder: "https://github.com/właściciel/repozytorium",
  githubHint: "Tylko publiczne repozytoria. Wklej adres repozytorium, folderu lub SKILL.md albo „właściciel/repozytorium”.",
  githubFind: "Znajdź",
  githubFetching: "Pobieranie z serwisu GitHub…",
  importReading: "Odczytywanie umiejętności…",
  previewTitle: "Umiejętności do zainstalowania",
  previewFromFolder: "Znalezione umiejętności w folderze: {n}",
  previewFromZip: "Znalezione umiejętności w pliku zip: {n}",
  previewFromGitHub: "Znalezione umiejętności w {repo} ({ref}): {n}",
  previewSize: "Pliki: {n} · {size}",
  previewScripts: "Zawiera skrypty",
  previewUrls: "Adresy internetowe: {n}",
  previewLicense: "Plik licencji: {name}",
  previewRootLicense: "Plik licencji repozytorium: {name}",
  previewWarning: "Instaluj umiejętności tylko z zaufanych źródeł. Umiejętność przekazuje AI instrukcje, a w oknie agenta może uruchamiać skrypty.",
  previewInstallLabel: "Zainstaluj {title}",
  collision: "W moich umiejętnościach jest umiejętność o tej samej nazwie:",
  collisionReplace: "Zastąp",
  collisionSkip: "Pomiń",
  problemDuplicate: "Nie można zainstalować: inna umiejętność tutaj ma tę samą nazwę",
  problemCannot: "Nie można zainstalować: {reason}",
  install: "Zainstaluj",
  installed: "Zainstalowane umiejętności: {n}",
  chooseCollision: "Dla każdej umiejętności z zajętą nazwą wybierz Zastąp lub Pomiń",
  failNoSkills: "Nie znaleziono umiejętności",
  failRepoNotFound: "Nie znaleziono repozytorium lub nie jest ono publiczne",
  failRateLimited: "GitHub chwilowo wstrzymuje żądania. Spróbuj ponownie za moment",
  failNetwork: "Nie udało się połączyć",
  failTooLarge: "Za duże",
  failUnsafe: "Nie przeszło kontroli bezpieczeństwa. Nic nie zainstalowano",
  failBadAddress: "To nie jest adres GitHub",
  failBusy: "Trwa jeszcze inny import lub sprawdzanie aktualizacji",
  failNotFound: "Nie znaleziono umiejętności",
  failNotAllowed: "Nie można tego zrobić z tego okna",
  failNotInstallable: "Tej umiejętności nie można zainstalować",
  failNotGitHub: "Ta umiejętność nie została zainstalowana z serwisu GitHub",
  failTrash: "Nie udało się przenieść starej umiejętności do kosza, więc została zachowana i nic nie zastąpiono",
  failHidden: "Zanim włączysz ukrytą wbudowaną umiejętność, pokaż ją ponownie",
  failEmptyTitle: "Wpisz tytuł",
  failEmptyDescription: "Wpisz opis",
  failEmptyBody: "Wpisz instrukcje",
  failBadName: "Nazwa nie spełnia zasad",
  failGeneric: "Nie udało się. Spróbuj ponownie"
};
const cs = {
  navLabel: "Dovednosti",
  intro: "Dovednost je sada pracovních pokynů pro AI. Zapnutou dovednost vyvoláte pomocí / nebo $ v panelu AI, nebo ji AI použije sama, když ji potřebuje.",
  helpLink: "Otevřít nápovědu",
  searchLabel: "Hledat dovednosti",
  searchPlaceholder: "Hledat podle nadpisu, názvu nebo popisu",
  add: "Přidat",
  addFolder: "Ze složky",
  addZip: "Ze souboru zip",
  addGitHub: "Z odkazu na GitHub",
  create: "Nová dovednost",
  loading: "Načítání…",
  empty: "Zatím žádné dovednosti. Začněte tlačítkem Přidat nebo Nová dovednost nahoře.",
  noMatch: "Hledání „{query}“ neodpovídá žádná dovednost.",
  sourceBuiltin: "Vestavěné",
  sourceApp: "Moje dovednosti",
  sourceAppGitHub: "Moje dovednosti · GitHub",
  sourceUser: "Složka dovedností Claude",
  sourcePluginGroup: "Pluginy Claude",
  sourcePlugin: "Plugin Claude · {plugin}",
  sourceCodex: "Složka dovedností Codex",
  switchLabel: "Zapnout {title}",
  invokeLabel: "{title}: kdy se používá",
  invokeAuto: "Rozhoduje AI",
  invokeManual: "Jen na vyvolání",
  badgeTemplate: "Obsahuje šablonu",
  badgeScripts: "Obsahuje skripty · plně funguje v okně agenta",
  badgeAgentOnly: "Jen v okně agenta",
  unreadableNoFrontmatter: "chybí hlavička s metadaty",
  unreadableBadName: "název neodpovídá pravidlům",
  unreadableTooLarge: "příliš velká",
  unreadableUnreadable: "nelze přečíst",
  unreadableNote: "Nelze použít: {reason}",
  moreLabel: "Další možnosti pro {title}",
  actView: "Zobrazit obsah",
  actEdit: "Upravit",
  actCopy: "Kopírovat do mých dovedností",
  actExport: "Exportovat (zip)",
  actCheckUpdate: "Zkontrolovat aktualizace",
  actOpenFolder: "Otevřít složku",
  actRemove: "Přesunout do koše",
  actHide: "Skrýt",
  hiddenFooter: "Skryté vestavěné dovednosti: {n}",
  unhide: "Znovu zobrazit",
  confirmRemove: "Přesunout dovednost „{title}“ do koše? Odtud ji můžete obnovit.",
  confirmHide: "Skrýt vestavěnou dovednost „{title}“? Skrytá dovednost se vypne; znovu ji zobrazíte dole v seznamu.",
  cancel: "Zrušit",
  close: "Zavřít",
  copied: "Kopie vytvořena a původní dovednost vypnuta",
  confirmOverwrite: "V mých dovednostech už je dovednost s názvem {name}. Nahradit ji?",
  overwrite: "Nahradit",
  exportNotice: "Do souboru se přidá i dokument šablony. Zkontrolujte, že neobsahuje osobní údaje",
  exportContinue: "Pokračovat",
  exported: "Exportováno: {path}",
  upToDate: "Aktuální",
  checking: "Kontrola…",
  updateTitle: "Aktualizace: {title}",
  updateIntro: "Dovednost se změnila ve službě GitHub.",
  updateFiles: "Změněné soubory",
  changeAdded: "přidáno",
  changeRemoved: "odebráno",
  changeModified: "změněno",
  updateLocalEdits: "Vaše úpravy budou ztraceny",
  updateApply: "Aktualizovat",
  updated: "Aktualizováno",
  editorNew: "Nová dovednost",
  editorEdit: "Úprava dovednosti",
  editorView: "Obsah dovednosti",
  fieldTitle: "Nadpis",
  fieldDescription: "Popis",
  fieldDescriptionHint: "Podle tohoto popisu AI rozhoduje, kdy dovednost použít",
  fieldBody: "Pokyny",
  advanced: "Upřesnit",
  fieldName: "Název",
  nameHint: "Malá písmena bez diakritiky, číslice a spojovníky (-), nejvýše 64 znaků",
  nameAuto: "Název podle nadpisu: {name}",
  files: "Soubory dovednosti",
  filesNone: "Žádné další soubory",
  filesHint: "Tyto soubory změníte po otevření složky",
  save: "Uložit",
  saved: "Uloženo",
  createHint: "Můžete také požádat v panelu AI: „vytvoř mi dovednost, která…“",
  nameEmpty: "Zadejte název",
  nameTooLong: "Název může mít nejvýše 64 znaků",
  nameCharacters: "Jen malá písmena bez diakritiky, číslice a spojovníky (-)",
  nameHyphenEdge: "Název nesmí začínat ani končit spojovníkem",
  nameDoubleHyphen: "Název nesmí obsahovat dva spojovníky za sebou",
  nameReserved: "Tento název nelze použít",
  nameTaken: "V mých dovednostech už je dovednost s tímto názvem",
  githubTitle: "Přidat z odkazu na GitHub",
  githubLabel: "Adresa GitHub",
  githubPlaceholder: "https://github.com/vlastník/repozitář",
  githubHint: "Jen veřejné repozitáře. Vložte adresu repozitáře, složky nebo SKILL.md, případně „vlastník/repozitář“.",
  githubFind: "Najít",
  githubFetching: "Stahování ze služby GitHub…",
  importReading: "Načítání dovedností…",
  previewTitle: "Dovednosti k instalaci",
  previewFromFolder: "Nalezené dovednosti ve složce: {n}",
  previewFromZip: "Nalezené dovednosti v souboru zip: {n}",
  previewFromGitHub: "Nalezené dovednosti v {repo} ({ref}): {n}",
  previewSize: "Soubory: {n} · {size}",
  previewScripts: "Obsahuje skripty",
  previewUrls: "Webové adresy: {n}",
  previewLicense: "Licenční soubor: {name}",
  previewRootLicense: "Licenční soubor repozitáře: {name}",
  previewWarning: "Instalujte dovednosti jen ze zdrojů, kterým důvěřujete. Dovednost dává AI pokyny a v okně agenta může spouštět skripty.",
  previewInstallLabel: "Nainstalovat {title}",
  collision: "V mých dovednostech je dovednost se stejným názvem:",
  collisionReplace: "Nahradit",
  collisionSkip: "Přeskočit",
  problemDuplicate: "Nelze nainstalovat: jiná dovednost zde má stejný název",
  problemCannot: "Nelze nainstalovat: {reason}",
  install: "Nainstalovat",
  installed: "Nainstalované dovednosti: {n}",
  chooseCollision: "U každé dovednosti s obsazeným názvem zvolte Nahradit nebo Přeskočit",
  failNoSkills: "Nebyly nalezeny žádné dovednosti",
  failRepoNotFound: "Repozitář nebyl nalezen nebo není veřejný",
  failRateLimited: "GitHub na chvíli zadržuje požadavky. Zkuste to za chvíli znovu",
  failNetwork: "Nepodařilo se připojit",
  failTooLarge: "Příliš velké",
  failUnsafe: "Neprošlo bezpečnostní kontrolou. Nic nebylo nainstalováno",
  failBadAddress: "Toto není adresa GitHub",
  failBusy: "Stále probíhá jiný import nebo kontrola aktualizací",
  failNotFound: "Dovednost nebyla nalezena",
  failNotAllowed: "V tomto okně to nelze provést",
  failNotInstallable: "Tuto dovednost nelze nainstalovat",
  failNotGitHub: "Tato dovednost nebyla nainstalována ze služby GitHub",
  failTrash: "Starou dovednost nebylo možné přesunout do koše, proto zůstala zachována a nic nebylo nahrazeno",
  failHidden: "Skrytou vestavěnou dovednost nejprve znovu zobrazte, teprve pak ji zapněte",
  failEmptyTitle: "Zadejte nadpis",
  failEmptyDescription: "Zadejte popis",
  failEmptyBody: "Zadejte pokyny",
  failBadName: "Název neodpovídá pravidlům",
  failGeneric: "Nepodařilo se. Zkuste to znovu"
};
const nl = {
  navLabel: "Vaardigheden",
  intro: "Een vaardigheid is een set werkinstructies voor de AI. Roep een ingeschakelde vaardigheid aan met / of $ in het AI-paneel, of laat de AI hem zelf gebruiken wanneer dat nodig is.",
  helpLink: "Help openen",
  searchLabel: "Vaardigheden zoeken",
  searchPlaceholder: "Zoeken op titel, naam of beschrijving",
  add: "Toevoegen",
  addFolder: "Uit een map",
  addZip: "Uit een zip-bestand",
  addGitHub: "Via een GitHub-link",
  create: "Nieuwe vaardigheid",
  loading: "Laden…",
  empty: "Nog geen vaardigheden. Begin hierboven met Toevoegen of Nieuwe vaardigheid.",
  noMatch: 'Geen vaardigheden gevonden voor "{query}".',
  sourceBuiltin: "Ingebouwd",
  sourceApp: "Mijn vaardigheden",
  sourceAppGitHub: "Mijn vaardigheden · GitHub",
  sourceUser: "Claude-vaardighedenmap",
  sourcePluginGroup: "Claude-plug-ins",
  sourcePlugin: "Claude-plug-in · {plugin}",
  sourceCodex: "Codex-vaardighedenmap",
  switchLabel: "{title} inschakelen",
  invokeLabel: "{title}: wanneer gebruikt",
  invokeAuto: "AI beslist",
  invokeManual: "Alleen bij aanroepen",
  badgeTemplate: "Met sjabloon",
  badgeScripts: "Met scripts · werkt volledig in het agentvenster",
  badgeAgentOnly: "Alleen agentvenster",
  unreadableNoFrontmatter: "geen kopgegevens",
  unreadableBadName: "naam voldoet niet aan de regels",
  unreadableTooLarge: "te groot",
  unreadableUnreadable: "kan niet worden gelezen",
  unreadableNote: "Niet bruikbaar: {reason}",
  moreLabel: "Meer voor {title}",
  actView: "Inhoud bekijken",
  actEdit: "Bewerken",
  actCopy: "Kopiëren naar mijn vaardigheden",
  actExport: "Exporteren (zip)",
  actCheckUpdate: "Controleren op updates",
  actOpenFolder: "Map openen",
  actRemove: "Naar prullenbak",
  actHide: "Verbergen",
  hiddenFooter: "{n} verborgen ingebouwde vaardigheden",
  unhide: "Weer tonen",
  confirmRemove: 'De vaardigheid "{title}" naar de prullenbak verplaatsen? Je kunt hem daar terugzetten.',
  confirmHide: 'De ingebouwde vaardigheid "{title}" verbergen? Een verborgen vaardigheid wordt uitgeschakeld; je kunt hem onderaan de lijst weer tonen.',
  cancel: "Annuleren",
  close: "Sluiten",
  copied: "Kopie gemaakt en de oorspronkelijke vaardigheid uitgeschakeld",
  confirmOverwrite: "Mijn vaardigheden bevat al een vaardigheid met de naam {name}. Vervangen?",
  overwrite: "Vervangen",
  exportNotice: "Het sjabloondocument gaat ook mee in het bestand. Controleer of er geen persoonsgegevens in staan",
  exportContinue: "Doorgaan",
  exported: "Geëxporteerd: {path}",
  upToDate: "Actueel",
  checking: "Controleren…",
  updateTitle: "{title} bijwerken",
  updateIntro: "De vaardigheid is gewijzigd op GitHub.",
  updateFiles: "Gewijzigde bestanden",
  changeAdded: "toegevoegd",
  changeRemoved: "verwijderd",
  changeModified: "gewijzigd",
  updateLocalEdits: "Je eigen wijzigingen gaan verloren",
  updateApply: "Bijwerken",
  updated: "Bijgewerkt",
  editorNew: "Nieuwe vaardigheid",
  editorEdit: "Vaardigheid bewerken",
  editorView: "Inhoud van de vaardigheid",
  fieldTitle: "Titel",
  fieldDescription: "Beschrijving",
  fieldDescriptionHint: "De AI leest dit om te bepalen wanneer de vaardigheid wordt gebruikt",
  fieldBody: "Instructies",
  advanced: "Geavanceerd",
  fieldName: "Naam",
  nameHint: "Kleine letters, cijfers en koppeltekens (-), maximaal 64 tekens",
  nameAuto: "Naam op basis van de titel: {name}",
  files: "Bestanden in de vaardigheid",
  filesNone: "Geen andere bestanden",
  filesHint: "Open de map om deze bestanden te wijzigen",
  save: "Opslaan",
  saved: "Opgeslagen",
  createHint: 'Je kunt het ook in het AI-paneel vragen: "maak een vaardigheid die…"',
  nameEmpty: "Vul een naam in",
  nameTooLong: "Een naam mag maximaal 64 tekens hebben",
  nameCharacters: "Alleen kleine letters, cijfers en koppeltekens (-)",
  nameHyphenEdge: "Een naam mag niet beginnen of eindigen met een koppelteken",
  nameDoubleHyphen: "Een naam mag geen twee koppeltekens achter elkaar hebben",
  nameReserved: "Deze naam kan niet worden gebruikt",
  nameTaken: "Mijn vaardigheden bevat al een vaardigheid met deze naam",
  githubTitle: "Toevoegen via een GitHub-link",
  githubLabel: "GitHub-adres",
  githubPlaceholder: "https://github.com/eigenaar/opslagplaats",
  githubHint: 'Alleen openbare opslagplaatsen. Plak het adres van een opslagplaats, map of SKILL.md, of "eigenaar/opslagplaats".',
  githubFind: "Zoeken",
  githubFetching: "Downloaden van GitHub…",
  importReading: "Vaardigheden lezen…",
  previewTitle: "Te installeren vaardigheden",
  previewFromFolder: "{n} vaardigheden gevonden in de map",
  previewFromZip: "{n} vaardigheden gevonden in het zip-bestand",
  previewFromGitHub: "{n} vaardigheden gevonden in {repo} ({ref})",
  previewSize: "{n} bestanden · {size}",
  previewScripts: "Met scripts",
  previewUrls: "{n} webadressen",
  previewLicense: "Licentiebestand: {name}",
  previewRootLicense: "Licentiebestand van de opslagplaats: {name}",
  previewWarning: "Installeer alleen vaardigheden uit bronnen die je vertrouwt. Een vaardigheid geeft de AI instructies en kan in het agentvenster scripts uitvoeren.",
  previewInstallLabel: "{title} installeren",
  collision: "Mijn vaardigheden bevat een vaardigheid met dezelfde naam:",
  collisionReplace: "Vervangen",
  collisionSkip: "Overslaan",
  problemDuplicate: "Kan niet worden geïnstalleerd: een andere vaardigheid hier heeft dezelfde naam",
  problemCannot: "Kan niet worden geïnstalleerd: {reason}",
  install: "Installeren",
  installed: "{n} vaardigheden geïnstalleerd",
  chooseCollision: "Kies Vervangen of Overslaan voor elke vaardigheid waarvan de naam al bestaat",
  failNoSkills: "Geen vaardigheden gevonden",
  failRepoNotFound: "De opslagplaats is niet gevonden of is niet openbaar",
  failRateLimited: "GitHub houdt verzoeken even tegen. Probeer het zo opnieuw",
  failNetwork: "Kan geen verbinding maken",
  failTooLarge: "Te groot",
  failUnsafe: "De veiligheidscontrole is mislukt. Er is niets geïnstalleerd",
  failBadAddress: "Dat is geen GitHub-adres",
  failBusy: "Er loopt nog een andere import of updatecontrole",
  failNotFound: "De vaardigheid is niet gevonden",
  failNotAllowed: "Dit kan niet vanuit dit venster",
  failNotInstallable: "Deze vaardigheid kan niet worden geïnstalleerd",
  failNotGitHub: "Deze vaardigheid is niet via GitHub geïnstalleerd",
  failTrash: "De oude vaardigheid kon niet naar de prullenbak worden verplaatst. Ze is bewaard en er is niets vervangen",
  failHidden: "Toon een verborgen ingebouwde vaardigheid eerst weer voordat je hem inschakelt",
  failEmptyTitle: "Vul een titel in",
  failEmptyDescription: "Vul een beschrijving in",
  failEmptyBody: "Vul de instructies in",
  failBadName: "De naam voldoet niet aan de regels",
  failGeneric: "Dat is niet gelukt. Probeer het opnieuw"
};
const ms = {
  navLabel: "Kemahiran",
  intro: "Kemahiran ialah set arahan kerja untuk AI. Panggil kemahiran yang dihidupkan dengan / atau $ dalam panel AI, atau biarkan AI menggunakannya sendiri apabila perlu.",
  helpLink: "Buka bantuan",
  searchLabel: "Cari kemahiran",
  searchPlaceholder: "Cari mengikut tajuk, nama atau keterangan",
  add: "Tambah",
  addFolder: "Daripada folder",
  addZip: "Daripada fail zip",
  addGitHub: "Daripada pautan GitHub",
  create: "Kemahiran baharu",
  loading: "Memuatkan…",
  empty: "Belum ada kemahiran. Mulakan dengan Tambah atau Kemahiran baharu di atas.",
  noMatch: 'Tiada kemahiran yang sepadan dengan "{query}".',
  sourceBuiltin: "Terbina dalam",
  sourceApp: "Kemahiran saya",
  sourceAppGitHub: "Kemahiran saya · GitHub",
  sourceUser: "Folder kemahiran Claude",
  sourcePluginGroup: "Pemalam Claude",
  sourcePlugin: "Pemalam Claude · {plugin}",
  sourceCodex: "Folder kemahiran Codex",
  switchLabel: "Hidupkan {title}",
  invokeLabel: "{title}: bila digunakan",
  invokeAuto: "AI tentukan",
  invokeManual: "Hanya apabila dipanggil",
  badgeTemplate: "Ada templat",
  badgeScripts: "Ada skrip · berfungsi sepenuhnya dalam tetingkap ejen",
  badgeAgentOnly: "Tetingkap ejen sahaja",
  unreadableNoFrontmatter: "tiada maklumat pengepala",
  unreadableBadName: "nama tidak mematuhi peraturan",
  unreadableTooLarge: "terlalu besar",
  unreadableUnreadable: "tidak dapat dibaca",
  unreadableNote: "Tidak boleh digunakan: {reason}",
  moreLabel: "Lagi untuk {title}",
  actView: "Lihat kandungan",
  actEdit: "Sunting",
  actCopy: "Salin ke kemahiran saya",
  actExport: "Eksport (zip)",
  actCheckUpdate: "Semak kemas kini",
  actOpenFolder: "Buka folder",
  actRemove: "Alih ke tong sampah",
  actHide: "Sembunyikan",
  hiddenFooter: "{n} kemahiran terbina dalam disembunyikan",
  unhide: "Tunjukkan semula",
  confirmRemove: 'Alihkan kemahiran "{title}" ke tong sampah? Anda boleh memulihkannya dari sana.',
  confirmHide: 'Sembunyikan kemahiran terbina dalam "{title}"? Kemahiran yang disembunyikan akan dimatikan; anda boleh menunjukkannya semula di bahagian bawah senarai.',
  cancel: "Batal",
  close: "Tutup",
  copied: "Salinan dibuat dan kemahiran asal dimatikan",
  confirmOverwrite: "Kemahiran saya sudah ada kemahiran bernama {name}. Gantikan?",
  overwrite: "Gantikan",
  exportNotice: "Dokumen templat turut dimasukkan ke dalam fail. Pastikan ia tidak mengandungi maklumat peribadi",
  exportContinue: "Teruskan",
  exported: "Dieksport: {path}",
  upToDate: "Terkini",
  checking: "Menyemak…",
  updateTitle: "Kemas kini {title}",
  updateIntro: "Kemahiran ini telah berubah di GitHub.",
  updateFiles: "Fail yang berubah",
  changeAdded: "ditambah",
  changeRemoved: "dibuang",
  changeModified: "diubah",
  updateLocalEdits: "Suntingan anda sendiri akan hilang",
  updateApply: "Kemas kini",
  updated: "Dikemas kini",
  editorNew: "Kemahiran baharu",
  editorEdit: "Sunting kemahiran",
  editorView: "Kandungan kemahiran",
  fieldTitle: "Tajuk",
  fieldDescription: "Keterangan",
  fieldDescriptionHint: "AI membaca ini untuk menentukan bila hendak menggunakan kemahiran",
  fieldBody: "Arahan",
  advanced: "Lanjutan",
  fieldName: "Nama",
  nameHint: "Huruf kecil, digit dan tanda sempang (-), sehingga 64 aksara",
  nameAuto: "Nama daripada tajuk: {name}",
  files: "Fail dalam kemahiran",
  filesNone: "Tiada fail lain",
  filesHint: "Buka folder untuk mengubah fail ini",
  save: "Simpan",
  saved: "Disimpan",
  createHint: 'Anda juga boleh meminta dalam panel AI: "buatkan saya kemahiran yang…"',
  nameEmpty: "Masukkan nama",
  nameTooLong: "Nama boleh sehingga 64 aksara",
  nameCharacters: "Hanya huruf kecil, digit dan tanda sempang (-)",
  nameHyphenEdge: "Nama tidak boleh bermula atau berakhir dengan tanda sempang",
  nameDoubleHyphen: "Nama tidak boleh mempunyai dua tanda sempang berturut-turut",
  nameReserved: "Nama ini tidak boleh digunakan",
  nameTaken: "Kemahiran saya sudah ada kemahiran dengan nama ini",
  githubTitle: "Tambah daripada pautan GitHub",
  githubLabel: "Alamat GitHub",
  githubPlaceholder: "https://github.com/pemilik/repositori",
  githubHint: 'Repositori awam sahaja. Tampal alamat repositori, folder atau SKILL.md, atau "pemilik/repositori".',
  githubFind: "Cari",
  githubFetching: "Memuat turun dari GitHub…",
  importReading: "Membaca kemahiran…",
  previewTitle: "Kemahiran untuk dipasang",
  previewFromFolder: "{n} kemahiran ditemui dalam folder",
  previewFromZip: "{n} kemahiran ditemui dalam fail zip",
  previewFromGitHub: "{n} kemahiran ditemui dalam {repo} ({ref})",
  previewSize: "{n} fail · {size}",
  previewScripts: "Ada skrip",
  previewUrls: "{n} alamat web",
  previewLicense: "Fail lesen: {name}",
  previewRootLicense: "Fail lesen repositori: {name}",
  previewWarning: "Pasang kemahiran hanya daripada sumber yang anda percayai. Kemahiran memberi arahan kepada AI, dan dalam tetingkap ejen ia boleh menjalankan skrip.",
  previewInstallLabel: "Pasang {title}",
  collision: "Kemahiran saya ada kemahiran dengan nama yang sama:",
  collisionReplace: "Gantikan",
  collisionSkip: "Langkau",
  problemDuplicate: "Tidak boleh dipasang: ada kemahiran lain di sini dengan nama yang sama",
  problemCannot: "Tidak boleh dipasang: {reason}",
  install: "Pasang",
  installed: "{n} kemahiran dipasang",
  chooseCollision: "Pilih Gantikan atau Langkau bagi setiap kemahiran yang namanya sudah digunakan",
  failNoSkills: "Tiada kemahiran ditemui",
  failRepoNotFound: "Repositori tidak ditemui atau bukan awam",
  failRateLimited: "GitHub sedang menahan permintaan buat seketika. Cuba lagi sebentar nanti",
  failNetwork: "Tidak dapat menyambung",
  failTooLarge: "Terlalu besar",
  failUnsafe: "Gagal semakan keselamatan. Tiada apa-apa yang dipasang",
  failBadAddress: "Itu bukan alamat GitHub",
  failBusy: "Import atau semakan kemas kini lain masih berjalan",
  failNotFound: "Kemahiran tidak ditemui",
  failNotAllowed: "Ini tidak boleh dilakukan dari tetingkap ini",
  failNotInstallable: "Kemahiran ini tidak boleh dipasang",
  failNotGitHub: "Kemahiran ini tidak dipasang daripada GitHub",
  failTrash: "Kemahiran lama tidak dapat dialihkan ke tong sampah, jadi ia disimpan dan tiada apa-apa diganti",
  failHidden: "Tunjukkan semula kemahiran terbina dalam yang disembunyikan sebelum menghidupkannya",
  failEmptyTitle: "Masukkan tajuk",
  failEmptyDescription: "Masukkan keterangan",
  failEmptyBody: "Masukkan arahan",
  failBadName: "Nama tidak mematuhi peraturan",
  failGeneric: "Tidak berjaya. Cuba lagi"
};
const he = {
  navLabel: "מיומנויות",
  intro: "מיומנות היא מערכת הוראות עבודה ל-AI. אפשר לקרוא למיומנות מופעלת עם / או $ בחלונית ה-AI, או לתת ל-AI להשתמש בה בעצמו כשצריך.",
  helpLink: "פתיחת העזרה",
  searchLabel: "חיפוש מיומנויות",
  searchPlaceholder: "חיפוש לפי כותרת, שם או תיאור",
  add: "הוספה",
  addFolder: "מתיקייה",
  addZip: "מקובץ zip",
  addGitHub: "מקישור GitHub",
  create: "מיומנות חדשה",
  loading: "בטעינה…",
  empty: "אין עדיין מיומנויות. אפשר להתחיל עם הוספה או מיומנות חדשה למעלה.",
  noMatch: 'אין מיומנויות שמתאימות ל-"{query}".',
  sourceBuiltin: "מובנית",
  sourceApp: "המיומנויות שלי",
  sourceAppGitHub: "המיומנויות שלי · GitHub",
  sourceUser: "תיקיית המיומנויות של Claude",
  sourcePluginGroup: "תוספים של Claude",
  sourcePlugin: "תוסף של Claude · {plugin}",
  sourceCodex: "תיקיית המיומנויות של Codex",
  switchLabel: "הפעלת {title}",
  invokeLabel: "{title}: מתי משתמשים בה",
  invokeAuto: "ה-AI מחליט",
  invokeManual: "רק כשקוראים לה",
  badgeTemplate: "כוללת תבנית",
  badgeScripts: "כוללת סקריפטים · פועלת במלואה בחלון הסוכן",
  badgeAgentOnly: "בחלון הסוכן בלבד",
  unreadableNoFrontmatter: "חסרים נתוני כותרת",
  unreadableBadName: "השם לא עומד בכללים",
  unreadableTooLarge: "גדולה מדי",
  unreadableUnreadable: "אי אפשר לקרוא אותה",
  unreadableNote: "אי אפשר להשתמש: {reason}",
  moreLabel: "עוד עבור {title}",
  actView: "הצגת התוכן",
  actEdit: "עריכה",
  actCopy: "העתקה למיומנויות שלי",
  actExport: "ייצוא (zip)",
  actCheckUpdate: "בדיקת עדכונים",
  actOpenFolder: "פתיחת התיקייה",
  actRemove: "העברה לאשפה",
  actHide: "הסתרה",
  hiddenFooter: "{n} מיומנויות מובנות מוסתרות",
  unhide: "הצגה מחדש",
  confirmRemove: 'להעביר את המיומנות "{title}" לאשפה? אפשר לשחזר אותה משם.',
  confirmHide: 'להסתיר את המיומנות המובנית "{title}"? מיומנות מוסתרת מכובה; אפשר להציג אותה שוב בתחתית הרשימה.',
  cancel: "ביטול",
  close: "סגירה",
  copied: "נוצר עותק והמיומנות המקורית כובתה",
  confirmOverwrite: "במיומנויות שלי כבר יש מיומנות בשם {name}. להחליף אותה?",
  overwrite: "החלפה",
  exportNotice: "גם מסמך התבנית נכלל בקובץ. כדאי לוודא שאין בו מידע אישי",
  exportContinue: "המשך",
  exported: "הייצוא הושלם: {path}",
  upToDate: "מעודכנת",
  checking: "בבדיקה…",
  updateTitle: "עדכון {title}",
  updateIntro: "המיומנות השתנתה ב-GitHub.",
  updateFiles: "קבצים שהשתנו",
  changeAdded: "נוסף",
  changeRemoved: "הוסר",
  changeModified: "השתנה",
  updateLocalEdits: "השינויים שעשית בעצמך יאבדו",
  updateApply: "עדכון",
  updated: "העדכון הושלם",
  editorNew: "מיומנות חדשה",
  editorEdit: "עריכת מיומנות",
  editorView: "תוכן המיומנות",
  fieldTitle: "כותרת",
  fieldDescription: "תיאור",
  fieldDescriptionHint: "ה-AI קורא את זה כדי להחליט מתי להשתמש במיומנות",
  fieldBody: "הוראות",
  advanced: "מתקדם",
  fieldName: "שם",
  nameHint: "אותיות אנגליות קטנות, ספרות ומקפים (-), עד 64 תווים",
  nameAuto: "שם לפי הכותרת: {name}",
  files: "קבצים במיומנות",
  filesNone: "אין קבצים נוספים",
  filesHint: "כדי לשנות את הקבצים האלה, פותחים את התיקייה",
  save: "שמירה",
  saved: "נשמר",
  createHint: 'אפשר גם לבקש בחלונית ה-AI: "תכין לי מיומנות ש…"',
  nameEmpty: "נא להזין שם",
  nameTooLong: "השם יכול להכיל עד 64 תווים",
  nameCharacters: "רק אותיות אנגליות קטנות, ספרות ומקפים (-)",
  nameHyphenEdge: "השם לא יכול להתחיל או להסתיים במקף",
  nameDoubleHyphen: "השם לא יכול לכלול שני מקפים ברצף",
  nameReserved: "אי אפשר להשתמש בשם הזה",
  nameTaken: "במיומנויות שלי כבר יש מיומנות בשם הזה",
  githubTitle: "הוספה מקישור GitHub",
  githubLabel: "כתובת GitHub",
  githubPlaceholder: "https://github.com/בעלים/מאגר",
  githubHint: 'מאגרים ציבוריים בלבד. אפשר להדביק כתובת של מאגר, תיקייה או SKILL.md, או "בעלים/מאגר".',
  githubFind: "חיפוש",
  githubFetching: "בהורדה מ-GitHub…",
  importReading: "קריאת המיומנויות…",
  previewTitle: "מיומנויות להתקנה",
  previewFromFolder: "נמצאו {n} מיומנויות בתיקייה",
  previewFromZip: "נמצאו {n} מיומנויות בקובץ ה-zip",
  previewFromGitHub: "נמצאו {n} מיומנויות ב-{repo} ({ref})",
  previewSize: "{n} קבצים · {size}",
  previewScripts: "כוללת סקריפטים",
  previewUrls: "{n} כתובות אינטרנט",
  previewLicense: "קובץ רישיון: {name}",
  previewRootLicense: "קובץ הרישיון של המאגר: {name}",
  previewWarning: "יש להתקין מיומנויות רק ממקורות מהימנים. מיומנות נותנת הוראות ל-AI, ובחלון הסוכן היא יכולה להריץ סקריפטים.",
  previewInstallLabel: "התקנת {title}",
  collision: "במיומנויות שלי יש מיומנות עם אותו שם:",
  collisionReplace: "החלפה",
  collisionSkip: "דילוג",
  problemDuplicate: "אי אפשר להתקין: יש כאן מיומנות אחרת עם אותו שם",
  problemCannot: "אי אפשר להתקין: {reason}",
  install: "התקנה",
  installed: "הותקנו {n} מיומנויות",
  chooseCollision: "יש לבחור החלפה או דילוג לכל מיומנות ששמה כבר תפוס",
  failNoSkills: "לא נמצאו מיומנויות",
  failRepoNotFound: "המאגר לא נמצא או שאינו ציבורי",
  failRateLimited: "GitHub מעכב בקשות לרגע. נסו שוב בעוד זמן קצר",
  failNetwork: "לא ניתן להתחבר",
  failTooLarge: "גדול מדי",
  failUnsafe: "בדיקת הבטיחות נכשלה. שום דבר לא הותקן",
  failBadAddress: "זו לא כתובת GitHub",
  failBusy: "ייבוא או בדיקת עדכונים אחרים עדיין פועלים",
  failNotFound: "המיומנות לא נמצאה",
  failNotAllowed: "אי אפשר לעשות את זה מהחלון הזה",
  failNotInstallable: "אי אפשר להתקין את המיומנות הזו",
  failNotGitHub: "המיומנות הזו לא הותקנה מ-GitHub",
  failTrash: "לא ניתן היה להעביר את המיומנות הישנה לאשפה, ולכן היא נשמרה ושום דבר לא הוחלף",
  failHidden: "כדי להפעיל מיומנות מובנית מוסתרת, צריך קודם להציג אותה מחדש",
  failEmptyTitle: "נא להזין כותרת",
  failEmptyDescription: "נא להזין תיאור",
  failEmptyBody: "נא להזין הוראות",
  failBadName: "השם לא עומד בכללים",
  failGeneric: "הפעולה לא הצליחה. נסו שוב"
};
const hi = {
  navLabel: "कौशल",
  intro: "कौशल AI के लिए काम के निर्देशों का एक सेट है। चालू किए गए कौशल को AI पैनल में / या $ से बुलाएँ, या ज़रूरत पड़ने पर AI को उसे खुद इस्तेमाल करने दें।",
  helpLink: "सहायता खोलें",
  searchLabel: "कौशल खोजें",
  searchPlaceholder: "शीर्षक, नाम या विवरण से खोजें",
  add: "जोड़ें",
  addFolder: "फ़ोल्डर से",
  addZip: "zip फ़ाइल से",
  addGitHub: "GitHub लिंक से",
  create: "नया कौशल",
  loading: "लोड हो रहा है…",
  empty: "अभी कोई कौशल नहीं है। ऊपर जोड़ें या नया कौशल से शुरू करें।",
  noMatch: '"{query}" से मेल खाता कोई कौशल नहीं है।',
  sourceBuiltin: "अंतर्निहित",
  sourceApp: "मेरे कौशल",
  sourceAppGitHub: "मेरे कौशल · GitHub",
  sourceUser: "Claude कौशल फ़ोल्डर",
  sourcePluginGroup: "Claude प्लग-इन",
  sourcePlugin: "Claude प्लग-इन · {plugin}",
  sourceCodex: "Codex कौशल फ़ोल्डर",
  switchLabel: "{title} चालू करें",
  invokeLabel: "{title}: कब इस्तेमाल हो",
  invokeAuto: "AI तय करे",
  invokeManual: "सिर्फ़ बुलाने पर",
  badgeTemplate: "टेम्पलेट शामिल",
  badgeScripts: "स्क्रिप्ट शामिल · एजेंट विंडो में पूरी तरह काम करता है",
  badgeAgentOnly: "सिर्फ़ एजेंट विंडो",
  unreadableNoFrontmatter: "शुरुआती जानकारी नहीं है",
  unreadableBadName: "नाम नियमों के अनुसार नहीं है",
  unreadableTooLarge: "बहुत बड़ा",
  unreadableUnreadable: "पढ़ा नहीं जा सकता",
  unreadableNote: "इस्तेमाल नहीं किया जा सकता: {reason}",
  moreLabel: "{title} के लिए और विकल्प",
  actView: "सामग्री देखें",
  actEdit: "संपादित करें",
  actCopy: "मेरे कौशल में कॉपी करें",
  actExport: "निर्यात करें (zip)",
  actCheckUpdate: "अपडेट जाँचें",
  actOpenFolder: "फ़ोल्डर खोलें",
  actRemove: "ट्रैश में ले जाएँ",
  actHide: "छिपाएँ",
  hiddenFooter: "{n} छिपे हुए अंतर्निहित कौशल",
  unhide: "फिर से दिखाएँ",
  confirmRemove: 'कौशल "{title}" को ट्रैश में ले जाएँ? आप उसे वहाँ से वापस ला सकते हैं।',
  confirmHide: 'अंतर्निहित कौशल "{title}" को छिपाएँ? छिपा हुआ कौशल बंद हो जाता है; आप उसे सूची में सबसे नीचे से फिर से दिखा सकते हैं।',
  cancel: "रद्द करें",
  close: "बंद करें",
  copied: "कॉपी बना दी गई और मूल कौशल बंद कर दिया गया",
  confirmOverwrite: "मेरे कौशल में {name} नाम का कौशल पहले से है। उसे बदलें?",
  overwrite: "बदलें",
  exportNotice: "टेम्पलेट दस्तावेज़ भी फ़ाइल में शामिल होगा। जाँच लें कि उसमें कोई निजी जानकारी नहीं है",
  exportContinue: "जारी रखें",
  exported: "निर्यात हो गया: {path}",
  upToDate: "नवीनतम है",
  checking: "जाँच हो रही है…",
  updateTitle: "{title} अपडेट करें",
  updateIntro: "GitHub पर यह कौशल बदल गया है।",
  updateFiles: "बदली गई फ़ाइलें",
  changeAdded: "जोड़ा गया",
  changeRemoved: "हटाया गया",
  changeModified: "बदला गया",
  updateLocalEdits: "आपके अपने बदलाव मिट जाएँगे",
  updateApply: "अपडेट करें",
  updated: "अपडेट हो गया",
  editorNew: "नया कौशल",
  editorEdit: "कौशल संपादित करें",
  editorView: "कौशल की सामग्री",
  fieldTitle: "शीर्षक",
  fieldDescription: "विवरण",
  fieldDescriptionHint: "AI इसे पढ़कर तय करता है कि कौशल कब इस्तेमाल करना है",
  fieldBody: "निर्देश",
  advanced: "उन्नत",
  fieldName: "नाम",
  nameHint: "छोटे अंग्रेज़ी अक्षर, अंक और हाइफ़न (-), अधिकतम 64 वर्ण",
  nameAuto: "शीर्षक से बना नाम: {name}",
  files: "कौशल की फ़ाइलें",
  filesNone: "कोई और फ़ाइल नहीं",
  filesHint: "इन फ़ाइलों को बदलने के लिए फ़ोल्डर खोलें",
  save: "सहेजें",
  saved: "सहेजा गया",
  createHint: 'आप AI पैनल में भी कह सकते हैं: "मेरे लिए ऐसा कौशल बनाओ जो…"',
  nameEmpty: "नाम लिखें",
  nameTooLong: "नाम अधिकतम 64 वर्ण का हो सकता है",
  nameCharacters: "सिर्फ़ छोटे अंग्रेज़ी अक्षर, अंक और हाइफ़न (-)",
  nameHyphenEdge: "नाम हाइफ़न से शुरू या खत्म नहीं हो सकता",
  nameDoubleHyphen: "नाम में लगातार दो हाइफ़न नहीं हो सकते",
  nameReserved: "यह नाम इस्तेमाल नहीं किया जा सकता",
  nameTaken: "मेरे कौशल में इस नाम का कौशल पहले से है",
  githubTitle: "GitHub लिंक से जोड़ें",
  githubLabel: "GitHub पता",
  githubPlaceholder: "https://github.com/मालिक/रिपॉज़िटरी",
  githubHint: 'सिर्फ़ सार्वजनिक रिपॉज़िटरी। किसी रिपॉज़िटरी, फ़ोल्डर या SKILL.md का पता, या "मालिक/रिपॉज़िटरी" चिपकाएँ।',
  githubFind: "खोजें",
  githubFetching: "GitHub से डाउनलोड हो रहा है…",
  importReading: "कौशल पढ़े जा रहे हैं…",
  previewTitle: "इंस्टॉल होने वाले कौशल",
  previewFromFolder: "फ़ोल्डर में {n} कौशल मिले",
  previewFromZip: "zip फ़ाइल में {n} कौशल मिले",
  previewFromGitHub: "{repo} ({ref}) में {n} कौशल मिले",
  previewSize: "{n} फ़ाइलें · {size}",
  previewScripts: "स्क्रिप्ट शामिल",
  previewUrls: "{n} वेब पते",
  previewLicense: "लाइसेंस फ़ाइल: {name}",
  previewRootLicense: "रिपॉज़िटरी की लाइसेंस फ़ाइल: {name}",
  previewWarning: "सिर्फ़ भरोसेमंद स्रोतों से कौशल इंस्टॉल करें। कौशल AI को निर्देश देता है, और एजेंट विंडो में स्क्रिप्ट चला सकता है।",
  previewInstallLabel: "{title} इंस्टॉल करें",
  collision: "मेरे कौशल में इसी नाम का कौशल है:",
  collisionReplace: "बदलें",
  collisionSkip: "छोड़ें",
  problemDuplicate: "इंस्टॉल नहीं किया जा सकता: यहाँ इसी नाम का एक और कौशल है",
  problemCannot: "इंस्टॉल नहीं किया जा सकता: {reason}",
  install: "इंस्टॉल करें",
  installed: "{n} कौशल इंस्टॉल किए गए",
  chooseCollision: "जिन कौशलों का नाम पहले से मौजूद है, हर एक के लिए बदलें या छोड़ें चुनें",
  failNoSkills: "कोई कौशल नहीं मिला",
  failRepoNotFound: "रिपॉज़िटरी नहीं मिली या सार्वजनिक नहीं है",
  failRateLimited: "GitHub ने कुछ देर के लिए अनुरोध रोक दिए हैं। थोड़ी देर बाद फिर कोशिश करें",
  failNetwork: "कनेक्ट नहीं हो सका",
  failTooLarge: "बहुत बड़ा",
  failUnsafe: "सुरक्षा जाँच में विफल। कुछ भी इंस्टॉल नहीं किया गया",
  failBadAddress: "यह GitHub पता नहीं है",
  failBusy: "कोई और आयात या अपडेट जाँच अभी चल रही है",
  failNotFound: "कौशल नहीं मिला",
  failNotAllowed: "यह काम इस विंडो से नहीं हो सकता",
  failNotInstallable: "यह कौशल इंस्टॉल नहीं किया जा सकता",
  failNotGitHub: "यह कौशल GitHub से इंस्टॉल नहीं किया गया था",
  failTrash: "पुराना कौशल ट्रैश में नहीं ले जाया जा सका, इसलिए उसे रखा गया और कुछ भी नहीं बदला गया",
  failHidden: "छिपे हुए अंतर्निहित कौशल को चालू करने से पहले उसे फिर से दिखाएँ",
  failEmptyTitle: "शीर्षक लिखें",
  failEmptyDescription: "विवरण लिखें",
  failEmptyBody: "निर्देश लिखें",
  failBadName: "नाम नियमों के अनुसार नहीं है",
  failGeneric: "यह नहीं हो सका। फिर से कोशिश करें"
};
const zhTW = {
  navLabel: "技能",
  intro: "技能是交給 AI 的工作說明。已開啟的技能可在 AI 面板中用 / 或 $ 呼叫，AI 也會在需要時自行使用。",
  helpLink: "查看說明",
  searchLabel: "尋找技能",
  searchPlaceholder: "依標題、名稱、說明搜尋",
  add: "新增",
  addFolder: "從資料夾",
  addZip: "從 zip 檔案",
  addGitHub: "從 GitHub 連結",
  create: "建立技能",
  loading: "載入中…",
  empty: "還沒有技能。請從上方的「新增」或「建立技能」開始。",
  noMatch: "沒有符合「{query}」的技能。",
  sourceBuiltin: "內建",
  sourceApp: "我的技能",
  sourceAppGitHub: "我的技能 · GitHub",
  sourceUser: "Claude 技能資料夾",
  sourcePluginGroup: "Claude 外掛程式",
  sourcePlugin: "Claude 外掛程式 · {plugin}",
  sourceCodex: "Codex 技能資料夾",
  switchLabel: "開啟 {title}",
  invokeLabel: "{title}：使用時機",
  invokeAuto: "自動使用",
  invokeManual: "僅在呼叫時",
  badgeTemplate: "含範本",
  badgeScripts: "含指令碼 · 在代理程式視窗中完整運作",
  badgeAgentOnly: "僅限代理程式視窗",
  unreadableNoFrontmatter: "缺少前置資訊",
  unreadableBadName: "名稱不符合規則",
  unreadableTooLarge: "過大",
  unreadableUnreadable: "無法讀取",
  unreadableNote: "無法使用：{reason}",
  moreLabel: "{title} 的更多操作",
  actView: "查看內容",
  actEdit: "直接修改",
  actCopy: "複製到我的技能",
  actExport: "匯出（zip）",
  actCheckUpdate: "檢查更新",
  actOpenFolder: "開啟資料夾",
  actRemove: "移到資源回收筒",
  actHide: "隱藏",
  hiddenFooter: "已隱藏的內建技能 {n} 個",
  unhide: "重新顯示",
  confirmRemove: "要將技能「{title}」移到資源回收筒嗎？可以從資源回收筒還原。",
  confirmHide: "要隱藏內建技能「{title}」嗎？隱藏後會關閉，可在清單底部重新顯示。",
  cancel: "取消",
  close: "關閉",
  copied: "已建立副本，並關閉了原技能",
  confirmOverwrite: "我的技能中已有同名技能（{name}）。要覆寫嗎？",
  overwrite: "覆寫",
  exportNotice: "範本文件會一併打包。請確認文件中沒有個人資料",
  exportContinue: "繼續",
  exported: "已匯出：{path}",
  upToDate: "已是最新版本",
  checking: "正在檢查…",
  updateTitle: "更新 {title}",
  updateIntro: "GitHub 上的內容有變更。",
  updateFiles: "有變更的檔案",
  changeAdded: "新增",
  changeRemoved: "刪除",
  changeModified: "修改",
  updateLocalEdits: "你所做的修改將會遺失",
  updateApply: "更新",
  updated: "已更新",
  editorNew: "新技能",
  editorEdit: "修改技能",
  editorView: "技能內容",
  fieldTitle: "標題",
  fieldDescription: "說明",
  fieldDescriptionHint: "AI 會根據這段說明決定是否使用此技能",
  fieldBody: "內文",
  advanced: "進階",
  fieldName: "名稱",
  nameHint: "小寫英文字母、數字和連字號（-），最多 64 個字元",
  nameAuto: "依標題產生的名稱：{name}",
  files: "附帶檔案",
  filesNone: "沒有附帶檔案",
  filesHint: "附帶檔案請開啟資料夾修改",
  save: "儲存",
  saved: "已儲存",
  createHint: "也可以在 AI 面板中說「幫我做一個這樣的技能」來建立",
  nameEmpty: "請輸入名稱",
  nameTooLong: "名稱最多 64 個字元",
  nameCharacters: "只能使用小寫英文字母、數字和連字號（-）",
  nameHyphenEdge: "名稱不能以連字號開頭或結尾",
  nameDoubleHyphen: "不能連續使用兩個連字號",
  nameReserved: "此名稱無法使用",
  nameTaken: "我的技能中已有同名技能",
  githubTitle: "從 GitHub 連結新增",
  githubLabel: "GitHub 網址",
  githubPlaceholder: "https://github.com/擁有者/儲存庫",
  githubHint: "僅支援公開儲存庫。請填入儲存庫、資料夾或 SKILL.md 的網址，或「擁有者/儲存庫」。",
  githubFind: "尋找",
  githubFetching: "正在從 GitHub 下載…",
  importReading: "正在讀取技能…",
  previewTitle: "要安裝的技能",
  previewFromFolder: "在資料夾中找到 {n} 個技能",
  previewFromZip: "在 zip 檔案中找到 {n} 個技能",
  previewFromGitHub: "在 {repo}（{ref}）中找到 {n} 個技能",
  previewSize: "{n} 個檔案 · {size}",
  previewScripts: "含指令碼",
  previewUrls: "網址 {n} 個",
  previewLicense: "授權檔案：{name}",
  previewRootLicense: "儲存庫授權檔案：{name}",
  previewWarning: "只安裝來自可信來源的技能。技能會向 AI 下達指示，在代理程式視窗中還可以執行指令碼。",
  previewInstallLabel: "安裝 {title}",
  collision: "我的技能中有同名技能：",
  collisionReplace: "取代",
  collisionSkip: "略過",
  problemDuplicate: "這裡還有同名技能，無法安裝",
  problemCannot: "無法安裝：{reason}",
  install: "安裝",
  installed: "已安裝 {n} 個技能",
  chooseCollision: "請為每個名稱重複的技能選擇取代或略過",
  failNoSkills: "找不到技能",
  failRepoNotFound: "找不到該儲存庫，或儲存庫未公開",
  failRateLimited: "GitHub 暫時限制了請求，請稍後再試",
  failNetwork: "無法連線",
  failTooLarge: "過大",
  failUnsafe: "未通過安全檢查，沒有安裝任何內容",
  failBadAddress: "這不是 GitHub 網址",
  failBusy: "另一個匯入或更新檢查仍在進行中",
  failNotFound: "找不到該技能",
  failNotAllowed: "無法在此視窗中執行",
  failNotInstallable: "此技能無法安裝",
  failNotGitHub: "此技能不是從 GitHub 安裝的",
  failTrash: "無法將舊技能移到資源回收筒，因此保留原樣，沒有取代任何內容",
  failHidden: "隱藏的內建技能需要先重新顯示才能開啟",
  failEmptyTitle: "請輸入標題",
  failEmptyDescription: "請輸入說明",
  failEmptyBody: "請輸入內文",
  failBadName: "名稱不符合規則",
  failGeneric: "操作未完成，請再試一次"
};
const vi = {
  navLabel: "Kỹ năng",
  intro: "Kỹ năng là bộ hướng dẫn công việc dành cho AI. Gọi kỹ năng đã bật bằng / hoặc $ trong bảng AI, hoặc để AI tự dùng khi cần.",
  helpLink: "Mở trợ giúp",
  searchLabel: "Tìm kỹ năng",
  searchPlaceholder: "Tìm theo tiêu đề, tên hoặc mô tả",
  add: "Thêm",
  addFolder: "Từ thư mục",
  addZip: "Từ tệp zip",
  addGitHub: "Từ liên kết GitHub",
  create: "Kỹ năng mới",
  loading: "Đang tải…",
  empty: "Chưa có kỹ năng nào. Hãy bắt đầu với Thêm hoặc Kỹ năng mới ở trên.",
  noMatch: 'Không có kỹ năng nào khớp với "{query}".',
  sourceBuiltin: "Có sẵn",
  sourceApp: "Kỹ năng của tôi",
  sourceAppGitHub: "Kỹ năng của tôi · GitHub",
  sourceUser: "Thư mục kỹ năng Claude",
  sourcePluginGroup: "Phần bổ trợ Claude",
  sourcePlugin: "Phần bổ trợ Claude · {plugin}",
  sourceCodex: "Thư mục kỹ năng Codex",
  switchLabel: "Bật {title}",
  invokeLabel: "{title}: khi nào được dùng",
  invokeAuto: "AI tự quyết định",
  invokeManual: "Chỉ khi được gọi",
  badgeTemplate: "Có mẫu",
  badgeScripts: "Có tập lệnh · hoạt động đầy đủ trong cửa sổ tác tử",
  badgeAgentOnly: "Chỉ trong cửa sổ tác tử",
  unreadableNoFrontmatter: "thiếu phần thông tin đầu",
  unreadableBadName: "tên không đúng quy tắc",
  unreadableTooLarge: "quá lớn",
  unreadableUnreadable: "không đọc được",
  unreadableNote: "Không dùng được: {reason}",
  moreLabel: "Thêm tùy chọn cho {title}",
  actView: "Xem nội dung",
  actEdit: "Chỉnh sửa",
  actCopy: "Sao chép vào kỹ năng của tôi",
  actExport: "Xuất (zip)",
  actCheckUpdate: "Kiểm tra cập nhật",
  actOpenFolder: "Mở thư mục",
  actRemove: "Chuyển vào thùng rác",
  actHide: "Ẩn",
  hiddenFooter: "{n} kỹ năng có sẵn đã ẩn",
  unhide: "Hiện lại",
  confirmRemove: 'Chuyển kỹ năng "{title}" vào thùng rác? Bạn có thể khôi phục từ đó.',
  confirmHide: 'Ẩn kỹ năng có sẵn "{title}"? Kỹ năng bị ẩn sẽ bị tắt; bạn có thể hiện lại ở cuối danh sách.',
  cancel: "Hủy",
  close: "Đóng",
  copied: "Đã tạo bản sao và tắt kỹ năng gốc",
  confirmOverwrite: "Kỹ năng của tôi đã có kỹ năng tên {name}. Thay thế?",
  overwrite: "Thay thế",
  exportNotice: "Tài liệu mẫu cũng được đưa vào tệp. Hãy kiểm tra để chắc chắn không có thông tin cá nhân",
  exportContinue: "Tiếp tục",
  exported: "Đã xuất: {path}",
  upToDate: "Đã là bản mới nhất",
  checking: "Đang kiểm tra…",
  updateTitle: "Cập nhật {title}",
  updateIntro: "Kỹ năng đã thay đổi trên GitHub.",
  updateFiles: "Tệp đã thay đổi",
  changeAdded: "đã thêm",
  changeRemoved: "đã xóa",
  changeModified: "đã sửa",
  updateLocalEdits: "Những chỉnh sửa của bạn sẽ bị mất",
  updateApply: "Cập nhật",
  updated: "Đã cập nhật",
  editorNew: "Kỹ năng mới",
  editorEdit: "Sửa kỹ năng",
  editorView: "Nội dung kỹ năng",
  fieldTitle: "Tiêu đề",
  fieldDescription: "Mô tả",
  fieldDescriptionHint: "AI đọc phần này để quyết định khi nào dùng kỹ năng",
  fieldBody: "Hướng dẫn",
  advanced: "Nâng cao",
  fieldName: "Tên",
  nameHint: "Chữ thường tiếng Anh, chữ số và dấu gạch nối (-), tối đa 64 ký tự",
  nameAuto: "Tên lấy từ tiêu đề: {name}",
  files: "Tệp trong kỹ năng",
  filesNone: "Không có tệp nào khác",
  filesHint: "Mở thư mục để sửa các tệp này",
  save: "Lưu",
  saved: "Đã lưu",
  createHint: 'Bạn cũng có thể nhờ trong bảng AI: "tạo cho tôi một kỹ năng…"',
  nameEmpty: "Nhập tên",
  nameTooLong: "Tên tối đa 64 ký tự",
  nameCharacters: "Chỉ dùng chữ thường tiếng Anh, chữ số và dấu gạch nối (-)",
  nameHyphenEdge: "Tên không được bắt đầu hoặc kết thúc bằng dấu gạch nối",
  nameDoubleHyphen: "Tên không được có hai dấu gạch nối liền nhau",
  nameReserved: "Không thể dùng tên này",
  nameTaken: "Kỹ năng của tôi đã có kỹ năng trùng tên này",
  githubTitle: "Thêm từ liên kết GitHub",
  githubLabel: "Địa chỉ GitHub",
  githubPlaceholder: "https://github.com/chủ-sở-hữu/kho",
  githubHint: 'Chỉ kho công khai. Dán địa chỉ của kho, thư mục hoặc SKILL.md, hoặc "chủ-sở-hữu/kho".',
  githubFind: "Tìm",
  githubFetching: "Đang tải xuống từ GitHub…",
  importReading: "Đang đọc kỹ năng…",
  previewTitle: "Kỹ năng sẽ cài đặt",
  previewFromFolder: "Tìm thấy {n} kỹ năng trong thư mục",
  previewFromZip: "Tìm thấy {n} kỹ năng trong tệp zip",
  previewFromGitHub: "Tìm thấy {n} kỹ năng trong {repo} ({ref})",
  previewSize: "{n} tệp · {size}",
  previewScripts: "Có tập lệnh",
  previewUrls: "{n} địa chỉ web",
  previewLicense: "Tệp giấy phép: {name}",
  previewRootLicense: "Tệp giấy phép của kho: {name}",
  previewWarning: "Chỉ cài kỹ năng từ nguồn bạn tin cậy. Kỹ năng đưa chỉ dẫn cho AI và có thể chạy tập lệnh trong cửa sổ tác tử.",
  previewInstallLabel: "Cài đặt {title}",
  collision: "Kỹ năng của tôi đã có kỹ năng cùng tên:",
  collisionReplace: "Thay thế",
  collisionSkip: "Bỏ qua",
  problemDuplicate: "Không thể cài đặt: ở đây có một kỹ năng khác trùng tên",
  problemCannot: "Không thể cài đặt: {reason}",
  install: "Cài đặt",
  installed: "Đã cài đặt {n} kỹ năng",
  chooseCollision: "Chọn Thay thế hoặc Bỏ qua cho từng kỹ năng bị trùng tên",
  failNoSkills: "Không tìm thấy kỹ năng nào",
  failRepoNotFound: "Không tìm thấy kho hoặc kho không công khai",
  failRateLimited: "GitHub đang tạm chặn yêu cầu. Hãy thử lại sau ít phút",
  failNetwork: "Không thể kết nối",
  failTooLarge: "Quá lớn",
  failUnsafe: "Không qua được kiểm tra an toàn. Chưa có gì được cài đặt",
  failBadAddress: "Đó không phải là địa chỉ GitHub",
  failBusy: "Một lần nhập hoặc kiểm tra cập nhật khác vẫn đang chạy",
  failNotFound: "Không tìm thấy kỹ năng",
  failNotAllowed: "Không thể thực hiện từ cửa sổ này",
  failNotInstallable: "Không thể cài đặt kỹ năng này",
  failNotGitHub: "Kỹ năng này không được cài từ GitHub",
  failTrash: "Không thể chuyển kỹ năng cũ vào thùng rác nên đã giữ nguyên và không thay thế gì",
  failHidden: "Hãy hiện lại kỹ năng có sẵn đã ẩn trước khi bật",
  failEmptyTitle: "Nhập tiêu đề",
  failEmptyDescription: "Nhập mô tả",
  failEmptyBody: "Nhập hướng dẫn",
  failBadName: "Tên không đúng quy tắc",
  failGeneric: "Không thực hiện được. Hãy thử lại"
};
const skillsUiStrings = defineStrings({
  zh,
  en,
  ja,
  ko,
  fr,
  de,
  es,
  th,
  id,
  ru,
  ar,
  pt,
  it,
  pl,
  cs,
  nl,
  ms,
  he,
  hi,
  "zh-TW": zhTW,
  vi
});
const translate = createI18n(skillsUiStrings);
function skillsText(lang, key, params) {
  return translate(lang, key, params);
}
function SkillDialog({
  label,
  onCancel,
  children,
  footer
}) {
  const cancelRef = reactExports.useRef(onCancel);
  cancelRef.current = onCancel;
  const boxRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      cancelRef.current();
    };
    window.addEventListener("keydown", onKey, true);
    boxRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "skl-overlay",
      onMouseDown: (e) => {
        if (e.target === e.currentTarget) onCancel();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          ref: boxRef,
          className: "skl-dialog",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": label,
          tabIndex: -1,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "skl-dialog-title", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "skl-dialog-body", children }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "skl-dialog-footer", children: footer })
          ]
        }
      )
    }
  );
}
function MenuButton({
  label,
  ariaLabel,
  items,
  className = "set-btn"
}) {
  const [open, setOpen] = reactExports.useState(false);
  const wrapRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!open) return;
    const outside = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("click", outside);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("click", outside);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "skl-menu-wrap", ref: wrapRef, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-label": ariaLabel,
        onClick: () => setOpen((was) => !was),
        children: label
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "skl-menu", role: "menu", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        role: "menuitem",
        className: "skl-menu-item",
        onClick: () => {
          setOpen(false);
          item.onPick();
        },
        children: item.label
      },
      item.key
    )) })
  ] });
}
function useFinalCleanup(cleanup) {
  const cleanupRef = reactExports.useRef(cleanup);
  cleanupRef.current = cleanup;
  const mounted = reactExports.useRef(false);
  reactExports.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      setTimeout(() => {
        if (!mounted.current) cleanupRef.current();
      }, 0);
    };
  }, []);
}
function userSkillsApi() {
  return window.aiOfficeUserSkills;
}
const SKILL_GROUPS = ["builtin", "app", "user", "plugin", "codex"];
const GROUP_LABEL = {
  builtin: "sourceBuiltin",
  app: "sourceApp",
  user: "sourceUser",
  plugin: "sourcePluginGroup",
  codex: "sourceCodex"
};
function groupLabelKey(group) {
  return GROUP_LABEL[group];
}
function skillDisplayTitle(view, lang) {
  if (view.source === "builtin" && isBuiltinSkillName(view.name)) {
    return builtinSkillTitle(lang, view.name);
  }
  return view.title || view.name;
}
function skillDisplayDesc(view, lang) {
  if (view.source === "builtin" && isBuiltinSkillName(view.name)) {
    return builtinSkillDesc(lang, view.name);
  }
  return view.description;
}
function sourceLabel(view, text) {
  switch (view.source) {
    case "builtin":
      return text("sourceBuiltin");
    case "app":
      return text(view.github ? "sourceAppGitHub" : "sourceApp");
    case "user":
      return text("sourceUser");
    case "plugin":
      return text("sourcePlugin", { plugin: view.plugin ?? "" });
    case "codex":
      return text("sourceCodex");
    default:
      return "";
  }
}
function isListed(view) {
  return SKILL_GROUPS.includes(view.source);
}
function skillMatches(view, query, lang) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [
    skillDisplayTitle(view, lang),
    view.title,
    view.name,
    skillDisplayDesc(view, lang),
    view.description
  ].some((field) => field.toLowerCase().includes(needle));
}
function groupSkills(views, query, lang) {
  const groups = [];
  for (const id2 of SKILL_GROUPS) {
    const skills = views.filter(isListed).filter((view) => view.source === id2 && !view.hidden && skillMatches(view, query, lang)).sort((a, b) => {
      if (id2 === "plugin" && a.plugin !== b.plugin) {
        return (a.plugin ?? "").localeCompare(b.plugin ?? "");
      }
      return skillDisplayTitle(a, lang).localeCompare(skillDisplayTitle(b, lang));
    });
    if (skills.length > 0) groups.push({ id: id2, skills });
  }
  return groups;
}
function hiddenBuiltinCount(views) {
  return views.filter((view) => view.source === "builtin" && view.hidden).length;
}
function listedCount(views) {
  return views.filter((view) => isListed(view) && !view.hidden).length;
}
const ACTION_LABEL = {
  view: "actView",
  edit: "actEdit",
  copyToMine: "actCopy",
  export: "actExport",
  checkUpdate: "actCheckUpdate",
  openFolder: "actOpenFolder",
  remove: "actRemove",
  hide: "actHide"
};
function actionLabelKey(action) {
  return ACTION_LABEL[action];
}
function skillMenuActions(view) {
  const actions = [];
  if (!view.unreadable) actions.push("view");
  if (view.can.edit) actions.push("edit");
  if (view.can.copyToMine) actions.push("copyToMine");
  if (view.can.export) actions.push("export");
  if (view.can.checkUpdate) actions.push("checkUpdate");
  if (view.can.openFolder) actions.push("openFolder");
  if (view.can.remove) actions.push("remove");
  else if (view.can.hide) actions.push("hide");
  return actions;
}
const UNREADABLE = {
  "no-frontmatter": "unreadableNoFrontmatter",
  "bad-name": "unreadableBadName",
  "too-large": "unreadableTooLarge",
  unreadable: "unreadableUnreadable"
};
function unreadableKey(reason) {
  return UNREADABLE[reason] ?? "unreadableUnreadable";
}
const NAME_PROBLEM = {
  empty: "nameEmpty",
  "too-long": "nameTooLong",
  characters: "nameCharacters",
  "hyphen-edge": "nameHyphenEdge",
  "double-hyphen": "nameDoubleHyphen",
  reserved: "nameReserved",
  taken: "nameTaken"
};
function nameProblemKey(problem) {
  return NAME_PROBLEM[problem] ?? "failBadName";
}
function failureKey(reason, context = "other") {
  switch (reason) {
    case "cancelled":
      return void 0;
    case "no-skills":
      return "failNoSkills";
    case "not-found":
      return context === "import" ? "failRepoNotFound" : "failNotFound";
    case "rate-limited":
      return "failRateLimited";
    case "network":
      return "failNetwork";
    case "too-large":
      return "failTooLarge";
    case "unsafe":
      return "failUnsafe";
    case "bad-address":
      return "failBadAddress";
    case "busy":
      return "failBusy";
    case "not-allowed":
      return "failNotAllowed";
    case "not-installable":
    case "invalid-source":
      return "failNotInstallable";
    case "not-github":
      return "failNotGitHub";
    case "trash-failed":
      return "failTrash";
    case "hidden":
      return "failHidden";
    case "needs-choice":
      return "chooseCollision";
    case "empty-title":
      return "failEmptyTitle";
    case "empty-description":
      return "failEmptyDescription";
    case "empty-body":
      return "failEmptyBody";
    case "bad-name":
      return "failBadName";
    case "name-taken":
    case "exists":
      return "nameTaken";
    case "unreadable":
      return "unreadableUnreadable";
    default:
      return "failGeneric";
  }
}
const UNITS = ["B", "KB", "MB", "GB"];
function formatSkillSize(bytes, locale) {
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 || value >= 10 ? 0 : 1;
  return `${value.toLocaleString(locale, { maximumFractionDigits: digits })} ${UNITS[unit]}`;
}
function PreviewWarning({ lang }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "skl-preview-warning", role: "note", children: skillsText(lang, "previewWarning") });
}
function CandidateSummary({
  candidate,
  text,
  locale
}) {
  const c = candidate;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "skl-candidate-text", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "skl-row-head", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "skl-row-title", children: c.title || c.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "skl-name", children: c.name })
    ] }),
    c.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "set-field-desc skl-candidate-desc", children: c.description }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "skl-badges", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "skl-meta", children: text("previewSize", { n: c.files, size: formatSkillSize(c.bytes, locale) }) }),
      c.hasScripts && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "skl-badge", children: text("previewScripts") }),
      c.license && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "skl-meta", children: text("previewLicense", { name: c.license }) })
    ] }),
    c.urlCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "skl-urls", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "set-field-desc", children: text("previewUrls", { n: c.urlCount }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: c.urls.map((url) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: url }) }, url)) })
    ] })
  ] });
}
function GitHubImportDialog({
  api,
  lang,
  onPreview,
  onClose
}) {
  const s = (key, params) => skillsText(lang, key, params);
  const [address, setAddress] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [errorKey, setErrorKey] = reactExports.useState(null);
  const [state] = reactExports.useState(() => ({ running: false, closed: false }));
  useFinalCleanup(() => {
    state.closed = true;
    if (state.running) void api.cancelImport();
  });
  const find = async () => {
    const value = address.trim();
    if (!value || busy) return;
    setBusy(true);
    setErrorKey(null);
    state.running = true;
    const answer = await api.importGitHub(value);
    state.running = false;
    if (state.closed) {
      if (answer.ok) void api.cancelImport(answer.preview.token);
      return;
    }
    setBusy(false);
    if (answer.ok) {
      onPreview(answer.preview);
      return;
    }
    setErrorKey(failureKey(answer.reason, "import") ?? null);
  };
  const cancel = () => {
    state.closed = true;
    if (state.running) void api.cancelImport();
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SkillDialog,
    {
      label: s("githubTitle"),
      onCancel: cancel,
      footer: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "set-btn", onClick: cancel, children: s("cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "set-btn primary",
            disabled: busy || !address.trim(),
            onClick: () => void find(),
            children: s("githubFind")
          }
        )
      ] }),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "skl-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "skl-field-label", children: s("githubLabel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              className: "skl-input",
              value: address,
              placeholder: s("githubPlaceholder"),
              spellCheck: false,
              disabled: busy,
              onChange: (e) => setAddress(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") void find();
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "set-field-desc", children: s("githubHint") })
        ] }),
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "set-field-desc", role: "status", children: s("githubFetching") }),
        errorKey && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "set-field-desc skl-error", role: "alert", children: s(errorKey) })
      ]
    }
  );
}
function originLine(preview2, text) {
  const n = preview2.candidates.length;
  const origin = preview2.origin;
  if (origin.kind === "github") {
    const ref = origin.path ? `${origin.ref}/${origin.path}` : origin.ref;
    return text("previewFromGitHub", { repo: origin.repo, ref, n });
  }
  return text(origin.kind === "zip" ? "previewFromZip" : "previewFromFolder", { n });
}
function SkillImportPreviewDialog({
  api,
  preview: preview2,
  lang,
  locale,
  onDone,
  onClose
}) {
  const s = (key, params) => skillsText(lang, key, params);
  const installable = preview2.candidates.filter((c) => !c.problem);
  const [checked, setChecked] = reactExports.useState(
    () => new Set(installable.map((c) => c.key))
  );
  const [choices, setChoices] = reactExports.useState({});
  const [installing, setInstalling] = reactExports.useState(false);
  const [errorKey, setErrorKey] = reactExports.useState(null);
  const [state] = reactExports.useState(() => ({ settled: false }));
  useFinalCleanup(() => {
    if (!state.settled) void api.cancelImport(preview2.token);
  });
  const selected = preview2.candidates.filter((c) => !c.problem && checked.has(c.key));
  const missingChoice = selected.some((c) => c.collision && !choices[c.key]);
  const toggle = (key) => {
    setChecked((was) => {
      const next = new Set(was);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const install = async () => {
    if (installing || selected.length === 0 || missingChoice) return;
    const onCollision = {};
    for (const c of selected) {
      const choice = choices[c.key];
      if (c.collision && choice) onCollision[c.key] = choice;
    }
    setInstalling(true);
    setErrorKey(null);
    state.settled = true;
    const answer = await api.install(
      preview2.token,
      selected.map((c) => c.key),
      onCollision
    );
    setInstalling(false);
    if (answer.ok) {
      onDone({ tone: "ok", text: s("installed", { n: answer.installed.length }) });
      return;
    }
    if (answer.reason === "needs-choice") {
      state.settled = false;
      setErrorKey("chooseCollision");
      return;
    }
    onDone({ tone: "error", text: s(failureKey(answer.reason, "import") ?? "failGeneric") });
  };
  const cancel = () => {
    state.settled = true;
    void api.cancelImport(preview2.token);
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SkillDialog,
    {
      label: s("previewTitle"),
      onCancel: cancel,
      footer: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "set-btn", onClick: cancel, children: s("cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "set-btn primary",
            disabled: installing || selected.length === 0 || missingChoice,
            onClick: () => void install(),
            children: s("install")
          }
        )
      ] }),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "set-field-desc", children: originLine(preview2, s) }),
        preview2.rootLicense && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "set-field-desc", children: s("previewRootLicense", { name: preview2.rootLicense }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "skl-candidates", children: preview2.candidates.map((c) => {
          const isChecked = !c.problem && checked.has(c.key);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: "skl-candidate",
              "data-key": c.key,
              "data-problem": c.problem ? "true" : void 0,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    className: "skl-check",
                    checked: isChecked,
                    disabled: !!c.problem || installing,
                    "aria-label": s("previewInstallLabel", { title: c.title || c.name }),
                    onChange: () => toggle(c.key)
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "skl-candidate-main", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CandidateSummary, { candidate: c, text: s, locale }),
                  c.problem && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "set-field-desc skl-error", children: c.problem === "duplicate" ? s("problemDuplicate") : s("problemCannot", { reason: s(unreadableKey(c.problem)) }) }),
                  c.collision && isChecked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "skl-collision", role: "group", "aria-label": s("collision"), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "set-field-desc", children: s("collision") }),
                    ["replace", "skip"].map((choice) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        className: `set-btn skl-choice${choices[c.key] === choice ? " active" : ""}`,
                        "aria-pressed": choices[c.key] === choice,
                        onClick: () => setChoices((was) => ({ ...was, [c.key]: choice })),
                        children: s(choice === "replace" ? "collisionReplace" : "collisionSkip")
                      },
                      choice
                    ))
                  ] })
                ] })
              ]
            },
            c.key
          );
        }) }),
        errorKey && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "set-field-desc skl-error", role: "alert", children: s(errorKey) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PreviewWarning, { lang })
      ]
    }
  );
}
export {
  upsertCustomEndpoint as $,
  isTemplateMissing as A,
  chipRefForSkill as B,
  handedRequestOf as C,
  readSkillsForRequest as D,
  buildSkillRequest as E,
  resolveAiSettings as F,
  defaultAiSettings as G,
  AI_PROVIDERS as H,
  readUrlSettingsOf as I,
  headlessConsentVersionOf as J,
  headlessSubscriptionOn as K,
  sanitizeMeteredAccepted as L,
  AI_SEARCH_PROVIDERS as M,
  AI_MEDIA_PROVIDERS as N,
  OriginalTemplateActions as O,
  PreviewTemplateActions as P,
  providerHasCapability as Q,
  resolveCustomEndpoints as R,
  SkillCardLine as S,
  selectAiProvider as T,
  aiProviderDisplayName as U,
  AI_SUBSCRIPTION_PROVIDERS as V,
  subscriptionConnection as W,
  aiSubscriptionProviderName as X,
  isSubscriptionProvider as Y,
  customEndpointLabel as Z,
  isKeyProviderConfigured as _,
  SkillCardPreviewLine as a,
  aiSubscriptionText as a0,
  aiConnectGuideView as a1,
  aiSubscriptionStatusOf as a2,
  aiConnectStepsView as a3,
  AI_CONNECT_STEP_KEYS as a4,
  aiSubscriptionVendorName as a5,
  aiConnectInfoText as a6,
  aiConnectPromptView as a7,
  aiSubscriptionCardView as a8,
  isAiSubscriptionAccountAction as a9,
  listedCount as aA,
  groupLabelKey as aB,
  GitHubImportDialog as aC,
  skillDisplayDesc as aD,
  skillMenuActions as aE,
  sourceLabel as aF,
  unreadableKey as aG,
  actionLabelKey as aH,
  MAX_MAX_OUTPUT_TOKENS as aI,
  MIN_MAX_OUTPUT_TOKENS as aJ,
  DEFAULT_MAX_OUTPUT_TOKENS as aK,
  removeCustomEndpoint as aL,
  newCustomEndpointId as aM,
  clampMaxOutputTokens as aN,
  AI_SIGNING_IN_STALLED_MS as aa,
  aiRunErrorText as ab,
  isAiBlockedRunKind as ac,
  aiContinueOption as ad,
  providerSelectionOf as ae,
  activeCustomEndpoint as af,
  selectCustomEndpoint as ag,
  HEADLESS_SUBSCRIPTION_CONSENT_VERSION as ah,
  useComposerSkills as ai,
  NO_SKILL_USE as aj,
  USE_SKILL_TOOL as ak,
  USER_SKILL_TOOL_NAMES as al,
  SentSkillChips as am,
  Markdown as an,
  checkingSubscriptionStatuses as ao,
  skillDisplayTitle as ap,
  SkillDialog as aq,
  formatSkillSize as ar,
  nameProblemKey as as,
  useFinalCleanup as at,
  CandidateSummary as au,
  PreviewWarning as av,
  userSkillsApi as aw,
  groupSkills as ax,
  hiddenBuiltinCount as ay,
  MenuButton as az,
  SkillProposalCard as b,
  skillCardText as c,
  skillTemplateText as d,
  skillsText as e,
  SkillImportPreviewDialog as f,
  failureKey as g,
  skillChipOf as h,
  agentText as i,
  skillPickerText as j,
  skillPickerKeyAction as k,
  skillTemplateBridge as l,
  previewEndedOf as m,
  skillCardSavedRecord as n,
  windowUserSkillsBridge as o,
  pickerSkillsOf as p,
  createBridgedUserSkillsSkill as q,
  readStoredSkillCards as r,
  skillCardBridge as s,
  isBuiltinSkillName as t,
  useSkillPickerInput as u,
  builtinSkillTitle as v,
  withSkillChip as w,
  templateChoice as x,
  templateOpenResultOf as y,
  chipRefOf as z
};
