#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# ClawtBot — One-Line Installer
# Install ClawtBot on any system with a single command:
#
#   curl -fsSL https://raw.githubusercontent.com/avii-7/clawtbot/main/install.sh | bash
#
# Modes:
#   ... | bash                     # Auto-detect best method
#   ... | bash -s -- --docker      # Force Docker Compose install
#   ... | bash -s -- --local       # Force local (Python + Node) install
#   ... | bash -s -- --dir /path   # Custom install directory
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ─── Config ──────────────────────────────────────────────────────────────────
REPO_URL="https://github.com/avii-7/clawtbot.git"
INSTALL_DIR="${HOME}/clawtbot"
MODE="auto"   # auto | docker | local
BRANCH="main"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()      { echo -e "${CYAN}[ClawtBot]${NC} $1"; }
log_ok()   { echo -e "${GREEN}[ClawtBot]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[ClawtBot]${NC} $1"; }
log_err()  { echo -e "${RED}[ClawtBot]${NC} $1"; }

# ─── Parse args ──────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case $1 in
        --docker)  MODE="docker"; shift ;;
        --local)   MODE="local"; shift ;;
        --dir)     INSTALL_DIR="$2"; shift 2 ;;
        --branch)  BRANCH="$2"; shift 2 ;;
        *)         shift ;;
    esac
done

# ─── Banner ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}"
cat << 'BANNER'
   _____ _               _   ____        _
  / ____| |             | | |  _ \      | |
 | |    | | __ ___      _| |_| |_) | ___ | |_
 | |    | |/ _` \ \ /\ / / __|  _ < / _ \| __|
 | |____| | (_| |\ V  V /| |_| |_) | (_) | |_
  \_____|_|\__,_| \_/\_/  \__|____/ \___/ \__|

BANNER
echo -e "${NC}"
echo -e "${BOLD}  AI Automation System — Built by Abhishek Singh (Avii)${NC}"
echo -e "  ─────────────────────────────────────────────────────"
echo ""

# ─── System Detection ───────────────────────────────────────────────────────
OS="unknown"
ARCH="$(uname -m)"

case "$(uname -s)" in
    Linux*)   OS="linux" ;;
    Darwin*)  OS="macos" ;;
    MINGW*|MSYS*|CYGWIN*) OS="windows" ;;
esac

log "Detected: ${OS} (${ARCH})"

# ─── Dependency Checks ──────────────────────────────────────────────────────
HAS_GIT=false
HAS_DOCKER=false
HAS_PYTHON=false
HAS_NODE=false
HAS_PIP=false

command -v git     &>/dev/null && HAS_GIT=true
command -v docker  &>/dev/null && HAS_DOCKER=true
(command -v python3 &>/dev/null || command -v python &>/dev/null) && HAS_PYTHON=true
command -v node    &>/dev/null && HAS_NODE=true
(command -v pip3 &>/dev/null || command -v pip &>/dev/null) && HAS_PIP=true

log "Dependencies:"
$HAS_GIT    && log_ok "  ✓ git"     || log_err "  ✗ git (required)"
$HAS_DOCKER && log_ok "  ✓ docker"  || log_warn "  ✗ docker (optional)"
$HAS_PYTHON && log_ok "  ✓ python3" || log_warn "  ✗ python3"
$HAS_NODE   && log_ok "  ✓ node"    || log_warn "  ✗ node"
$HAS_PIP    && log_ok "  ✓ pip"     || log_warn "  ✗ pip"
echo ""

# ─── Auto-detect mode ───────────────────────────────────────────────────────
if [ "$MODE" = "auto" ]; then
    if $HAS_DOCKER && docker info &>/dev/null 2>&1; then
        MODE="docker"
        log "Auto-selected: ${BOLD}Docker mode${NC} (Docker is running)"
    elif $HAS_PYTHON && $HAS_NODE; then
        MODE="local"
        log "Auto-selected: ${BOLD}Local mode${NC} (Python + Node available)"
    elif $HAS_DOCKER; then
        MODE="docker"
        log "Auto-selected: ${BOLD}Docker mode${NC}"
    else
        log_err "Cannot auto-detect install mode."
        log_err "Please install either Docker or Python3 + Node.js, then re-run."
        exit 1
    fi
fi
echo ""

# ─── Validate requirements ──────────────────────────────────────────────────
if ! $HAS_GIT; then
    log_err "git is required. Install it first:"
    case $OS in
        macos)   echo "  brew install git" ;;
        linux)   echo "  sudo apt install git  (Debian/Ubuntu)" ;;
        *)       echo "  https://git-scm.com/downloads" ;;
    esac
    exit 1
fi

if [ "$MODE" = "docker" ] && ! $HAS_DOCKER; then
    log_err "Docker mode selected but Docker is not installed."
    log_err "Install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if [ "$MODE" = "local" ]; then
    if ! $HAS_PYTHON; then
        log_err "Python 3.9+ is required for local mode."
        exit 1
    fi
    if ! $HAS_NODE; then
        log_err "Node.js 18+ is required for local mode."
        exit 1
    fi
fi

# ═════════════════════════════════════════════════════════════════════════════
# Step 1: Clone Repository
# ═════════════════════════════════════════════════════════════════════════════

if [ -d "$INSTALL_DIR" ]; then
    log "Directory $INSTALL_DIR already exists."
    log "Updating with git pull..."
    cd "$INSTALL_DIR"
    git pull origin "$BRANCH" 2>/dev/null || true
else
    log "Cloning ClawtBot into ${INSTALL_DIR}..."
    git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# ═════════════════════════════════════════════════════════════════════════════
# Step 2: Setup .env
# ═════════════════════════════════════════════════════════════════════════════

if [ ! -f .env ]; then
    log "Creating .env from template..."
    cp .env.example .env

    # Generate a random JWT secret
    JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || openssl rand -hex 32 2>/dev/null || echo "change-this-in-production-$(date +%s)")
    if [[ "$OS" == "macos" ]]; then
        sed -i '' "s/your-super-secret-jwt-key-change-this-in-production/${JWT_SECRET}/" .env
    else
        sed -i "s/your-super-secret-jwt-key-change-this-in-production/${JWT_SECRET}/" .env
    fi
    log_ok "  ✓ .env created with secure JWT secret"
else
    log_ok "  ✓ .env already exists — keeping current config"
fi

# ═════════════════════════════════════════════════════════════════════════════
# Step 3A: Docker Install
# ═════════════════════════════════════════════════════════════════════════════

if [ "$MODE" = "docker" ]; then
    log "Building and starting via Docker Compose..."
    echo ""

    docker compose up --build -d

    echo ""
    log_ok "═══════════════════════════════════════════════════"
    log_ok "  ClawtBot is running! 🚀"
    log_ok "═══════════════════════════════════════════════════"
    echo ""
    log "  🌐 Frontend:    http://localhost:${FRONTEND_PORT:-3000}"
    log "  🔧 Backend API: http://localhost:${BACKEND_PORT:-8000}"
    log "  📚 API Docs:    http://localhost:${BACKEND_PORT:-8000}/docs"
    echo ""
    log "  Manage with:"
    echo "    clawtbot start    # Start services"
    echo "    clawtbot stop     # Stop services"
    echo "    clawtbot logs     # View logs"
    echo "    clawtbot status   # Check health"
    echo ""
fi

# ═════════════════════════════════════════════════════════════════════════════
# Step 3B: Local Install
# ═════════════════════════════════════════════════════════════════════════════

if [ "$MODE" = "local" ]; then
    # Python dependencies
    log "Installing Python dependencies..."
    pip3 install -r requirements.txt --quiet 2>/dev/null || \
        python3 -m pip install -r requirements.txt --quiet
    log_ok "  ✓ Python packages installed"

    # Node dependencies
    log "Installing frontend dependencies..."
    cd frontend && npm ci --silent 2>/dev/null || npm install --silent
    cd "$INSTALL_DIR"
    log_ok "  ✓ Frontend packages installed"

    echo ""
    log_ok "═══════════════════════════════════════════════════"
    log_ok "  ClawtBot installed successfully! 🚀"
    log_ok "═══════════════════════════════════════════════════"
    echo ""
    log "  To start ClawtBot:"
    echo "    cd ${INSTALL_DIR}"
    echo "    clawtbot start"
    echo ""
    log "  Or manually:"
    echo "    ./scripts/start.sh"
    echo ""
fi

# ═════════════════════════════════════════════════════════════════════════════
# Step 4: Install CLI
# ═════════════════════════════════════════════════════════════════════════════

log "Installing 'clawtbot' CLI command..."

CLI_PATH="$INSTALL_DIR/clawtbot"
chmod +x "$CLI_PATH" 2>/dev/null || true

# Symlink to PATH
LINK_TARGET=""
if [ -d "/usr/local/bin" ] && [ -w "/usr/local/bin" ]; then
    LINK_TARGET="/usr/local/bin/clawtbot"
elif [ -d "$HOME/.local/bin" ]; then
    LINK_TARGET="$HOME/.local/bin/clawtbot"
    mkdir -p "$HOME/.local/bin"
elif [ -d "$HOME/bin" ]; then
    LINK_TARGET="$HOME/bin/clawtbot"
    mkdir -p "$HOME/bin"
fi

if [ -n "$LINK_TARGET" ]; then
    ln -sf "$CLI_PATH" "$LINK_TARGET" 2>/dev/null && \
        log_ok "  ✓ 'clawtbot' command installed → ${LINK_TARGET}" || \
        log_warn "  ⚠ Could not create symlink. Run: sudo ln -sf ${CLI_PATH} /usr/local/bin/clawtbot"
else
    log_warn "  ⚠ No writable bin directory found."
    log_warn "  Add this to your shell profile:"
    echo "    export PATH=\"${INSTALL_DIR}:\$PATH\""
fi

echo ""
log "Edit ${INSTALL_DIR}/.env to configure API keys and ports."
log "See ${INSTALL_DIR}/docs/HOW_TO_GET_API_KEYS.md for API key setup."
echo ""
log_ok "Done! Run 'clawtbot start' to launch. 🎉"
echo ""
