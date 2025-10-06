# 🏠 Smart Home Full Duplex Communication System

## 🚀 Quick Start

### Option 1: Automated Startup (Recommended)
```bash
# Double-click or run:
start_system.bat

# Or for advanced startup:
start_smart_home.bat
```

### Option 2: Manual Startup
```bash
# Terminal 1: ESP32 Command Receiver
python esp32_command_receiver.py

# Terminal 2: ESP32 Sensor Simulator  
python continuous_esp32_simulator.py

# Terminal 3: Backend Server
cd backend && node server.js

# Terminal 4: Face Detection System
python face_recognition_simple.py

# Terminal 5: Frontend (optional)
cd frontend && npm start
```

## 📡 MQTT Communication Topics

### 📥 INCOMING (ESP32 → Server):
- **`esp/sensors`** - Sensor data (temp, hum, ldr, pir, ir)
- **`esp/cam`** - Face detection results
- **`face-detection/status`** - Face detection system status

### 📤 OUTGOING (Server → ESP32):
- **`home/control/fan`** - Fan control
- **`home/control/light`** - Light control  
- **`home/control/ac`** - AC control
- **`home/control/washing-machine`** - Washing machine control
- **`face-detection/commands`** - Face detection commands

## 🔄 Full Duplex Communication Flow

```
┌─────────────────┐    MQTT     ┌──────────────────┐
│   Frontend      │◄──────────►│   Backend        │
│   Dashboard     │            │   Server         │
└─────────────────┘            └──────────────────┘
                                        │
                                        │ MQTT
                                        ▼
                               ┌──────────────────┐
                               │ ESP32 Devices     │
                               │ (fan, light, ac) │
                               └──────────────────┘
                                        ▲
                                        │ MQTT
                                        │
                               ┌──────────────────┐
                               │ Face Detection   │
                               │ System           │
                               └──────────────────┘
```

## 🎯 System Features

### ✅ Frontend Dashboard Controls:
- **Device Toggles**: Fan, Light, AC, Washing Machine
- **Real-time Charts**: Temperature and humidity monitoring
- **Face Detection Control**: Manual trigger and configuration
- **Live Sensor Data**: PIR, IR, LDR, Temperature, Humidity

### ✅ ESP32 Command Processing:
- **Command Reception**: Listens to `home/control/*` topics
- **Device Control**: Updates device states (on/off)
- **Status Publishing**: Publishes device states and sensor data
- **Real-time Response**: Immediate response to frontend commands

### ✅ Face Detection System:
- **Manual Trigger**: Frontend can trigger camera
- **Configuration**: Timeout, sensitivity, mode settings
- **Motion Detection**: Automatic triggering on PIR/IR sensors
- **Result Publishing**: Face detection results to dashboard

## 🧪 Testing the System

### Test Communication:
```bash
python test_commands_simple.py
```

### Test Full Duplex:
```bash
python test_full_duplex_demo.py
```

### Test ESP32 Simulator:
```bash
python continuous_esp32_simulator.py
```

## 📊 System Components

### 1. **ESP32 Command Receiver** (`esp32_command_receiver.py`)
- Listens for frontend commands
- Updates device states
- Publishes sensor data with device states
- Simulates ESP32 responses

### 2. **ESP32 Sensor Simulator** (`continuous_esp32_simulator.py`)
- Sends continuous sensor data every 2 seconds
- Simulates realistic temperature, humidity, light, motion data
- Publishes to `esp/sensors` topic

### 3. **Backend Server** (`backend/server.js`)
- Processes MQTT messages
- Serves API endpoints
- Real-time Socket.IO updates
- Database storage

### 4. **Face Detection System** (`face_recognition_simple.py`)
- Handles face recognition
- Responds to manual triggers
- Processes configuration changes
- Publishes detection results

### 5. **Frontend Dashboard** (`frontend/`)
- React-based dashboard
- Real-time device controls
- Live sensor data display
- Face detection controls

## 🌐 Access Points

- **Frontend Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **MQTT Broker**: broker-cn.emqx.io:1883

## 🔧 API Endpoints

### Device Control:
```bash
POST /api/control
{
  "device": "fan",
  "action": "on"
}
```

### Face Detection:
```bash
POST /api/face-detection/trigger
{
  "reason": "manual_trigger",
  "priority": "high"
}

POST /api/face-detection/configure
{
  "timeout": 15,
  "sensitivity": "high",
  "mode": "manual"
}
```

### Sensor Data:
```bash
GET /api/sensors
```

## 📝 ESP32 Code Structure

Your ESP32 should:
- **Subscribe to**: `home/control/fan`, `home/control/light`, `home/control/ac`, `home/control/washing-machine`
- **Publish to**: `esp/sensors` with sensor data
- **Handle commands**: Update device states based on received commands

## 🎉 Success Indicators

### ✅ System Working When You See:
1. **ESP32 Command Receiver**: Receiving and processing commands
2. **ESP32 Sensor Simulator**: Sending continuous data
3. **Backend Server**: Processing MQTT messages
4. **Frontend Dashboard**: Real-time updates and controls
5. **Face Detection**: Responding to triggers and commands

### 📊 Expected Output:
- ESP32 logs: `📥 Received command: home/control/fan -> on`
- Backend logs: `📡 Raw MQTT: esp/sensors {...}`
- Frontend: Real-time charts updating with sensor data
- Device controls: Toggle switches working in dashboard

## 🚨 Troubleshooting

### Backend Not Starting:
```bash
cd backend
npm install
node server.js
```

### Frontend Not Loading:
```bash
cd frontend
npm install
npm start
```

### MQTT Connection Issues:
- Check internet connection
- Verify broker-cn.emqx.io is accessible
- Check firewall settings

## 🎯 Next Steps

1. **Start the system**: Run `start_system.bat`
2. **Open dashboard**: http://localhost:3001
3. **Test controls**: Toggle device switches
4. **Monitor data**: Watch real-time sensor charts
5. **Test face detection**: Use manual trigger controls

Your smart home system now has complete full duplex communication! 🎉

