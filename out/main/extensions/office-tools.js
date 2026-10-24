"use strict";

const { execFile, exec } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const candidateClis = [
  "/Users/sushikim/Desktop/Aether.app/Contents/Resources/cli/aether",
  "/Applications/dumped.app/Contents/Resources/cli/aether"
];
const CLI_PATH = candidateClis.find(p => fs.existsSync(p)) || candidateClis[0];
const BUILTIN_SKILLS_PATH = "/Applications/dumped.app/Contents/Resources/builtin-skills";
const VISION_OCR_PATH = "/Applications/dumped.app/Contents/Resources/ocr/vision-ocr";
const WORKSPACE_ROOT = "/Users/sushikim/Desktop/app_source";

function runCli(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CLI_PATH)) {
      return reject(new Error(`Aether CLI binary not found at ${CLI_PATH}`));
    }
    const fullArgs = [command, ...args, "--json"];
    execFile(CLI_PATH, fullArgs, { maxBuffer: 50 * 1024 * 1024, ...options }, (err, stdout, stderr) => {
      if (err && !stdout) {
        return reject(new Error(stderr || err.message));
      }
      try {
        const json = JSON.parse(stdout);
        resolve(json);
      } catch (parseErr) {
        if (stdout) resolve({ status: "ok", raw: stdout });
        else reject(new Error(`Failed to parse CLI JSON: ${stderr || parseErr.message}`));
      }
    });
  });
}

// 1. HWP / HWPX (Hangul)
async function readHwp(filePath) {
  return await runCli("hwp", [filePath]);
}

// 2. Format Converter (docx, pdf, xlsx, pptx, odt, md, html, csv, epub)
async function convertDocument(inputPath, outputPath) {
  const args = [inputPath];
  if (outputPath) {
    args.push("--out", outputPath);
  }
  return await runCli("convert", args);
}

// 3. PDF Reader & Structure Extractor
async function readPdf(filePath, { pages = "all" } = {}) {
  const args = [filePath];
  if (pages !== "all") {
    args.push("--pages", String(pages));
  }
  return await runCli("pdf", args);
}

// 4. Document Page Renderer (Visual PNG output)
async function renderPages(filePath, outputDir) {
  const args = [filePath];
  if (outputDir) {
    args.push("--out", outputDir);
  }
  return await runCli("render", args);
}

// 5. Document Info / Metadata
async function getDocumentInfo(filePath) {
  return await runCli("info", [filePath]);
}

// 6. Word / Docs Operations
async function readDocs(filePath) {
  return await runCli("docs", ["read", filePath]);
}

// 7. Spreadsheet / Sheets Operations
async function readSheet(filePath) {
  return await runCli("sheet", ["read", filePath]);
}

// 8. Presentation / Slides Operations
async function readSlides(filePath) {
  return await runCli("slides", ["read", filePath]);
}

// 9. Built-in Skills (Meeting Minutes, Humanizer, Internal Comms, Copy Editing)
function listBuiltinSkills() {
  const manifest = path.join(BUILTIN_SKILLS_PATH, "builtin-skills.json");
  if (!fs.existsSync(manifest)) return [];
  try {
    return JSON.parse(fs.readFileSync(manifest, "utf8"));
  } catch {
    return [];
  }
}

function getSkillContent(skillName) {
  const dir = path.join(BUILTIN_SKILLS_PATH, skillName);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const result = {};
  for (const f of files) {
    if (f.endsWith(".md") || f.endsWith(".txt") || f.endsWith(".json")) {
      result[f] = fs.readFileSync(path.join(dir, f), "utf8");
    }
  }
  return result;
}

// 10. Native Vision OCR on Images / Scanned Docs
function runVisionOcr(imagePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(VISION_OCR_PATH)) {
      return reject(new Error("Native vision-ocr binary not found"));
    }
    execFile(VISION_OCR_PATH, [imagePath], { maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve(stdout.trim());
    });
  });
}

// 11. Desktop Projects & Applications Hub
function listWorkspaceProjects() {
  const projects = [];
  if (!fs.existsSync(WORKSPACE_ROOT)) return projects;

  const entries = fs.readdirSync(WORKSPACE_ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (["node_modules", "out", ".git"].includes(entry.name)) continue;

    const projPath = path.join(WORKSPACE_ROOT, entry.name);
    let type = "general";
    let details = "";
    let entryFile = "";

    if (fs.existsSync(path.join(projPath, "package.json"))) {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(projPath, "package.json"), "utf8"));
        type = entry.name === "antigravity" ? "agentic_desktop_ide" : "node_electron";
        details = `${pkg.name || entry.name} v${pkg.version || "1.0.0"} - ${pkg.description || ""}`;
        entryFile = pkg.main || "index.js";
      } catch { /* ignore */ }
    } else if (fs.existsSync(path.join(projPath, `${entry.name}.xcodeproj`))) {
      type = "apple_swift_app";
      details = `macOS/iOS Swift Native Application (${entry.name}.xcodeproj)`;
      entryFile = `${entry.name}.xcodeproj`;
    } else if (entry.name === "VMP_DEVIRT") {
      type = "reverse_engineering_suite";
      details = "VMProtect 3.5.1 Devirtualization & Binary Analysis Toolchain (Triton, LLVM, Pin, VMHunt)";
      entryFile = "README.md";
    } else if (entry.name === "TACC") {
      type = "decentralized_computing_research";
      details = "Trustless Autonomous Computing Consortium (Rust Core + Node + Whitepapers)";
      entryFile = "README.md";
    }

    projects.push({
      name: entry.name,
      path: projPath,
      type,
      details,
      entryFile,
      hasGit: fs.existsSync(path.join(projPath, ".git"))
    });
  }

  return projects;
}

// AI Agent Tool Definitions
const OFFICE_TOOL_DEFINITIONS = [
  {
    name: "office_read_hwp",
    description: "한글 문서(HWP / HWPX)의 텍스트 본문과 메타데이터를 파싱하여 추출합니다.",
    parameters: {
      type: "object",
      properties: { filePath: { type: "string" } },
      required: ["filePath"]
    }
  },
  {
    name: "office_convert",
    description: "오피스 문서를 다른 포맷으로 상호 변환합니다 (pdf, docx, odt, xlsx, pptx, md, html, csv).",
    parameters: {
      type: "object",
      properties: { inputPath: { type: "string" }, outputPath: { type: "string" } },
      required: ["inputPath", "outputPath"]
    }
  },
  {
    name: "office_read_pdf",
    description: "PDF 문서의 텍스트 계층, 구조적 목차 및 페이지별 내용을 읽습니다.",
    parameters: {
      type: "object",
      properties: { filePath: { type: "string" }, pages: { type: "string" } },
      required: ["filePath"]
    }
  },
  {
    name: "office_render_pages",
    description: "문서(Word, PPT, Sheet, PDF)의 페이지들을 검수용 고해상도 PNG 이미지로 렌더링합니다.",
    parameters: {
      type: "object",
      properties: { filePath: { type: "string" }, outputDir: { type: "string" } },
      required: ["filePath", "outputDir"]
    }
  },
  {
    name: "office_read_docs",
    description: "Word(DOCX / ODT) 문서의 서식 구조와 본문 문단을 추출합니다.",
    parameters: {
      type: "object",
      properties: { filePath: { type: "string" } },
      required: ["filePath"]
    }
  },
  {
    name: "office_read_sheet",
    description: "Excel(XLSX / CSV) 스프레드시트의 시트 목록, 셀 데이터 및 수식을 추출합니다.",
    parameters: {
      type: "object",
      properties: { filePath: { type: "string" } },
      required: ["filePath"]
    }
  },
  {
    name: "office_read_slides",
    description: "PowerPoint(PPTX) 슬라이드의 구성 요소, 텍스트 상자 및 레이아웃을 추출합니다.",
    parameters: {
      type: "object",
      properties: { filePath: { type: "string" } },
      required: ["filePath"]
    }
  },
  {
    name: "office_get_skills",
    description: "내장된 전문 오피스 AI 스킬(회의록 정리, 휴머나이저, 사내 커뮤니케이션, 카피 에디팅) 목록을 확인합니다.",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "workspace_list_projects",
    description: "app_source 내의 모든 통합 프로젝트(Antigravity, VMP_DEVIRT, TACC, QRDrop, ShakeAndSound) 목록과 정보를 확인합니다.",
    parameters: { type: "object", properties: {} }
  }
];

async function executeOfficeTool(toolName, args) {
  switch (toolName) {
    case "office_read_hwp":
      return await readHwp(args.filePath);
    case "office_convert":
      return await convertDocument(args.inputPath, args.outputPath);
    case "office_read_pdf":
      return await readPdf(args.filePath, args);
    case "office_render_pages":
      return await renderPages(args.filePath, args.outputDir);
    case "office_read_docs":
      return await readDocs(args.filePath);
    case "office_read_sheet":
      return await readSheet(args.filePath);
    case "office_read_slides":
      return await readSlides(args.filePath);
    case "office_get_skills":
      return listBuiltinSkills();
    case "workspace_list_projects":
      return listWorkspaceProjects();
    default:
      throw new Error(`Unknown office tool: ${toolName}`);
  }
}

function registerOfficeIpc(ipcMain) {
  ipcMain.handle("hyper:office:tools", () => OFFICE_TOOL_DEFINITIONS);
  ipcMain.handle("hyper:office:call", async (_event, { tool, args }) => {
    try {
      const result = await executeOfficeTool(tool, args);
      return { ok: true, result };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("hyper:office:hwp", (_event, filePath) => readHwp(filePath));
  ipcMain.handle("hyper:office:convert", (_event, { input, output }) => convertDocument(input, output));
  ipcMain.handle("hyper:office:render", (_event, { input, outputDir }) => renderPages(input, outputDir));
  ipcMain.handle("hyper:office:skills", () => listBuiltinSkills());
  ipcMain.handle("hyper:office:skill-content", (_event, name) => getSkillContent(name));
  ipcMain.handle("hyper:office:ocr", (_event, imgPath) => runVisionOcr(imgPath));
  ipcMain.handle("hyper:projects:list", () => listWorkspaceProjects());
}

module.exports = {
  readHwp,
  convertDocument,
  readPdf,
  renderPages,
  getDocumentInfo,
  readDocs,
  readSheet,
  readSlides,
  listBuiltinSkills,
  getSkillContent,
  runVisionOcr,
  listWorkspaceProjects,
  OFFICE_TOOL_DEFINITIONS,
  executeOfficeTool,
  registerOfficeIpc
};
