#!/usr/bin/env bash
# Builds the invoice-generator app and copies its output into the main
# site's public/invoice folder, so it ships as part of the site build.
# Run this from anywhere; paths are resolved relative to this script.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVOICE_DIR="$ROOT/invoice-generator"
SITE_PUBLIC_INVOICE="$ROOT/site/public/invoice"

echo "==> Building invoice-generator..."
cd "$INVOICE_DIR"
npm install --no-fund --no-audit
npm run build

echo "==> Copying dist/ into site/public/invoice ..."
rm -rf "$SITE_PUBLIC_INVOICE"
mkdir -p "$SITE_PUBLIC_INVOICE"
cp -r "$INVOICE_DIR/dist/." "$SITE_PUBLIC_INVOICE/"

echo "==> Done. site/public/invoice now matches invoice-generator/dist."
echo "    Commit + push GARUNA/site to trigger a Vercel redeploy."
