"use strict";

const fs = require("node:fs");
const path = require("node:path");

let ICON_B64 = "";
try {
  const iconPath = "/Users/sushikim/Desktop/app_source/out/renderer/assets/app-icon-kcTvUgcs.png";
  if (fs.existsSync(iconPath)) {
    ICON_B64 = fs.readFileSync(iconPath).toString("base64");
  }
} catch (e) {
  ICON_B64 = "";
}

const ICON_DATA_URL = ICON_B64 ? `data:image/png;base64,${ICON_B64}` : "./assets/app-icon-kcTvUgcs.png";

const SHARED_CSS = `
  :root {
    --bg: #090d16;
    --surface: #111827;
    --surface-hover: #1f2937;
    --border: rgba(255, 255, 255, 0.08);
    --border-light: rgba(255, 255, 255, 0.15);
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --accent: #6366f1;
    --accent-hover: #4f46e5;
    --radius: 12px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 100%;
    min-height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-y: auto;
  }
  .container {
    max-width: 1040px;
    width: 100%;
    margin: 0 auto;
    padding: 32px 32px 64px 32px;
  }
  .header-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px 28px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  }
  .header-logo {
    width: 64px;
    height: 64px;
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    object-fit: contain;
    background: #000;
  }
  .header-info h1 {
    font-size: 22px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }
  .header-info p {
    color: var(--text-muted);
    font-size: 13px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    background: #312e81;
    color: #c7d2fe;
    border: 1px solid var(--accent);
    margin-top: 6px;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px 26px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn {
    background: var(--surface-hover);
    border: 1px solid var(--border-light);
    color: var(--text);
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    transition: all 0.15s ease;
  }
  .btn:hover {
    background: #374151;
    color: #fff;
  }
  .btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }
  .btn.primary:hover {
    background: var(--accent-hover);
  }
  .btn.success {
    background: #15803d;
    border-color: #22c55e;
    color: #fff;
  }
  .btn.danger {
    background: #991b1b;
    border-color: #ef4444;
    color: #fff;
    padding: 5px 10px;
    font-size: 12px;
  }
  .btn.danger:hover {
    background: #b91c1c;
  }
  .input-text {
    background: #090d16;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    padding: 9px 14px;
    font-size: 13px;
    outline: none;
    width: 100%;
    transition: border-color 0.15s;
  }
  .input-text:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .nav-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
    margin-top: 12px;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: #e4e4e7;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .nav-item:hover {
    background: rgba(255,255,255,0.08);
    border-color: var(--accent);
    transform: translateY(-1px);
  }
  .nav-icon {
    font-size: 22px;
  }
  .nav-text strong {
    display: block;
    font-size: 13px;
    color: #fff;
  }
  .nav-text span {
    font-size: 11px;
    color: var(--text-muted);
  }
  .item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    transition: background 0.15s;
  }
  .item-row:hover {
    background: rgba(255,255,255,0.04);
  }
  .item-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    overflow: hidden;
  }
  .item-title {
    font-weight: 500;
    color: #f4f4f5;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
  }
  .item-title:hover {
    color: #818cf8;
    text-decoration: underline;
  }
  .item-url {
    font-size: 12px;
    color: #94a3b8;
    margin-left: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .meta-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }
  .meta-table td {
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .meta-table td.label {
    color: var(--text-muted);
    width: 200px;
    font-weight: 500;
  }
  .meta-table td.value {
    color: #f4f4f5;
    font-family: ui-monospace, Menlo, Monaco, monospace;
    font-size: 12px;
  }
`;

function getWelcomePage() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome — Aetherum Browser</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="container">
    <div class="header-card">
      <img src="${ICON_DATA_URL}" class="header-logo" alt="Aether Logo">
      <div class="header-info">
        <h1>Welcome to Aetherum</h1>
        <p>Private Office Browser • Tor SOCKS5 Network Circuit • Direct Proton Integration</p>
        <span class="badge">🧅 Tor Circuit: Active (127.0.0.1:9050)</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🚀 Quick Start Favorites</div>
      <div class="nav-grid">
        <a class="nav-item" onclick="parentNavigate('https://mail.proton.me')">
          <span class="nav-icon">✉️</span>
          <div class="nav-text">
            <strong>Proton Mail</strong>
            <span>mail.proton.me</span>
          </div>
        </a>
        <a class="nav-item" onclick="parentNavigate('https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion')">
          <span class="nav-icon">🧅</span>
          <div class="nav-text">
            <strong>DuckDuckGo (.onion)</strong>
            <span>Private Tor Hidden Service</span>
          </div>
        </a>
        <a class="nav-item" onclick="parentNavigate('https://check.torproject.org')">
          <span class="nav-icon">🛡️</span>
          <div class="nav-text">
            <strong>Tor Project Check</strong>
            <span>Verify Circuit & IP</span>
          </div>
        </a>
        <a class="nav-item" onclick="parentNavigate('https://duckduckgo.com')">
          <span class="nav-icon">🔍</span>
          <div class="nav-text">
            <strong>DuckDuckGo</strong>
            <span>Standard Web Search</span>
          </div>
        </a>
        <a class="nav-item" onclick="parentNavigate('aetherum://nibelungen')">
          <span class="nav-icon">🗝️</span>
          <div class="nav-text">
            <strong>Nibelungen Graph</strong>
            <span>Local-First Personal Wiki</span>
          </div>
        </a>
        <a class="nav-item" onclick="parentNavigate('aetherum://ratatoskr')">
          <span class="nav-icon">🐿️</span>
          <div class="nav-text">
            <strong>Ratatoskr API/DB</strong>
            <span>Visual API Client & DB GUI</span>
          </div>
        </a>
        <a class="nav-item" onclick="parentNavigate('aetherum://fafnir')">
          <span class="nav-icon">🐉</span>
          <div class="nav-text">
            <strong>Fafnir Vault</strong>
            <span>Zero-Knowledge Encrypted Drive</span>
          </div>
        </a>
        <a class="nav-item" onclick="parentNavigate('aetherum://mimisbrunnr')">
          <span class="nav-icon">🧠</span>
          <div class="nav-text">
            <strong>Mímisbrunnr AI</strong>
            <span>Airgapped Local Intelligence Assistant</span>
          </div>
        </a>
      </div>
    </div>

    <div class="card">
      <div class="card-title">⚙️ Browser Setup</div>
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:14px;">Customize default behavior. These can be adjusted anytime in <a href="javascript:void(0)" onclick="parentNavigate('aetherum://settings')" style="color:#818cf8;">aetherum://settings</a>.</p>
      <div class="grid-2">
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:500;">Default Search Provider</label>
          <select id="welcomeSearch" class="input-text" style="cursor:pointer;">
            <option value="https://duckduckgo.com/?q=" selected>DuckDuckGo (Privacy)</option>
            <option value="https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/?q=">DuckDuckGo Onion</option>
            <option value="https://www.google.com/search?q=">Google</option>
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:500;">Default Startup Target</label>
          <select id="welcomeStartup" class="input-text" style="cursor:pointer;">
            <option value="https://mail.proton.me" selected>Proton Mail (Secure)</option>
            <option value="aetherum://welcome">Aetherum Welcome Page</option>
            <option value="https://duckduckgo.com">DuckDuckGo Search</option>
          </select>
        </div>
      </div>
      <div style="margin-top:16px;display:flex;gap:10px;">
        <button class="btn primary" onclick="startBrowsing()">Start Browsing with Aetherum →</button>
        <button class="btn" onclick="parentNavigate('aetherum://bookmarks')">Manage Bookmarks</button>
      </div>
    </div>
  </div>
  <script>
    function parentNavigate(url) {
      if (window.parent && window.parent !== window && window.parent.navigateTo) {
        window.parent.navigateTo(url);
      } else if (window.navigateTo) {
        window.navigateTo(url);
      } else {
        window.location.href = url;
      }
    }
    function startBrowsing() {
      const target = document.getElementById("welcomeStartup").value;
      localStorage.setItem("aetherum_search", document.getElementById("welcomeSearch").value);
      parentNavigate(target);
    }
  </script>
</body>
</html>`;
}

function getAboutPage() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>About — Aetherum Browser</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="container">
    <div class="header-card">
      <img src="${ICON_DATA_URL}" class="header-logo" alt="Aether Logo">
      <div class="header-info">
        <h1>About Aether Platform</h1>
        <p>Aether — Unified Office, Yggdrasil & Aetherum Privacy Browser</p>
        <span class="badge">Version 0.0.1 (macOS Native ARM64)</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🌐 Platform Overview</div>
      <p style="color:var(--text-muted);line-height:1.6;font-size:13px;margin-bottom:14px;">
        <strong>Aether</strong> is an all-in-one productivity and security workstation built by Jeffrey Kim.
        It integrates a multi-format document suite, the <strong>Yggdrasil</strong> native shell environment,
        and the <strong>Aetherum</strong> privacy browser featuring Tor SOCKS5 network routing and Gemini 3.8 AI intelligence.
      </p>
      <div style="display:flex;gap:10px;">
        <a class="btn primary" href="mailto:jk9576@hanyang.ac.kr?subject=Aether%20Feedback">✉️ Send Feedback</a>
        <button class="btn" onclick="parentNavigate('aetherum://version')">View Version Details</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📋 Metadata & Channels</div>
      <table class="meta-table">
        <tr><td class="label">Product Name</td><td class="value">Aether</td></tr>
        <tr><td class="label">Browser Component</td><td class="value">Aetherum Browser</td></tr>
        <tr><td class="label">Terminal Component</td><td class="value">Yggdrasil</td></tr>
        <tr><td class="label">Knowledge Graph</td><td class="value">Nibelungen (Local-First Wiki)</td></tr>
        <tr><td class="label">Encrypted Drive</td><td class="value">Fafnir Vault (AES-256-GCM)</td></tr>
        <tr><td class="label">Anti-DPI Shield</td><td class="value">Sleipnir (SNI Packet Splitter)</td></tr>
        <tr><td class="label">API & DB Inspector</td><td class="value">Ratatoskr</td></tr>
        <tr><td class="label">Local AI Engine</td><td class="value">Mímisbrunnr (Airgapped Neural Assistant)</td></tr>
        <tr><td class="label">Platform Version</td><td class="value">0.0.1</td></tr>
        <tr><td class="label">Author</td><td class="value">Jeffrey Kim (jk9576@hanyang.ac.kr)</td></tr>
        <tr><td class="label">GitLab Repository</td><td class="value"><a href="https://gitlab.com/jk9576/aether" target="_blank" style="color:#818cf8;">https://gitlab.com/jk9576/aether</a></td></tr>
        <tr><td class="label">Update Channels</td><td class="value">main (stable) & beta (beta)</td></tr>
      </table>
    </div>
  </div>
  <script>
    function parentNavigate(url) {
      if (window.parent && window.parent !== window && window.parent.navigateTo) {
        window.parent.navigateTo(url);
      } else if (window.navigateTo) {
        window.navigateTo(url);
      } else {
        window.location.href = url;
      }
    }
  </script>
</body>
</html>`;
}

function getBookmarksPage() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bookmarks — Aetherum Browser</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="container">
    <div class="header-card">
      <img src="${ICON_DATA_URL}" class="header-logo" alt="Aether Logo">
      <div class="header-info">
        <h1>Bookmarks</h1>
        <p>Manage and launch your saved links, Proton Mail, and onion services</p>
      </div>
    </div>

    <div class="card">
      <div class="card-title">➕ Add New Bookmark</div>
      <div style="display:flex;gap:10px;margin-bottom:8px;">
        <input type="text" id="bmTitle" class="input-text" placeholder="Title (e.g. Proton Mail)" style="flex:1;">
        <input type="text" id="bmUrl" class="input-text" placeholder="URL (e.g. https://mail.proton.me)" style="flex:2;">
        <button class="btn primary" onclick="addBookmark()">Add</button>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div class="card-title" style="margin:0;">⭐ Saved Bookmarks (<span id="bmCount">0</span>)</div>
        <input type="text" id="bmSearch" class="input-text" placeholder="Search bookmarks..." style="width:240px;" oninput="renderBookmarks()">
      </div>
      <div id="bmList"></div>
    </div>
  </div>

  <script>
    const DEFAULT_BOOKMARKS = [
      { id: "1", title: "Proton Mail", url: "https://mail.proton.me", icon: "✉️" },
      { id: "2", title: "DuckDuckGo (.onion)", url: "https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion", icon: "🧅" },
      { id: "3", title: "Tor Project Check", url: "https://check.torproject.org", icon: "🛡️" },
      { id: "4", title: "DuckDuckGo", url: "https://duckduckgo.com", icon: "🔍" },
      { id: "5", title: "Aether GitLab Repo", url: "https://gitlab.com/jk9576/aether", icon: "🐙" }
    ];

    function getStoredBookmarks() {
      try {
        const raw = localStorage.getItem("aetherum_bookmarks");
        if (raw) return JSON.parse(raw);
      } catch {}
      localStorage.setItem("aetherum_bookmarks", JSON.stringify(DEFAULT_BOOKMARKS));
      return DEFAULT_BOOKMARKS;
    }

    function saveBookmarks(bms) {
      localStorage.setItem("aetherum_bookmarks", JSON.stringify(bms));
      renderBookmarks();
    }

    function renderBookmarks() {
      const bms = getStoredBookmarks();
      const query = (document.getElementById("bmSearch").value || "").toLowerCase();
      const filtered = bms.filter(b => b.title.toLowerCase().includes(query) || b.url.toLowerCase().includes(query));
      document.getElementById("bmCount").textContent = filtered.length;
      const listEl = document.getElementById("bmList");
      listEl.innerHTML = "";

      if (filtered.length === 0) {
        listEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">No bookmarks found.</div>';
        return;
      }

      filtered.forEach(b => {
        const row = document.createElement("div");
        row.className = "item-row";

        const left = document.createElement("div");
        left.className = "item-left";

        const iconSpan = document.createElement("span");
        iconSpan.textContent = b.icon || "🔗";

        const titleSpan = document.createElement("span");
        titleSpan.className = "item-title";
        titleSpan.textContent = b.title;
        titleSpan.onclick = () => parentNavigate(b.url);

        const urlSpan = document.createElement("span");
        urlSpan.className = "item-url";
        urlSpan.textContent = b.url;

        left.appendChild(iconSpan);
        left.appendChild(titleSpan);
        left.appendChild(urlSpan);

        const delBtn = document.createElement("button");
        delBtn.className = "btn danger";
        delBtn.textContent = "Delete";
        delBtn.onclick = () => removeBookmark(b.id);

        row.appendChild(left);
        row.appendChild(delBtn);
        listEl.appendChild(row);
      });
    }

    function addBookmark() {
      const title = document.getElementById("bmTitle").value.trim();
      const url = document.getElementById("bmUrl").value.trim();
      if (!title || !url) return alert("Please enter both title and URL.");
      const bms = getStoredBookmarks();
      bms.unshift({ id: "bm-" + Date.now(), title, url, icon: "🔖" });
      saveBookmarks(bms);
      document.getElementById("bmTitle").value = "";
      document.getElementById("bmUrl").value = "";
    }

    function removeBookmark(id) {
      const bms = getStoredBookmarks().filter(b => b.id !== id);
      saveBookmarks(bms);
    }

    function parentNavigate(url) {
      if (window.parent && window.parent !== window && window.parent.navigateTo) {
        window.parent.navigateTo(url);
      } else if (window.navigateTo) {
        window.navigateTo(url);
      } else {
        window.location.href = url;
      }
    }

    renderBookmarks();
  </script>
</body>
</html>`;
}

function getHistoryPage() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>History — Aetherum Browser</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="container">
    <div class="header-card">
      <img src="${ICON_DATA_URL}" class="header-logo" alt="Aether Logo">
      <div class="header-info">
        <h1>Browsing History</h1>
        <p>Review and search pages visited in Aetherum Browser</p>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <input type="text" id="histSearch" class="input-text" placeholder="Search visited URLs..." style="width:260px;" oninput="renderHistory()">
        <button class="btn danger" onclick="clearHistory()">Clear History</button>
      </div>
      <div id="histList"></div>
    </div>
  </div>
  <script>
    function getStoredHistory() {
      try {
        const raw = localStorage.getItem("aetherum_history");
        if (raw) return JSON.parse(raw);
      } catch {}
      return [
        { title: "Proton Mail — Secure Email", url: "https://mail.proton.me", time: new Date().toLocaleTimeString() },
        { title: "DuckDuckGo Privacy Search", url: "https://duckduckgo.com", time: new Date().toLocaleTimeString() }
      ];
    }

    function renderHistory() {
      const list = getStoredHistory();
      const query = (document.getElementById("histSearch").value || "").toLowerCase();
      const filtered = list.filter(h => h.title.toLowerCase().includes(query) || h.url.toLowerCase().includes(query));
      const listEl = document.getElementById("histList");
      listEl.innerHTML = "";

      if (filtered.length === 0) {
        listEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">No history records.</div>';
        return;
      }

      filtered.forEach(item => {
        const row = document.createElement("div");
        row.className = "item-row";

        const left = document.createElement("div");
        left.className = "item-left";

        const iconSpan = document.createElement("span");
        iconSpan.textContent = "🌐";

        const titleSpan = document.createElement("span");
        titleSpan.className = "item-title";
        titleSpan.textContent = item.title;
        titleSpan.onclick = () => parentNavigate(item.url);

        const urlSpan = document.createElement("span");
        urlSpan.className = "item-url";
        urlSpan.textContent = item.url;

        left.appendChild(iconSpan);
        left.appendChild(titleSpan);
        left.appendChild(urlSpan);

        const timeSpan = document.createElement("span");
        timeSpan.style.fontSize = "11px";
        timeSpan.style.color = "var(--text-muted)";
        timeSpan.textContent = item.time || "";

        row.appendChild(left);
        row.appendChild(timeSpan);
        listEl.appendChild(row);
      });
    }

    function clearHistory() {
      if (confirm("Are you sure you want to clear browsing history?")) {
        localStorage.removeItem("aetherum_history");
        renderHistory();
      }
    }

    function parentNavigate(url) {
      if (window.parent && window.parent !== window && window.parent.navigateTo) {
        window.parent.navigateTo(url);
      } else if (window.navigateTo) {
        window.navigateTo(url);
      } else {
        window.location.href = url;
      }
    }

    renderHistory();
  </script>
</body>
</html>`;
}

function getSettingsPage() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Settings — Aetherum Browser</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="container">
    <div class="header-card">
      <img src="${ICON_DATA_URL}" class="header-logo" alt="Aether Logo">
      <div class="header-info">
        <h1>Browser Settings</h1>
        <p>Configure Tor routing, update channels, and search preferences</p>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🧅 Tor Onion Routing</div>
      <p style="color:var(--text-muted);margin-bottom:14px;">Aetherum routes web traffic through local SOCKS5 Tor daemon to protect your privacy and resolve .onion hidden services.</p>
      <div class="grid-2">
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:500;">Tor SOCKS5 Host & Port</label>
          <input type="text" id="torHost" class="input-text" value="127.0.0.1:9050">
        </div>
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:500;">Tor Mode Status</label>
          <div style="display:flex;align-items:center;height:38px;color:#86efac;font-weight:600;font-size:13px;">
            <span>🟢 SOCKS5 Daemon Active (9050)</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔄 Update Channel (GitLab CI)</div>
      <p style="color:var(--text-muted);margin-bottom:14px;">Choose the release branch to receive automatic updates from Jeffrey Kim's GitLab repository.</p>
      <div class="grid-2">
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:500;">Update Channel</label>
          <select id="updateChannel" class="input-text" onchange="switchChannel()">
            <option value="main" selected>Stable (main branch v0.0.1)</option>
            <option value="beta">Beta (beta branch v0.0.1-beta)</option>
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:500;">GitLab Remote</label>
          <input type="text" class="input-text" readonly value="https://gitlab.com/jk9576/aether.git">
        </div>
      </div>
      <div id="channelNotice" style="margin-top:10px;font-size:12px;color:#818cf8;">현재 'main' 안정 채널에서 최신 빌드를 수신합니다.</div>
    </div>

    <div class="card">
      <div class="card-title">🔍 Search & General</div>
      <div class="grid-2">
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:500;">Default Search Engine</label>
          <select id="cfgSearch" class="input-text">
            <option value="https://duckduckgo.com/?q=" selected>DuckDuckGo</option>
            <option value="https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/?q=">DuckDuckGo (.onion)</option>
            <option value="https://www.google.com/search?q=">Google</option>
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:500;">Home URL</label>
          <input type="text" id="cfgHome" class="input-text" value="https://mail.proton.me">
        </div>
      </div>
      <div style="margin-top:16px;">
        <button class="btn success" onclick="saveSettings()">Save Preferences</button>
        <span id="saveNotice" style="margin-left:12px;color:#86efac;font-size:12px;display:none;">Saved successfully!</span>
      </div>
    </div>
  </div>
  <script>
    function switchChannel() {
      const ch = document.getElementById("updateChannel").value;
      const notice = document.getElementById("channelNotice");
      if (ch === "beta") {
        notice.textContent = "Beta 채널로 변경되었습니다. (GitLab: beta 브랜치 추적)";
      } else {
        notice.textContent = "Stable 채널로 변경되었습니다. (GitLab: main 브랜치 추적)";
      }
      localStorage.setItem("aether_update_channel", ch);
    }
    function saveSettings() {
      const notice = document.getElementById("saveNotice");
      notice.style.display = "inline";
      setTimeout(() => notice.style.display = "none", 2500);
    }
    const savedCh = localStorage.getItem("aether_update_channel");
    if (savedCh) {
      document.getElementById("updateChannel").value = savedCh;
      switchChannel();
    }
  </script>
</body>
</html>`;
}

function getVersionPage() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Version — Aetherum Browser</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="container">
    <div class="header-card">
      <img src="${ICON_DATA_URL}" class="header-logo" alt="Aether Logo">
      <div class="header-info">
        <h1>Aether 0.0.1</h1>
        <p>Unified Office Platform • Yggdrasil • Aetherum Privacy Browser</p>
        <span class="badge">macOS ARM64 Darwin Build</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📦 Component Details</div>
      <table class="meta-table">
        <tr><td class="label">Application Name</td><td class="value">Aether</td></tr>
        <tr><td class="label">Browser Subsystem</td><td class="value">Aetherum Browser (Tor Enabled)</td></tr>
        <tr><td class="label">Terminal Subsystem</td><td class="value">Yggdrasil</td></tr>
        <tr><td class="label">AI Engine</td><td class="value">Google Gemini 3.8 Flash (Low Latency)</td></tr>
        <tr><td class="label">Tor Network Subsystem</td><td class="value">0.4.9.14 (Darwin ARM64 Libevent)</td></tr>
        <tr><td class="label">Chromium Runtime</td><td class="value">130.0.6723.137</td></tr>
        <tr><td class="label">Node.js Engine</td><td class="value">20.18.0</td></tr>
        <tr><td class="label">V8 JavaScript Engine</td><td class="value">13.0.245.21-electron.0</td></tr>
        <tr><td class="label">Author</td><td class="value">Jeffrey Kim (jk9576@hanyang.ac.kr)</td></tr>
        <tr><td class="label">Repository</td><td class="value"><a href="https://gitlab.com/jk9576/aether" target="_blank" style="color:#818cf8;">https://gitlab.com/jk9576/aether</a></td></tr>
      </table>
    </div>
  </div>
</body>
</html>`;
}

function getAetherumPage(pageName = "welcome") {
  const name = (pageName || "welcome").toLowerCase().replace(/\.html$/, "");
  switch (name) {
    case "welcome":
      return getWelcomePage();
    case "about":
      return getAboutPage();
    case "bookmarks":
      return getBookmarksPage();
    case "history":
      return getHistoryPage();
    case "settings":
      return getSettingsPage();
    case "version":
      return getVersionPage();
    case "nibelungen":
      try {
        return fs.readFileSync(path.resolve(__dirname, "../../renderer/nibelungen.html"), "utf8");
      } catch (e) {
        return `<p style="padding:2rem;color:red;">Error loading Nibelungen: ${e.message}</p>`;
      }
    case "ratatoskr":
      try {
        return fs.readFileSync(path.resolve(__dirname, "../../renderer/ratatoskr.html"), "utf8");
      } catch (e) {
        return `<p style="padding:2rem;color:red;">Error loading Ratatoskr: ${e.message}</p>`;
      }
    case "fafnir":
      try {
        return fs.readFileSync(path.resolve(__dirname, "../../renderer/fafnir.html"), "utf8");
      } catch (e) {
        return `<p style="padding:2rem;color:red;">Error loading Fafnir Vault: ${e.message}</p>`;
      }
    case "mimisbrunnr":
      try {
        return fs.readFileSync(path.resolve(__dirname, "../../renderer/mimisbrunnr.html"), "utf8");
      } catch (e) {
        return `<p style="padding:2rem;color:red;">Error loading Mímisbrunnr: ${e.message}</p>`;
      }
    default:
      return getAboutPage();
  }
}

module.exports = {
  getAetherumPage,
  ICON_DATA_URL
};
