"use strict";

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");
const { spawn } = require("node:child_process");
const { executeAiChat } = require("./env-agent");
const { convertDocument } = require("./office-tools");
const { getAetherumPage } = require("./aetherum-pages");

let electronSession = null;
try {
  electronSession = require("electron").session;
} catch {
  electronSession = null;
}

let torModeEnabled = true;

function checkTorPort() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1200);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      resolve(false);
    });
    socket.connect(9050, "127.0.0.1");
  });
}

async function ensureTorRunning() {
  const isRunning = await checkTorPort();
  if (isRunning) return true;
  try {
    const torBin = fs.existsSync("/opt/homebrew/bin/tor") ? "/opt/homebrew/bin/tor" : "tor";
    const child = spawn(torBin, [], { detached: true, stdio: "ignore" });
    child.unref();
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 400));
      if (await checkTorPort()) return true;
    }
  } catch (e) {
    console.error("[Aetherum Tor] Error starting tor daemon:", e.message);
  }
  return await checkTorPort();
}

async function configureAetherumSession() {
  if (!electronSession) return;
  try {
    const ses = electronSession.fromPartition("persist:aetherum");

    // Remove restrictive security headers that prevent framing/webview embed
    ses.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = { ...details.responseHeaders };
      delete responseHeaders["x-frame-options"];
      delete responseHeaders["X-Frame-Options"];
      delete responseHeaders["content-security-policy"];
      delete responseHeaders["Content-Security-Policy"];
      delete responseHeaders["x-content-security-policy"];
      delete responseHeaders["X-Content-Security-Policy"];
      callback({ cancel: false, responseHeaders });
    });

    // Custom Aetherum / Tor user agent
    ses.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Aetherum/0.0.1 (Macintosh; Privacy Tor Browser; Aether Platform)"
    );

    // Apply Tor proxy if enabled
    await ensureTorRunning();
    if (torModeEnabled) {
      await ses.setProxy({ proxyRules: "socks5://127.0.0.1:9050,socks5://127.0.0.1:9150,direct://" });
      console.log("[Aetherum Browser] Tor proxy attached: socks5://127.0.0.1:9050");
    } else {
      await ses.setProxy({ proxyRules: "" });
      console.log("[Aetherum Browser] Direct web connection attached.");
    }
  } catch (err) {
    console.error("[Aetherum Browser] Session configuration error:", err.message);
  }
}

function fetchUrlText(urlStr) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const client = url.protocol === "https:" ? https : http;
      const req = client.get(url, { headers: { "User-Agent": "Aetherum/0.0.1 (Macintosh; Privacy Tor Browser; Aether Platform)" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchUrlText(res.headers.location).then(resolve, reject);
        }
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
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
    system: "당신은 Aether의 Aetherum 브라우저에 내장된 웹 분석 AI 도우미입니다. 웹페이지 본문을 분석하고 간결하며 명확하게 요약합니다.",
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
<p><em>Captured via Aetherum Browser on ${new Date().toLocaleString()}</em></p>
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
    const mdContent = `# Webpage Capture: ${urlStr}\n\n*Captured via Aetherum Browser on ${new Date().toLocaleString()}*\n\n---\n\n${pageText}`;
    fs.writeFileSync(outputPath, mdContent, "utf8");
    return { ok: true, path: outputPath };
  }
}

function registerAetherumIpc(ipcMain) {
  configureAetherumSession();

  ipcMain.handle("hyper:browser:get-aetherum-page", (_event, pageName) => {
    return getAetherumPage(pageName);
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

  ipcMain.handle("hyper:browser:tor-status", async () => {
    const active = await checkTorPort();
    return { active, torEnabled: torModeEnabled, port: 9050 };
  });

  ipcMain.handle("hyper:browser:set-tor", async (_event, enabled) => {
    torModeEnabled = !!enabled;
    if (electronSession) {
      const ses = electronSession.fromPartition("persist:aetherum");
      if (torModeEnabled) {
        await ensureTorRunning();
        await ses.setProxy({ proxyRules: "socks5://127.0.0.1:9050,socks5://127.0.0.1:9150,direct://" });
      } else {
        await ses.setProxy({ proxyRules: "" });
      }
    }
    const active = await checkTorPort();
    return { active, torEnabled: torModeEnabled, port: 9050 };
  });
}

module.exports = {
  getAetherumPage,
  summarizeWebpage,
  saveWebpageAsDoc,
  registerAetherumIpc,
  ensureTorRunning,
  checkTorPort
};
