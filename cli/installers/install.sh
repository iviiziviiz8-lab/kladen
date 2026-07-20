#!/bin/bash
set -e

INSTALL_DIR="${HOME}/.kladen"
REPO_URL="https://github.com/iviiziviiz8-lab/kladen/raw/main"

echo "========================================"
echo "  Kladen - Spotify Customization Tool"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "Node.js is required. Install from https://nodejs.org"
  exit 1
fi
echo "Node.js detected: $(node --version)"

# Create directories
mkdir -p "$INSTALL_DIR/themes"
mkdir -p "$INSTALL_DIR/config"
mkdir -p "$INSTALL_DIR/cli/bin"
mkdir -p "$INSTALL_DIR/cli/src/commands"
mkdir -p "$INSTALL_DIR/cli/src/core"

# Download CLI files
FILES=(
  "cli/package.json"
  "cli/bin/kladen.js"
  "cli/src/commands/apply.js"
  "cli/src/commands/backup.js"
  "cli/src/commands/restore.js"
  "cli/src/commands/config.js"
  "cli/src/commands/list.js"
  "cli/src/core/spotify.js"
  "cli/src/core/injector.js"
)

for file in "${FILES[@]}"; do
  dest="$INSTALL_DIR/$file"
  mkdir -p "$(dirname "$dest")"
  echo "Downloading: $file"
  curl -fsSL "$REPO_URL/$file" -o "$dest"
done

# Install npm deps
cd "$INSTALL_DIR"
npm install

# Download themes
for theme in default.css nord.css dark-purple.css; do
  curl -fsSL "$REPO_URL/cli/themes/$theme" -o "$INSTALL_DIR/themes/$theme" 2>/dev/null || true
done

# Add alias
SHELL_CONFIG="$HOME/.bashrc"
if [ -f "$HOME/.zshrc" ]; then
  SHELL_CONFIG="$HOME/.zshrc"
fi

if ! grep -q "kladen" "$SHELL_CONFIG" 2>/dev/null; then
  echo "alias kladen='node $INSTALL_DIR/cli/bin/kladen.js'" >> "$SHELL_CONFIG"
  echo "Added alias to $SHELL_CONFIG"
fi

echo ""
echo "Installation complete!"
echo ""
echo "Quick start:"
echo "  source $SHELL_CONFIG"
echo "  kladen apply default"
echo "  kladen list"
