# 🚀 Smart Home System - Startup Guide

## What Happens When You Run START_PROJECT.bat

### 📺 6 Windows Will Open

```
┌─────────────────────────────────────────────────────────────┐
│  Window 1: Backend Server (Port 3000)                       │
│  ✅ API Server running                                       │
│  ✅ MQTT Client connected                                    │
│  ✅ MySQL Database connected                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Window 2: ESP32 Command Receiver                           │
│  ✅ Listening for device commands                            │
│  ✅ MQTT connected                                           │
│  ✅ Ready to control devices                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Window 3: ESP32 Sensor Simulator                           │
│  ✅ Sending sensor data every 2-5 seconds                    │
│  ✅ Temperature, Humidity, Light, Motion                     │
│  ✅ MQTT connected                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Window 4: Face Detection System                            │
│  ✅ Camera ready                                             │
│  ✅ Waiting for trigger commands                             │
│  ✅ Face recognition active                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Window 5: YOLO Fridge Detection (AI) 🤖 NEW!              │
│  ✅ Camera window with live feed                             │
│  ✅ YOLO AI model loaded                                     │
│  ✅ Press 's' to scan items                                  │
│  ✅ Press 'q' to quit                                        │
│  ✅ Detects 80+ food items                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Window 6: Frontend Dashboard (Browser)                     │
│  🌐 http://localhost:3001                                    │
│  ✅ Device controls                                          │
│  ✅ Live sensor data                                         │
│  ✅ Historical charts                                        │
│  ✅ Voice assistant                                          │
│  ✅ Face detection controls                                  │
│  ✅ Fridge inventory                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## ⏱️ Startup Timeline

```
0s   ▶ START_PROJECT.bat executed
     └─ Checking system...

3s   ▶ Backend Server starting...
     └─ Port 3000 active

6s   ▶ ESP32 Command Receiver starting...
     └─ MQTT connected

8s   ▶ ESP32 Sensor Simulator starting...
     └─ Sending data...

10s  ▶ Face Detection System starting...
     └─ Camera initialized

12s  ▶ YOLO Fridge Detection starting... 🤖
     └─ Loading AI model...
     └─ Camera window opens

15s  ▶ Frontend Dashboard starting...
     └─ React app compiling...

45s  ▶ Browser opens automatically
     └─ http://localhost:3001

✅ SYSTEM READY! (Total: ~45-60 seconds)
```

---

## 🎯 What You'll See

### 1. Command Prompt Windows (5 windows)
Each window shows:
- Service name and status
- Real-time logs
- Connection status
- Data flow

**Don't close these windows!** They need to stay open.

### 2. YOLO Camera Window
Shows:
- Live camera feed
- Detection overlay
- Detected items list
- Instructions

**Interact with this window:**
- Press **'s'** to scan items
- Press **'q'** to quit

### 3. Browser Dashboard
Shows:
- All device controls
- Live sensor gauges
- Historical charts
- Voice assistant button
- Face detection controls
- Fridge inventory

**This is your main interface!**

---

## 🎮 First Steps After Startup

### Step 1: Wait for Everything to Load
- All 6 windows should be open
- Browser should show dashboard
- No error messages

### Step 2: Test Device Control
1. Click any device toggle (Fan, Light, AC, Washing Machine)
2. Watch the ESP32 Command Receiver window
3. You'll see the command being sent
4. Device status updates in real-time

### Step 3: Test YOLO Fridge Detection 🤖
1. Find the YOLO camera window
2. Show a food item to camera (banana, apple, bottle, etc.)
3. Press **'s'** key to scan
4. Watch the detection happen:
   - Bounding box appears around item
   - Item name and confidence score shown
   - Inventory updates automatically
5. Check dashboard - inventory updated!

### Step 4: Test Voice Commands
1. Click microphone icon on dashboard
2. Say "Turn on the fan"
3. Watch device respond

### Step 5: View Historical Data
1. Click "History" panel
2. Select time period (1h, 6h, 24h, etc.)
3. View temperature/humidity charts

### Step 6: Test Face Detection
1. Click "Trigger Camera" on dashboard
2. Look at camera
3. System processes and identifies you

---

## 🧊 YOLO Fridge Detection - Detailed Usage

### What You'll See:
```
┌─────────────────────────────────────────────────┐
│  🧊 YOLO Fridge Detection                       │
│  Time: 11:39:51                                 │
│  Detected Items:                                │
│  Banana: 1                                      │
│  Apple: 2                                       │
│                                                 │
│  [Live camera feed with bounding boxes]         │
│                                                 │
│  Press 'q' to quit | Press 's' to scan          │
└─────────────────────────────────────────────────┘
```

### How to Use:
1. **Position item** in front of camera
2. **Press 's'** to trigger detection
3. **Wait 1-2 seconds** for AI processing
4. **See results**:
   - Green bounding box around item
   - Item name with confidence score
   - Console shows: "Detected: {'banana': 1}"
   - Backend updated: "Milk: 1 → 2"
5. **Check dashboard** - inventory updated!
6. **Repeat** for more items
7. **Press 'q'** when done

### Tips for Best Results:
- ✅ Good lighting
- ✅ Hold item steady
- ✅ Show item clearly to camera
- ✅ One item at a time for accuracy
- ✅ Wait for detection to complete

### What Can Be Detected:
- 🍌 Banana
- 🍎 Apple
- 🍊 Orange
- 🥕 Carrot
- 🥦 Broccoli
- 🍼 Bottle (milk, water)
- ☕ Cup
- 🥣 Bowl
- 🍕 Pizza
- 🌭 Hot dog
- 🥪 Sandwich
- 🍩 Donut
- 🍰 Cake
- 🍴 Fork, Knife, Spoon
- **And 60+ more items!**

---

## 🔧 Troubleshooting

### ❌ YOLO Window Shows Error
**Problem:** "Module 'ultralytics' not found"
**Solution:**
```bash
pip install ultralytics
```

### ❌ Camera Not Working
**Problem:** "Could not open camera"
**Solution:**
- Check if camera is connected
- Close other apps using camera
- Try changing camera index in code

### ❌ Backend Not Starting
**Problem:** Port 3000 already in use
**Solution:**
```bash
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### ❌ Frontend Not Loading
**Problem:** Dashboard shows blank page
**Solution:**
- Wait 60 seconds for compilation
- Check if backend is running
- Refresh browser (Ctrl+F5)

### ❌ MQTT Connection Failed
**Problem:** "Failed to connect to MQTT broker"
**Solution:**
- Check internet connection
- Verify broker URL in code
- Try again after a few seconds

---

## 🛑 How to Stop Everything

### Option 1: Run Stop Script
```bash
STOP_PROJECT.bat
```

### Option 2: Manual Stop
1. Close YOLO camera window (press 'q')
2. Close all command prompt windows
3. Close browser tab

### Option 3: Task Manager
- Press Ctrl+Shift+Esc
- End tasks: node.exe, python.exe

---

## 📊 System Status Indicators

### ✅ Everything Working:
- All 6 windows open
- No red error messages
- Dashboard loads successfully
- YOLO camera shows live feed
- Devices respond to commands

### ⚠️ Partial Working:
- Some windows show warnings
- Dashboard loads but features missing
- YOLO works but low accuracy

### ❌ Not Working:
- Windows close immediately
- Red error messages
- Dashboard doesn't load
- YOLO camera doesn't open

---

## 🎉 Success Checklist

After startup, verify:

- [ ] Backend Server window shows "Server running on port 3000"
- [ ] ESP32 Command Receiver shows "Connected to MQTT"
- [ ] ESP32 Simulator shows sensor data being sent
- [ ] Face Detection shows "Camera initialized"
- [ ] **YOLO window shows live camera feed** 🤖
- [ ] Browser opens at http://localhost:3001
- [ ] Dashboard shows all panels
- [ ] Device toggles work
- [ ] **YOLO detection works (press 's')** 🤖
- [ ] Inventory updates on dashboard

**If all checked: System is fully operational! 🎊**

---

## 📚 Additional Resources

- **Complete Features:** `FEATURES_OVERVIEW.md`
- **Fridge Detection Guide:** `FRIDGE_DETECTION_QUICK_START.md`
- **Detection Methods:** `docs/FRIDGE_DETECTION_METHODS.md`
- **Main README:** `README.md`

---

## 🚀 Ready to Start?

```bash
# Just run this:
START_PROJECT.bat

# Then follow the steps above!
```

**Enjoy your Smart Home System with AI-Powered Fridge Detection! 🎉**
