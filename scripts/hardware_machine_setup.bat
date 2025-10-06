@echo off
echo ========================================
echo Hardware Machine Setup
echo ========================================
echo.
echo This script should be run on the PC with the ESP32 hardware
echo.

REM Check if network configuration exists
if not exist "network_config.json" (
    echo ❌ Network configuration not found!
    echo Please copy network_config.json from development machine
    pause
    exit /b 1
)

echo 🌐 Starting Hardware Machine Services...
echo.

REM Start ESP32 network command receiver
echo 📡 Starting ESP32 Network Command Receiver...
start "ESP32 Network Receiver" cmd /k "python esp32_network_receiver.py"

REM Start ESP32 network sensor simulator
echo 📊 Starting ESP32 Network Sensor Simulator...
start "ESP32 Network Simulator" cmd /k "python esp32_network_simulator.py"

REM Wait for services to start
echo.
echo ⏳ Waiting for services to start...
timeout /t 3 /nobreak > nul

echo.
echo ✅ Hardware Machine Services Started!
echo.
echo 📋 Hardware Machine Status:
echo   - ESP32 Network Command Receiver: Running
echo   - ESP32 Network Sensor Simulator: Running
echo.
echo 🌐 Network Configuration:
echo   - Hardware Machine: This PC
echo   - Development Machine: Check network_config.json
echo   - MQTT Broker: broker-cn.emqx.io
echo.
echo 📝 The hardware machine is now ready to receive commands
echo    from the development machine dashboard!
echo.
pause
