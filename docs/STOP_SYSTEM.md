# 🛑 How to Stop the Smart Home System

## 🚀 Quick Stop Methods

### Method 1: Automated Stop Script (Recommended)
```bash
# Run the stop script:
stop_smart_home.bat
```

### Method 2: Manual Stop Commands
```bash
# Stop all Python processes (ESP32 simulators):
taskkill /f /im python.exe

# Stop all Node.js processes (Backend server):
taskkill /f /im node.exe
```

### Method 3: Individual Component Stop
```bash
# Stop specific processes by PID:
taskkill /f /pid [PID_NUMBER]

# Find running processes:
tasklist | findstr python
tasklist | findstr node
```

## 🔍 What Gets Stopped

### ✅ Python Processes:
- **ESP32 Command Receiver** - Stops listening for frontend commands
- **ESP32 Sensor Simulator** - Stops sending continuous sensor data
- **Face Detection System** - Stops face recognition processing
- **Test Scripts** - Stops any running test processes

### ✅ Node.js Processes:
- **Backend Server** - Stops API server and MQTT processing
- **Frontend Development Server** - Stops React development server

### ✅ Terminal Windows:
- **ESP32 Command Receiver Window**
- **ESP32 Sensor Simulator Window**
- **Backend Server Window**
- **Face Detection System Window**

## 🧹 Clean Shutdown Process

1. **Stop Python processes** - ESP32 simulators and face detection
2. **Stop Node.js processes** - Backend server
3. **Close terminal windows** - All related command windows
4. **Verify shutdown** - Check that no processes are running

## 🔄 Restart the System

After stopping, you can restart with:
```bash
# Quick restart:
start_system.bat

# Or advanced restart:
start_smart_home.bat
```

## ⚠️ Troubleshooting

### If processes don't stop:
```bash
# Force kill all Python processes:
taskkill /f /im python.exe

# Force kill all Node.js processes:
taskkill /f /im node.exe

# Check what's still running:
tasklist | findstr python
tasklist | findstr node
```

### If terminal windows don't close:
- Press `Ctrl+C` in each terminal window
- Close terminal windows manually
- Use Task Manager to end processes

## ✅ Verification

After stopping, you should see:
- No Python processes running
- No Node.js processes running
- All terminal windows closed
- Dashboard no longer accessible at http://localhost:3001

Your Smart Home system is now completely stopped! 🛑

