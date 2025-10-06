@echo off
title Stopping Smart Home System
color 0C

echo.
echo █████████████████████████████████████████████████████████████████████████████████
echo ██                                                                        ██
echo ██                    🛑 STOPPING SMART HOME SYSTEM 🛑                   ██
echo ██                                                                        ██
echo █████████████████████████████████████████████████████████████████████████████████
echo.

echo 🔧 Stopping all Smart Home components...
echo ==========================================
echo.

echo 🐍 Stopping Python processes (ESP32 simulators)...
taskkill /f /im python.exe 2>nul
if %errorlevel% == 0 (
    echo ✅ Python processes stopped
) else (
    echo ⚠️ No Python processes found
)

echo.
echo 🟢 Stopping Node.js processes (Backend server)...
taskkill /f /im node.exe 2>nul
if %errorlevel% == 0 (
    echo ✅ Node.js processes stopped
) else (
    echo ⚠️ No Node.js processes found
)

echo.
echo 🧹 Cleaning up any remaining processes...
taskkill /f /fi "WINDOWTITLE eq ESP32*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Backend*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Face*" 2>nul

echo.
echo ✅ Smart Home System stopped successfully!
echo.
echo 📊 Stopped Components:
echo =====================
echo 🐍 Python processes (ESP32 simulators)
echo 🟢 Node.js processes (Backend server)
echo 🧹 All related terminal windows
echo.
echo 🎯 All Smart Home components have been shut down.
echo.
pause

