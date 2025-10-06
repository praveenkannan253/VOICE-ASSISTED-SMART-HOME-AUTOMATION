@echo off
echo 🚀 Starting Smart Home System...
echo.

echo Starting ESP32 Command Receiver...
start "ESP32 Receiver" cmd /k "python esp32_command_receiver.py"

echo Starting ESP32 Sensor Simulator...
start "ESP32 Sensors" cmd /k "python continuous_esp32_simulator.py"

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && node server.js"

echo Starting Face Detection...
start "Face Detection" cmd /k "python face_recognition_simple.py"

echo.
echo ✅ All systems started!
echo 🌐 Dashboard: http://localhost:3001
echo.
pause

