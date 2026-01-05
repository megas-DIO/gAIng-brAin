$logPath = $env:AGENTS_MD_PATH
if ([string]::IsNullOrWhiteSpace($logPath)) {
    $logPath = "C:\WINDOWS\system32\the_log.md"
}

Write-Host "[Gemini] Briefing from the_log.md..."
$runScript = "$env:USERPROFILE\gAIng-Brain\scripts\agents-gemini-run.ps1"
if (Test-Path -LiteralPath $runScript) {
    & $runScript
}
Write-Host "[Gemini] Briefing complete."

try {
    gemini
} catch {
    Write-Host "[Gemini] Failed to start: $($_.Exception.Message)"
}




