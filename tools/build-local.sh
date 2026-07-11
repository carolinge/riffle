#!/bin/bash
# Riffle release build — always on local disk (the Dropbox mount wedges electron-builder)
set -euo pipefail
S="$(cd "$(dirname "$0")/.." && pwd)"
B=/tmp/riffle-build
rm -rf "$B" && mkdir -p "$B/renderer" "$B/build"
cp "$S/main.js" "$S/preload.js" "$S/package.json" "$S/package-lock.json" "$B/"
cp "$S/renderer/index.html" "$S/renderer/app.js" "$S/renderer/styles.css" "$B/renderer/"
cp "$S/build/icon.icns" "$B/build/"
cd "$B"
npm ci --no-audit --no-fund
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac
rm -rf "$S/dist" && mkdir -p "$S/dist"
xattr -w com.dropbox.ignored 1 "$S/dist" 2>/dev/null || true
cp "$B"/dist/Riffle-*.dmg "$S/dist/"
cp -R "$B/dist/mac-arm64" "$S/dist/"
echo "== done: $S/dist =="
ls -la "$S/dist"
