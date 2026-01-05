@echo off
:: Codex CLI Wrapper - gAIng Collective
:: Launches Codex agent via PowerShell script
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-codex.ps1" %*
