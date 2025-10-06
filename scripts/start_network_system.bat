@echo off
echo ========================================
echo Smart Home Network System Startup
echo ========================================
echo.

REM Check if network configuration exists
if not exist "network_config.json" (
    echo ❌ Network configuration not found!
    echo Please run: python network_config.py
    pause
    exit /b 1
)

echo 🌐 Starting Smart Home Network System...
echo.

REM Start backend server
echo 🚀 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start ESP32 command receiver (simulated on this machine)
echo 📡 Starting ESP32 Command Receiver...
start "ESP32 Command Receiver" cmd /k "python esp32_command_receiver.py"

REM Start ESP32 sensor simulator (simulated on this machine)
echo 📊 Starting ESP32 Sensor Simulator...
start "ESP32 Sensor Simulator" cmd /k "python continuous_esp32_simulator.py"

REM Start face detection system
echo 📷 Starting Face Detection System...
start "Face Detection" cmd /k "python face_recognition_entry.py"

REM Start frontend
echo 🌐 Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

REM Wait for services to start
echo.
echo ⏳ Waiting for services to start...
timeout /t 5 /nobreak > nul

echo.
echo ✅ Smart Home Network System Started!
echo.
echo 📋 System Status:
echo   - Backend Server: http://localhost:3000
echo   - Frontend Dashboard: http://localhost:3001
echo   - ESP32 Command Receiver: Running
echo   - ESP32 Sensor Simulator: Running
echo   - Face Detection: Running
echo.
echo 🌐 Network Configuration:
echo   - Development Machine: This PC
echo   - Hardware Machine: Check network_config.json
echo   - MQTT Broker: broker-cn.emqx.io
echo.
echo 📝 To stop the system, run: stop_smart_home.bat
echo.
pause
