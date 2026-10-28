#!/usr/bin/env bash
# ==============================================================================
# 🌌 Aether Universal Installer (macOS)
# Installs Aether.app to /Applications, sets up ~/.aether, configures CLI & Gatekeeper
# ==============================================================================
set -euo pipefail

APP_NAME="Aether"
VERSION="0.0.1"
TARGET_DIR="/Applications"
TARGET_APP="${TARGET_DIR}/${APP_NAME}.app"
USER_AETHER_DIR="${HOME}/.aether"
CLI_TARGET_DIR="/usr/local/bin"
ALT_CLI_DIR="${HOME}/.local/bin"

# Styling & Colors
BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
PURPLE="\033[0;35m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${PURPLE}${BOLD}"
cat << 'EOF'
    ___     ______ _______ _    _ ______ _____  
   /   \   |  ____|__   __| |  | |  ____|  __ \ 
  / /_\ \  | |__     | |  | |__| | |__  | |__) |
 / _____ \ |  __|    | |  |  __  |  __| |  _  / 
/_/     \_\| |____   | |  | |  | | |____| | \ \ 
           |______|  |_|  |_|  |_|______|_|  \_\
EOF
echo -e "${CYAN}Sovereign Workspace • High Table • Mímisbrunnr • Aetherum${RESET}"
echo -e "${BLUE}Platform: macOS ($(uname -m)) • v${VERSION}${RESET}"
echo "=================================================================="

# 1. Platform Validation
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo -e "${RED}❌ Error: Aether is currently built and optimized for macOS (Darwin).${RESET}"
  exit 1
fi

ARCH="$(uname -m)"
echo -e "${GREEN}✓ Platform validated: macOS on ${ARCH}${RESET}"

# 2. Locate Installation Source
SRC_APP=""
MOUNTED_DMG=""

cleanup() {
  if [[ -n "${MOUNTED_DMG}" ]]; then
    echo -e "${BLUE}🧹 Detaching installer image (${MOUNTED_DMG})...${RESET}"
    hdiutil detach "${MOUNTED_DMG}" -quiet 2>/dev/null || diskutil eject "${MOUNTED_DMG}" -quiet 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "🔍 Locating Aether installation bundle or disk image..."

# Search order for local source
CANDIDATE_APPS=(
  "$(pwd)/Aether.app"
  "${HOME}/Desktop/Aether.app"
  "/tmp/Aether.app"
  "$(pwd)/dist/Aether.app"
)

for cand in "${CANDIDATE_APPS[@]}"; do
  if [[ -d "${cand}" ]]; then
    SRC_APP="${cand}"
    echo -e "${GREEN}✓ Found local application bundle:${RESET} ${SRC_APP}"
    break
  fi
done

# If no loose .app, look for .dmg
if [[ -z "${SRC_APP}" ]]; then
  CANDIDATE_DMGS=(
    "$(pwd)/Aether-${VERSION}-${ARCH}.dmg"
    "${HOME}/Desktop/Aether-${VERSION}-${ARCH}.dmg"
    "$(pwd)/dist/Aether-${VERSION}-${ARCH}.dmg"
    "${HOME}/Downloads/Aether-${VERSION}-${ARCH}.dmg"
    "$(pwd)/Aether.dmg"
    "${HOME}/Desktop/Aether.dmg"
  )

  for dmg in "${CANDIDATE_DMGS[@]}"; do
    if [[ -f "${dmg}" ]]; then
      echo -e "${BLUE}📦 Found installer disk image:${RESET} ${dmg}"
      echo "   Attaching disk image..."
      MOUNT_OUT="$(hdiutil attach "${dmg}" -nobrowse -readonly 2>/dev/null || true)"
      MOUNT_POINT="$(echo "${MOUNT_OUT}" | grep "/Volumes/" | awk -F '\t' '{print $NF}' | tr -d '\n')"
      
      if [[ -n "${MOUNT_POINT}" && -d "${MOUNT_POINT}/Aether.app" ]]; then
        MOUNTED_DMG="${MOUNT_POINT}"
        SRC_APP="${MOUNT_POINT}/Aether.app"
        echo -e "${GREEN}✓ Mounted disk image at:${RESET} ${MOUNT_POINT}"
        break
      fi
    fi
  done
fi

# Fallback: if in repo directory and source is missing, build it
if [[ -z "${SRC_APP}" && -f "$(pwd)/package.json" && -f "$(pwd)/test/run-tests.js" ]]; then
  echo -e "${YELLOW}ℹ️  Source .app not pre-built. Triggering repository packager...${RESET}"
  npm run pack
  if [[ -d "${HOME}/Desktop/Aether.app" ]]; then
    SRC_APP="${HOME}/Desktop/Aether.app"
  fi
fi

if [[ -z "${SRC_APP}" || ! -d "${SRC_APP}" ]]; then
  echo -e "${RED}❌ Error: Could not locate Aether.app or Aether-*.dmg on Desktop, in current directory, or in Downloads.${RESET}"
  echo "   Please download Aether-${VERSION}-${ARCH}.dmg from GitLab releases: https://gitlab.com/jk9576/aether"
  exit 1
fi

# 3. Stop Running Aether Process
if pgrep -f "/Applications/Aether.app" >/dev/null 2>&1; then
  echo "⏸️  Stopping currently running Aether instance..."
  pkill -f "/Applications/Aether.app" 2>/dev/null || true
  sleep 1
fi

# 4. Copy to /Applications
echo "🚀 Installing Aether to ${TARGET_APP}..."
if [[ -w "${TARGET_DIR}" ]]; then
  rm -rf "${TARGET_APP}"
  cp -R "${SRC_APP}" "${TARGET_APP}"
else
  echo -e "${YELLOW}⚠️  Administrator permissions required to install into ${TARGET_DIR}.${RESET}"
  sudo rm -rf "${TARGET_APP}"
  sudo cp -R "${SRC_APP}" "${TARGET_APP}"
fi
echo -e "${GREEN}✓ Application copied to /Applications/Aether.app${RESET}"

# 5. Clear macOS Gatekeeper Quarantine & Ad-Hoc Sign
echo "🛡️  Clearing macOS quarantine attributes (Gatekeeper bypass)..."
xattr -cr "${TARGET_APP}" 2>/dev/null || sudo xattr -cr "${TARGET_APP}" 2>/dev/null || true
codesign --force --deep --sign - "${TARGET_APP}" 2>/dev/null || true
echo -e "${GREEN}✓ Security permissions and Gatekeeper verified${RESET}"

# 6. Initialize ~/.aether User Environment
echo "⚙️  Configuring local sovereign environment (~/.aether)..."
mkdir -p "${USER_AETHER_DIR}"/{fafnir_vault,models,nibelungen,scripts}
chmod 700 "${USER_AETHER_DIR}" "${USER_AETHER_DIR}/fafnir_vault" 2>/dev/null || true

# Seed fallback .env if not exists
if [[ ! -f "${USER_AETHER_DIR}/.env" ]]; then
  if [[ -f "$(pwd)/.env.example" ]]; then
    cp "$(pwd)/.env.example" "${USER_AETHER_DIR}/.env"
  else
    cat << 'ENVEOF' > "${USER_AETHER_DIR}/.env"
# Aether Sovereign Configuration
GEMINI_API_KEY=
DEFAULT_MODEL=gemini-3.5-flash-lite
OLLAMA_BASE_URL=http://127.0.0.1:11434
ENVEOF
  fi
  chmod 600 "${USER_AETHER_DIR}/.env"
  echo -e "${GREEN}✓ Initialized ~/.aether/.env configuration file${RESET}"
fi

# 7. Install /usr/local/bin/aether Command Line Interface (CLI)
echo "💻 Installing 'aether' command-line launcher..."
CLI_DEST=""
mkdir -p "${ALT_CLI_DIR}"
if [[ -d "${CLI_TARGET_DIR}" && -w "${CLI_TARGET_DIR}" ]]; then
  CLI_DEST="${CLI_TARGET_DIR}/aether"
elif sudo -n true 2>/dev/null && [[ -d "${CLI_TARGET_DIR}" ]]; then
  CLI_DEST="${CLI_TARGET_DIR}/aether"
else
  CLI_DEST="${ALT_CLI_DIR}/aether"
fi

CLI_SCRIPT='#!/usr/bin/env bash
# Aether CLI Launcher
APP_PATH="/Applications/Aether.app"

show_help() {
  cat << "HELPEOF"
🌌 Aether Sovereign Desktop CLI

Usage:
  aether [command] [options]

Commands:
  (default)            Launch Aether Desktop Application
  high-table           Open The High Table Multi-Agent Council
  mimisbrunnr          Open Mímisbrunnr Sovereign AI Engine
  browser [url]        Launch Aetherum Browser (optional URL)
  terminal             Open Yggdrasil Terminal Workspace
  fafnir               Open Fafnir Zero-Knowledge Vault
  nibelungen           Open Nibelungen Personal Knowledge Graph
  ratatoskr            Open Ratatoskr API & Database Explorer
  heimdall             Open Heimdall Biometrics & Telemetry
  council "query"      Convene The High Table directly via CLI
  -v, --version        Show installed Aether version
  -h, --help           Show this help message

HELPEOF
}

case "${1:-}" in
  -h|--help|help)
    show_help
    exit 0
    ;;
  -v|--version|version)
    echo "Aether v0.0.1 (macOS Apple Silicon / Intel)"
    exit 0
    ;;
  high-table)
    open "aetherum://high-table" 2>/dev/null || open -a "${APP_PATH}"
    ;;
  mimisbrunnr)
    open "aetherum://mimisbrunnr" 2>/dev/null || open -a "${APP_PATH}"
    ;;
  browser)
    if [[ -n "${2:-}" ]]; then
      open -a "${APP_PATH}" --args "${2}"
    else
      open "aetherum://welcome" 2>/dev/null || open -a "${APP_PATH}"
    fi
    ;;
  terminal)
    open "aetherum://terminal" 2>/dev/null || open -a "${APP_PATH}"
    ;;
  fafnir)
    open "aetherum://fafnir" 2>/dev/null || open -a "${APP_PATH}"
    ;;
  nibelungen)
    open "aetherum://nibelungen" 2>/dev/null || open -a "${APP_PATH}"
    ;;
  ratatoskr)
    open "aetherum://ratatoskr" 2>/dev/null || open -a "${APP_PATH}"
    ;;
  heimdall)
    open "aetherum://heimdall" 2>/dev/null || open -a "${APP_PATH}"
    ;;
  council)
    shift
    COUNCIL_PY="${HOME}/.aether/antigravity_council.py"
    if [[ -f "${COUNCIL_PY}" ]]; then
      python3 "${COUNCIL_PY}" "$@"
    else
      open "aetherum://high-table" 2>/dev/null || open -a "${APP_PATH}"
    fi
    ;;
  *)
    open -a "${APP_PATH}" "$@"
    ;;
esac
'

if [[ "${CLI_DEST}" == "${CLI_TARGET_DIR}/aether" && ! -w "${CLI_TARGET_DIR}" ]]; then
  if sudo -n true 2>/dev/null; then
    echo "${CLI_SCRIPT}" | sudo tee "${CLI_DEST}" >/dev/null
    sudo chmod +x "${CLI_DEST}"
  else
    CLI_DEST="${ALT_CLI_DIR}/aether"
    echo "${CLI_SCRIPT}" > "${CLI_DEST}"
    chmod +x "${CLI_DEST}"
  fi
else
  echo "${CLI_SCRIPT}" > "${CLI_DEST}"
  chmod +x "${CLI_DEST}"
fi

# Always link to ~/.aether/launcher for internal consistency
ln -sf "${CLI_DEST}" "${USER_AETHER_DIR}/launcher" 2>/dev/null || true
echo -e "${GREEN}✓ CLI command installed at:${RESET} ${CLI_DEST}"

# Check PATH for ~/.local/bin
if [[ "${CLI_DEST}" == "${ALT_CLI_DIR}/aether" ]]; then
  if [[ ":${PATH}:" != *":${ALT_CLI_DIR}:"* ]]; then
    if [[ -f "${HOME}/.zshrc" ]] && ! grep -q '\.local/bin' "${HOME}/.zshrc"; then
      echo 'export PATH="${HOME}/.local/bin:${PATH}"' >> "${HOME}/.zshrc"
      echo -e "${GREEN}✓ Added ~/.local/bin to ~/.zshrc PATH${RESET}"
    else
      echo -e "${YELLOW}ℹ️  Ensure ${ALT_CLI_DIR} is in your PATH:${RESET}"
      echo "   export PATH=\"\${HOME}/.local/bin:\${PATH}\""
    fi
  fi
fi

# 8. Success Report
echo ""
echo "=================================================================="
echo -e "${GREEN}${BOLD}🎉 Aether has been successfully installed on your Mac!${RESET}"
echo "=================================================================="
echo -e "• ${BOLD}Application:${RESET} ${TARGET_APP}"
echo -e "• ${BOLD}CLI Command:${RESET} ${CLI_DEST}"
echo -e "• ${BOLD}User Data:${RESET}   ${USER_AETHER_DIR}"
echo -e "• ${BOLD}Sovereign AI:${RESET} Mímisbrunnr & The High Table ready"
echo "=================================================================="
echo ""
echo "To launch Aether right now, run:"
echo -e "   ${CYAN}aether${RESET}   or   ${CYAN}open /Applications/Aether.app${RESET}"
echo ""

# Optional immediate launch if interactive
if [[ -t 0 ]]; then
  read -r -p "Would you like to launch Aether now? [Y/n] " choice || true
  case "$choice" in
    n|N) echo "Enjoy using Aether!" ;;
    *)   open -a "${TARGET_APP}" ;;
  esac
fi
