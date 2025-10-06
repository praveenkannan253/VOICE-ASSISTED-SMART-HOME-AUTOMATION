@echo off
echo 🚀 Starting Smart Home Full Duplex Communication System
echo ============================================================

echo.
echo 📡 Starting MQTT components...

echo 🔧 Starting ESP32 Command Receiver...
start "ESP32 Receiver" cmd /k "python esp32_command_receiver.py"

echo 📊 Starting ESP32 Sensor Data Simulator...
start "ESP32 Sensors" cmd /k "python continuous_esp32_simulator.py"

echo 🖥️ Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"

echo 📷 Starting Face Detection System...
start "Face Detection" cmd /k "python face_recognition_simple.py"

echo.
echo ✅ All components started!
echo.
echo 📊 System Components:
echo • ESP32 Command Receiver - Listens for frontend commands
echo • ESP32 Sensor Simulator - Sends continuous sensor data
echo • Backend Server - Processes MQTT and serves API
echo • Face Detection System - Handles face recognition
echo.
echo 🌐 Access your dashboard at: http://localhost:3001
echo.
echo Press any key to test the system...
pause > nul

echo 🧪 Running communication test...
python test_commands_simple.py

echo.
echo ✅ Full Duplex Communication System Ready!
echo.
echo 📋 Available Commands:
echo • Frontend Dashboard: Toggle devices (fan, light, ac, washing-machine)
echo • Face Detection Control: Trigger camera, configure settings
echo • Real-time Charts: Temperature and humidity monitoring
echo.
echo Press any key to exit...
pause > nul

