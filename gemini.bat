@echo off
:: Gemini CLI Wrapper - gAIng Collective
:: Launches Gemini agent via PowerShell script
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-gemini.ps1" %*
