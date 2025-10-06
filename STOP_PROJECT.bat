@echo off
title Stop Smart Home System
color 0C

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          🛑 STOPPING SMART HOME SYSTEM 🛑                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 🛑 Stopping all components...
echo.

REM Stop Node.js processes (Backend & Frontend)
echo [1/2] Stopping Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel%==0 (
    echo ✅ Node.js processes stopped
) else (
    echo ⚠️  No Node.js processes found
)

REM Stop Python processes (Simulators & Detection)
echo [2/2] Stopping Python processes...
taskkill /F /IM python.exe 2>nul
if %errorlevel%==0 (
    echo ✅ Python processes stopped
) else (
    echo ⚠️  No Python processes found
)

echo.
echo ✅ All Smart Home components have been stopped!
echo.
echo Press any key to exit...
pause > nul
