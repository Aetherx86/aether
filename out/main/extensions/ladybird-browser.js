"use strict";

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const https = require("node:https");
const { executeAiChat } = require("./env-agent");
const { convertDocument } = require("./office-tools");

const candidatePaths = [
  "/Users/sushikim/Desktop/app_source/ladybird-master",
  path.resolve(__dirname, "../../../ladybird-master"),
  typeof process !== "undefined" && process.resourcesPath ? path.join(process.resourcesPath, "ladybird-master") : ""
];
const LADYBIRD_DIR = candidatePaths.find(p => p && fs.existsSync(p)) || "/Users/sushikim/Desktop/app_source/ladybird-master";
const ABOUT_PAGES_DIR = path.join(LADYBIRD_DIR, "Base/res/ladybird/about-pages");
const RES_DIR = path.join(LADYBIRD_DIR, "Base/res/ladybird");

function getLadybirdPage(pageName = "welcome") {
  const safeName = path.basename(pageName).replace(/\.html$/, "");
  const htmlPath = path.join(ABOUT_PAGES_DIR, `${safeName}.html`);
  if (!fs.existsSync(htmlPath)) {
    return `<h2 style="font-family:sans-serif;padding:2rem;">Ladybird page "${safeName}" not found</h2>`;
  }

  let html = fs.readFileSync(htmlPath, "utf8");

  // Read CSS files to inline them
  const ladybirdCss = fs.existsSync(path.join(RES_DIR, "ladybird.css"))
    ? fs.readFileSync(path.join(RES_DIR, "ladybird.css"), "utf8")
    : "";
  const webuiCss = fs.existsSync(path.join(ABOUT_PAGES_DIR, "webui.css"))
    ? fs.readFileSync(path.join(ABOUT_PAGES_DIR, "webui.css"), "utf8")
    : "";
  const pageCssPath = path.join(ABOUT_PAGES_DIR, `${safeName}.css`);
  const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

  // Replace external resource links with inlined CSS
  const inlinedStyles = `
    <style>
      ${ladybirdCss}
      ${webuiCss}
      ${pageCss}
      body {
        margin: 0;
        padding: 0;
        background: var(--surface, #1b1924);
        color: var(--text, #e2e1e9);
        font-family: system-ui, -apple-system, sans-serif;
      }
      header {
        padding: 24px 32px 16px;
      }
      main {
        padding: 0 32px 40px;
      }
    </style>
  `;

  html = html.replace(/<link rel="stylesheet"[^>]*>/g, "");
  html = html.replace(/<script[^>]*welcome\.js[^>]*><\/script>/g, "");
  html = html.replace("</head>", `${inlinedStyles}</head>`);

  return html;
}

function fetchUrlText(urlStr) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const client = url.protocol === "https:" ? https : http;
      const req = client.get(url, { headers: { "User-Agent": "Ladybird/1.0 (SerenityOS; LibWeb; Aether Browser)" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchUrlText(res.headers.location).then(resolve, reject);
        }
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
          // Quick strip tags
          const stripped = data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                               .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
                               .replace(/<[^>]+>/g, " ")
                               .replace(/\s+/g, " ")
                               .trim();
          resolve(stripped.slice(0, 15000));
        });
      });
      req.on("error", reject);
    } catch (e) {
      reject(e);
    }
  });
}

async function summarizeWebpage(urlStr) {
  const pageText = await fetchUrlText(urlStr);
  const prompt = `다음 웹페이지 본문을 분석하여 한국어로 핵심 내용을 요약해줘:
URL: ${urlStr}

[본문 내용]
${pageText}

[요청 사항]
1. 3줄 핵심 한줄 요약
2. 주요 포인트 5가지 (불릿 포인트)
3. 결론 및 인사이트`;

  return await executeAiChat({
    provider: "gemini",
    system: "당신은 Aether Browser에 내장된 웹 분석 AI 도우미입니다. 웹페이지의 본문을 분석하고 간결하며 명확하게 요약합니다.",
    user: prompt
  });
}

async function saveWebpageAsDoc(urlStr, outputPath) {
  const pageText = await fetchUrlText(urlStr);
  const ext = path.extname(outputPath).toLowerCase();

  const title = path.basename(outputPath, ext);
  const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body>
<h1>Webpage Capture: ${urlStr}</h1>
<p><em>Captured via Aether Ladybird Browser on ${new Date().toLocaleString()}</em></p>
<hr/>
<div>${pageText.split(" ").slice(0, 1000).join(" ")}</div>
</body>
</html>`;

  if (ext === ".docx") {
    const tempHtml = outputPath.replace(/\.docx$/, ".html");
    fs.writeFileSync(tempHtml, htmlContent, "utf8");
    await convertDocument(tempHtml, outputPath);
    return { ok: true, path: outputPath };
  } else {
    // Markdown
    const mdContent = `# Webpage Capture: ${urlStr}\n\n*Captured via Aether Ladybird Browser on ${new Date().toLocaleString()}*\n\n---\n\n${pageText}`;
    fs.writeFileSync(outputPath, mdContent, "utf8");
    return { ok: true, path: outputPath };
  }
}

function registerLadybirdIpc(ipcMain) {
  ipcMain.handle("hyper:browser:get-ladybird-page", (_event, pageName) => {
    return getLadybirdPage(pageName);
  });

  ipcMain.handle("hyper:browser:summarize", async (_event, url) => {
    try {
      const summary = await summarizeWebpage(url);
      return { ok: true, summary: summary.content };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("hyper:browser:save-doc", async (_event, { url, outputPath }) => {
    try {
      return await saveWebpageAsDoc(url, outputPath);
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });
}

module.exports = {
  getLadybirdPage,
  summarizeWebpage,
  saveWebpageAsDoc,
  registerLadybirdIpc
};
