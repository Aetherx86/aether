"use strict";

const { spawn } = require("node:child_process");
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

    const defaultCwd = options.cwd || os.homedir();
    const isWin = process.platform === "win32";
    const shell = options.shell || (isWin ? "powershell.exe" : (process.env.SHELL || "/bin/zsh"));

    // Ensure PATH has Aether CLI directory and Node runtime
    const cliDir = fs.existsSync("/Users/sushikim/Desktop/Aether.app/Contents/Resources/cli")
      ? "/Users/sushikim/Desktop/Aether.app/Contents/Resources/cli"
      : "/Applications/dumped.app/Contents/Resources/cli";
    const currentPath = process.env.PATH || "";
    const enhancedPath = `${cliDir}:${path.join(cliDir, "bin")}:/usr/local/bin:/opt/homebrew/bin:${currentPath}`;

    const env = {
      ...process.env,
      ...options.env,
      PATH: enhancedPath,
      TERM: "xterm-256color",
      COLORTERM: "truecolor",
      LANG: process.env.LANG || "ko_KR.UTF-8"
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
}

module.exports = {
  terminalManager,
  registerTerminalIpc
};
