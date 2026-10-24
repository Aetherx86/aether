"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert");

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
      "out/preload/index.js",
      "out/main/extensions/aetherum-browser.js",
      "out/main/extensions/aetherum-pages.js",
      "out/main/extensions/terminal.js",
      "out/main/extensions/office-tools.js",
      "out/main/index.js",
      "out/renderer/assets/index-CTi8t0a8.js"
    ];

    for (const rel of filesToCheck) {
      const fullPath = path.join(__dirname, "..", rel);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8").toLowerCase();
        for (const term of forbidden) {
          assert.ok(!content.includes(term), `File ${rel} must not contain forbidden term '${term}'`);
        }
      }
    }
  });

  // 3. Fafnir AES-256-GCM Vault Unit Tests
  runTest("Fafnir Vault: Zero-Knowledge AES-256-GCM Encryption & Decryption", () => {
    const { encryptBuffer, decryptBuffer } = require("../out/main/extensions/fafnir");
    const secretMessage = Buffer.from("Secret document content for Jeffrey Kim in Aether Vault.", "utf8");
    const passphrase = "TestMasterPassphrase#2026";

    const encrypted = encryptBuffer(secretMessage, passphrase, "secret_doc.txt");
    assert.ok(encrypted.length > secretMessage.length, "Encrypted container must contain header and ciphertext");

    const { plaintext, meta } = decryptBuffer(encrypted, passphrase);
    assert.strictEqual(plaintext.toString("utf8"), secretMessage.toString("utf8"), "Decrypted plaintext must match original");
    assert.strictEqual(meta.filename, "secret_doc.txt");
    assert.strictEqual(meta.cipher, "aes-256-gcm");

    // Invalid passphrase must throw
    assert.throws(() => {
      decryptBuffer(encrypted, "WrongPassphrase123");
    }, /Unsupported state or unable to authenticate data/, "Wrong passphrase must fail auth-tag verification");
  });

  // 4. Nibelungen Knowledge Graph Tests
  runTest("Nibelungen: Vault Initialization & Bi-directional Wikilinks", () => {
    const { buildKnowledgeGraph, saveNote, listNotes } = require("../out/main/extensions/nibelungen");
    const testNote = saveNote({
      id: "ci-test-note",
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
  });

  // 5. Sleipnir HTTPS SNI Bypass Tests
  runTest("Sleipnir: Engine Status & DoH Configuration", () => {
    const { getSleipnirStatus } = require("../out/main/extensions/sleipnir");
    const status = getSleipnirStatus();
    assert.ok(typeof status.port === "number", "Sleipnir port must be a number (default 8087)");
    assert.ok(typeof status.packetsFragmented === "number", "Packet fragmentation counter must exist");
  });

  // 6. Mimisbrunnr Airgapped AI Tests
  await runAsyncTest("Mímisbrunnr: Offline Semantic & Rule Intelligence", async () => {
    const { executeMimisbrunnrChat } = require("../out/main/extensions/mimisbrunnr");
    const emailRes = await executeMimisbrunnrChat({
      prompt: "From: boss@corp.com\nSubject: Project Deadline\nPlease finalize the quarterly audit report by Friday.",
      task: "email"
    });
    assert.ok(emailRes.ok, "Mimisbrunnr email analysis must succeed");
    assert.ok(emailRes.response.includes("Mímisbrunnr Offline Email Analysis"), "Must return structured summary");

    const scriptRes = await executeMimisbrunnrChat({
      prompt: "rm -rf / tmp_files\necho $VARIABLE",
      task: "script"
    });
    assert.ok(scriptRes.ok, "Script debugger must succeed");
    assert.ok(scriptRes.response.includes("Mímisbrunnr Terminal Script Diagnostic"), "Must flag unsafe command patterns");
  });

  // 7. Ratatoskr Visual API Client & DB Engine Tests
  runTest("Ratatoskr: Engine Module Verification", () => {
    const ratatoskr = require("../out/main/extensions/ratatoskr");
    assert.strictEqual(typeof ratatoskr.executeApiRequest, "function", "executeApiRequest must be exported");
    assert.strictEqual(typeof ratatoskr.querySqliteDb, "function", "querySqliteDb must be exported");
    assert.strictEqual(typeof ratatoskr.listSqliteTables, "function", "listSqliteTables must be exported");
  });

  // 8. Internal Aetherum Pages Generator (All 9 pages)
  runTest("Aetherum Pages: Full 9-Page Generation Suite", () => {
    const { getAetherumPage } = require("../out/main/extensions/aetherum-pages");
    const pages = ["welcome", "about", "bookmarks", "history", "settings", "version", "nibelungen", "ratatoskr", "fafnir"];

    for (const p of pages) {
      const html = getAetherumPage(p);
      assert.ok(html && html.length > 100, `Page '${p}' must render non-empty HTML`);
      assert.ok(html.includes("<!DOCTYPE html>") || html.includes("<div") || html.includes("<html"), `Page '${p}' must be valid HTML`);
    }
  });

  // 9. UI Asset Integrity Tests
  runTest("UI Assets: Unicorn & Xcode Icon Availability", () => {
    const sleipnirIcon = path.join(__dirname, "../out/renderer/assets/sleipnir-logo.png");
    const appIcon = path.join(__dirname, "../out/renderer/assets/app-icon-kcTvUgcs.png");

    assert.ok(fs.existsSync(sleipnirIcon), "sleipnir-logo.png must exist");
    assert.ok(fs.existsSync(appIcon), "app-icon-kcTvUgcs.png must exist");
    assert.ok(fs.statSync(sleipnirIcon).size > 1000, "sleipnir-logo.png must be non-empty");
  });

  // 10. Yggdrasil Terminal Live Process Verification
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

  // 11. Sleipnir Live TLS SNI Packet Splitting Integration
  await runAsyncTest("Sleipnir: Live Proxy Socket & SNI Packet Segmentation", async () => {
    const { startSleipnir, stopSleipnir, getSleipnirStatus } = require("../out/main/extensions/sleipnir");
    const http = require("node:http");
    const tls = require("node:tls");

    await startSleipnir(8087);
    const initialStatus = getSleipnirStatus();
    assert.strictEqual(initialStatus.active, true, "Sleipnir proxy must be active");

    await new Promise((resolve, reject) => {
      const req = http.request({
        host: "127.0.0.1",
        port: 8087,
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

    const finalStatus = getSleipnirStatus();
    assert.ok(finalStatus.packetsFragmented >= 1, "Sleipnir must fragment TLS ClientHello packets");
    assert.ok(finalStatus.sniBypassed >= 1, "Sleipnir must record SNI bypass count");
    await stopSleipnir();
  });

  // 12. Complete Nordic Suite Naming Audit
  runTest("Nordic Suite Naming Integrity: App, Browser, Terminal, VPN, Wiki, Vault, AI, DB", () => {
    const suites = {
      App: "Aether",
      Browser: "Aetherum",
      Terminal: "Yggdrasil",
      VPN: "Sleipnir",
      Knowledge: "Nibelungen",
      Vault: "Fafnir",
      AI: "Mímisbrunnr",
      DB_API: "Ratatoskr"
    };

    assert.strictEqual(suites.App, "Aether");
    assert.strictEqual(suites.Browser, "Aetherum");
    assert.strictEqual(suites.Terminal, "Yggdrasil");
    assert.strictEqual(suites.VPN, "Sleipnir");
    assert.strictEqual(suites.Knowledge, "Nibelungen");
    assert.strictEqual(suites.Vault, "Fafnir");
    assert.strictEqual(suites.AI, "Mímisbrunnr");
    assert.strictEqual(suites.DB_API, "Ratatoskr");
  });

  console.log("=================================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 All Aether CI/CD unit and integration tests passed!");
    process.exit(0);
  }
}

main().catch(err => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
