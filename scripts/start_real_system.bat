@echo off
title Real ESP8266 Smart Home System
color 0A

echo.
echo █████████████████████████████████████████████████████████████████████████████████
echo ██                                                                        ██
echo ██                    🏠 REAL ESP8266 SMART HOME SYSTEM 🏠               ██
echo ██                                                                        ██
echo █████████████████████████████████████████████████████████████████████████████████
echo.

echo 🔧 Starting Real ESP8266 Integration System...
echo ================================================
echo.

echo 📡 Starting Backend Server...
start "Backend Server" cmd /k "title Backend Server && color 0D && echo 🚀 Backend Server && echo ================== && cd backend && node server.js"
timeout /t 3 /nobreak > nul

echo 📷 Starting Face Recognition System...
start "Face Recognition" cmd /k "title Face Recognition System && color 0E && echo 🚀 Face Recognition System && echo ========================== && python real_esp8266_integration.py"
timeout /t 2 /nobreak > nul

echo.
echo ✅ Real ESP8266 System started successfully!
echo.
echo 📊 System Components:
echo =====================
echo 🔧 ESP8266 Hardware    - Your real ESP8266 sending sensor data
echo 🖥️ Backend Server      - Processing MQTT and serving API
echo 📷 Face Recognition    - Real face recognition with your ESP8266
echo.
echo 🌐 Access your dashboard at: http://localhost:3001
echo.
echo 📋 Your ESP8266 should be:
echo • Connected to WiFi: OPPO F19
echo • Publishing to: esp/sensors
echo • Sending sensor data every 2 seconds
echo.
echo 🎯 Test your system:
echo 1. Open http://localhost:3001 in your browser
echo 2. Watch real sensor data from your ESP8266
echo 3. Trigger face recognition with PIR/IR sensors
echo 4. Control devices via the dashboard
echo.
echo Press any key to open the dashboard...
pause > nul

echo 🌐 Opening Smart Home Dashboard...
start http://localhost:3001

echo.
echo 🎉 Real ESP8266 Smart Home System is now running!
echo.
echo Press any key to exit this startup script...
pause > nul

