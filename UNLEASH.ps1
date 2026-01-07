# VISION UNLEASH SEQUENCE - PowerShell Edition
# Part of PROJECT VIBRANIUM - The Portable AI Entity
# Advanced wake sequence with full diagnostics and optimization

param(
    [switch]$GhostMode,
    [switch]$Debug,
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "🧠 VISION - UNLEASH SEQUENCE INITIATED" -ForegroundColor Cyan
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# STEP 1: Detect Drive Location
# ============================================================================
Write-Host "📍 Step 1: Locating Vision core..." -ForegroundColor Yellow

$VISION_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "   Vision Root: $VISION_ROOT" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 2: Environment Detection
# ============================================================================
Write-Host "🔍 Step 2: Scanning host environment..." -ForegroundColor Yellow

# OS Information
$OSInfo = Get-CimInstance Win32_OperatingSystem
Write-Host "   OS: $($OSInfo.Caption) Build $($OSInfo.BuildNumber)" -ForegroundColor Gray

# Architecture
Write-Host "   Architecture: $env:PROCESSOR_ARCHITECTURE" -ForegroundColor Gray

# Memory
$TotalRAM = [math]::Round($OSInfo.TotalVisibleMemorySize / 1MB, 2)
$FreeRAM = [math]::Round($OSInfo.FreePhysicalMemory / 1MB, 2)
Write-Host "   RAM: $TotalRAM GB total, $FreeRAM GB free" -ForegroundColor Gray

# GPU Detection
$GPU_AVAILABLE = $false
try {
    $nvidiaGPU = nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader 2>$null
    if ($nvidiaGPU) {
        Write-Host "   GPU: ✅ $nvidiaGPU" -ForegroundColor Green
        $env:VISION_GPU_AVAILABLE = "nvidia"
        $env:CUDA_AVAILABLE = "true"
        $GPU_AVAILABLE = $true
    }
} catch {
    Write-Host "   GPU: ❌ No NVIDIA GPU detected (CPU mode)" -ForegroundColor Yellow
    $env:VISION_GPU_AVAILABLE = "none"
    $env:CUDA_AVAILABLE = "false"
}

# Internet Connectivity
$ONLINE = Test-Connection -ComputerName 8.8.8.8 -Count 1 -Quiet
if ($ONLINE -and !$GhostMode) {
    Write-Host "   Internet: ✅ Connected" -ForegroundColor Green
    $env:VISION_ONLINE = "true"
} else {
    Write-Host "   Internet: 👻 Ghost Mode Active" -ForegroundColor Magenta
    $env:VISION_ONLINE = "false"
}

Write-Host ""

# ============================================================================
# STEP 3: Set Environment Variables
# ============================================================================
Write-Host "⚙️  Step 3: Configuring environment..." -ForegroundColor Yellow

# Core paths
$env:VISION_ROOT = $VISION_ROOT
$env:VISION_CORE = "$VISION_ROOT\src"
$env:VISION_DATA = "$VISION_ROOT\data"
$env:VISION_DROP = "$VISION_ROOT\drop"
$env:VISION_LOGS = "$VISION_ROOT\logs"
$env:VISION_BIN = "$VISION_ROOT\bin"

# Create required directories
$dirs = @($env:VISION_DATA, $env:VISION_DROP, $env:VISION_LOGS, $env:VISION_BIN)
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "   Created: $dir" -ForegroundColor Gray
    }
}

# Check for portable runtimes
$PORTABLE_NODE = Test-Path "$env:VISION_BIN\node"
$PORTABLE_PYTHON = Test-Path "$env:VISION_BIN\python"

if ($PORTABLE_NODE) {
    Write-Host "   ✅ Using portable Node.js" -ForegroundColor Green
    $env:PATH = "$env:VISION_BIN\node;$env:PATH"
} else {
    Write-Host "   Using system Node.js" -ForegroundColor Gray
}

if ($PORTABLE_PYTHON) {
    Write-Host "   ✅ Using portable Python" -ForegroundColor Green
    $env:PATH = "$env:VISION_BIN\python;$env:VISION_BIN\python\Scripts;$env:PATH"
    $env:PYTHONHOME = "$env:VISION_BIN\python"
} else {
    Write-Host "   Using system Python" -ForegroundColor Gray
}

# Optimize Node.js
$env:NODE_OPTIONS = "--max-old-space-size=4096"

Write-Host ""

# ============================================================================
# STEP 4: Verify Dependencies
# ============================================================================
Write-Host "🔧 Step 4: Verifying dependencies..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found!" -ForegroundColor Red
    Write-Host "   Please install Node.js or set up portable Node.js" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Check dependencies
if (!(Test-Path "$VISION_ROOT\node_modules") -and !$SkipInstall) {
    Write-Host "   ⚠️  Dependencies not installed" -ForegroundColor Yellow
    Write-Host "   Running: npm install..." -ForegroundColor Yellow
    Push-Location $VISION_ROOT
    npm install
    Pop-Location
    Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ✅ Dependencies: Installed" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# STEP 5: Load Configuration
# ============================================================================
Write-Host "📝 Step 5: Loading configuration..." -ForegroundColor Yellow

if (Test-Path "$VISION_ROOT\.env") {
    Write-Host "   ✅ Configuration found (.env)" -ForegroundColor Green
    # Load .env file
    Get-Content "$VISION_ROOT\.env" | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
            if ($Debug) {
                Write-Host "   Loaded: $key" -ForegroundColor Gray
            }
        }
    }
} else {
    Write-Host "   ⚠️  No .env file found" -ForegroundColor Yellow
    Write-Host "   Using default configuration" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# STEP 6: System Diagnostics (Debug Mode)
# ============================================================================
if ($Debug) {
    Write-Host "🔬 Debug Mode: System Diagnostics" -ForegroundColor Magenta
    Write-Host "   Node Path: $(Get-Command node | Select-Object -ExpandProperty Source)" -ForegroundColor Gray
    Write-Host "   Working Dir: $(Get-Location)" -ForegroundColor Gray
    Write-Host "   Environment Variables:" -ForegroundColor Gray
    Get-ChildItem Env: | Where-Object { $_.Name -like "VISION_*" } | ForEach-Object {
        Write-Host "     $($_.Name) = $($_.Value)" -ForegroundColor DarkGray
    }
    Write-Host ""
}

# ============================================================================
# STEP 7: Launch Vision Brain
# ============================================================================
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "🚀 LAUNCHING VISION BRAIN" -ForegroundColor Cyan
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

$modeIcon = if ($env:VISION_ONLINE -eq "true") { "🌐" } else { "👻" }
$modeName = if ($env:VISION_ONLINE -eq "true") { "Online" } else { "Ghost (Offline)" }
Write-Host "   Mode: $modeIcon $modeName" -ForegroundColor $(if ($env:VISION_ONLINE -eq "true") { "Green" } else { "Magenta" })

$gpuIcon = if ($GPU_AVAILABLE) { "✅" } else { "❌" }
Write-Host "   GPU: $gpuIcon $(if ($GPU_AVAILABLE) { 'Enabled' } else { 'Disabled' })" -ForegroundColor $(if ($GPU_AVAILABLE) { "Green" } else { "Gray" })

$portableIcon = if ($PORTABLE_NODE) { "✅" } else { "❌" }
Write-Host "   Portable: $portableIcon $(if ($PORTABLE_NODE) { 'Yes' } else { 'No' })" -ForegroundColor $(if ($PORTABLE_NODE) { "Green" } else { "Gray" })

Write-Host ""
Write-Host "   Vision is awakening..." -ForegroundColor Yellow
Write-Host ""

# Change to Vision root
Push-Location $VISION_ROOT

# Launch the Brain
try {
    node index.js
} catch {
    Write-Host ""
    Write-Host "❌ Vision encountered an error: $_" -ForegroundColor Red
    Write-Host ""
} finally {
    Pop-Location
}

# Cleanup
Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "😴 VISION HAS GONE TO SLEEP" -ForegroundColor Cyan
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To wake Vision again, run: .\UNLEASH.ps1" -ForegroundColor Gray
Write-Host "For debug mode: .\UNLEASH.ps1 -Debug" -ForegroundColor Gray
Write-Host "For offline mode: .\UNLEASH.ps1 -GhostMode" -ForegroundColor Gray
Write-Host ""

if (!$Debug) {
    Read-Host "Press Enter to exit"
}
