"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");

const VAULT_DIR = path.join(os.homedir(), ".aether", "fafnir_vault");

function ensureVaultDir() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }
}

function deriveKey(passphrase, salt) {
  return crypto.pbkdf2Sync(passphrase, salt, 100000, 32, "sha512");
}

function encryptBuffer(buffer, passphrase, originalName = "document.bin") {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(passphrase, salt);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const metadata = {
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    filename: originalName,
    size: buffer.length,
    timestamp: new Date().toISOString(),
    cipher: "aes-256-gcm",
    kdf: "pbkdf2-sha512-100k"
  };

  const metaBuffer = Buffer.from(JSON.stringify(metadata), "utf8");
  const metaLenBuffer = Buffer.alloc(4);
  metaLenBuffer.writeUInt32BE(metaBuffer.length, 0);

  // Layout: [4 bytes metaLen] [metadata JSON] [AES-256-GCM ciphertext]
  return Buffer.concat([metaLenBuffer, metaBuffer, encrypted]);
}

function decryptBuffer(containerBuffer, passphrase) {
  if (containerBuffer.length < 4) throw new Error("Invalid Fafnir encrypted container.");
  const metaLen = containerBuffer.readUInt32BE(0);
  const metaJson = containerBuffer.slice(4, 4 + metaLen).toString("utf8");
  const meta = JSON.parse(metaJson);
  const ciphertext = containerBuffer.slice(4 + metaLen);

  const salt = Buffer.from(meta.salt, "hex");
  const iv = Buffer.from(meta.iv, "hex");
  const authTag = Buffer.from(meta.authTag, "hex");
  const key = deriveKey(passphrase, salt);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return { plaintext, meta };
}

function listVaultFiles() {
  ensureVaultDir();
  const files = fs.readdirSync(VAULT_DIR).filter(f => f.endsWith(".fafnir"));
  const records = [];
  for (const f of files) {
    try {
      const fpath = path.join(VAULT_DIR, f);
      const fd = fs.openSync(fpath, "r");
      const lenBuf = Buffer.alloc(4);
      fs.readSync(fd, lenBuf, 0, 4, 0);
      const metaLen = lenBuf.readUInt32BE(0);
      const metaBuf = Buffer.alloc(metaLen);
      fs.readSync(fd, metaBuf, 0, metaLen, 4);
      fs.closeSync(fd);

      const meta = JSON.parse(metaBuf.toString("utf8"));
      records.push({
        id: f,
        vaultPath: fpath,
        filename: meta.filename,
        size: meta.size,
        timestamp: meta.timestamp,
        cipher: meta.cipher
      });
    } catch {}
  }
  return records;
}

function encryptFileToVault(srcPath, passphrase) {
  ensureVaultDir();
  if (!fs.existsSync(srcPath)) throw new Error(`Source file does not exist: ${srcPath}`);
  const content = fs.readFileSync(srcPath);
  const baseName = path.basename(srcPath);
  const encryptedBuf = encryptBuffer(content, passphrase, baseName);

  const targetName = `${baseName}_${Date.now()}.fafnir`;
  const targetPath = path.join(VAULT_DIR, targetName);
  fs.writeFileSync(targetPath, encryptedBuf);

  return { ok: true, vaultPath: targetPath, filename: baseName };
}

function decryptFileFromVault(vaultFileName, destDir, passphrase) {
  ensureVaultDir();
  const fpath = path.join(VAULT_DIR, vaultFileName);
  if (!fs.existsSync(fpath)) throw new Error(`Vault file not found: ${vaultFileName}`);
  const encryptedBuf = fs.readFileSync(fpath);
  const { plaintext, meta } = decryptBuffer(encryptedBuf, passphrase);

  const targetPath = path.join(destDir || os.homedir(), "Desktop", `decrypted_${meta.filename}`);
  fs.writeFileSync(targetPath, plaintext);
  return { ok: true, decryptedPath: targetPath, filename: meta.filename };
}

function registerFafnirIpc(ipcMain) {
  ensureVaultDir();

  ipcMain.handle("hyper:fafnir:list", () => {
    return listVaultFiles();
  });

  ipcMain.handle("hyper:fafnir:encrypt", async (_event, { srcPath, passphrase }) => {
    try {
      return encryptFileToVault(srcPath, passphrase);
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle("hyper:fafnir:decrypt", async (_event, { vaultFileName, destDir, passphrase }) => {
    try {
      return decryptFileFromVault(vaultFileName, destDir, passphrase);
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
}

module.exports = {
  encryptBuffer,
  decryptBuffer,
  listVaultFiles,
  encryptFileToVault,
  decryptFileFromVault,
  registerFafnirIpc
};
