@echo off
echo ========================================
echo Smart Home Dashboard Only System
echo ========================================
echo.
echo 🌐 Hardware: Separate PC (Friend's laptop)
echo 📊 Data Source: Real ESP32 data from database
echo 🔧 Enhanced: Historical patterns + real-time
echo.

REM Check if database exists
if not exist "backend\db.js" (
    echo ❌ Backend database not found!
    echo Please ensure backend is set up first
    pause
    exit /b 1
)

echo 🚀 Starting Dashboard Only System...
echo.

REM Start backend server
echo 🚀 Starting Backend Server...
start "Backend Server" cmd /k "cd ..\backend && npm start"

REM Wait for backend to start
timeout /t 5 /nobreak > nul

REM Start enhanced sensor data system
echo 📊 Starting Enhanced Sensor Data System...
start "Enhanced Sensor Data" cmd /k "cd .. && python python\core\dashboard_only_system.py"

REM Start frontend
echo 🌐 Starting Frontend Dashboard...
start "Frontend Dashboard" cmd /k "cd ..\frontend && npm start"

REM Wait for services to start
echo.
echo ⏳ Waiting for services to start...
timeout /t 5 /nobreak > nul

echo.
echo ✅ Dashboard Only System Started!
echo.
echo 📋 System Status:
echo   - Backend Server: http://localhost:3000
echo   - Frontend Dashboard: http://localhost:3001
echo   - Enhanced Sensor Data: Running
echo   - Data Source: Real ESP32 data from database
echo.
echo 🌐 Hardware Communication:
echo   - Hardware Machine: Separate PC
echo   - Real-time Data: MQTT from hardware
echo   - Fallback Data: Database + historical patterns
echo.
echo 📝 To stop the system, run: stop_smart_home.bat
echo.
pause
