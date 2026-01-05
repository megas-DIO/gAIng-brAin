$logPath = $env:AGENTS_MD_PATH
if ([string]::IsNullOrWhiteSpace($logPath)) {
    $logPath = "C:\WINDOWS\system32\the_log.md"
}

Write-Host "[Claude] Briefing from the_log.md (latest entries)..."
if (Test-Path -LiteralPath $logPath) {
    Get-Content -LiteralPath $logPath -Tail 120
}
Write-Host "[Claude] Briefing complete."

try {
    claude
} catch {
    Write-Host "[Claude] Failed to start: $($_.Exception.Message)"
}




