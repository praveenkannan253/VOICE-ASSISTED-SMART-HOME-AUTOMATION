# 🏠 Smart Home IoT System

A full-duplex IoT smart home system with real-time monitoring, device control, face detection, and voice assistant capabilities.

![Status](https://img.shields.io/badge/status-active-success)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)

---

## 🚀 Quick Start

### ⭐ Complete System with All Features (Recommended)
```bash
START_PROJECT.bat
```
**Includes:** Device Control, Sensors, Face Detection, YOLO Fridge Detection (AI), Voice Assistant, Charts

See `FEATURES_OVERVIEW.md` for complete feature list.

### Option 1: Full System Launcher
```bash
cd scripts
start_smart_home.bat
```

### Option 2: Dashboard Only (No Simulators)
```bash
cd scripts
start_dashboard_only.bat
```

### Option 3: Manual Start
```bash
# Terminal 1: Backend Server
cd backend
npm install
npm start

# Terminal 2: ESP32 Simulator
python python/core/continuous_esp32_simulator.py

# Terminal 3: Command Receiver
python python/core/esp32_command_receiver.py

# Terminal 4: Frontend Dashboard
cd frontend
npm install
npm start
```

**Access Dashboard:** http://localhost:3001

---

## ✨ Features

### 🎛️ Device Control
- **Smart Devices**: Fan, Light, AC, Washing Machine
- **Real-time Control**: Toggle devices from web dashboard
- **MQTT Communication**: Bidirectional ESP32 ↔ Backend ↔ Frontend

### 📊 Real-time Monitoring
- **Live Sensor Data**: Temperature, Humidity, Light (LDR), Motion (PIR/IR)
- **Interactive Charts**: Historical data visualization with Chart.js
- **WebSocket Updates**: Instant data updates via Socket.IO

### 🎤 Voice Assistant
- **Voice Commands**: Control devices using voice
- **Speech Recognition**: Built-in browser speech API
- **Natural Language**: "Turn on the fan", "What's the temperature?"

### 📷 Face Detection
- **Face Recognition**: Identify registered users
- **Manual Trigger**: Camera control from dashboard
- **Motion-based**: Auto-trigger on PIR/IR sensor detection
- **Configuration**: Adjustable timeout, sensitivity, mode

### 🍕 Fridge Inventory
- **Item Tracking**: Monitor fridge contents with AI detection
- **Detection Methods**: Color-based (simple) or YOLO (AI-powered)
- **Quantity Management**: Add/remove items automatically
- **Status Alerts**: Low stock notifications
- **Real-time Updates**: Instant inventory sync
- **80+ Items**: YOLO can detect fruits, vegetables, bottles, and more

### 📈 Data History
- **Historical Charts**: View past sensor data
- **Time Periods**: 1h, 6h, 12h, 24h, 7d, 30d
- **MySQL Storage**: Persistent data storage
- **Export Ready**: API endpoints for data export

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  Dashboard | Device Controls | Charts | Voice | Face UI     │
└─────────────────────┬───────────────────────────────────────┘
                      │ Socket.IO + REST API
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                │
│  API Server | MQTT Client | Socket.IO | MySQL Database      │
└─────────────────────┬───────────────────────────────────────┘
                      │ MQTT (broker-cn.emqx.io)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   PYTHON SERVICES                           │
│  ESP32 Simulator | Command Receiver | Face Detection        │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                ESP32/ESP8266 DEVICES (Optional)             │
│  Sensors | Actuators | Camera | WiFi Module                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
SMARTHOME/
├── 📁 backend/                    # Node.js Backend Server
│   ├── server.js                  # Main API server
│   ├── db.js                      # MySQL connection
│   ├── schema.sql                 # Database schema
│   ├── .env                       # Configuration
│   └── package.json               # Dependencies
│
├── 📁 frontend/                   # React Frontend
│   ├── src/
│   │   ├── App.js                 # Main application
│   │   └── components/            # UI components
│   │       ├── Dashboard.js
│   │       ├── DeviceCard.js
│   │       ├── FaceDetectionControl.js
│   │       ├── FaceRecognition.js
│   │       ├── HistoryChart.js
│   │       ├── HistoryPanel.js
│   │       └── VoiceAssistant.js
│   ├── public/
│   └── package.json
│
├── 📁 python/                     # Python Services
│   ├── core/                      # Core functionality
│   │   ├── esp32_command_receiver.py
│   │   ├── continuous_esp32_simulator.py
│   │   ├── face_recognition_simple.py
│   │   └── dashboard_only_system.py
│   │
│   ├── network/                   # Network integration
│   │   ├── esp32_network_receiver.py
│   │   ├── esp32_network_simulator.py
│   │   └── real_esp8266_integration.py
│   │
│   ├── features/                  # Additional features
│   │   ├── enhanced_sensor_data.py
│   │   ├── fridge_detection.py
│   │   ├── realtime_fridge_detection.py  # Color-based
│   │   ├── yolo_fridge_detection.py      # AI-powered (NEW)
│   │   └── face_recognition_entry.py
│   │
│   └── setup/                     # Setup scripts
│       ├── setup_face_recognition.py
│       ├── setup_database_config.py
│       └── create_face_encodings.py
│
├── 📁 tests/                      # Test files
│   ├── test_api.js
│   ├── test_commands_simple.py
│   ├── test_mqtt_simple.py
│   └── test_full_duplex_demo.py
│
├── 📁 scripts/                    # Startup scripts
│   ├── start_smart_home.bat       # Main launcher
│   ├── start_smart_home.ps1       # PowerShell version
│   ├── start_dashboard_only.bat   # Dashboard only
│   ├── start_yolo_fridge.bat      # YOLO fridge detection (NEW)
│   └── stop_smart_home.bat        # Stop all services
│
├── 📁 docs/                       # Documentation
│   ├── SMART_HOME_SETUP.md
│   ├── DASHBOARD_ONLY_SETUP.md
│   ├── NETWORK_SETUP.md
│   ├── REAL_ESP8266_INTEGRATION.md
│   ├── FRIDGE_DETECTION_METHODS.md  # Detection methods comparison (NEW)
│   └── PROJECT_ANALYSIS.md
│
├── 📁 data/                       # Data folders
│   ├── faces/                     # Face encodings
│   └── captured_faces/            # Captured images
│
├── requirements.txt               # Python dependencies
├── START_PROJECT.bat              # Main launcher (all features)
├── FEATURES_OVERVIEW.md           # Complete features guide (NEW)
├── FRIDGE_DETECTION_QUICK_START.md # Fridge detection guide (NEW)
└── README.md                      # This file
```

---

## 🛠️ Installation

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **MySQL** 8.0+ ([Download](https://dev.mysql.com/downloads/))
- **Git** (optional)

### Step 1: Clone/Download Project
```bash
git clone <your-repo-url>
cd SMARTHOME
```

### Step 2: Setup Backend
```bash
cd backend
npm install
```

**Configure `.env` file:**
```env
MQTT_URL=mqtt://broker-cn.emqx.io:1883
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=smarthome
```

**Setup Database:**
```bash
mysql -u root -p < schema.sql
```

### Step 3: Setup Frontend
```bash
cd frontend
npm install
```

### Step 4: Setup Python Environment
```bash
# Install Python dependencies
pip install -r requirements.txt

# Optional: Setup face recognition
python python/setup/setup_face_recognition.py
```

---

## 🎯 Usage

### Start the System
```bash
cd scripts
start_smart_home.bat
```

This will launch:
1. **ESP32 Command Receiver** - Listens for device commands
2. **ESP32 Sensor Simulator** - Sends simulated sensor data
3. **Backend Server** - API + MQTT processing (port 3000)
4. **Face Detection System** - Face recognition service
5. **Frontend Dashboard** - Opens browser at http://localhost:3001

### Stop the System
```bash
cd scripts
stop_smart_home.bat
```

### Fridge Detection (Standalone)

**Option 1: Color-Based Detection (Simple)**
```bash
python python/features/realtime_fridge_detection.py
```
- Fast and lightweight
- No AI model needed
- 60-70% accuracy

**Option 2: YOLO Detection (AI-Powered) ⭐ Recommended**
```bash
cd scripts
start_yolo_fridge.bat
```
- High accuracy (85-95%)
- Detects 80+ items
- Auto-downloads model on first run

See `docs/FRIDGE_DETECTION_METHODS.md` for detailed comparison.

---

## 🌐 API Endpoints

### Device Control
```bash
POST /api/control
{
  "device": "fan",
  "action": "on"
}
```

### Sensor Data
```bash
GET /api/sensors
GET /api/sensors/history?topic=esp/sensors&period=24h
```

### Face Detection
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

GET /api/face-detection/status
```

### Fridge Inventory
```bash
GET /api/fridge/inventory

POST /api/fridge/update
{
  "item": "milk",
  "quantity": 2,
  "action": "add"
}
```

---

## 📡 MQTT Topics

### Incoming (ESP32 → Backend)
- `esp/sensors` - Sensor data (temp, hum, ldr, pir, ir)
- `esp/cam` - Face detection results
- `face-detection/status` - Face detection system status
- `fridge/inventory` - Fridge inventory updates

### Outgoing (Backend → ESP32)
- `home/control/fan` - Fan control
- `home/control/light` - Light control
- `home/control/ac` - AC control
- `home/control/washing-machine` - Washing machine control
- `face-detection/commands` - Face detection commands

---

## 🧪 Testing

### Test MQTT Communication
```bash
python tests/test_mqtt_simple.py
```

### Test Device Commands
```bash
python tests/test_commands_simple.py
```

### Test Full Duplex
```bash
python tests/test_full_duplex_demo.py
```

### Test API
```bash
node tests/test_api.js
```

---

## 🔧 Configuration

### Backend Configuration (`backend/.env`)
- `MQTT_URL` - MQTT broker URL
- `MYSQL_*` - Database credentials

### Frontend Configuration (`frontend/package.json`)
- `proxy` - Backend API URL (default: http://0.0.0.0:3000)
- Port is set to 3001 in start script

### Python Configuration
- MQTT broker is hardcoded in Python scripts
- Can be modified in each script's MQTT connection section

---

## 🐛 Troubleshooting

### Backend won't start
```bash
cd backend
npm install
node server.js
```
Check MySQL connection and credentials in `.env`

### Frontend won't load
```bash
cd frontend
npm install
npm start
```
Ensure backend is running on port 3000

### MQTT connection issues
- Check internet connection
- Verify `broker-cn.emqx.io` is accessible
- Try alternative broker: `mqtt://test.mosquitto.org:1883`

### Python import errors
```bash
pip install -r requirements.txt
```

### Face recognition not working
```bash
python python/setup/setup_face_recognition.py
```

---

## 📊 Database Schema

### Tables
- **devices** - Device registry
- **sensors** - Sensor data history (JSON storage)
- **logs** - System logs
- **fridge_items** - Fridge inventory

See `backend/schema.sql` for complete schema.

---

## 🚀 Deployment

### For Production
1. Use environment variables for all secrets
2. Setup SSL/TLS for MQTT and HTTPS
3. Use production MQTT broker (not public test broker)
4. Enable authentication on all endpoints
5. Setup proper database backups
6. Use PM2 or similar for Node.js process management

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**PRAVIN**

---

## 🙏 Acknowledgments

- **MQTT Broker**: EMQX (broker-cn.emqx.io)
- **Frontend**: React, Socket.IO, Chart.js
- **Backend**: Node.js, Express, MySQL
- **Python**: Paho MQTT, OpenCV (face detection)

---

## 📞 Support

For issues and questions:
- Check `docs/` folder for detailed guides
- Review `PROJECT_ANALYSIS.md` for feature breakdown
- Test with provided test scripts in `tests/`

---

**🎉 Enjoy your Smart Home System!**
