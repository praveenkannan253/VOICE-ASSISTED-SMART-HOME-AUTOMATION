# 📡 MQTT Topics Reference Guide

## Overview
This document lists all MQTT topics used in the Smart Home IoT System for sensor data fetching, device control, and status updates.

---

## 📊 Subscribed Topics

### **1. Sensor Data Topics**

#### `esp/sensors`
- **Purpose:** Main sensor data from ESP32 hardware
- **Data Format:** JSON object
- **Fields:**
  - `temp` - Temperature in °C
  - `hum` - Humidity in %
  - `ldr` - Light level (0-1023)
  - `pir` - Motion detection (0/1)
  - `ir` - IR sensor status (0/1)
- **Example:**
  ```json
  {
    "temp": 23.6,
    "hum": 85.5,
    "ldr": 45,
    "pir": 0,
    "ir": 1
  }
  ```
- **Update Frequency:** Every 1-2 seconds

---

#### `esp/status`
- **Purpose:** Device status updates
- **Data Format:** JSON or string
- **Example:** `{"status": "online"}` or `"online"`

---

#### `esp/#`
- **Purpose:** Wildcard subscription for all ESP topics
- **Includes:** All topics starting with `esp/`
- **Note:** Used for catch-all monitoring

---

### **2. Device Control Topics**

#### `home/control`
- **Purpose:** Receive control commands from external sources
- **Data Format:** String command
- **Command Format:** `"device action"` (e.g., `"water-motor on"`)
- **Example Commands:**
  - `"water-motor on"` - Turn on water motor
  - `"water-motor off"` - Turn off water motor
- **Source:** External apps, friend's devices, or manual commands

---

#### `home/sensors/water-motor`
- **Purpose:** Water motor status updates from hardware
- **Data Format:** JSON object or string
- **Fields:**
  - `state` - Motor state ("on"/"off" or 1/0)
- **Example:**
  ```json
  {
    "state": "on"
  }
  ```
- **Broadcast:** Sent to all connected dashboard clients

---

### **3. Water Level Topics**

#### `home/sensors/water-level`
- **Purpose:** Water tank level from ESP32
- **Data Format:** JSON object or number
- **Fields:**
  - `level` - Water level percentage (0-100)
- **Example:**
  ```json
  {
    "level": 75
  }
  ```
- **Alternative:** Can also use `device/water/level`

---

#### `device/water/level`
- **Purpose:** Alternative water level topic
- **Data Format:** JSON object or number
- **Fields:**
  - `level` - Water level percentage (0-100)
- **Note:** Fallback topic if `home/sensors/water-level` not available

---

### **4. Appliance/Device Topics**

#### `home/sensors/water-motor`
- **Purpose:** Water motor status (see above)
- **Status Values:** "on", "off", 1, 0, true, false

---

### **5. Fridge Detection Topics**

#### `fridge/inventory`
- **Purpose:** Fridge item detection from Python script
- **Data Format:** JSON object
- **Fields:**
  - `items` - Array of detected items
  - `timestamp` - Detection timestamp
- **Item Format:**
  ```json
  {
    "items": [
      {
        "name": "egg",
        "quantity": 12,
        "confidence": 0.95
      },
      {
        "name": "milk",
        "quantity": 1,
        "confidence": 0.92
      }
    ],
    "timestamp": "2025-11-28T03:30:00Z"
  }
  ```
- **Handler:** `handleFridgeDetection()`
- **Database:** Saves to `fridge_items` table

---

### **6. Face Recognition Topics**

#### `esp/cam`
- **Purpose:** Face recognition data from camera
- **Data Format:** JSON object
- **Fields:**
  - `name` - Detected person name
  - `confidence` - Confidence level (0-1)
  - `status` - "known" or "unknown"
  - `timestamp` - Detection timestamp
- **Example:**
  ```json
  {
    "name": "John",
    "confidence": 0.95,
    "status": "known",
    "timestamp": "2025-11-28T03:30:00Z"
  }
  ```
- **Handler:** `handleFaceRecognition()`
- **Database:** Saves to `face_recognition` and `known_persons` tables

---

## 📤 Published Topics (Backend to Hardware)

### `home/control`
- **Purpose:** Send control commands to hardware
- **Format:** `"device action"`
- **Examples:**
  - `"water-motor on"`
  - `"water-motor off"`
  - `"light on"`
  - `"fan off"`

---

### `device/water`
- **Purpose:** Water motor control
- **Commands:**
  - `"on"` - Turn on
  - `"off"` - Turn off
  - `"check_level"` - Request water level check

---

### `device/boot`
- **Purpose:** Device boot/restart commands
- **Commands:**
  - `"master boot"` - Restart master device
  - `"slave_1 boot"` - Restart slave 1
  - `"slave_2 boot"` - Restart slave 2

---

## 🔄 Socket.IO Events (Frontend Communication)

### Received by Frontend

| Event | Purpose | Data |
|-------|---------|------|
| `sensor_update` | Sensor data update | `{topic, data}` |
| `water_level` | Water level update | `{level, status, timestamp}` |
| `device_state_change` | Device state change | `{device, state, source, timestamp}` |
| `fridge_detection` | Fridge items detected | `{items, count, timestamp}` |
| `face_detected` | Face recognition | `{name, status, confidence, timestamp}` |
| `mqtt_published` | MQTT publish success | `{topic, message, timestamp}` |
| `mqtt_error` | MQTT publish error | `{topic, error}` |
| `notification` | System notification | `{type, message, timestamp}` |

---

### Sent by Frontend

| Event | Purpose | Data |
|-------|---------|------|
| `mqtt_publish` | Publish to MQTT | `{topic, message}` |

---

## 📊 Data Flow Diagram

```
Hardware (ESP32/Python)
    ↓
MQTT Broker
    ↓
Backend (server.js)
    ├→ Parse & Validate
    ├→ Save to Database
    ├→ Handle Special Topics
    └→ Broadcast via Socket.IO
        ↓
Frontend (React)
    ├→ Update UI
    ├→ Show Notifications
    └→ Display Real-time Data
```

---

## 🔌 Topic Subscription Code

```javascript
mqttClient.subscribe([
  'esp/sensors',              // Main sensor data
  'esp/status',               // Device status
  'esp/#',                    // All ESP topics
  'fridge/inventory',         // Fridge detection
  'esp/cam',                  // Face recognition
  'home/sensors/water-motor', // Water motor status
  'home/control'              // External control commands
]);
```

---

## 🛠️ Special Topic Handlers

### 1. **Water Motor** (`home/sensors/water-motor`)
- Broadcasts `device_state_change` event
- Updates dashboard in real-time
- Logs motor status changes

### 2. **Water Level** (`home/sensors/water-level` / `device/water/level`)
- Broadcasts `water_level` event
- Calculates status: "full" (>80%), "half" (40-80%), "low" (<40%)
- Updates frontend water indicator

### 3. **Fridge Detection** (`fridge/inventory`)
- Calls `handleFridgeDetection()`
- Saves items to database
- Broadcasts `fridge_detection` event
- Triggers notifications for new items and eggs

### 4. **Face Recognition** (`esp/cam`)
- Calls `handleFaceRecognition()`
- Saves to database
- Updates known persons list
- Broadcasts `face_detected` event

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Water level is normalized to 0-100%
- Confidence values are 0-1 (multiply by 100 for percentage)
- Debug topics and messages are filtered out for clean output
- All sensor data is broadcast to connected clients via Socket.IO
- Database saves only JSON object data, not simple strings

---

## 🔗 Related Files

- Backend: `d:\Documents\SMARTHOME\backend\server.js`
- Frontend: `d:\Documents\SMARTHOME\frontend-vite\src\App.jsx`
- Python Detection: `d:\Documents\SMARTHOME\python\features\fridge_detection_improved.py`
- Face Recognition: `d:\Documents\SMARTHOME\python\features\face_recognition.py`

---

**Last Updated:** Nov 28, 2025
**Version:** 1.0
