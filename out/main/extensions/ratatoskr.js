"use strict";

const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs");
const { execSync } = require("node:child_process");

function executeApiRequest({ method = "GET", url, headers = {}, body = null, timeout = 10000 }) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    try {
      const parsed = new URL(url);
      const isHttps = parsed.protocol === "https:";
      const client = isHttps ? https : http;

      const reqHeaders = { ...headers };
      let payload = body;
      if (body && typeof body === "object") {
        payload = JSON.stringify(body);
        if (!reqHeaders["content-type"]) reqHeaders["content-type"] = "application/json";
      }

      if (payload && !reqHeaders["content-length"]) {
        reqHeaders["content-length"] = Buffer.byteLength(payload);
      }

      const options = {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: method.toUpperCase(),
        headers: reqHeaders,
        timeout
      };

      const req = client.request(options, (res) => {
        let responseData = "";
        res.on("data", chunk => responseData += chunk);
        res.on("end", () => {
          const duration = Date.now() - startTime;
          let parsedJson = null;
          try {
            parsedJson = JSON.parse(responseData);
          } catch {}

          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 400,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data: parsedJson || responseData,
            raw: responseData,
            duration,
            isJson: !!parsedJson
          });
        });
      });

      req.on("error", (err) => {
        resolve({
          ok: false,
          status: 0,
          statusText: "Network Error",
          error: err.message,
          duration: Date.now() - startTime
        });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({
          ok: false,
          status: 408,
          statusText: "Request Timeout",
          error: "Client request timed out after " + timeout + "ms",
          duration: Date.now() - startTime
        });
      });

      if (payload) req.write(payload);
      req.end();
    } catch (e) {
      resolve({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        error: e.message,
        duration: Date.now() - startTime
      });
    }
  });
}

function querySqliteDb(dbPath, sql) {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file not found: ${dbPath}`);
  }
  try {
    // Execute via macOS built-in sqlite3 CLI tool for fast, dependency-free execution
    const cmd = `sqlite3 -json "${dbPath}" "${sql.replace(/"/g, '\\"')}"`;
    const output = execSync(cmd, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024, timeout: 5000 });
    const json = JSON.parse(output || "[]");
    return { ok: true, rows: json, count: json.length };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function listSqliteTables(dbPath) {
  return querySqliteDb(dbPath, "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%';");
}

function registerRatatoskrIpc(ipcMain) {
  ipcMain.handle("hyper:ratatoskr:request", async (_event, payload) => {
    return await executeApiRequest(payload);
  });

  ipcMain.handle("hyper:ratatoskr:query-sqlite", (_event, { dbPath, sql }) => {
    return querySqliteDb(dbPath, sql);
  });

  ipcMain.handle("hyper:ratatoskr:list-tables", (_event, dbPath) => {
    return listSqliteTables(dbPath);
  });
}

module.exports = {
  executeApiRequest,
  querySqliteDb,
  listSqliteTables,
  registerRatatoskrIpc
};
