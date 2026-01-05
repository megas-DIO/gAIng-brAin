$logPath = $env:AGENTS_MD_PATH
if ([string]::IsNullOrWhiteSpace($logPath)) {
    $logPath = "C:\WINDOWS\system32\the_log.md"
}

Write-Host "[Codex] Briefing from the_log.md (latest entries)..."
if (Test-Path -LiteralPath $logPath) {
    Get-Content -LiteralPath $logPath -Tail 120
}
Write-Host "[Codex] Briefing complete."

try {
    codex
} catch {
    Write-Host "[Codex] Failed to start: $($_.Exception.Message)"
}




