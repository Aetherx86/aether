"use strict";

const { execFile } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { renderPages } = require("./office-tools");

function runGit(args, cwd) {
  return new Promise((resolve, reject) => {
    execFile("git", args, { cwd: cwd || process.cwd(), maxBuffer: 30 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve(stdout.trim());
    });
  });
}

async function getGitStatus(cwd) {
  try {
    const isRepo = await runGit(["rev-parse", "--is-inside-work-tree"], cwd);
    if (isRepo !== "true") return { isRepo: false };

    const branch = await runGit(["branch", "--show-current"], cwd);
    const rawStatus = await runGit(["status", "--porcelain=v1"], cwd);

    const staged = [];
    const unstaged = [];
    const untracked = [];

    const lines = rawStatus ? rawStatus.split("\n") : [];
    for (const line of lines) {
      if (line.length < 3) continue;
      const x = line[0];
      const y = line[1];
      const filePath = line.slice(3).trim();

      if (x === "?" && y === "?") {
        untracked.push(filePath);
      } else {
        if (x !== " " && x !== "?") staged.push({ file: filePath, status: x });
        if (y !== " " && y !== "?") unstaged.push({ file: filePath, status: y });
      }
    }

    return {
      isRepo: true,
      branch: branch || "HEAD detached",
      staged,
      unstaged,
      untracked
    };
  } catch (err) {
    return { isRepo: false, error: err.message };
  }
}

async function getGitDiff(cwd, filePath, staged = false) {
  const args = ["diff"];
  if (staged) args.push("--staged");
  if (filePath) args.push("--", filePath);
  return await runGit(args, cwd);
}

async function gitCommit(cwd, message, files = []) {
  if (files && files.length > 0) {
    await runGit(["add", ...files], cwd);
  }
  return await runGit(["commit", "-m", message], cwd);
}

// Office Visual Diff: Renders previous commit vs working copy as PNGs
async function getOfficeVisualDiff(cwd, relativePath, commit = "HEAD") {
  const ext = path.extname(relativePath).toLowerCase();
  const officeExts = [".docx", ".pptx", ".xlsx", ".pdf", ".odt", ".hwp", ".hwpx"];
  if (!officeExts.includes(ext)) {
    throw new Error(`File ${relativePath} is not an office document supported for visual diff.`);
  }

  const tempDir = path.join(os.tmpdir(), `hyper-diff-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const oldFile = path.join(tempDir, `old_${path.basename(relativePath)}`);
  const oldOutDir = path.join(tempDir, "old_rendered");
  const newOutDir = path.join(tempDir, "new_rendered");
  fs.mkdirSync(oldOutDir, { recursive: true });
  fs.mkdirSync(newOutDir, { recursive: true });

  // 1. Extract previous version
  const oldBuffer = await runGit(["show", `${commit}:${relativePath}`], cwd);
  fs.writeFileSync(oldFile, oldBuffer);

  // 2. Render both versions to PNG
  const currentAbsPath = path.resolve(cwd, relativePath);
  await renderPages(oldFile, oldOutDir);
  await renderPages(currentAbsPath, newOutDir);

  const getFiles = (dir) => fs.readdirSync(dir).filter(f => f.endsWith(".png")).sort().map(f => path.join(dir, f));

  return {
    ok: true,
    file: relativePath,
    commit,
    oldPages: getFiles(oldOutDir),
    newPages: getFiles(newOutDir)
  };
}

function registerGitIpc(ipcMain) {
  ipcMain.handle("hyper:git:status", async (_event, cwd) => {
    return await getGitStatus(cwd);
  });

  ipcMain.handle("hyper:git:diff", async (_event, { cwd, filePath, staged }) => {
    try {
      const diff = await getGitDiff(cwd, filePath, staged);
      return { ok: true, diff };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("hyper:git:commit", async (_event, { cwd, message, files }) => {
    try {
      const out = await gitCommit(cwd, message, files);
      return { ok: true, output: out };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("hyper:git:office-diff", async (_event, { cwd, filePath, commit }) => {
    try {
      return await getOfficeVisualDiff(cwd, filePath, commit);
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });
}

module.exports = {
  getGitStatus,
  getGitDiff,
  gitCommit,
  getOfficeVisualDiff,
  registerGitIpc
};
