"use strict";

const net = require("node:net");
const http = require("node:http");
const https = require("node:https");

let proxyServer = null;
let isRunning = false;
let listenPort = 8087;
let stats = {
  active: false,
  port: 8087,
  packetsFragmented: 0,
  connectionsHandled: 0,
  sniBypassed: 0
};

// DNS-over-HTTPS resolver cache to avoid DNS poisoning
const dnsCache = new Map();

async function resolveDoH(hostname) {
  if (net.isIP(hostname)) return hostname;
  if (dnsCache.has(hostname)) return dnsCache.get(hostname);

  return new Promise((resolve) => {
    const dohUrl = `https://1.1.1.1/dns-query?name=${encodeURIComponent(hostname)}&type=A`;
    const req = https.get(dohUrl, { headers: { "Accept": "application/dns-json" }, timeout: 1500 }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.Answer && json.Answer.length > 0) {
            const ipRecord = json.Answer.find(a => a.type === 1);
            if (ipRecord && ipRecord.data) {
              dnsCache.set(hostname, ipRecord.data);
              return resolve(ipRecord.data);
            }
          }
        } catch {}
        resolve(hostname);
      });
    });
    req.on("error", () => resolve(hostname));
    req.on("timeout", () => { req.destroy(); resolve(hostname); });
  });
}

function startSleipnir(port = 8087) {
  if (isRunning && proxyServer) return Promise.resolve(stats);
  listenPort = port;

  return new Promise((resolve, reject) => {
    proxyServer = http.createServer((req, res) => {
      // Standard HTTP proxying
      const parsed = new URL(req.url, `http://${req.headers.host}`);
      const options = {
        hostname: parsed.hostname,
        port: parsed.port || 80,
        path: parsed.pathname + parsed.search,
        method: req.method,
        headers: req.headers
      };
      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
      proxyReq.on("error", () => {
        try { res.writeHead(502); res.end("Sleipnir Gateway Error"); } catch {}
      });
      req.pipe(proxyReq);
    });

    // HTTPS CONNECT Tunneling with SNI Packet Splitting (WinDivert/Unicorn HTTPS logic)
    proxyServer.on("connect", async (req, clientSocket, head) => {
      stats.connectionsHandled++;
      const [host, rawPort] = req.url.split(":");
      const portNum = parseInt(rawPort, 10) || 443;

      // 1. Resolve host via DoH if possible
      const targetHost = await resolveDoH(host);

      const targetSocket = net.connect(portNum, targetHost, () => {
        clientSocket.write("HTTP/1.1 200 Connection Established\r\nProxy-Agent: Sleipnir-SNI-Bypass/1.0\r\n\r\n");
        targetSocket.setNoDelay(true);
        clientSocket.setNoDelay(true);

        let isFirstTlsRecord = true;

        clientSocket.once("data", (chunk) => {
          // Detect TLS ClientHello (Content Type 0x16, Version 0x03 0x01/0x02/0x03)
          if (chunk.length > 5 && chunk[0] === 0x16 && chunk[1] === 0x03) {
            stats.packetsFragmented++;
            stats.sniBypassed++;

            // WinDivert / Unicorn HTTPS strategy:
            // Segment the TLS ClientHello TCP payload into 2 packets (first 5 bytes, then rest)
            // with a microsecond delay. Deep Packet Inspection boxes expecting the full SNI in
            // the initial TCP segment will fail to match blocked hostnames.
            const splitPos = Math.min(5, Math.floor(chunk.length / 2));
            targetSocket.write(chunk.slice(0, splitPos));

            setTimeout(() => {
              if (!targetSocket.destroyed) {
                targetSocket.write(chunk.slice(splitPos));
                // Forward the remainder normally
                clientSocket.pipe(targetSocket);
                targetSocket.pipe(clientSocket);
              }
            }, 2);
          } else {
            targetSocket.write(chunk);
            clientSocket.pipe(targetSocket);
            targetSocket.pipe(clientSocket);
          }
        });

        if (head && head.length > 0) {
          clientSocket.emit("data", head);
        }
      });

      targetSocket.on("error", () => clientSocket.destroy());
      clientSocket.on("error", () => targetSocket.destroy());
    });

    proxyServer.listen(listenPort, "127.0.0.1", () => {
      isRunning = true;
      stats.active = true;
      stats.port = listenPort;
      console.log(`[Sleipnir] HTTPS SNI Packet Splitting Proxy active on 127.0.0.1:${listenPort}`);
      resolve(stats);
    });

    proxyServer.on("error", (err) => {
      console.error("[Sleipnir] Proxy error:", err.message);
      isRunning = false;
      stats.active = false;
      resolve(stats);
    });
  });
}

function stopSleipnir() {
  if (!isRunning || !proxyServer) {
    stats.active = false;
    return Promise.resolve(stats);
  }
  return new Promise((resolve) => {
    proxyServer.close(() => {
      isRunning = false;
      stats.active = false;
      proxyServer = null;
      console.log("[Sleipnir] Proxy stopped.");
      resolve(stats);
    });
  });
}

function getSleipnirStatus() {
  return { ...stats, active: isRunning };
}

function registerSleipnirIpc(ipcMain) {
  // Start Sleipnir by default
  startSleipnir(8087).catch(() => {});

  ipcMain.handle("hyper:sleipnir:status", () => {
    return getSleipnirStatus();
  });

  ipcMain.handle("hyper:sleipnir:toggle", async () => {
    if (isRunning) {
      await stopSleipnir();
    } else {
      await startSleipnir(listenPort);
    }
    return getSleipnirStatus();
  });

  ipcMain.handle("hyper:sleipnir:set", async (_event, enable) => {
    if (enable && !isRunning) {
      await startSleipnir(listenPort);
    } else if (!enable && isRunning) {
      await stopSleipnir();
    }
    return getSleipnirStatus();
  });
}

module.exports = {
  startSleipnir,
  stopSleipnir,
  getSleipnirStatus,
  registerSleipnirIpc
};
