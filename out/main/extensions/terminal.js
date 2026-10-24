"use strict";

const { spawn, exec } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

class TerminalSessionManager {
  constructor() {
    this.sessions = new Map();
  }

  createSession(id = "default", options = {}, sender = null) {
    if (this.sessions.has(id)) {
      this.killSession(id);
    }

    const defaultCwd = options.cwd || "/Users/sushikim/Desktop/app_source";
    const isWin = process.platform === "win32";
    const shell = options.shell || (isWin ? "powershell.exe" : (process.env.SHELL || "/bin/zsh"));

    const cliDir = fs.existsSync("/Users/sushikim/Desktop/Aetheum.app/Contents/Resources/cli")
      ? "/Users/sushikim/Desktop/Aetheum.app/Contents/Resources/cli"
      : path.resolve(__dirname, "../../cli");
    const currentPath = process.env.PATH || "";
    const enhancedPath = `${cliDir}:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${currentPath}`;

    const env = {
      ...process.env,
      ...options.env,
      PATH: enhancedPath,
      TERM: "xterm-256color",
      COLORTERM: "truecolor",
      LANG: process.env.LANG || "ko_KR.UTF-8",
      PAGER: "cat",
      GIT_PAGER: "cat",
      MANPAGER: "cat"
    };

    const child = spawn(shell, isWin ? [] : ["-l"], {
      cwd: defaultCwd,
      env,
      stdio: ["pipe", "pipe", "pipe"]
    });

    const sendData = (data) => {
      if (sender && !sender.isDestroyed()) {
        sender.send("hyper:term:output", { id, data: data.toString("utf8") });
      }
    };

    child.stdout.on("data", sendData);
    child.stderr.on("data", sendData);

    child.on("exit", (code) => {
      if (sender && !sender.isDestroyed()) {
        sender.send("hyper:term:exit", { id, code });
      }
      this.sessions.delete(id);
    });

    child.on("error", (err) => {
      sendData(`\r\n[Terminal Error: ${err.message}]\r\n`);
    });

    this.sessions.set(id, {
      id,
      child,
      cwd: defaultCwd,
      shell,
      sender
    });

    // Send initial greeting to verify connection
    setTimeout(() => {
      sendData(`\x1b[1;34mAetheum Shell Session Initialized\x1b[0m\r\nWorking Directory: ${defaultCwd}\r\nType 'aetheum --help' or any command.\r\n\r\n`);
    }, 100);

    return { id, shell, cwd: defaultCwd };
  }

  write(id, input) {
    const session = this.sessions.get(id);
    if (!session || !session.child.stdin.writable) return false;
    session.child.stdin.write(input);
    return true;
  }

  killSession(id) {
    const session = this.sessions.get(id);
    if (!session) return false;
    try {
      session.child.kill();
    } catch {
      // ignore
    }
    this.sessions.delete(id);
    return true;
  }

  killAll() {
    for (const id of this.sessions.keys()) {
      this.killSession(id);
    }
  }

  executeOneShot(cmd, cwd = "/Users/sushikim/Desktop/app_source") {
    return new Promise((resolve) => {
      const cliDir = fs.existsSync("/Users/sushikim/Desktop/Aetheum.app/Contents/Resources/cli")
        ? "/Users/sushikim/Desktop/Aetheum.app/Contents/Resources/cli"
        : path.resolve(__dirname, "../../cli");
      const currentPath = process.env.PATH || "";
      const enhancedPath = `${cliDir}:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${currentPath}`;

      exec(cmd, {
        cwd,
        env: {
          ...process.env,
          PATH: enhancedPath,
          TERM: "xterm-256color",
          PAGER: "cat",
          GIT_PAGER: "cat"
        },
        maxBuffer: 10 * 1024 * 1024
      }, (err, stdout, stderr) => {
        resolve({
          ok: !err,
          code: err ? (err.code || 1) : 0,
          stdout: stdout || "",
          stderr: stderr || (err ? err.message : "")
        });
      });
    });
  }
}

const terminalManager = new TerminalSessionManager();

function registerTerminalIpc(ipcMain) {
  ipcMain.handle("hyper:term:create", (event, { id = "default", cwd, shell } = {}) => {
    return terminalManager.createSession(id, { cwd, shell }, event.sender);
  });

  ipcMain.handle("hyper:term:write", (_event, { id = "default", input }) => {
    return terminalManager.write(id, input);
  });

  ipcMain.handle("hyper:term:kill", (_event, { id = "default" }) => {
    return terminalManager.killSession(id);
  });

  ipcMain.handle("hyper:term:exec", async (_event, { cmd, cwd }) => {
    return await terminalManager.executeOneShot(cmd, cwd);
  });
}

module.exports = {
  terminalManager,
  registerTerminalIpc
};