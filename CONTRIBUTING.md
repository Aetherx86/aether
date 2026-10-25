# Contributing to Aether

Thank you for your interest in contributing to **Aether**! We welcome contributions that align with our core mission: building an uncompromised, sovereign desktop workspace with airgapped intelligence and zero-trust privacy.

---

## 🧭 Code of Conduct

Aether fosters an inclusive, respectful, and technical community. We expect all contributors to adhere to standard open-source civility guidelines:
- Treat all community members with empathy and respect.
- Keep discussions focused on privacy, software engineering, and platform capabilities.
- Zero tolerance for harassment, discrimination, or abusive behavior.

---

## 🌿 Git Branching Strategy & Release Protocol

We enforce a strict, test-driven branching model:

1. **`main`**: Production release branch. Every commit on `main` must pass 100% of GitLab CI/CD pipelines.
2. **`beta`**: Staging and active verification branch.
   - All bug fixes, features, and documentation updates must be pushed to `beta` first.
   - Wait for the GitLab CI/CD pipeline on `beta` to achieve **100% Green (`Passed`)**.
   - Only then fast-forward merge into `main` (`git merge beta --ff-only`) and push to `origin main`.

---

## 🛠️ Local Development & Testing

### Prerequisites
- macOS (Apple Silicon recommended) or Linux
- Node.js >= 22.0.0
- SQLite 3 development headers

### Setup
```sh
# Clone repository
git clone https://gitlab.com/jk9576/aether.git
cd aether

# Install dependencies
npm install
```

### Running Test Suite
Before committing any changes, run the local verification suite:
```sh
npm test
```
All 18 comprehensive tests must pass:
- Package & version consistency
- Codebase purity audit (no legacy or forbidden terms)
- Fafnir AES-256-GCM cryptography & edge cases
- Mímisbrunnr local LLM & markdown parser
- Sleipnir SNI packet fragmentation & rapid toggle stress
- Ratatoskr API client & SQLite table inspector
- Nibelungen bidirectional wikilink initialization
- DOM & button click validation for all subsystems
- Aetherum multi-tab browser & redirection verification
- CLI usage and command integrity (`Usage: aether`)

### Packaging Desktop App
```sh
npm run pack
```

---

## 🛡️ Subsystem Architecture Guidelines

When modifying subsystems, preserve the architectural integrity of the **Nordic Octa-Engine**:
- **Aether Core**: Root document pipeline and MCP server.
- **Aetherum**: Keep the Chromium 131 standard headers and ensure all redirects/popups are non-blocking.
- **Yggdrasil**: Ensure terminal PTY instances properly clean up file descriptors on tab closure.
- **Sleipnir**: Maintain graceful socket teardown on port 8087 to prevent port collisions.
- **Mímisbrunnr**: Respect 100% airgapped privacy; never transmit prompts to unauthorized endpoints.
- **Fafnir**: Never write decrypted plaintext to disk without explicit user confirmation.
- **Nibelungen**: Store all notes as pure Markdown in `~/.aether/nibelungen`.
- **Ratatoskr**: Support both direct and Tor SOCKS5 routed connections.

---

## 📬 Submitting Merge Requests

1. Fork or branch off `beta`:
   ```sh
   git checkout beta
   git checkout -b feature/my-enhancement
   ```
2. Commit your changes with conventional commit messages (`feat:`, `fix:`, `docs:`, `test:`).
3. Ensure `npm test` passes cleanly.
4. Push to GitLab and open a Merge Request targeting branch `beta`.

---

## ⚖️ License

By contributing to Aether, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
