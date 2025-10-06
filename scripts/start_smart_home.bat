@echo off
title Smart Home Full Duplex Communication System
color 0A

echo.
echo ████████████████████████████████████████████████████████████████████████████████
echo ██                                                                        ██
echo ██                    🏠 SMART HOME SYSTEM STARTUP 🏠                     ██
echo ██                                                                        ██
echo ████████████████████████████████████████████████████████████████████████████████
echo.

echo 🔧 Initializing Full Duplex Communication System...
echo =====================================================
echo.

echo 📡 Starting MQTT Components...
echo.

echo 🔧 [1/4] Starting ESP32 Command Receiver...
start "ESP32 Command Receiver" cmd /k "title ESP32 Command Receiver && color 0B && echo 🚀 ESP32 Command Receiver && echo ======================== && cd .. && python python\core\esp32_command_receiver.py"
timeout /t 2 /nobreak > nul

echo 📊 [2/4] Starting ESP32 Sensor Data Simulator...
start "ESP32 Sensor Simulator" cmd /k "title ESP32 Sensor Simulator && color 0C && echo 🚀 ESP32 Sensor Data Simulator && echo ================================ && cd .. && python python\core\continuous_esp32_simulator.py"
timeout /t 2 /nobreak > nul

echo 🖥️ [3/4] Starting Backend Server...
start "Backend Server" cmd /k "title Backend Server && color 0D && echo 🚀 Backend Server && echo ================== && cd ..\backend && node server.js"
timeout /t 3 /nobreak > nul

echo 📷 [4/5] Starting Face Detection System...
start "Face Detection System" cmd /k "title Face Detection System && color 0E && echo 🚀 Face Detection System && echo ========================== && cd .. && python python\core\face_recognition_simple.py"
timeout /t 2 /nobreak > nul

echo 🤖 [5/5] Starting YOLO Fridge Detection...
start "YOLO Fridge Detection" cmd /k "title YOLO Fridge Detection && color 0A && echo 🚀 YOLO Fridge Detection (AI) && echo ============================== && cd .. && python python\features\yolo_fridge_detection.py"
timeout /t 2 /nobreak > nul

echo.
echo ✅ All components started successfully!
echo.
echo 📊 System Components Status:
echo ============================
echo 🔧 ESP32 Command Receiver    - Listening for frontend commands
echo 📊 ESP32 Sensor Simulator    - Sending continuous sensor data  
echo 🖥️ Backend Server            - Processing MQTT and serving API
echo 📷 Face Detection System     - Handling face recognition
echo 🤖 YOLO Fridge Detection     - AI-powered item detection (80+ items)
echo.
echo 🌐 Access your dashboard at: http://localhost:3001
echo.
echo 📋 Available Commands:
echo • Frontend Dashboard: Toggle devices (fan, light, ac, washing-machine)
echo • Face Detection Control: Trigger camera, configure settings
echo • YOLO Fridge Detection: Press 's' to scan items (AI detection)
echo • Real-time Charts: Temperature and humidity monitoring
echo.
echo 🧪 Testing communication...
timeout /t 3 /nobreak > nul
python ..\tests\test_commands_simple.py

echo.
echo ✅ Full Duplex Communication System Ready!
echo.
echo 📊 Communication Flow:
echo =====================
echo Frontend Dashboard → Backend Server → ESP32 Devices
echo ESP32 Sensors → Backend Server → Frontend Dashboard
echo Frontend Controls → Face Detection System
echo.
echo 🎯 Test your system:
echo 1. Open http://localhost:3001 in your browser
echo 2. Toggle device switches (fan, light, ac, washing-machine)
echo 3. Use face detection controls
echo 4. Show items to YOLO camera and press 's' to detect
echo 5. Watch real-time sensor data and charts
echo.
echo Press any key to open the dashboard...
pause > nul

echo 🌐 Opening Smart Home Dashboard...
start http://localhost:3001

echo.
echo 🎉 Smart Home System is now running!
echo.
echo Press any key to exit this startup script...
pause > nul
