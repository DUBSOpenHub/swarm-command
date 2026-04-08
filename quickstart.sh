#!/usr/bin/env bash
# 🐝 Swarm Command — One-line installer
# curl -fsSL https://raw.githubusercontent.com/DUBSOpenHub/swarm-command/main/quickstart.sh | bash
set -euo pipefail

SKILL_REPO="DUBSOpenHub/swarm-command"
SKILL_NAME="swarm-command"
SKILL_DIR="$HOME/.copilot/skills/$SKILL_NAME"
AGENT_DIR="$HOME/.copilot/agents"
SKILL_URL="https://raw.githubusercontent.com/$SKILL_REPO/main/skills/swarm-command/SKILL.md"
AGENT_URL="https://raw.githubusercontent.com/$SKILL_REPO/main/agents/swarm-command.agent.md"

echo ""
echo "🐝 Swarm Command"
echo "─────────────────────────────────────────"
echo "  Multi-model consensus swarm orchestrator"
echo "  50–250+ agents · 16 models · shadow scoring"
echo "─────────────────────────────────────────"
echo ""

# ── Step 1: Detect or install Copilot CLI ──
if command -v copilot >/dev/null 2>&1; then
  echo "✅ Copilot CLI already installed ($(copilot --version 2>/dev/null || echo 'installed'))"
else
  echo "📦 Installing GitHub Copilot CLI..."
  if [[ "$(uname)" == "Darwin" ]] || [[ "$(uname)" == "Linux" ]]; then
    if command -v brew >/dev/null 2>&1; then
      brew install copilot-cli
    else
      curl -fsSL https://gh.io/copilot-install | bash
    fi
  else
    echo "⚠️  Windows detected — please install manually:"
    echo "   winget install GitHub.Copilot"
    echo "   Then re-run this script."
    exit 1
  fi
  if ! command -v copilot >/dev/null 2>&1; then
    export PATH="$HOME/.local/bin:$PATH"
    if ! command -v copilot >/dev/null 2>&1; then
      echo "❌ Installation failed. Try manually: brew install copilot-cli"
      exit 1
    fi
  fi
  echo "✅ Copilot CLI installed!"
fi

# ── Step 2: Install skill + agent ──
echo "📥 Adding Swarm Command skill..."
mkdir -p "$SKILL_DIR" "$AGENT_DIR"

if curl -fsSL "$SKILL_URL" -o "$SKILL_DIR/SKILL.md"; then
  echo "✅ Skill installed to $SKILL_DIR/SKILL.md"
else
  echo "❌ Failed to download skill. Check your internet connection."
  exit 1
fi

if curl -fsSL "$AGENT_URL" -o "$AGENT_DIR/swarm-command.agent.md"; then
  echo "✅ Agent installed to $AGENT_DIR/swarm-command.agent.md"
else
  echo "⚠️  Agent download failed (skill still works without it)"
fi

echo ""
echo "─────────────────────────────────────────"
echo "🐝 Launching Copilot CLI..."
echo "   Just type: swarm command"
echo "─────────────────────────────────────────"
echo ""

exec copilot < /dev/tty
