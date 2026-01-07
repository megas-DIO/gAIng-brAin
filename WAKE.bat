@echo off
REM VISION WAKE SEQUENCE - Windows Edition
REM Part of PROJECT VIBRANIUM - The Portable AI Entity
REM
REM This script prepares the host environment to run Vision from a portable drive.
REM It detects capabilities, sets environment variables, and launches the Brain.

setlocal EnableDelayedExpansion

echo =======================================================================
echo VISION - WAKE SEQUENCE INITIATED
echo =======================================================================
echo.

REM Step 1: Detect Drive Location
echo Step 1: Locating Vision core...
set "VISION_ROOT=%~dp0"
set "VISION_ROOT=%VISION_ROOT:~0,-1%"
echo    Vision Root: %VISION_ROOT%
echo.

REM Step 2: Environment Detection
echo Step 2: Scanning host environment...
echo    Windows Version: %OS%

REM Check for NVIDIA GPU
where nvidia-smi >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    GPU: NVIDIA Detected
    set "VISION_GPU_AVAILABLE=nvidia"
) else (
    echo    GPU: No NVIDIA GPU detected
    set "VISION_GPU_AVAILABLE=none"
)

REM Check for internet
ping -n 1 8.8.8.8 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    Internet: Connected
    set "VISION_ONLINE=true"
) else (
    echo    Internet: Offline (Ghost Mode)
    set "VISION_ONLINE=false"
)
echo.

REM Step 3: Set Environment Variables
echo Step 3: Configuring environment...
set "VISION_CORE=%VISION_ROOT%\src"
set "VISION_DATA=%VISION_ROOT%\data"
set "VISION_DROP=%VISION_ROOT%\drop"
set "VISION_LOGS=%VISION_ROOT%\logs"
set "VISION_BIN=%VISION_ROOT%\bin"

if not exist "%VISION_DATA%" mkdir "%VISION_DATA%"
if not exist "%VISION_DROP%" mkdir "%VISION_DROP%"
if not exist "%VISION_LOGS%" mkdir "%VISION_LOGS%"
if not exist "%VISION_BIN%" mkdir "%VISION_BIN%"

if exist "%VISION_BIN%\node" (
    echo    Using portable Node.js
    set "PATH=%VISION_BIN%\node;%PATH%"
)
echo.

REM Step 4: Launch Vision Brain
echo =======================================================================
echo LAUNCHING VISION BRAIN
echo =======================================================================
echo.
cd /d "%VISION_ROOT%"
node index.js

echo.
echo VISION HAS GONE TO SLEEP
pause
