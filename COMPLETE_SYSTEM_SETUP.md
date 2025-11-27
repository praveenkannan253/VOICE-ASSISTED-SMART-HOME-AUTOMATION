# Complete Smart Home System Setup Guide

## 🎯 Current Status

✅ **Backend:** Running and receiving sensor data  
✅ **Frontend:** Ready to connect  
✅ **Python Fridge Detection:** Working and publishing MQTT  
✅ **Database:** Connected and storing data  
✅ **MQTT Broker:** Connected and receiving messages  

---

## 🚀 Quick Start (3 Steps)

### **Step 1: Restart Backend (IMPORTANT - Load Latest Code)**

**Close the current backend terminal and start fresh:**

```powershell
cd backend
npm start
```

**Wait for this output:**
```
✅ Server running on port 3000
✅ Connected to MQTT broker
✅ Database connected
```

---

### **Step 2: Start Frontend (New Terminal)**

```powershell
cd frontend-vite
npm run dev
```

**Wait for this output:**
```
✅ Local: http://localhost:3001
```

Then open browser: `http://localhost:3001`

---

### **Step 3: Run Fridge Detection (New Terminal)**

```powershell
& .\.venv\Scripts\Activate.ps1
python python\features\fridge_detection.py
```

**Wait for this output:**
```
🚀 Starting Smart Fridge Object Detection...
✅ Connected to MQTT Broker for Fridge Detection
📹 Webcam opened successfully
```

---

## 📊 Full System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SMART HOME SYSTEM                        │
└─────────────────────────────────────────────────────────────┘

MQTT Broker (broker-cn.emqx.io:1883)
    ↑                           ↑                    ↑
    │                           │                    │
    │ Publishes                 │ Publishes          │ Publishes
    │ Sensor Data               │ Fridge Items       │ Boot Commands
    │                           │                    │
┌───┴──────┐          ┌─────────┴────────┐   ┌──────┴─────────┐
│ ESP8266  │          │ Python Script    │   │ Frontend       │
│ Receiver │          │ (Fridge Detect)  │   │ (Dashboard)    │
└───┬──────┘          └─────────┬────────┘   └──────┬─────────┘
    │                           │                    │
    │ MQTT Messages             │ MQTT Messages      │ MQTT Publish
    │ (esp/sensors)             │ (fridge/inventory) │ (device/boot)
    │                           │                    │
    └───────────────────────────┼────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │  Backend Server      │
                    │  (Node.js + Express) │
                    │  Port: 3000          │
                    └───────────┬──────────┘
                                │
                    ┌───────────┼──────────┐
                    │           │          │
            ┌───────▼────┐  ┌───▼────┐  ┌─▼──────────┐
            │  MySQL DB  │  │Socket  │  │ File       │
            │            │  │.IO     │  │ Storage    │
            │ - Sensors  │  │        │  │ (Images)   │
            │ - Fridge   │  │Broadcast  │            │
            │ - Face     │  │Updates    │            │
            └────────────┘  └────┬─────┘  └────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Frontend (React)       │
                    │  Port: 3001             │
                    │                         │
                    │ ┌─────────────────────┐ │
                    │ │ Dashboard Display   │ │
                    │ │ - Sensors           │ │
                    │ │ - Fridge Items      │ │
                    │ │ - Controls          │ │
                    │ │ - Notifications     │ │
                    │ └─────────────────────┘ │
                    └─────────────────────────┘
                            ↑
                            │
                    User Browser
                    (http://localhost:3001)
```

---

## 🔄 Data Flow Example: Fridge Detection

```
1. Python Script Detects Items
   └─ Sees: 2 eggs, 1 milk bottle
   
2. Publishes MQTT Message
   └─ Topic: fridge/inventory
   └─ Message: {"items": [{"name": "eggs", "quantity": 2}, ...]}
   
3. Backend Receives via MQTT
   └─ Processes in handleFridgeDetection()
   └─ Saves to database
   
4. Backend Broadcasts to Frontend
   └─ Socket.IO event: fridge_detection
   └─ Sends: {items: [...], count: 2}
   
5. Frontend Updates State
   └─ Updates fridgeInventory state
   └─ Shows notification
   
6. Dashboard Renders Items
   └─ Displays with images
   └─ Shows quantities
   └─ Allows +/- buttons
```

---

## 🎯 Features Working

### **Water Motor Control**
- ✅ Toggle on/off
- ✅ Check water level button
- ✅ Real-time level display
- ✅ Status indicator (Full/Half/Low)

### **Fridge Detection**
- ✅ Python script detects items
- ✅ MQTT publishes to backend
- ✅ Backend saves to database
- ✅ Frontend displays with images
- ✅ Real-time updates
- ✅ Quantity management

### **ESP32 Boot Control**
- ✅ Master boot button
- ✅ Slave 1 boot button
- ✅ Slave 2 boot button
- ✅ MQTT commands sent
- ✅ Notifications shown

### **Sensor Data**
- ✅ Temperature
- ✅ Humidity
- ✅ Light Level (LDR)
- ✅ Motion Detection (PIR)
- ✅ IR Sensor
- ✅ Real-time updates

### **Face Recognition**
- ✅ Detects known persons
- ✅ Shows confidence scores
- ✅ Tracks visit history
- ✅ Real-time notifications

---

## 📁 Key Files

```
backend/
├── server.js              # Main server with all endpoints
├── db.js                  # Database connection
└── uploads/fridge/        # Fridge item images

frontend-vite/
├── src/
│   ├── App.jsx            # Main dashboard
│   └── components/
│       ├── HistoryChart.jsx
│       ├── HistoryPanel.jsx
│       ├── FaceRecognitionPanel.jsx
│       └── VoiceAssistant.jsx
└── index.css              # Global styles

python/
├── features/
│   └── fridge_detection.py  # YOLO detection script
└── core/
    └── esp32_command_receiver.py
```

---

## 🔧 Troubleshooting

### **Backend won't start**
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F

# Restart backend
npm start
```

### **Frontend can't connect to backend**
- Make sure backend is running on port 3000
- Check firewall settings
- Try: `curl http://localhost:3000/`

### **Fridge detection not updating dashboard**
1. Check backend is running
2. Check Python script is running
3. Look for MQTT messages in backend logs
4. Verify database connection

### **Database connection error**
- Check MySQL is running
- Verify credentials in `.env`
- Check database "smarthome" exists

---

## 📊 Ports & Services

| Service | Port | URL |
|---------|------|-----|
| Backend | 3000 | http://localhost:3000 |
| Frontend | 3001 | http://localhost:3001 |
| MySQL | 3306 | localhost:3306 |
| MQTT | 1883 | broker-cn.emqx.io:1883 |

---

## ✅ Verification Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001
- [ ] Dashboard accessible at http://localhost:3001
- [ ] Python script running and detecting items
- [ ] Fridge items appear in dashboard
- [ ] Water level updates when checking
- [ ] Boot buttons send commands
- [ ] Notifications appear in real-time

---

## 🎉 Success Indicators

✅ Backend logs show: "Broadcast: Sent to X client(s)"  
✅ Frontend shows sensor data updating  
✅ Fridge items display with images  
✅ Notifications appear when items detected  
✅ Water level updates on button click  
✅ Boot commands send to MQTT  

---

## 📝 Notes

- Backend must be restarted to load new code
- Python script needs virtual environment activated
- MQTT broker is cloud-based (broker-cn.emqx.io)
- All data is real-time via Socket.IO
- Images stored in backend/uploads/fridge/

---

## 🚀 Next Steps

1. **Restart backend** (load latest fixes)
2. **Start frontend** (connect to backend)
3. **Run fridge detection** (start detecting items)
4. **Open dashboard** (http://localhost:3001)
5. **Test all features** (water, fridge, boot buttons)
6. **Monitor logs** (check for errors)

