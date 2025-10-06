@echo off
echo ========================================
echo Smart Home Dashboard (No Database)
echo ========================================
echo.
echo 🌐 Hardware: Separate PC (Friend's laptop)
echo 📊 Data Source: Enhanced realistic simulation
echo 🔧 Features: Day/night patterns, realistic trends
echo.

echo 🚀 Starting Dashboard System (No Database)...
echo.

REM Start backend server
echo 🚀 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

REM Wait for backend to start
timeout /t 5 /nobreak > nul

REM Start enhanced sensor data system (no database)
echo 📊 Starting Enhanced Sensor Data System (No Database)...
start "Enhanced Sensor Data" cmd /k "python enhanced_sensor_data_no_db.py"

REM Start frontend
echo 🌐 Starting Frontend Dashboard...
start "Frontend Dashboard" cmd /k "cd frontend && npm start"

REM Wait for services to start
echo.
echo ⏳ Waiting for services to start...
timeout /t 5 /nobreak > nul

echo.
echo ✅ Dashboard System Started (No Database)!
echo.
echo 📋 System Status:
echo   - Backend Server: http://localhost:3000
echo   - Frontend Dashboard: http://localhost:3001
echo   - Enhanced Sensor Data: Running (No Database)
echo   - Data Source: Enhanced realistic simulation
echo.
echo 🌐 Hardware Communication:
echo   - Hardware Machine: Separate PC
echo   - Real-time Data: MQTT from hardware (when available)
echo   - Fallback Data: Enhanced realistic simulation
echo.
echo 📝 To stop the system, run: stop_smart_home.bat
echo.
pause
