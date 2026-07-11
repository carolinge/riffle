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
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac dir
APP="$B/dist/mac-arm64/Riffle.app"
# consistent ad-hoc signature (unsigned apps refuse to run at all on Apple Silicon)
codesign --force --deep -s - "$APP"
codesign --verify --deep "$APP" && echo "ad-hoc signature OK"
# DMG with /Applications shortcut
STAGE="$B/dmg-stage"
rm -rf "$STAGE" && mkdir -p "$STAGE"
cp -R "$APP" "$STAGE/"
ln -s /Applications "$STAGE/Applications"
VERSION=$(node -p "require('$B/package.json').version")
hdiutil create -volname "Riffle" -srcfolder "$STAGE" -ov -format UDZO "$B/dist/Riffle-$VERSION-arm64.dmg"
rm -rf "$S/dist" && mkdir -p "$S/dist"
xattr -w com.dropbox.ignored 1 "$S/dist" 2>/dev/null || true
cp "$B/dist/Riffle-$VERSION-arm64.dmg" "$S/dist/"
cp -R "$B/dist/mac-arm64" "$S/dist/"
echo "== done: $S/dist =="
ls -la "$S/dist"
