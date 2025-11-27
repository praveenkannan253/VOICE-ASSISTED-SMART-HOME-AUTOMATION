# How to Run Fridge Items Detection (Python)

## 📋 Overview

The fridge detection system uses **YOLOv9** to detect items in your fridge and automatically updates the dashboard inventory in real-time.

## 🔧 Prerequisites

### 1. Python Installation
- Python 3.8 or higher
- Download from: https://www.python.org/downloads/

### 2. Required Libraries

```bash
pip install opencv-python
pip install ultralytics
pip install mysql-connector-python
pip install paho-mqtt
```

Or install all at once:

```bash
pip install opencv-python ultralytics mysql-connector-python paho-mqtt
```

### 3. YOLOv9 Model
The model will auto-download on first run (~200MB)
- File: `yolov9c.pt`
- Location: Will be cached automatically

### 4. Hardware Requirements
- **Webcam/Camera** connected to your computer
- **GPU recommended** (CUDA) for faster detection, but CPU works too

## 📁 File Locations

```
d:\Documents\SMARTHOME\python\features\
├── fridge_detection.py          ← Main detection script
├── simple_fridge_detection.py   ← Lightweight version
├── realtime_fridge_detection.py ← Real-time version
└── yolo_fridge_detection.py     ← Advanced YOLO version
```

## 🚀 Quick Start

### Step 1: Open Terminal/Command Prompt

```bash
cd d:\Documents\SMARTHOME\python\features
```

### Step 2: Run the Detection Script

```bash
python fridge_detection.py
```

### Step 3: Watch the Console Output

```
🤖 Loading YOLO model...
✅ Connected to MQTT Broker for Fridge Detection
✅ Database table initialized
🚀 Starting Smart Fridge Object Detection...
📷 Opening camera...
🔍 Detecting items...
📦 Updated apple: 2 items
📦 Updated banana: 3 items
```

## 📊 What Happens

### Detection Process

```
1. Camera captures frame
   ↓
2. YOLO detects objects
   ↓
3. Matches against grocery list
   ↓
4. Updates database
   ↓
5. Sends MQTT message
   ↓
6. Dashboard updates in real-time
```

### Detected Items

The system detects:
- apple
- banana
- orange
- milk
- bread
- bottle
- wine glass
- cup
- bowl

### Real-time Updates

- **Database:** `fridge_items` table updated
- **MQTT:** Message sent to `fridge/inventory` topic
- **Dashboard:** Automatically displays detected items

## 🎥 Camera Setup

### Using Webcam

```python
# Default camera (usually built-in or first connected)
cap = cv2.VideoCapture(0)
```

### Using External Camera

```python
# If you have multiple cameras
cap = cv2.VideoCapture(1)  # Second camera
cap = cv2.VideoCapture(2)  # Third camera
```

### Using IP Camera

```python
# RTSP stream from IP camera
cap = cv2.VideoCapture('rtsp://username:password@camera_ip:port/stream')
```

## 🔧 Configuration

### Edit Detection Parameters

Open `fridge_detection.py` and modify:

```python
# Update interval (seconds)
update_interval = 5  # Detect every 5 seconds

# Grocery list (items to detect)
grocery_list = ["apple", "banana", "orange", "milk", "bread", "bottle", "wine glass", "cup", "bowl"]

# Confidence threshold
confidence_threshold = 0.5  # 50% confidence minimum
```

### Database Configuration

Update credentials in the script:

```python
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",  # Change this!
    database="smarthome"
)
```

### MQTT Configuration

```python
MQTT_BROKER = "broker-cn.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC = "fridge/inventory"
```

## 📱 Different Versions

### 1. Standard Version
```bash
python fridge_detection.py
```
- Full-featured
- Database + MQTT integration
- Real-time detection

### 2. Simple Version (No Database)
```bash
python simple_fridge_detection.py
```
- Lightweight
- No database required
- MQTT only

### 3. Real-time Version
```bash
python realtime_fridge_detection.py
```
- Optimized for speed
- Continuous detection
- Best for live monitoring

### 4. Advanced YOLO Version
```bash
python yolo_fridge_detection.py
```
- Advanced features
- Custom training support
- Multiple model options

## 🖥️ Console Output

### Successful Start
```
🤖 Loading YOLO model...
✅ Connected to MQTT Broker for Fridge Detection
✅ Database table initialized
🚀 Starting Smart Fridge Object Detection...
📷 Opening camera...
🔍 Detecting items...
```

### Detection Output
```
📦 Updated apple: 2 items
📦 Updated banana: 3 items
📦 Updated milk: 1 items
```

### Error Messages
```
❌ Database connection error: Access denied
❌ Failed to connect to MQTT, return code: 1
❌ Camera not found
```

## 🐛 Troubleshooting

### Issue: "Camera not found"
**Solution:**
1. Check camera is connected
2. Try different camera index:
   ```python
   cap = cv2.VideoCapture(1)  # Try 1, 2, 3...
   ```
3. Close other apps using camera

### Issue: "Database connection error"
**Solution:**
1. Verify MySQL is running
2. Check credentials in script
3. Ensure `smarthome` database exists
4. Check user permissions

### Issue: "MQTT connection failed"
**Solution:**
1. Check internet connection
2. Verify broker URL is correct
3. Check firewall settings
4. Try different MQTT broker

### Issue: "YOLO model download fails"
**Solution:**
1. Check internet connection
2. Manual download: https://github.com/ultralytics/assets/releases
3. Place `yolov9c.pt` in script directory

### Issue: "Slow detection"
**Solution:**
1. Use GPU (install CUDA)
2. Reduce frame resolution
3. Increase detection interval
4. Use lighter model (yolov8n instead of yolov9c)

## 📊 Performance Tips

### Speed Up Detection
```python
# Reduce resolution
frame = cv2.resize(frame, (640, 480))

# Increase detection interval
update_interval = 10  # Every 10 seconds instead of 5

# Use lighter model
model = YOLO("yolov8n.pt")  # Nano instead of Custom
```

### Improve Accuracy
```python
# Increase confidence threshold
confidence_threshold = 0.7  # 70% instead of 50%

# Use larger model
model = YOLO("yolov9l.pt")  # Large instead of Custom
```

## 🔄 Integration with Dashboard

### Real-time Updates
1. Detection script sends MQTT message
2. Backend receives on `fridge/inventory` topic
3. Frontend updates via Socket.IO
4. Dashboard shows detected items instantly

### Database Sync
- Detected items stored in `fridge_items` table
- Dashboard queries table on load
- Real-time updates via MQTT

## 📝 Running in Background

### Windows (Command Prompt)
```bash
# Run in background
start python fridge_detection.py

# Or use Task Scheduler for automatic startup
```

### Linux/Mac
```bash
# Run in background
nohup python fridge_detection.py &

# Or use systemd service
```

## 🎯 Next Steps

1. ✅ Install Python and dependencies
2. ✅ Start backend: `npm start` (backend folder)
3. ✅ Start frontend: `npm run dev` (frontend-vite folder)
4. ✅ Run detection: `python fridge_detection.py`
5. ✅ Open dashboard: `http://localhost:3001`
6. ✅ Point camera at fridge items
7. ✅ Watch items appear in dashboard!

## 📚 Example Workflow

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend-vite
npm run dev

# Terminal 3 - Fridge Detection
cd python/features
python fridge_detection.py
```

Then open: `http://localhost:3001`

## 🎓 Learning Resources

- **YOLO Documentation:** https://docs.ultralytics.com/
- **OpenCV Docs:** https://docs.opencv.org/
- **MySQL Connector:** https://dev.mysql.com/doc/connector-python/en/
- **MQTT Protocol:** https://mqtt.org/

## ⚙️ Advanced Configuration

### Custom Item Detection

Edit the grocery list:
```python
grocery_list = [
    "apple", "banana", "orange",
    "milk", "bread", "bottle",
    "wine glass", "cup", "bowl",
    # Add your items here
    "cheese", "eggs", "butter"
]
```

### Custom YOLO Model

Train your own model:
```python
from ultralytics import YOLO

# Load a model
model = YOLO('yolov8n.yaml')  # build a new model from YAML

# Train the model
results = model.train(data='path/to/dataset.yaml', epochs=100)
```

### Webhook Notifications

Send alerts when items detected:
```python
import requests

def send_notification(item_name, quantity):
    webhook_url = "your_webhook_url"
    data = {"item": item_name, "quantity": quantity}
    requests.post(webhook_url, json=data)
```

---

**Status:** ✅ Ready to run  
**Last Updated:** November 27, 2025  
**Python Version:** 3.8+
