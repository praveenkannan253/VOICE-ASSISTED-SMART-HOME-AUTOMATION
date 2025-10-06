# 🧪 Smart Home System - Testing Checklist

**Date:** 2025-10-05  
**Status:** Testing after project reorganization

---

## 🚀 System Startup

### ✅ Services Running
Check that all these windows are open:

- [ ] **ESP32 Command Receiver** (Blue window)
- [ ] **ESP32 Sensor Simulator** (Red window)
- [ ] **Backend Server** (Purple window)
- [ ] **Face Detection System** (Yellow window)

### ✅ Backend Server Logs
In the **Backend Server** window, you should see:
```
✅ Connected to MQTT
🔗 MQTT URL: mqtt://broker-cn.emqx.io:1883
📡 Subscribed to esp/# and fridge/inventory
🚀 Backend running on http://localhost:3000
```

### ✅ ESP32 Simulator Logs
In the **ESP32 Sensor Simulator** window, you should see:
```
📡 Publishing sensor data every 2 seconds...
📤 Published to esp/sensors: {"temp": 25.8, "hum": 57.2, ...}
```

### ✅ Command Receiver Logs
In the **ESP32 Command Receiver** window, you should see:
```
🔧 ESP32 Command Receiver Started
📡 Subscribed to: home/control/#
⏳ Waiting for commands...
```

---

## 🌐 Frontend Dashboard

### Step 1: Start Frontend
Open a new terminal and run:
```bash
cd frontend
npm start
```

Wait for browser to open at: **http://localhost:3001**

### Step 2: Check Dashboard UI
- [ ] Dashboard loads without errors
- [ ] No console errors in browser DevTools (F12)
- [ ] Socket.IO connection shows: `✅ Socket connected to backend`

---

## 📊 Feature Testing

### 1. ✅ Real-time Sensor Data Display

**Test:** Check if live sensor data is displayed

- [ ] **Temperature** value is showing (e.g., 25.8°C)
- [ ] **Humidity** value is showing (e.g., 57.2%)
- [ ] **LDR** (Light) value is showing (0-1023)
- [ ] **PIR** (Motion) value is showing (0 or 1)
- [ ] **IR** (Infrared) value is showing (0 or 1)
- [ ] Values update every 2 seconds

**Expected Result:** ✅ Sensor values update in real-time  
**Status:** ⬜ Pass / ⬜ Fail

---

### 2. ✅ Real-time Charts

**Test:** Check if temperature and humidity charts are working

- [ ] **Temperature Chart** is visible
- [ ] **Humidity Chart** is visible
- [ ] Charts update with new data points
- [ ] X-axis shows time
- [ ] Y-axis shows values

**Expected Result:** ✅ Charts display and update smoothly  
**Status:** ⬜ Pass / ⬜ Fail

---

### 3. ✅ Device Control (MQTT Communication)

**Test:** Toggle devices and verify MQTT communication

#### Fan Control
1. Click **Fan** toggle switch
2. Check **ESP32 Command Receiver** window for:
   ```
   📥 Received command: home/control/fan -> on
   📤 Publishing device state: {"device": "fan", "state": "on"}
   ```
3. Check **Backend Server** window for:
   ```
   📡 Raw MQTT: home/sensors/fan {"state": "on"}
   ```

- [ ] Fan toggle works
- [ ] Command received by ESP32
- [ ] State published back to backend
- [ ] UI updates to show "ON" state

#### Light Control
1. Click **Light** toggle switch
2. Verify same flow as Fan

- [ ] Light toggle works
- [ ] MQTT communication successful

#### AC Control
1. Click **AC** toggle switch
2. Verify same flow

- [ ] AC toggle works
- [ ] MQTT communication successful

#### Washing Machine Control
1. Click **Washing Machine** toggle switch
2. Verify same flow

- [ ] Washing Machine toggle works
- [ ] MQTT communication successful

**Expected Result:** ✅ All devices respond to commands  
**Status:** ⬜ Pass / ⬜ Fail

---

### 4. ✅ Voice Assistant

**Test:** Voice commands for device control

1. Click **🎤 Voice Assistant** button
2. Allow microphone access
3. Say: **"Turn on the fan"**
4. Check if fan toggles on

**Voice Commands to Test:**
- [ ] "Turn on the fan"
- [ ] "Turn off the fan"
- [ ] "Turn on the light"
- [ ] "What's the temperature?"
- [ ] "Turn on the AC"

**Expected Result:** ✅ Voice commands control devices  
**Status:** ⬜ Pass / ⬜ Fail

---

### 5. ✅ Face Detection System

**Test:** Manual face detection trigger

1. Click **📷 Trigger Camera** button in Face Detection section
2. Check **Face Detection System** window for:
   ```
   📸 Camera triggered: manual_trigger
   📤 Publishing result to esp/cam
   ```
3. Check if result appears in dashboard

**Configuration Test:**
1. Click **⚙️ Configure** button
2. Adjust settings (timeout, sensitivity, mode)
3. Click **Save Configuration**
4. Verify settings are sent via MQTT

- [ ] Manual trigger works
- [ ] Face detection processes
- [ ] Results published to MQTT
- [ ] Configuration updates work

**Expected Result:** ✅ Face detection responds to triggers  
**Status:** ⬜ Pass / ⬜ Fail

**Note:** If camera is not available, it will show an error but MQTT communication should still work.

---

### 6. ✅ Fridge Inventory

**Test:** Fridge inventory management

1. Check if fridge inventory section is visible
2. Try adding/removing items
3. Verify real-time updates

**API Test:**
```bash
# Get inventory
curl http://localhost:3000/api/fridge/inventory

# Update item
curl -X POST http://localhost:3000/api/fridge/update \
  -H "Content-Type: application/json" \
  -d '{"item":"milk","quantity":2,"action":"add"}'
```

- [ ] Inventory displays
- [ ] Add/remove buttons work
- [ ] Real-time updates via Socket.IO
- [ ] API endpoints respond

**Expected Result:** ✅ Fridge inventory updates in real-time  
**Status:** ⬜ Pass / ⬜ Fail

---

### 7. ✅ History Panel

**Test:** Historical data visualization

1. Click on **History** or **Charts** tab
2. Select a sensor (temperature/humidity)
3. Select time period (1h, 6h, 24h, etc.)
4. Check if historical chart loads

**API Test:**
```bash
curl "http://localhost:3000/api/sensors/history?topic=esp/sensors&period=24h"
```

- [ ] History panel loads
- [ ] Time period selector works
- [ ] Historical data displays
- [ ] API returns data

**Expected Result:** ✅ Historical charts display past data  
**Status:** ⬜ Pass / ⬜ Fail

---

### 8. ✅ Database Storage

**Test:** Verify data is being saved to MySQL

1. Open MySQL client or phpMyAdmin
2. Check `smarthome` database
3. Query sensors table:
   ```sql
   SELECT * FROM sensors ORDER BY recorded_at DESC LIMIT 10;
   ```

- [ ] Database exists
- [ ] Sensors table has data
- [ ] New data is being inserted
- [ ] JSON values are stored correctly

**Expected Result:** ✅ Sensor data is persisted in database  
**Status:** ⬜ Pass / ⬜ Fail

---

## 🐛 Known Issues & Fixes

### Issue 1: JSON Parse Errors
**Symptom:** Backend shows `⚠️ JSON parse error`  
**Cause:** ESP32 debug messages (starting with `[D]`, `[I]`, etc.)  
**Fix:** ✅ Already fixed - Debug messages are now filtered out  
**Status:** ✅ Resolved

### Issue 2: MQTT Connection Failed
**Symptom:** Backend shows `❌ MQTT Error`  
**Cause:** Internet connection or broker unavailable  
**Fix:** 
- Check internet connection
- Try alternative broker in `backend/.env`:
  ```
  MQTT_URL=mqtt://test.mosquitto.org:1883
  ```

### Issue 3: Database Connection Error
**Symptom:** Backend shows `⚠️ DB insert error`  
**Cause:** MySQL not running or wrong credentials  
**Fix:**
- Start MySQL service
- Verify credentials in `backend/.env`
- Run `backend/schema.sql` to create tables

### Issue 4: Frontend Not Loading
**Symptom:** Browser shows blank page  
**Cause:** Backend not running or wrong port  
**Fix:**
- Ensure backend is running on port 3000
- Check `frontend/package.json` proxy setting
- Clear browser cache

### Issue 5: Face Detection Not Working
**Symptom:** Camera trigger fails  
**Cause:** Missing dependencies or no camera  
**Fix:**
- Run: `pip install opencv-python face_recognition`
- If no camera, system will still send MQTT messages (test mode)

---

## 📝 Test Results Summary

### ✅ Working Features
- [ ] Backend Server (MQTT + API)
- [ ] ESP32 Simulator (Sensor data)
- [ ] Command Receiver (Device control)
- [ ] Frontend Dashboard (UI)
- [ ] Real-time Sensor Display
- [ ] Real-time Charts
- [ ] Device Control (Fan, Light, AC, Washing Machine)
- [ ] Voice Assistant
- [ ] Face Detection
- [ ] Fridge Inventory
- [ ] History Panel
- [ ] Database Storage

### ❌ Issues Found
List any issues discovered during testing:

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### 🔧 Next Steps
Based on test results, what needs to be done:

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## 📊 Performance Metrics

- **Backend Response Time:** ___________ ms
- **MQTT Message Latency:** ___________ ms
- **Frontend Load Time:** ___________ seconds
- **Database Query Time:** ___________ ms
- **Socket.IO Connection Time:** ___________ ms

---

## ✅ Sign-off

**Tested By:** _______________  
**Date:** _______________  
**Overall Status:** ⬜ Pass / ⬜ Fail / ⬜ Partial  

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**🎉 Happy Testing!**
