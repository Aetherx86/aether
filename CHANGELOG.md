# Changelog

All notable changes to the **Aether** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.1] - 2026-10-25

### Added
- **Aether Core**: Unified Sovereign Workspace combining office document engines, local intelligence, and zero-knowledge privacy into a single desktop application.
- **Aetherum Browser**:
  - Full-featured multi-tab browsing architecture with isolated WebContents and iframe viewports.
  - Native Tor SOCKS5 proxy routing (Port 9050) supporting `.onion` hidden services.
  - Chromium 131 standard client hints and headers resolving Proton Mail, Google, and Microsoft OAuth authentication and redirect flows.
  - One-click Gemini AI page summarizer side-drawer and instant Word/Markdown export.
- **Yggdrasil Terminal**:
  - Native interactive PTY shell (`zsh`/`bash`) with ANSI full-color rendering.
  - Presets bar for one-click diagnostic checks (Tor status, Homebrew, Ollama, CLI guide).
  - Cross-frame session persistence and dynamic terminal resizing.
- **Sleipnir Anti-DPI**:
  - Local HTTPS SNI packet splitting proxy on Port 8087.
  - Real-time TLS ClientHello fragmentation bypassing ISP Deep Packet Inspection without speed penalties.
  - Rapid toggle stress resilience and automatic socket state recovery.
- **Mímisbrunnr Local AI**:
  - 100% airgapped neural intelligence engine optimized for Apple Silicon M4 unified memory and Apple Neural Engine (ANE).
  - Multi-task presets: Yggdrasil script audit, ProtonMail thread digest, and secure code synthesizer.
  - Multi-endpoint auto-resolver for local Ollama, LM Studio, and Llama.cpp servers.
- **Fafnir Vault**:
  - Zero-knowledge safe drive with AES-256-GCM encryption and PBKDF2 (100,000 iterations, SHA-256).
  - Direct-to-desktop decryption without intermediate plaintext residue.
  - Real-time vault entry browsing and encrypted container management.
- **Nibelungen Wiki**:
  - Local-first bidirectional knowledge graph with `[[Wikilink]]` syntax.
  - Obsidian-style force-directed SVG interactive canvas with draggable nodes and zoom/pan controls.
  - Pure Markdown storage located in `~/.aether/nibelungen`.
- **Ratatoskr API & Database**:
  - Tor-tunneled HTTP and REST API client with Tor Check and Cloudflare DoH presets.
  - Live visual SQLite inspector with schema viewer, custom SQL runner, and interactive data grid.
- **Aether CLI (`aether`)**:
  - Headless document manipulation CLI (`sheet`, `docs`, `slides`, `convert`, `render`, `pdf`).
  - Model Context Protocol (MCP) server integration for Claude Code, Codex, and Cursor agents.
- **CI/CD & Quality Assurance**:
  - Comprehensive 18-suite automated test harness covering cryptography, DOM buttons, network fragmentation, and purity.
  - GitLab CI/CD container pipeline utilizing `node:22-alpine` with SQLite build tools.
