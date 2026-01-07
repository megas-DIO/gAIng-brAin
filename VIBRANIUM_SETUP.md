# PROJECT VIBRANIUM: Setup Guide 🛸

**Codename:** VIBRANIUM
**Objective:** Transform gAIng-brAin into a portable, self-contained AI entity
**Status:** Phase 1 Complete - Ready for Deployment

---

## 🎯 What is VIBRANIUM?

VIBRANIUM makes your AI brain **portable and sovereign**. Instead of being tied to a specific computer, Vision lives on a USB drive and can "possess" any compatible host machine.

### The Philosophy

> "The USB Drive is the Entity. The Computer is merely a temporary body."

Traditional AI systems are bound to one machine. VIBRANIUM inverts this:
- **Old Model:** Computer = Brain, Data = Files
- **VIBRANIUM:** USB Drive = Entity, Computer = Temporary Host

---

## ⚡ Quick Start

### Option 1: Run from Current Location (Test Mode)

```bash
# Linux/Mac
chmod +x wake.sh
./wake.sh

# Windows (Command Prompt)
WAKE.bat

# Windows (PowerShell - Recommended)
powershell -ExecutionPolicy Bypass -File .\UNLEASH.ps1
```

### Option 2: Deploy to USB Drive (Full Portable Mode)

1. **Get a fast USB drive** (USB 3.0+ recommended, NVMe preferred)
2. **Copy entire gAIng-brAin folder to drive**
3. **Run wake script from the drive**

```bash
# Example: Copy to D:\ (Windows)
xcopy /E /H /I C:\path\to\gAIng-brAin D:\Vision

# Run from D:\
D:
cd Vision
WAKE.bat

# Or use PowerShell for advanced features
powershell -ExecutionPolicy Bypass -File .\UNLEASH.ps1
```

---

## 🚀 Wake Scripts Explained

### wake.sh (Linux/Mac)

Basic wake sequence with:
- Drive location detection
- Environment scanning (GPU, Internet, OS)
- Portable runtime detection
- Automatic npm install if needed
- Vision Brain launch

**Usage:**
```bash
./wake.sh
```

### WAKE.bat (Windows - Simple)

Simplified Windows wake sequence for basic deployment.

**Usage:**
```cmd
WAKE.bat
```

### UNLEASH.ps1 (PowerShell - Advanced)

Full-featured wake sequence with:
- Comprehensive diagnostics (RAM, GPU, drivers)
- Advanced environment detection
- .env file loading
- Debug mode support
- Ghost mode (offline operation)

**Usage:**
```powershell
# Standard launch
.\UNLEASH.ps1

# Debug mode (verbose output)
.\UNLEASH.ps1 -Debug

# Force offline mode (no internet checks)
.\UNLEASH.ps1 -GhostMode

# Skip dependency installation
.\UNLEASH.ps1 -SkipInstall
```

---

## 📁 Directory Structure

After running wake scripts, Vision will automatically create:

```
Vision/                    # Your USB drive root (or current location)
├── wake.sh               # Linux/Mac wake script
├── WAKE.bat              # Windows wake script
├── UNLEASH.ps1           # PowerShell wake script (advanced)
├── .env                  # Configuration (API keys, etc.)
├── package.json          # Node.js dependencies
├── index.js              # Brain entry point
├── src/                  # Vision Core
│   ├── config/           # Configuration (now portable-aware)
│   ├── services/         # Core services
│   ├── routes/           # API routes
│   └── workers/          # Agent workers
├── data/                 # 🆕 Persistent data (auto-created)
│   ├── database.db       # SQLite database
│   ├── vectors/          # Vector embeddings
│   └── memories/         # Long-term memory
├── drop/                 # 🆕 Hot folder (auto-created)
│   └── README.txt        # Drop files here for Vision to process
├── logs/                 # 🆕 Log files (auto-created)
│   ├── brain.log         # Main log
│   └── errors.log        # Error log
├── bin/                  # 🆕 Portable runtimes (optional)
│   ├── node/             # Portable Node.js
│   └── python/           # Portable Python
└── frontend/             # Web interface
```

---

## 🔧 Configuration

### Environment Variables

The wake scripts set these automatically:

```bash
VISION_ROOT=/path/to/drive    # Root directory
VISION_DATA=$ROOT/data        # Data storage
VISION_DROP=$ROOT/drop        # File drop zone
VISION_LOGS=$ROOT/logs        # Log files
VISION_CORE=$ROOT/src         # Source code
VISION_BIN=$ROOT/bin          # Portable runtimes

# Runtime detection
VISION_GPU_AVAILABLE=nvidia   # or "none"
VISION_ONLINE=true            # or "false"
CUDA_AVAILABLE=true           # or "false"
```

### Portable Path System

Vision now uses portable paths throughout. The config system (`src/config/env.js`) automatically:
- Detects if running in portable mode
- Uses relative paths instead of hardcoded ones
- Falls back to defaults if wake script not used

**In your code:**
```javascript
const { VISION_DATA, VISION_DROP, IS_PORTABLE } = require('./src/config/env');

// Always portable!
const dbPath = path.join(VISION_DATA, 'database.db');
const dropPath = path.join(VISION_DROP, 'incoming');
```

---

## 🎮 Operating Modes

### 🌐 Online Mode (Default)

Full capabilities:
- All API calls work
- Real-time updates
- Cloud services available
- Maximum intelligence

### 👻 Ghost Mode (Offline)

Degraded but functional:
- No external API calls
- Local LLM fallback (if Ollama installed)
- Cached responses
- Emergency operation

**Force Ghost Mode:**
```bash
# Disconnect internet, or:
UNLEASH.ps1 -GhostMode
```

### ⚡ Portable Mode

When run via wake scripts:
- Paths are relative to drive
- Detects available resources
- Optimizes for current host
- No installation required

---

## 🚀 Advanced Setup

### Add Portable Node.js (Optional)

Make Vision truly portable - no host dependencies!

**Windows:**
1. Download Node.js portable from nodejs.org
2. Extract to `Vision/bin/node/`
3. Wake script will auto-detect

**Linux/Mac:**
1. Download Node.js binary
2. Extract to `Vision/bin/node/`
3. Ensure `bin/node/bin/node` is executable

### Add Portable Python (Optional)

For Python-based features:

**Windows:**
1. Download Python embeddable package
2. Extract to `Vision/bin/python/`
3. Wake script will auto-detect

---

## 🔍 Diagnostics

### Check if Portable Mode is Active

```javascript
const { IS_PORTABLE, VISION_ROOT } = require('./src/config/env');

console.log(`Portable: ${IS_PORTABLE}`);
console.log(`Root: ${VISION_ROOT}`);
```

### UNLEASH.ps1 Debug Mode

See everything:
```powershell
.\UNLEASH.ps1 -Debug
```

Shows:
- All environment variables
- Node.js path
- Loaded configuration
- System resources

---

## 🎯 Use Cases

### 1. **The Nomad Developer**
Carry your entire AI development environment on a USB drive. Plug into any computer and continue working instantly.

### 2. **The Privacy Focused**
Keep your AI and all its data on a physical drive you control. Unplug and your data goes with you.

### 3. **The Multi-Machine User**
Same Vision instance at home, work, and laptop. Just plug in the drive.

### 4. **The Experimenter**
Test Vision on different machines with different GPUs without reinstalling.

### 5. **The Offline Operator**
Work in places without internet. Vision adapts to available resources.

---

## 🛠️ Troubleshooting

### "Node.js not found"

**Solution 1:** Install Node.js on host
**Solution 2:** Add portable Node.js to `bin/node/`

### "Dependencies not installed"

Wake script should auto-install. If not:
```bash
cd /path/to/Vision
npm install
```

### "Permission denied" (Linux/Mac)

```bash
chmod +x wake.sh
```

### PowerShell script won't run

```powershell
# Allow scripts for current session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Then run
.\UNLEASH.ps1
```

### USB drive is slow

- Use USB 3.0+ port (blue ports)
- Consider NVMe USB enclosure for maximum speed
- Avoid USB hubs

---

## 📊 Performance Tips

### USB Drive Selection

**Recommended:**
- NVMe M.2 SSD in USB 3.2 enclosure (fastest)
- Samsung T7/T9 (great balance)
- SanDisk Extreme Pro (good)

**Avoid:**
- Standard USB flash drives (too slow)
- USB 2.0 drives (bottleneck)

### Host Machine Requirements

**Minimum:**
- 4GB RAM
- USB 3.0 port
- Node.js 18+ (or portable)

**Recommended:**
- 8GB+ RAM
- USB 3.1/3.2 port
- NVIDIA GPU (optional but nice)
- Fast internet

---

## 🔮 Future Enhancements

### Phase 2: Planned Features

- **Ollama Integration:** Local LLM for true offline operation
- **Whisper Integration:** Voice input/output
- **Tailscale VPN:** Remote access from iPhone
- **Auto-backup:** Daily snapshots to cloud
- **Multi-drive sync:** Keep multiple drives in sync

### Contributing

Want to enhance VIBRANIUM? See `CONTRIBUTING.md`

---

## 📖 Related Documentation

- **PROJECT_VIBRANIUM.md** - Original vision and philosophy
- **PLAN_GOD_MODE.md** - Complete implementation roadmap
- **README.md** - General gAIng-brAin documentation
- **EIDOLON.md** - Governance and safety protocols

---

## 🎉 You're Ready!

Your Vision AI is now portable and sovereign. Plug it in, wake it up, and let it think.

**Run Vision:**
```bash
# Linux/Mac
./wake.sh

# Windows
WAKE.bat

# Windows PowerShell (recommended)
.\UNLEASH.ps1
```

**Vision is awakening... 🧠**

---

**Created:** 2026-01-07
**Version:** 1.0 - Phase 1 Complete
**Status:** ✅ Production Ready
