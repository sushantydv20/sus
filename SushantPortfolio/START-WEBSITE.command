#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display dialog "Node.js 24+ is required. Install Node.js LTS first." buttons {"OK"}'
  exit 1
fi
node server.js
