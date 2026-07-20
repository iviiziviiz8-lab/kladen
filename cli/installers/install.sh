#!/bin/bash
set -e

INSTALL_DIR="${HOME}/.kladen"
REPO_BASE="https://raw.githubusercontent.com/iviiziviiz8-lab/kladen/master"

echo "========================================"
echo "  Kladen - Spotify Customization"
echo "========================================"
echo ""

if ! command -v node &> /dev/null; then
  echo "Node.js is required. Install from https://nodejs.org"
  exit 1
fi
echo "Node.js: $(node --version)"

mkdir -p "$INSTALL_DIR/bin"
mkdir -p "$INSTALL_DIR/themes"
mkdir -p "$INSTALL_DIR/config"

echo "Downloading kladen..."
curl -fsSL "$REPO_BASE/cli/bin/kladen.js" -o "$INSTALL_DIR/bin/kladen.js"

echo "Downloading themes..."
for theme in default.css nord.css dark-purple.css; do
  curl -fsSL "$REPO_BASE/cli/themes/$theme" -o "$INSTALL_DIR/themes/$theme" 2>/dev/null || true
done

# Shell alias
SHELL_CONFIG="$HOME/.bashrc"
[ -f "$HOME/.zshrc" ] && SHELL_CONFIG="$HOME/.zshrc"
if ! grep -q "kladen" "$SHELL_CONFIG" 2>/dev/null; then
  echo "alias kladen='node $INSTALL_DIR/bin/kladen.js'" >> "$SHELL_CONFIG"
  echo "Added alias to $SHELL_CONFIG"
fi

echo ""
echo "Installation complete!"
echo ""
echo "Quick start:"
echo "  source $SHELL_CONFIG"
echo "  kladen apply default"
echo "  kladen list"
