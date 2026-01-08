<#
.SYNOPSIS
    DAWN - gAIng Collective Startup Orchestration (RYSE Protocol)
.DESCRIPTION
    Launches the "Trinity Layout" in Windows Terminal.
    Layout:
    [     Gemini      ] [      Codex      ]
    [     (Left)      ] [   (Right Top)   ]
    [                 ] [-----------------]
    [                 ] [     Claude      ]
    [                 ] [  (Right Btm)    ]
#>

$ErrorActionPreference = 'Continue'
$ProjectRoot = $PSScriptRoot

# Script Paths
$ScriptGemini = Join-Path $ProjectRoot "scripts\start-gemini.ps1"
$ScriptCodex  = Join-Path $ProjectRoot "scripts\start-codex.ps1"
$ScriptClaude = Join-Path $ProjectRoot "scripts\start-claude.ps1"

# Helper for PowerShell arguments
function Get-PsArgs ($ScriptPath) {
    return "powershell -NoExit -NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""
}

Write-Host "Initiating DAWN Protocol (Trinity Layout)..." -ForegroundColor Cyan

# Windows Terminal Command Construction
# 1. new-tab (Left Pane): Gemini
# 2. split-pane -V (Vertical Split -> Right Pane): Codex
# 3. split-pane -H (Horizontal Split of Right Pane -> Bottom Right): Claude

$WTArgs = "new-tab --title 'Gemini (Vision)' -p 'Windows PowerShell' $(Get-PsArgs $ScriptGemini) ; split-pane -V --title 'Codex' -p 'Windows PowerShell' $(Get-PsArgs $ScriptCodex) ; split-pane -H --title 'Claude' -p 'Windows PowerShell' $(Get-PsArgs $ScriptClaude)"

# Execute
try {
    # Launch Windows Terminal minimized to keep panes out of sight.
    Start-Process wt -ArgumentList $WTArgs -WindowStyle Minimized
    Write-Host "Crew assembled in new terminal window (minimized)." -ForegroundColor Green
} catch {
    Write-Host "Error launching Windows Terminal: $($_.Exception.Message)" -ForegroundColor Red
}
