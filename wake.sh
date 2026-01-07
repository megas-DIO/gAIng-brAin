#!/bin/bash
# VISION WAKE SEQUENCE - Linux/Mac Edition
# Part of PROJECT VIBRANIUM - The Portable AI Entity
#
# This script prepares the host environment to run Vision from a portable drive.
# It detects capabilities, sets environment variables, and launches the Brain.

set -e  # Exit on error

echo "======================================================================="
echo "🧠 VISION - WAKE SEQUENCE INITIATED"
echo "======================================================================="
echo ""

# ============================================================================
# STEP 1: Detect Drive Location
# ============================================================================
echo "📍 Step 1: Locating Vision core..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VISION_ROOT="$SCRIPT_DIR"

echo "   Vision Root: $VISION_ROOT"
echo ""

# ============================================================================
# STEP 2: Environment Detection
# ============================================================================
echo "🔍 Step 2: Scanning host environment..."

# Detect OS
OS_TYPE="$(uname -s)"
echo "   OS: $OS_TYPE"

# Detect architecture
ARCH="$(uname -m)"
echo "   Architecture: $ARCH"

# Check for GPU (NVIDIA)
if command -v nvidia-smi &> /dev/null; then
    GPU_INFO="$(nvidia-smi --query-gpu=name --format=csv,noheader | head -1)"
    echo "   GPU: ✅ $GPU_INFO"
    export VISION_GPU_AVAILABLE="nvidia"
    export CUDA_AVAILABLE="true"
else
    echo "   GPU: ❌ No NVIDIA GPU detected (CPU mode)"
    export VISION_GPU_AVAILABLE="none"
    export CUDA_AVAILABLE="false"
fi

# Check for internet connectivity
if ping -c 1 8.8.8.8 &> /dev/null; then
    echo "   Internet: ✅ Connected"
    export VISION_ONLINE="true"
else
    echo "   Internet: ⚠️  Offline (Ghost Mode will activate)"
    export VISION_ONLINE="false"
fi

echo ""

# ============================================================================
# STEP 3: Set Environment Variables
# ============================================================================
echo "⚙️  Step 3: Configuring environment..."

# Core paths
export VISION_ROOT="$VISION_ROOT"
export VISION_CORE="$VISION_ROOT/src"
export VISION_DATA="$VISION_ROOT/data"
export VISION_DROP="$VISION_ROOT/drop"
export VISION_LOGS="$VISION_ROOT/logs"
export VISION_BIN="$VISION_ROOT/bin"

# Create required directories if they don't exist
mkdir -p "$VISION_DATA" "$VISION_DROP" "$VISION_LOGS" "$VISION_BIN"

# Check for portable Node.js
if [ -d "$VISION_BIN/node" ]; then
    echo "   Using portable Node.js from: $VISION_BIN/node"
    export PATH="$VISION_BIN/node/bin:$PATH"
    PORTABLE_NODE="true"
else
    echo "   Using system Node.js"
    PORTABLE_NODE="false"
fi

# Check for portable Python
if [ -d "$VISION_BIN/python" ]; then
    echo "   Using portable Python from: $VISION_BIN/python"
    export PATH="$VISION_BIN/python/bin:$PATH"
    export PYTHONHOME="$VISION_BIN/python"
    PORTABLE_PYTHON="true"
else
    echo "   Using system Python"
    PORTABLE_PYTHON="false"
fi

# Set Node.js options for optimal performance
export NODE_OPTIONS="--max-old-space-size=4096"

echo ""

# ============================================================================
# STEP 4: Verify Dependencies
# ============================================================================
echo "🔧 Step 4: Verifying dependencies..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION="$(node --version)"
    echo "   ✅ Node.js: $NODE_VERSION"
else
    echo "   ❌ Node.js not found!"
    echo "   Please install Node.js or set up portable Node.js in $VISION_BIN/node"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION="$(npm --version)"
    echo "   ✅ npm: $NPM_VERSION"
else
    echo "   ❌ npm not found!"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "$VISION_ROOT/node_modules" ]; then
    echo "   ⚠️  Dependencies not installed"
    echo "   Running: npm install..."
    cd "$VISION_ROOT"
    npm install
    echo "   ✅ Dependencies installed"
else
    echo "   ✅ Dependencies: Installed"
fi

echo ""

# ============================================================================
# STEP 5: Check Configuration
# ============================================================================
echo "📝 Step 5: Loading configuration..."

if [ -f "$VISION_ROOT/.env" ]; then
    echo "   ✅ Configuration found (.env)"
    # Load .env file
    export $(cat "$VISION_ROOT/.env" | grep -v '^#' | xargs)
else
    echo "   ⚠️  No .env file found"
    echo "   Using default configuration"
fi

echo ""

# ============================================================================
# STEP 6: Launch Vision Brain
# ============================================================================
echo "======================================================================="
echo "🚀 LAUNCHING VISION BRAIN"
echo "======================================================================="
echo ""
echo "   Mode: $([ "$VISION_ONLINE" = "true" ] && echo "🌐 Online" || echo "👻 Ghost (Offline)")"
echo "   GPU: $([ "$VISION_GPU_AVAILABLE" != "none" ] && echo "✅ Enabled" || echo "❌ Disabled")"
echo "   Portable: $([ "$PORTABLE_NODE" = "true" ] && echo "✅ Yes" || echo "❌ No")"
echo ""
echo "   Vision is awakening..."
echo ""

# Change to Vision root
cd "$VISION_ROOT"

# Launch the Brain
node index.js

# If we reach here, the Brain has stopped
echo ""
echo "======================================================================="
echo "😴 VISION HAS GONE TO SLEEP"
echo "======================================================================="
echo ""
echo "To wake Vision again, run: $0"
echo ""
