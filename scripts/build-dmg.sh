#!/usr/bin/env bash
# ==============================================================================
# Aether macOS Disk Image (.dmg) Builder
# Builds a compressed, drag-and-drop installer DMG with /Applications symlink
# ==============================================================================
set -euo pipefail

APP_NAME="Aether"
VERSION="0.0.1"
ARCH="$(uname -m)"
DMG_NAME="Aether-${VERSION}-${ARCH}.dmg"
DIST_DIR="$(pwd)/dist"
DESKTOP_DMG="${HOME}/Desktop/${DMG_NAME}"
STAGE_DIR="/tmp/aether_dmg_build_$$"

# Find source .app bundle
SRC_APP=""
if [[ -d "${HOME}/Desktop/Aether.app" ]]; then
  SRC_APP="${HOME}/Desktop/Aether.app"
elif [[ -d "/Applications/Aether.app" ]]; then
  SRC_APP="/Applications/Aether.app"
elif [[ -d "./Aether.app" ]]; then
  SRC_APP="$(pwd)/Aether.app"
else
  echo "❌ Error: Could not locate Aether.app on Desktop, in /Applications, or in current dir."
  echo "   Run 'npm run pack' first to generate the application bundle."
  exit 1
fi

echo "=================================================================="
echo "📦 Building Aether Disk Image (.dmg) for macOS (${ARCH})"
echo "   Source Bundle: ${SRC_APP}"
echo "   Target Output: ${DIST_DIR}/${DMG_NAME}"
echo "=================================================================="

# Ensure output directory exists
mkdir -p "${DIST_DIR}"

# Ensure source app has quarantine removed and valid ad-hoc signature
echo "🔐 Refreshing ad-hoc signature & clearing quarantine..."
codesign --force --deep --sign - "${SRC_APP}" 2>/dev/null || true
xattr -cr "${SRC_APP}" 2>/dev/null || true

# Prepare clean staging area
echo "📂 Preparing DMG volume staging layout..."
rm -rf "${STAGE_DIR}"
mkdir -p "${STAGE_DIR}"

# Copy app bundle into staging
echo "📋 Copying application bundle to staging area..."
cp -R "${SRC_APP}" "${STAGE_DIR}/${APP_NAME}.app"

# Create /Applications drag-and-drop shortcut
echo "🔗 Creating /Applications folder symlink..."
ln -s /Applications "${STAGE_DIR}/Applications"

# Build the compressed disk image using hdiutil
echo "🗜️  Compressing disk image with zlib-level 9 (UDZO)..."
FINAL_DMG="${DIST_DIR}/${DMG_NAME}"
rm -f "${FINAL_DMG}"

hdiutil create \
  -volname "${APP_NAME}" \
  -srcfolder "${STAGE_DIR}" \
  -ov \
  -format UDZO \
  -imagekey zlib-level=9 \
  "${FINAL_DMG}"

# Copy to Desktop if Desktop exists
if [[ -d "${HOME}/Desktop" ]]; then
  cp -f "${FINAL_DMG}" "${DESKTOP_DMG}"
  echo "🖥️  Copied to Desktop: ${DESKTOP_DMG}"
fi

# Cleanup staging directory
rm -rf "${STAGE_DIR}"

# Calculate checksums & print statistics
DMG_SIZE="$(du -h "${FINAL_DMG}" | cut -f1)"
SHA256="$(shasum -a 256 "${FINAL_DMG}" | awk '{print $1}')"

echo "=================================================================="
echo "🎉 Successfully generated ${DMG_NAME} (${DMG_SIZE})"
echo "   SHA-256: ${SHA256}"
echo "   Path:    ${FINAL_DMG}"
if [[ -f "${DESKTOP_DMG}" ]]; then
  echo "   Desktop: ${DESKTOP_DMG}"
fi
echo "=================================================================="
