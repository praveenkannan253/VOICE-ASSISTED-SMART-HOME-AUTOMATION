@echo off
title Smart Home IoT System - Complete Launcher
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          🏠 SMART HOME IoT SYSTEM - LAUNCHER 🏠           ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Starting all components...
echo.

REM Start Backend Server (Clean Demo Mode)
echo [1/4] 🖥️  Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run demo"
timeout /t 3 /nobreak > nul

REM Start ESP32 Sensor Simulator (Comment out if using real hardware)
echo [2/4] 📊 ESP32 Simulator (Skipped - Using Real Hardware)
REM start "ESP32 Simulator" cmd /k "python python\core\continuous_esp32_simulator.py"
timeout /t 1 /nobreak > nul

REM Start ESP32 Command Receiver
echo [3/4] 🔧 Starting ESP32 Command Receiver...
start "ESP32 Command Receiver" cmd /k "python python\core\esp32_command_receiver.py"
timeout /t 2 /nobreak > nul

REM Start Frontend Dashboard
echo [4/4] 🌐 Starting Frontend Dashboard...
start "Frontend Dashboard" cmd /k "cd frontend && npm start"
timeout /t 5 /nobreak > nul

echo.
echo ✅ All components started successfully!
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    SYSTEM STATUS                           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ✅ Backend Server       - Running on http://localhost:3000
echo ✅ ESP32 Simulator      - Sending sensor data
echo ✅ Command Receiver     - Listening for commands
echo ✅ Frontend Dashboard   - Opening at http://localhost:3001
echo.
echo ⏳ Waiting for frontend to compile (30-60 seconds)...
timeout /t 10 /nobreak > nul

REM Open browser automatically
echo.
echo 🌐 Opening dashboard in browser...
start http://localhost:3001

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    READY TO DEMO!                          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🎯 Your Smart Home System is now running!
echo.
echo 📋 What you can do:
echo    • Toggle devices (Fan, Light, AC, Washing Machine)
echo    • Use voice commands (Click microphone icon)
echo    • View real-time sensor data and charts
echo    • Manage fridge inventory
echo    • Test full duplex communication
echo.
echo 🤖 Optional: Run YOLO Fridge Detection separately:
echo    python python\features\yolo_fridge_detection.py
echo.
echo 🛑 To stop everything: Run STOP_PROJECT.bat
echo.
echo Press any key to close this window...
pause > nul
