"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { exec } = require("node:child_process");

const CORE_MCP_TOOLS = new Set([
  "list_open_documents",
  "read_open_document",
  "create_document",
  "read_document",
  "edit_document",
  "save_document",
  "create_sheet",
  "read_sheet",
  "edit_sheet",
  "save_sheet",
  "create_presentation",
  "read_deck",
  "edit_presentation",
  "save_presentation",
  "read_pdf",
  "read_hwp",
  "propose_skill",
  "propose_skill_install"
]);

function isInsideDir(candidate, rootDir) {
  const rel = path.relative(path.resolve(rootDir), path.resolve(candidate));
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

function touchesProtectedPath(targetOrCmd, protectedPaths = [], isCommand = false) {
  for (const guard of protectedPaths) {
    if (!guard) continue;
    const resolvedGuard = path.resolve(guard);
    if (isCommand) {
      if (resolvedGuard.length > 3 && String(targetOrCmd).includes(resolvedGuard)) return true;
    } else if (isInsideDir(targetOrCmd, resolvedGuard)) {
      return true;
    }
  }
  return false;
}

async function parseMcpHttpResponse(resp) {
  const ct = (resp.headers.get("content-type") || "").toLowerCase();
  const raw = await resp.text();
  if (ct.includes("text/event-stream")) {
    const lines = raw.split(/\r?\n/);
    let lastJson = null;
    for (const ln of lines) {
      if (ln.startsWith("data:")) {
        const payload = ln.slice(5).trim();
        if (!payload) continue;
        try {
          lastJson = JSON.parse(payload);
        } catch {
          // ignore non-json comments
        }
      }
    }
    return lastJson;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function connectAppMcpClient(appMcp) {
  if (!appMcp?.url || !appMcp?.token) return null;
  let mcpSessionId = null;
  let nextRpcId = 1;

  const rpc = async (method, params, isNotification = false) => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      Authorization: `Bearer ${appMcp.token}`,
      ...(mcpSessionId ? { "mcp-session-id": mcpSessionId } : {})
    };
    const body = isNotification
      ? { jsonrpc: "2.0", method, ...(params ? { params } : {}) }
      : { jsonrpc: "2.0", id: nextRpcId++, method, ...(params ? { params } : {}) };
    const resp = await fetch(appMcp.url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });
    const sid = resp.headers.get("mcp-session-id");
    if (sid) mcpSessionId = sid;
    if (isNotification) return null;
    return parseMcpHttpResponse(resp);
  };

  try {
    await rpc("initialize", {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "aether-builtin-agent", version: "1.0.0" }
    });
    await rpc("notifications/initialized", {}, true);
    const listed = await rpc("tools/list", {});
    const rawTools = Array.isArray(listed?.result?.tools) ? listed.result.tools : [];
    const selected = rawTools.slice(0, 32);
    return {
      tools: selected.map((t) => ({
        name: t.name,
        description: String(t.description || t.name).slice(0, 900),
        inputSchema: t.inputSchema || { type: "object", properties: {} }
      })),
      async callTool(name, args) {
        const res = await rpc("tools/call", { name, arguments: args || {} });
        if (res?.error) {
          return { output: res.error.message || JSON.stringify(res.error), isError: true };
        }
        const parts = Array.isArray(res?.result?.content) ? res.result.content : [];
        const text = parts.map((p) => p?.text ?? JSON.stringify(p)).join("\n");
        return { output: text || "OK", isError: res?.result?.isError === true };
      }
    };
  } catch (err) {
    console.warn("[AetherAgent] MCP bridge init warning:", err.message);
    return null;
  }
}

function buildBuiltinProjectTools() {
  return [
    {
      name: "list_project_files",
      description: "List files and directories inside the project folder (relative path, empty for root).",
      inputSchema: {
        type: "object",
        properties: {
          subpath: { type: "string", description: "Relative subdirectory inside projectRoot (default '.')" }
        }
      }
    },
    {
      name: "read_project_file",
      description: "Read a UTF-8 text file inside the project folder.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative or absolute path inside the project folder" }
        },
        required: ["path"]
      }
    },
    {
      name: "write_project_file",
      description: "Create or overwrite a UTF-8 text file inside the project folder.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative or absolute path inside the project folder" },
          content: { type: "string", description: "Full file contents to write" }
        },
        required: ["path", "content"]
      }
    },
    {
      name: "run_command",
      description: "Execute a shell command in the project folder and return stdout/stderr.",
      inputSchema: {
        type: "object",
        properties: {
          command: { type: "string", description: "Shell command to run in projectRoot" }
        },
        required: ["command"]
      }
    }
  ];
}

async function startAetherAgentSession(options, onEvent, runtime) {
  const projectRoot = path.resolve(options.projectRoot);
  let openDocuments = Array.isArray(options.openDocuments) ? [...options.openDocuments] : [];
  const protectedPaths = Array.isArray(options.protectedPaths) ? options.protectedPaths : [];
  let ended = false;
  let busy = false;
  let activeAbort = null;
  const pendingPermissions = new Map();
  const history = [];

  const emit = (ev) => {
    if (!ended) onEvent(ev);
  };

  const mcpClient = await connectAppMcpClient(options.appMcp);
  const allTools = [...buildBuiltinProjectTools(), ...(mcpClient ? mcpClient.tools : [])];

  const systemPrompt = [
    "You are Aether's built-in autonomous workspace & document agent.",
    `Project folder: ${projectRoot}`,
    "Respond in the same language as the user (e.g., Korean when asked in Korean).",
    "Use the provided tools to inspect/read/write files in the project folder, run commands when needed, and create or edit Aether Office documents (.docx, .xlsx, .pptx, .pdf, .hwp).",
    options.instructions || ""
  ].filter(Boolean).join("\n\n");

  const askPermission = (action) =>
    new Promise((resolve) => {
      const reqId = crypto.randomUUID();
      pendingPermissions.set(reqId, resolve);
      emit({
        type: "permission",
        request: { ...action, id: reqId, provider: "aether-ai" }
      });
    });

  const executeSingleTool = async (call) => {
    const args = call.input && typeof call.input === "object" ? call.input : {};

    if (call.name === "list_project_files") {
      const sub = typeof args.subpath === "string" && args.subpath.trim() ? args.subpath.trim() : ".";
      const full = path.resolve(projectRoot, sub);
      const action = { kind: "read", tool: call.name, paths: [full], target: full };
      if (!isInsideDir(full, projectRoot) || touchesProtectedPath(full, protectedPaths)) {
        emit({ type: "tool", action, status: "denied" });
        return { output: "Access denied: path must stay inside the project folder.", isError: true };
      }
      emit({ type: "tool", action, status: "running" });
      try {
        const entries = fs.readdirSync(full, { withFileTypes: true }).slice(0, 200).map((d) =>
          d.isDirectory() ? `${d.name}/` : d.name
        );
        emit({ type: "tool", action, status: "done" });
        return { output: entries.join("\n") || "(empty folder)", isError: false };
      } catch (err) {
        emit({ type: "tool", action, status: "failed" });
        return { output: err.message, isError: true };
      }
    }

    if (call.name === "read_project_file") {
      const rawPath = String(args.path || "");
      const full = path.isAbsolute(rawPath) ? path.resolve(rawPath) : path.resolve(projectRoot, rawPath);
      const action = { kind: "read", tool: call.name, paths: [full], target: full };
      const inSkillDir = options.skillBundleDir && isInsideDir(full, options.skillBundleDir);
      if ((!isInsideDir(full, projectRoot) && !inSkillDir) || touchesProtectedPath(full, protectedPaths)) {
        emit({ type: "tool", action, status: "denied" });
        return { output: "Access denied: can only read files inside the project folder.", isError: true };
      }
      emit({ type: "tool", action, status: "running" });
      try {
        const content = fs.readFileSync(full, "utf8").slice(0, 60000);
        emit({ type: "tool", action, status: "done" });
        return { output: content, isError: false };
      } catch (err) {
        emit({ type: "tool", action, status: "failed" });
        return { output: err.message, isError: true };
      }
    }

    if (call.name === "write_project_file") {
      const rawPath = String(args.path || "");
      const full = path.isAbsolute(rawPath) ? path.resolve(rawPath) : path.resolve(projectRoot, rawPath);
      const action = { kind: "write", tool: call.name, paths: [full], target: full };
      if (!isInsideDir(full, projectRoot) || touchesProtectedPath(full, protectedPaths)) {
        emit({ type: "tool", action, status: "denied" });
        return { output: "Access denied: can only write files inside the project folder.", isError: true };
      }
      if (openDocuments.some((docPath) => path.resolve(docPath) === full)) {
        emit({ type: "tool", action, status: "denied" });
        return {
          output: "This file is currently open in an Aether editor tab; edit it via the Aether document tools instead.",
          isError: true
        };
      }
      if (options.mode === "ask-writes") {
        const ans = await askPermission(action);
        if (!ans.allow) {
          emit({ type: "tool", action, status: "denied" });
          return { output: "The user declined writing this file.", isError: true };
        }
      }
      emit({ type: "tool", action, status: "running" });
      try {
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, String(args.content ?? ""), "utf8");
        emit({ type: "tool", action, status: "done" });
        return { output: `Wrote ${full}`, isError: false };
      } catch (err) {
        emit({ type: "tool", action, status: "failed" });
        return { output: err.message, isError: true };
      }
    }

    if (call.name === "run_command") {
      const cmd = String(args.command || "").trim();
      const action = {
        kind: "command",
        tool: call.name,
        command: cmd,
        summary: cmd.slice(0, 120),
        cwd: projectRoot,
        paths: []
      };
      if (!cmd || touchesProtectedPath(cmd, protectedPaths, true)) {
        emit({ type: "tool", action, status: "denied" });
        return { output: "Command blocked by protected path policy.", isError: true };
      }
      if (options.mode !== "trust-project") {
        const ans = await askPermission(action);
        if (!ans.allow) {
          emit({ type: "tool", action, status: "denied" });
          return { output: "The user declined running this command.", isError: true };
        }
      }
      emit({ type: "tool", action, status: "running" });
      return new Promise((resolve) => {
        exec(cmd, { cwd: projectRoot, timeout: 30000, maxBuffer: 2 * 1024 * 1024 }, (err, stdout, stderr) => {
          const combined = [stdout, stderr].filter(Boolean).join("\n").slice(0, 24000);
          if (err) {
            emit({ type: "tool", action, status: "failed" });
            resolve({ output: combined || err.message, isError: true });
          } else {
            emit({ type: "tool", action, status: "done" });
            resolve({ output: combined || "(exit 0)", isError: false });
          }
        });
      });
    }

    if (mcpClient) {
      const targetPath = typeof args.path === "string" ? args.path : undefined;
      const action = {
        kind: "app-tool",
        tool: call.name,
        paths: targetPath ? [targetPath] : [],
        ...(targetPath ? { target: targetPath } : {})
      };
      emit({ type: "tool", action, status: "running" });
      const res = await mcpClient.callTool(call.name, args);
      emit({ type: "tool", action, status: res.isError ? "failed" : "done" });
      return res;
    }

    return { output: `Unknown tool: ${call.name}`, isError: true };
  };

  setImmediate(() => {
    emit({
      type: "started",
      provider: "aether-ai",
      model: runtime.modelLabel || "gemini-3.5-flash-lite",
      skills: options.skills || []
    });
  });

  return {
    provider: "aether-ai",
    async send(userText) {
      if (ended) throw new Error("The agent session has ended");
      if (busy) throw new Error("The agent is still answering the previous message");
      busy = true;
      const ac = new AbortController();
      activeAbort = ac;
      history.push({ role: "user", text: userText });

      void (async () => {
        try {
          for (let step = 0; step < 8; step++) {
            if (ended || ac.signal.aborted) break;
            let turnText = "";
            const toolCalls = [];
            await runtime.streamTurn(systemPrompt, history, allTools, {
              signal: ac.signal,
              onDelta: (delta) => {
                turnText += delta;
              },
              onToolCall: (tc) => {
                toolCalls.push(tc);
              }
            });

            if (turnText.trim()) {
              emit({ type: "text", text: turnText.trim() });
            }

            history.push({
              role: "assistant",
              text: turnText,
              ...(toolCalls.length > 0 ? { toolCalls } : {})
            });

            if (toolCalls.length === 0) {
              break;
            }

            const results = [];
            for (const call of toolCalls) {
              if (ended || ac.signal.aborted) break;
              const outcome = await executeSingleTool(call);
              results.push({
                id: call.id,
                name: call.name,
                output: String(outcome.output ?? ""),
                isError: outcome.isError === true
              });
            }
            history.push({ role: "tool", results });
          }
          emit({ type: "turn-done", ok: true });
        } catch (err) {
          if (!ended && !ac.signal.aborted) {
            emit({ type: "text", text: `⚠️ 오류: ${err instanceof Error ? err.message : String(err)}` });
            emit({ type: "turn-done", ok: false });
          }
        } finally {
          busy = false;
          activeAbort = null;
        }
      })();
    },
    answer(requestId, answer) {
      const resolver = pendingPermissions.get(requestId);
      if (!resolver) return;
      pendingPermissions.delete(requestId);
      resolver(answer || { allow: false });
    },
    setOpenDocuments(paths) {
      openDocuments = Array.isArray(paths) ? [...paths] : [];
    },
    stop() {
      if (ended) return;
      ended = true;
      activeAbort?.abort();
      for (const [, resolve] of pendingPermissions) {
        resolve({ allow: false });
      }
      pendingPermissions.clear();
      onEvent({ type: "ended" });
    }
  };
}

module.exports = {
  startAetherAgentSession
};
