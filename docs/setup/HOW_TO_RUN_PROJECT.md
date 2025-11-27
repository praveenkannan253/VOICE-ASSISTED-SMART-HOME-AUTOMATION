# 🎓 How to Run & Stop the Smart Home Project

## 📋 Table of Contents
1. [Quick Start (Single Click)](#quick-start)
2. [What Gets Started](#what-gets-started)
3. [How to Stop](#how-to-stop)
4. [Troubleshooting](#troubleshooting)
5. [Demo Checklist for Teachers](#demo-checklist)

---

## 🚀 Quick Start (Single Click)

### **Method 1: Double-Click to Start** ⭐ RECOMMENDED
1. Go to: `D:\Documents\SMARTHOME\`
2. **Double-click**: `START_PROJECT.bat`
3. Wait 30-60 seconds
4. Browser opens automatically at http://localhost:3001
5. **Done!** ✅

### **Method 2: Right-Click to Start**
1. Right-click `START_PROJECT.bat`
2. Click "Run as administrator" (if needed)
3. Follow on-screen prompts

---

## 🖥️ What Gets Started

When you run `START_PROJECT.bat`, these windows open:

### 1. **Backend Server** (Purple window)
- Shows clean, professional output
- Displays sensor data updates
- Port: 3000

### 2. **ESP32 Simulator** (Red window)
- Sends fake sensor data every 2 seconds
- Simulates temperature, humidity, etc.

### 3. **Command Receiver** (Blue window)
- Listens for device commands
- Processes voice commands

### 4. **Frontend Dashboard** (Browser)
- Opens automatically at http://localhost:3001
- Main user interface

### 5. **Fridge Detection** (Optional)
- Only starts if you press 'y'
- Opens camera window

---

## 🛑 How to Stop Everything

### **Method 1: Double-Click to Stop** ⭐ EASIEST
1. Go to: `D:\Documents\SMARTHOME\`
2. **Double-click**: `STOP_PROJECT.bat`
3. All windows close automatically
4. **Done!** ✅

### **Method 2: Manual Stop**
1. Close each terminal window (click X)
2. Close browser tab

### **Method 3: Task Manager**
1. Press `Ctrl + Shift + Esc`
2. Find `node.exe` and `python.exe`
3. Right-click → End Task

---

## 📝 Step-by-Step Guide for Teachers

### **Before the Demo:**

#### 1. Check Prerequisites (One-time setup)
```bash
# Check Node.js is installed
node --version

# Check Python is installed
python --version

# Check npm packages are installed
cd backend
npm install

cd ../frontend
npm install

# Check Python packages
pip install opencv-python numpy requests paho-mqtt
```

#### 2. Ensure MySQL is Running
- Open MySQL Workbench or Services
- Start MySQL service if stopped
- Database: `smarthome` should exist

---

### **During the Demo:**

#### **Step 1: Start the System** (30 seconds before demo)
```
1. Double-click START_PROJECT.bat
2. Wait for "READY TO DEMO!" message
3. Browser opens automatically
4. All 4 windows are running
```

#### **Step 2: Show Features** (5-10 minutes)

**Feature 1: Real-time Sensor Data**
- Point to temperature, humidity values
- Show they update every 2 seconds
- Explain: "Live data from ESP32 via MQTT"

**Feature 2: Device Control**
- Toggle Fan switch
- Show backend terminal receives command
- Explain: "Dashboard → Backend → MQTT → Hardware"

**Feature 3: Voice Commands**
- Click microphone icon
- Say: "Turn on the light"
- Show it toggles the light
- Explain: "Voice → Dashboard → MQTT → Hardware"

**Feature 4: Real-time Charts**
- Point to temperature/humidity graphs
- Show they update live
- Explain: "Historical data visualization"

**Feature 5: Fridge Monitoring** (Optional)
- If camera is running, show banana
- Press 's' to scan
- Dashboard updates automatically
- Explain: "Camera → AI Detection → Dashboard"

#### **Step 3: Explain Architecture**
```
Voice/UI → Frontend (React) → Backend (Node.js) → MQTT → Hardware (ESP32)
                                     ↓
                                 Database (MySQL)
```

#### **Step 4: Stop the System** (After demo)
```
1. Double-click STOP_PROJECT.bat
2. All windows close
3. Done!
```

---

## 🐛 Troubleshooting

### **Problem 1: "Port 3000 already in use"**
**Solution:**
```bash
# Stop everything first
STOP_PROJECT.bat

# Wait 5 seconds, then start again
START_PROJECT.bat
```

### **Problem 2: "Frontend not loading"**
**Solution:**
- Wait 60 seconds (React needs time to compile)
- Manually open: http://localhost:3001
- Check backend is running (should see purple window)

### **Problem 3: "No sensor data showing"**
**Solution:**
- Check ESP32 Simulator window is open
- Should see "Publishing sensor data..."
- If not, restart: `STOP_PROJECT.bat` then `START_PROJECT.bat`

### **Problem 4: "Camera not opening"**
**Solution:**
- Close other apps using camera (Zoom, Teams, etc.)
- Try different camera: Edit `realtime_fridge_detection.py`, change `CAMERA_INDEX = 1`

### **Problem 5: "MySQL connection error"**
**Solution:**
- Start MySQL service
- Check credentials in `backend/.env`
- Run `backend/schema.sql` to create tables

---

## ✅ Pre-Demo Checklist

**Night Before:**
- [ ] Test full system: `START_PROJECT.bat`
- [ ] Verify all features work
- [ ] Prepare demo script
- [ ] Charge laptop fully

**30 Minutes Before:**
- [ ] Close unnecessary apps
- [ ] Connect to stable WiFi
- [ ] Test camera (if using fridge detection)
- [ ] Open project folder: `D:\Documents\SMARTHOME\`

**5 Minutes Before:**
- [ ] Double-click `START_PROJECT.bat`
- [ ] Wait for browser to open
- [ ] Verify dashboard loads
- [ ] Test one device toggle

**During Demo:**
- [ ] Show real-time sensor data
- [ ] Toggle devices (Fan, Light, AC)
- [ ] Use voice command
- [ ] Show charts updating
- [ ] (Optional) Show fridge detection
- [ ] Explain architecture

**After Demo:**
- [ ] Double-click `STOP_PROJECT.bat`
- [ ] Close browser
- [ ] Thank teachers 😊

---

## 🎯 Demo Script (5 Minutes)

### **Minute 1: Introduction**
> "This is a Smart Home IoT system with full duplex communication. 
> It connects sensors, devices, and a dashboard in real-time using MQTT protocol."

### **Minute 2: Show Real-time Data**
> "Here you can see live sensor data - temperature, humidity, light level, and motion detection. 
> This updates every 2 seconds from our ESP32 simulator."

### **Minute 3: Device Control**
> "I can control devices from the dashboard. Watch the backend terminal when I toggle this fan."
> [Toggle fan]
> "The command goes: Dashboard → Backend → MQTT → Hardware. This is full duplex communication."

### **Minute 4: Voice Control**
> "We also have voice control. Let me say 'Turn on the light'."
> [Click mic, say command]
> "The system recognizes the command and sends it to the device."

### **Minute 5: Advanced Features**
> "We have real-time charts, fridge monitoring with camera detection, and automatic alerts.
> The system uses React for frontend, Node.js for backend, MQTT for communication, 
> and MySQL for data storage. Everything updates in real-time via WebSockets."

---

## 📞 Quick Reference

### **Start System:**
```
Double-click: START_PROJECT.bat
```

### **Stop System:**
```
Double-click: STOP_PROJECT.bat
```

### **Access Dashboard:**
```
http://localhost:3001
```

### **Check Backend:**
```
http://localhost:3000
```

### **Emergency Stop:**
```
Ctrl + Shift + Esc → End Task: node.exe, python.exe
```

---

## 🎓 Key Points to Remember

1. **Always start 30 seconds before demo** - Frontend needs time to load
2. **Use STOP_PROJECT.bat** - Don't just close windows
3. **Backend window shows clean output** - Perfect for showing teachers
4. **Voice commands work best in quiet room** - Minimize background noise
5. **Have backup plan** - If camera fails, skip fridge detection

---

## 🌟 Confidence Boosters

✅ **You've got this!** The system is fully automated
✅ **Single click to start** - No complex commands
✅ **Single click to stop** - Clean shutdown
✅ **Professional output** - Backend looks impressive
✅ **Real-time updates** - Everything works smoothly

---

## 📚 Additional Resources

- **Full Documentation**: `README.md`
- **Testing Guide**: `TESTING_CHECKLIST.md`
- **Fridge Setup**: `FRIDGE_DETECTION_SETUP.md`
- **Full Duplex Test**: `FULL_DUPLEX_TEST.md`

---

**🎉 You're ready to impress your teachers!**

Good luck with your presentation! 🍀
