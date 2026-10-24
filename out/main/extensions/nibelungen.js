"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const VAULT_DIR = path.join(os.homedir(), ".aether", "nibelungen");

function ensureVault() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }

  // Populate default starter notes if empty
  const defaultNotes = [
    {
      id: "welcome-nibelungen",
      title: "Welcome to Nibelungen",
      tags: ["wiki", "intro", "knowledge"],
      content: `# Welcome to Nibelungen 🗝️\n\nNibelungen is your local-first personal knowledge graph and Obsidian-style wiki inside **Aether**.\n\n## Features\n- **Bi-directional Wikilinks**: Link topics seamlessly using \`[[Note Name]]\` syntax.\n- **Automated Entity Cross-Linking**: Scans [[Proton Mail]] communications, [[Aetherum Browser]] bookmarks, and [[Yggdrasil]] terminal logs.\n- **Interactive Force Graph**: Visualize relationships between ideas in real-time.\n- **Local Markdown Files**: Notes persist as standard \`.md\` files in \`~/.aether/nibelungen/\`.\n\nCheck out [[Architecture]] and [[Proton Mail Security]] to see linking in action!`
    },
    {
      id: "proton-mail-security",
      title: "Proton Mail Security",
      tags: ["security", "email", "privacy"],
      content: `# Proton Mail Security ✉️\n\nZero-knowledge end-to-end encrypted messaging integrated with [[Aetherum Browser]].\n\n- Primary target: \`https://mail.proton.me\`\n- Routing via [[Tor Network]] and [[Sleipnir]] SNI fragmentation.\n- Auto-indexed by [[Nibelungen]] for cross-referencing research documents.`
    },
    {
      id: "architecture",
      title: "Architecture",
      tags: ["dev", "system", "aether"],
      content: `# Aether System Architecture ⚡\n\nUnified privacy and intelligence environment by Jeffrey Kim.\n\n## Subsystems\n- [[Yggdrasil]]: Native truecolor macOS shell & terminal workspace.\n- [[Aetherum Browser]]: Multi-session Tor & DoH privacy browser.\n- [[Sleipnir]]: HTTPS SNI packet splitting and anti-DPI packet-level bypass.\n- [[Mímisbrunnr]]: Privacy-first offline local intelligence engine.\n- [[Fafnir Vault]]: Zero-knowledge AES-256-GCM encrypted document drive.\n- [[Ratatoskr]]: Visual API client & SQLite/PostgreSQL inspector.`
    }
  ];

  for (const n of defaultNotes) {
    const fpath = path.join(VAULT_DIR, `${n.id}.json`);
    if (!fs.existsSync(fpath)) {
      fs.writeFileSync(fpath, JSON.stringify(n, null, 2), "utf8");
    }
  }
}

function listNotes() {
  ensureVault();
  const files = fs.readdirSync(VAULT_DIR).filter(f => f.endsWith(".json"));
  const notes = [];
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(VAULT_DIR, f), "utf8"));
      notes.push(data);
    } catch {}
  }
  return notes;
}

function extractWikilinks(text) {
  const matches = [];
  const regex = /\[\[(.*?)\]\]/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    matches.push(m[1].trim());
  }
  return matches;
}

function buildKnowledgeGraph(extraBookmarks = [], extraEmails = []) {
  const notes = listNotes();
  const nodesMap = new Map();
  const edges = [];

  // 1. Add Note Nodes
  for (const n of notes) {
    nodesMap.set(n.title.toLowerCase(), {
      id: n.id,
      title: n.title,
      type: "note",
      tags: n.tags || [],
      val: 18,
      content: n.content
    });
  }

  // 2. Add Bookmarks as Nodes
  for (const b of extraBookmarks) {
    const bId = `bm-${b.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    if (!nodesMap.has(b.title.toLowerCase())) {
      nodesMap.set(b.title.toLowerCase(), {
        id: bId,
        title: b.title,
        type: "bookmark",
        tags: ["bookmark", "web"],
        val: 14,
        url: b.url,
        content: `Bookmark: ${b.url}`
      });
    }
  }

  // 3. Connect Edges via [[Wikilinks]] & Shared Tags
  for (const n of notes) {
    const sourceNode = nodesMap.get(n.title.toLowerCase());
    if (!sourceNode) continue;

    const links = extractWikilinks(n.content || "");
    for (const targetTitle of links) {
      let targetNode = nodesMap.get(targetTitle.toLowerCase());
      // If target node doesn't exist yet, create ghost topic node
      if (!targetNode) {
        targetNode = {
          id: `topic-${targetTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          title: targetTitle,
          type: "topic",
          tags: ["concept"],
          val: 12,
          content: `Topic: ${targetTitle}`
        };
        nodesMap.set(targetTitle.toLowerCase(), targetNode);
      }
      edges.push({
        source: sourceNode.id,
        target: targetNode.id,
        type: "wikilink"
      });
    }

    // Connect bookmarks mentioned in text
    for (const b of extraBookmarks) {
      if (n.content && n.content.toLowerCase().includes(b.title.toLowerCase())) {
        const bNode = nodesMap.get(b.title.toLowerCase());
        if (bNode && bNode.id !== sourceNode.id) {
          edges.push({
            source: sourceNode.id,
            target: bNode.id,
            type: "reference"
          });
        }
      }
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges
  };
}

function saveNote(note) {
  ensureVault();
  const id = note.id || `note-${Date.now()}`;
  const record = {
    id,
    title: note.title || "Untitled Note",
    tags: note.tags || [],
    content: note.content || "",
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(VAULT_DIR, `${id}.json`), JSON.stringify(record, null, 2), "utf8");
  return record;
}

function deleteNote(id) {
  ensureVault();
  const fpath = path.join(VAULT_DIR, `${id}.json`);
  if (fs.existsSync(fpath)) {
    fs.unlinkSync(fpath);
    return true;
  }
  return false;
}

function registerNibelungenIpc(ipcMain) {
  ensureVault();

  ipcMain.handle("hyper:nibelungen:get-graph", (_event, { bookmarks = [], emails = [] } = {}) => {
    return buildKnowledgeGraph(bookmarks, emails);
  });

  ipcMain.handle("hyper:nibelungen:list-notes", () => {
    return listNotes();
  });

  ipcMain.handle("hyper:nibelungen:save-note", (_event, note) => {
    return saveNote(note);
  });

  ipcMain.handle("hyper:nibelungen:delete-note", (_event, id) => {
    return deleteNote(id);
  });
}

module.exports = {
  buildKnowledgeGraph,
  listNotes,
  saveNote,
  deleteNote,
  registerNibelungenIpc
};
