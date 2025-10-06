# 👤 Face Recognition System - Complete Guide

## 🎯 Overview

Your Smart Home system now includes a **Face Recognition System** that receives data from your friend's PC via MQTT topic `esp/cam`, classifies persons as **known** or **unknown**, and displays real-time data on the dashboard.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          Friend's PC (Face Detection System)                │
│  - Captures faces via camera                                │
│  - Runs face recognition                                    │
│  - Publishes to MQTT: esp/cam                               │
└────────────────────┬────────────────────────────────────────┘
                     │ MQTT (broker-cn.emqx.io)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Your Backend Server (Node.js)                  │
│  - Subscribes to esp/cam topic                              │
│  - Classifies known/unknown persons                         │
│  - Saves to MySQL database                                  │
│  - Broadcasts to frontend via Socket.IO                     │
└────────────────────┬────────────────────────────────────────┘
                     │ Socket.IO + REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Your Dashboard (React)                         │
│  - Real-time face detection alerts                          │
│  - Known persons list                                       │
│  - Detection history                                        │
│  - Statistics                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 MQTT Message Format

### Topic: `esp/cam`

Your friend's system should publish messages in this format:

```json
{
  "name": "John Doe",
  "status": "known",
  "confidence": 0.95,
  "timestamp": "2025-10-06T12:00:00.000Z"
}
```

### Message Fields:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Person's name (or "Unknown") | "John Doe" |
| `status` | string | "known" or "unknown" | "known" |
| `confidence` | float | Confidence score (0.0 to 1.0) | 0.95 |
| `timestamp` | string | ISO timestamp | "2025-10-06T12:00:00.000Z" |

---

## 🗄️ Database Tables

### 1. `face_recognition` Table
Stores all face detection events:

```sql
CREATE TABLE face_recognition (
  id INT AUTO_INCREMENT PRIMARY KEY,
  person_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,  -- 'known' or 'unknown'
  confidence FLOAT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  image_path VARCHAR(255),
  location VARCHAR(100) DEFAULT 'entrance',
  INDEX idx_timestamp (timestamp),
  INDEX idx_status (status)
);
```

### 2. `known_persons` Table
Maintains list of known persons:

```sql
CREATE TABLE known_persons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP NULL,
  visit_count INT DEFAULT 0
);
```

---

## 🔧 Setup Instructions

### Step 1: Update Database Schema

Run the SQL script to create tables:

```bash
cd backend
mysql -u root -p smarthome < schema.sql
```

Or manually:

```sql
USE smarthome;

CREATE TABLE IF NOT EXISTS face_recognition (
  id INT AUTO_INCREMENT PRIMARY KEY,
  person_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  confidence FLOAT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  image_path VARCHAR(255),
  location VARCHAR(100) DEFAULT 'entrance',
  INDEX idx_timestamp (timestamp),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS known_persons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP NULL,
  visit_count INT DEFAULT 0
);
```

### Step 2: Start Your System

```bash
START_PROJECT.bat
```

This will start:
- Backend server (subscribes to `esp/cam`)
- Frontend dashboard (displays face recognition data)

### Step 3: Configure Friend's System

Your friend needs to publish to MQTT topic `esp/cam` with the correct format.

**Example Python code for friend's system:**

```python
import paho.mqtt.client as mqtt
import json
from datetime import datetime

MQTT_BROKER = "broker-cn.emqx.io"
MQTT_PORT = 1883
TOPIC = "esp/cam"

client = mqtt.Client()
client.connect(MQTT_BROKER, MQTT_PORT, 60)

# When face is detected
def send_face_detection(name, is_known, confidence):
    message = {
        "name": name,
        "status": "known" if is_known else "unknown",
        "confidence": confidence,
        "timestamp": datetime.now().isoformat()
    }
    
    client.publish(TOPIC, json.dumps(message))
    print(f"✅ Sent: {message}")

# Example usage
send_face_detection("John Doe", True, 0.95)  # Known person
send_face_detection("Unknown", False, 0.0)   # Unknown person
```

---

## 📊 Dashboard Features

### 1. **Real-time Detection Alert**
- Shows latest detected person
- Green for known, Orange for unknown
- Displays confidence percentage
- Auto-dismisses after 5 seconds

### 2. **Statistics Cards**
- Total known persons
- Total detections
- Known detections count
- Unknown detections count

### 3. **Add Known Person**
- Input field to add new known persons
- Adds to database for future classification

### 4. **Known Persons List**
- Shows all registered persons
- Visit count for each person
- Last seen timestamp
- Avatar with first letter

### 5. **Recent Detections**
- Last 10 detections
- Color-coded (green/orange)
- Time ago format
- Confidence percentage

---

## 🔌 API Endpoints

### Get Recent Detections
```bash
GET /api/face/recent?limit=10
```

**Response:**
```json
{
  "detections": [
    {
      "name": "John Doe",
      "status": "known",
      "confidence": 0.95,
      "timestamp": "2025-10-06T12:00:00.000Z"
    }
  ]
}
```

### Get Known Persons
```bash
GET /api/face/known
```

**Response:**
```json
{
  "known_persons": [
    {
      "name": "John Doe",
      "added_at": "2025-10-01T10:00:00.000Z",
      "last_seen": "2025-10-06T12:00:00.000Z",
      "visit_count": 15
    }
  ]
}
```

### Add Known Person
```bash
POST /api/face/add-known
Content-Type: application/json

{
  "name": "Jane Smith"
}
```

### Get Statistics
```bash
GET /api/face/stats
```

**Response:**
```json
{
  "stats": {
    "total_known_persons": 5,
    "total_detections": 150,
    "known_detections": 120,
    "unknown_detections": 30
  }
}
```

---

## 🧪 Testing

### Test 1: Simulate Face Detection

Use this Python script to test:

```python
import paho.mqtt.client as mqtt
import json
from datetime import datetime
import time

MQTT_BROKER = "broker-cn.emqx.io"
MQTT_PORT = 1883
TOPIC = "esp/cam"

client = mqtt.Client()
client.connect(MQTT_BROKER, MQTT_PORT, 60)

# Test known person
message1 = {
    "name": "John Doe",
    "status": "known",
    "confidence": 0.95,
    "timestamp": datetime.now().isoformat()
}
client.publish(TOPIC, json.dumps(message1))
print("✅ Sent known person detection")

time.sleep(2)

# Test unknown person
message2 = {
    "name": "Unknown",
    "status": "unknown",
    "confidence": 0.0,
    "timestamp": datetime.now().isoformat()
}
client.publish(TOPIC, json.dumps(message2))
print("✅ Sent unknown person detection")

client.disconnect()
```

### Test 2: Check Backend Logs

When a face is detected, you should see in backend console:

```
👤 FACE RECOGNITION DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Person: John Doe
📊 Status: ✅ KNOWN
🎯 Confidence: 95.0%
⏰ Time: 12:00:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Test 3: Check Dashboard

1. Open http://localhost:3001
2. Scroll to "Face Recognition System" panel
3. You should see:
   - Real-time alert (if detection just happened)
   - Updated statistics
   - Detection in recent list

---

## 🎨 How Classification Works

### Known Person Detection:
1. Friend's system detects face
2. Sends `status: "known"` with person's name
3. Backend checks if name exists in `known_persons` table
4. If yes: Updates `last_seen` and increments `visit_count`
5. If no: Adds to `known_persons` table
6. Dashboard shows **green alert** with name

### Unknown Person Detection:
1. Friend's system detects unknown face
2. Sends `status: "unknown"` with `name: "Unknown"`
3. Backend saves to `face_recognition` table only
4. Does NOT add to `known_persons` table
5. Dashboard shows **orange alert** for unknown person

---

## 📝 Adding Known Persons Manually

### Via Dashboard:
1. Go to "Face Recognition System" panel
2. Find "Add Known Person" section
3. Enter name
4. Click "Add"

### Via API:
```bash
curl -X POST http://localhost:3000/api/face/add-known \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith"}'
```

### Via Database:
```sql
INSERT INTO known_persons (name) VALUES ('Jane Smith');
```

---

## 🔔 Real-time Notifications

The system uses Socket.IO for real-time updates:

### Event: `face_detected`

Frontend listens for this event:

```javascript
socket.on('face_detected', (data) => {
  // data = { name, status, confidence, timestamp }
  // Show alert, update UI, etc.
});
```

---

## 🎯 Use Cases

### 1. **Home Security**
- Track who enters your home
- Alert on unknown persons
- Keep visit logs

### 2. **Office Access Control**
- Monitor employee entry
- Detect unauthorized persons
- Track attendance

### 3. **Smart Doorbell**
- Identify visitors
- Notify on known/unknown persons
- Historical visitor log

---

## 🔧 Troubleshooting

### Issue: No detections showing

**Check:**
1. Backend is running and subscribed to `esp/cam`
2. Friend's system is publishing to correct topic
3. MQTT broker is accessible
4. Message format is correct JSON

**Debug:**
```bash
# Check backend logs
# Should see: "Subscribed to: esp/cam (Face recognition data)"
```

### Issue: Person not classified as known

**Check:**
1. Person's name exists in `known_persons` table
2. Name spelling matches exactly (case-sensitive)
3. Status field is "known" in MQTT message

**Fix:**
```sql
-- Add person to known_persons
INSERT INTO known_persons (name) VALUES ('John Doe');
```

### Issue: Dashboard not updating

**Check:**
1. Socket.IO connection is active
2. Browser console for errors
3. Backend is broadcasting events

**Debug:**
```javascript
// In browser console
socket.connected  // Should be true
```

---

## 📊 Data Flow Example

```
1. Friend's Camera detects face
   ↓
2. Face recognition runs
   ↓
3. Publishes to MQTT: esp/cam
   {
     "name": "John Doe",
     "status": "known",
     "confidence": 0.95,
     "timestamp": "2025-10-06T12:00:00.000Z"
   }
   ↓
4. Your Backend receives message
   ↓
5. Saves to face_recognition table
   ↓
6. Updates known_persons table (if known)
   ↓
7. Broadcasts to frontend via Socket.IO
   ↓
8. Dashboard shows real-time alert
   ↓
9. Updates statistics and recent list
```

---

## 🎉 Summary

Your Smart Home system now has a complete face recognition integration:

✅ **Backend**: Subscribes to `esp/cam`, processes data, saves to database
✅ **Database**: Two tables for detections and known persons
✅ **Frontend**: Beautiful dashboard panel with real-time updates
✅ **API**: RESTful endpoints for all operations
✅ **Real-time**: Socket.IO for instant notifications
✅ **Classification**: Automatic known/unknown person detection

**Your friend just needs to publish face detection data to `esp/cam` topic!**

---

## 📞 Support

For issues:
1. Check backend console logs
2. Verify MQTT message format
3. Test with provided Python script
4. Check database tables

**Happy Face Recognition! 👤🎉**
