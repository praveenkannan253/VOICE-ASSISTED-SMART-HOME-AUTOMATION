# Smart Home Full Duplex Communication System Startup Script
# PowerShell Version

Write-Host ""
Write-Host "████████████████████████████████████████████████████████████████████████████████" -ForegroundColor Green
Write-Host "██                                                                        ██" -ForegroundColor Green
Write-Host "██                    🏠 SMART HOME SYSTEM STARTUP 🏠                     ██" -ForegroundColor Green
Write-Host "██                                                                        ██" -ForegroundColor Green
Write-Host "████████████████████████████████████████████████████████████████████████████████" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Initializing Full Duplex Communication System..." -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "📡 Starting MQTT Components..." -ForegroundColor Cyan
Write-Host ""

# Function to start a process in a new window
function Start-ProcessInWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$Color = "White"
    )
    
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "cmd.exe"
    $processInfo.Arguments = "/k `"title $Title && color $Color && $Command`""
    $processInfo.UseShellExecute = $true
    $processInfo.CreateNoWindow = $false
    
    [System.Diagnostics.Process]::Start($processInfo)
}

Write-Host "🔧 [1/4] Starting ESP32 Command Receiver..." -ForegroundColor Green
Start-ProcessInWindow -Title "ESP32 Command Receiver" -Command "echo 🚀 ESP32 Command Receiver && echo ======================== && cd .. && python python\core\esp32_command_receiver.py" -Color "0B"
Start-Sleep -Seconds 2

Write-Host "📊 [2/4] Starting ESP32 Sensor Data Simulator..." -ForegroundColor Green
Start-ProcessInWindow -Title "ESP32 Sensor Simulator" -Command "echo 🚀 ESP32 Sensor Data Simulator && echo ================================ && cd .. && python python\core\continuous_esp32_simulator.py" -Color "0C"
Start-Sleep -Seconds 2

Write-Host "🖥️ [3/4] Starting Backend Server..." -ForegroundColor Green
Start-ProcessInWindow -Title "Backend Server" -Command "echo 🚀 Backend Server && echo ================== && cd ..\backend && node server.js" -Color "0D"
Start-Sleep -Seconds 3

Write-Host "📷 [4/5] Starting Face Detection System..." -ForegroundColor Green
Start-ProcessInWindow -Title "Face Detection System" -Command "echo 🚀 Face Detection System && echo ========================== && cd .. && python python\core\face_recognition_simple.py" -Color "0E"
Start-Sleep -Seconds 2

Write-Host "🤖 [5/5] Starting YOLO Fridge Detection..." -ForegroundColor Green
Start-ProcessInWindow -Title "YOLO Fridge Detection" -Command "echo 🚀 YOLO Fridge Detection (AI) && echo ============================== && cd .. && python python\features\yolo_fridge_detection.py" -Color "0A"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ All components started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 System Components Status:" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Write-Host "🔧 ESP32 Command Receiver    - Listening for frontend commands" -ForegroundColor White
Write-Host "📊 ESP32 Sensor Simulator    - Sending continuous sensor data" -ForegroundColor White
Write-Host "🖥️ Backend Server            - Processing MQTT and serving API" -ForegroundColor White
Write-Host "📷 Face Detection System     - Handling face recognition" -ForegroundColor White
Write-Host "🤖 YOLO Fridge Detection     - AI-powered item detection (80+ items)" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access your dashboard at: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Available Commands:" -ForegroundColor Yellow
Write-Host "• Frontend Dashboard: Toggle devices (fan, light, ac, washing-machine)" -ForegroundColor White
Write-Host "• Face Detection Control: Trigger camera, configure settings" -ForegroundColor White
Write-Host "• YOLO Fridge Detection: Press 's' to scan items (AI detection)" -ForegroundColor White
Write-Host "• Real-time Charts: Temperature and humidity monitoring" -ForegroundColor White
Write-Host ""

Write-Host "🧪 Testing communication..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
python ..\tests\test_commands_simple.py

Write-Host ""
Write-Host "✅ Full Duplex Communication System Ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Communication Flow:" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
Write-Host "Frontend Dashboard → Backend Server → ESP32 Devices" -ForegroundColor White
Write-Host "ESP32 Sensors → Backend Server → Frontend Dashboard" -ForegroundColor White
Write-Host "Frontend Controls → Face Detection System" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Test your system:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3001 in your browser" -ForegroundColor White
Write-Host "2. Toggle device switches (fan, light, ac, washing-machine)" -ForegroundColor White
Write-Host "3. Use face detection controls" -ForegroundColor White
Write-Host "4. Show items to YOLO camera and press 's' to detect" -ForegroundColor White
Write-Host "5. Watch real-time sensor data and charts" -ForegroundColor White
Write-Host ""

$response = Read-Host "Press Enter to open the dashboard (or 'q' to quit)"
if ($response -ne 'q') {
    Write-Host "🌐 Opening Smart Home Dashboard..." -ForegroundColor Cyan
    Start-Process "http://localhost:3001"
}

Write-Host ""
Write-Host "🎉 Smart Home System is now running!" -ForegroundColor Green
Write-Host ""
Write-Host "Press Enter to exit this startup script..."
Read-Host
