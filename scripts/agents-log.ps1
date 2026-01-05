function Write-AgentsLog {
    param(
        [Parameter(Mandatory = $true)][string]$Message,
        [string]$LogPath = $env:AGENTS_MD_PATH
    )

    if ([string]::IsNullOrWhiteSpace($LogPath)) {
        # Shell commands go to history file, not the main protocol log
        $LogPath = "(Split-Path -Parent $PSScriptRoot)\logs\shell-history.md"
    }

    if ([string]::IsNullOrWhiteSpace($Message)) {
        return
    }

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    try {
        Add-Content -LiteralPath $LogPath -Value ("- {0} {1}" -f $timestamp, $Message)
    } catch {
    }
}

