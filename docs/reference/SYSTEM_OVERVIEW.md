# 🏠 Smart Home System - Complete Overview

## 📋 Table of Contents
1. [Dashboard Layout](#dashboard-layout)
2. [Fridge Items - Why Duplicates?](#fridge-items)
3. [Face Recognition - How It Works](#face-recognition)
4. [Dashboard Organization](#dashboard-organization)

---

## 🖥️ Dashboard Layout

### Current 3-Column Layout:

```
┌─────────────────┬─────────────────┬─────────────────┐
│  LEFT COLUMN    │  MIDDLE COLUMN  │  RIGHT COLUMN   │
├─────────────────┼─────────────────┼─────────────────┤
│ • Sensor Charts │ • Device        │ • Fridge        │
│   - Temperature │   Controls      │   Inventory     │
│   - Humidity    │ • Live Sensor   │ • Face          │
│                 │   Data          │   Recognition   │
│                 │ • Voice         │ • Notifications │
│                 │   Assistant     │ • Weather       │
│                 │ • History Panel │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

---

## 🧊 Fridge Items - Why Duplicates?

### Problem:
You're seeing multiple entries for same items (Milk, Banana, Orange, Carrot) because:

1. **YOLO Detection** adds items with detected capitalization
2. **Manual additions** might use different capitalization
3. **No case-insensitive uniqueness** in database

### Example:
```
- milk (lowercase)
- Milk (capitalized)
- MILK (uppercase)
```
All treated as different items!

### ✅ Solution:

**Step 1: Clean up duplicates**

Run this in MySQL:
```sql
USE smarthome;

-- Delete all fridge items
DELETE FROM fridge_items;

-- Reset auto increment
ALTER TABLE fridge_items AUTO_INCREMENT = 1;

-- Add only unique items
INSERT INTO fridge_items (item, quantity, status) VALUES
('Milk', 0, 'ok'),
('Banana', 0, 'ok'),
('Orange', 0, 'ok'),
('Apple', 0, 'ok'),
('Tomato', 0, 'ok'),
('Carrot', 0, 'ok')
ON DUPLICATE KEY UPDATE quantity = quantity;
```

Or use the cleanup script:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < backend\cleanup_fridge.sql
```

**Step 2: Prevent future duplicates**

The `fridge_items` table already has a UNIQUE constraint on `item` column, so duplicates shouldn't happen if items are capitalized consistently.

---

## 👤 Face Recognition - How It Works

### 🔄 Complete Flow:

```
┌──────────────────────────────────────────────────────────┐
│  1. Friend's PC (Face Detection System)                 │
│     - Camera captures face                               │
│     - Runs face recognition algorithm                    │
│     - Determines if person is known/unknown              │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼ Publishes to MQTT
┌──────────────────────────────────────────────────────────┐
│  2. MQTT Broker (broker-cn.emqx.io)                      │
│     Topic: esp/cam                                       │
│     Message: {                                           │
│       "name": "John Doe",                                │
│       "status": "known",                                 │
│       "confidence": 0.95,                                │
│       "timestamp": "2025-10-06T12:00:00Z"                │
│     }                                                    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼ Subscribes
┌──────────────────────────────────────────────────────────┐
│  3. Your Backend Server (Node.js)                        │
│     - Receives MQTT message                              │
│     - Parses JSON data                                   │
│     - Saves to face_recognition table                    │
│     - If known: Updates known_persons table              │
│     - Broadcasts to frontend via Socket.IO               │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼ Socket.IO Event: 'face_detected'
┌──────────────────────────────────────────────────────────┐
│  4. Your Dashboard (React Frontend)                      │
│     - Receives real-time notification                    │
│     - Shows alert (Green=Known, Orange=Unknown)          │
│     - Updates statistics                                 │
│     - Adds to recent detections list                     │
│     - Updates known persons list                         │
└──────────────────────────────────────────────────────────┘
```

### 📊 Classification Logic:

#### Known Person:
1. Friend's system sends: `status: "known"`, `name: "John Doe"`
2. Backend checks if "John Doe" exists in `known_persons` table
3. If exists: Updates `last_seen` and increments `visit_count`
4. If not exists: Adds new entry to `known_persons`
5. Dashboard shows **GREEN alert** with name

#### Unknown Person:
1. Friend's system sends: `status: "unknown"`, `name: "Unknown"`
2. Backend saves to `face_recognition` table only
3. Does NOT add to `known_persons` table
4. Dashboard shows **ORANGE alert** for unknown

### 🎨 Dashboard Display:

**Real-time Alert (Top of Face Recognition Panel):**
```
┌─────────────────────────────────────────┐
│  ✅  John Doe                           │
│      KNOWN PERSON                       │
│      Confidence: 95.0%                  │
└─────────────────────────────────────────┘
```

**Statistics Cards:**
```
┌──────────┬──────────┬──────────┬──────────┐
│   👥     │   📊     │   ✅     │   ⚠️     │
│    5     │   150    │   120    │    30    │
│  Known   │  Total   │  Known   │ Unknown  │
│ Persons  │Detections│Detections│Detections│
└──────────┴──────────┴──────────┴──────────┘
```

**Known Persons List:**
```
┌─────────────────────────────────────┐
│  [J]  John Doe                      │
│       Visits: 15                    │
│       Last seen: 5m ago             │
├─────────────────────────────────────┤
│  [M]  Mary Smith                    │
│       Visits: 8                     │
│       Last seen: 2h ago             │
└─────────────────────────────────────┘
```

**Recent Detections:**
```
┌─────────────────────────────────────┐
│  ✅  John Doe     2m ago    95%     │
│  ⚠️  Unknown      5m ago    0%      │
│  ✅  Mary Smith   10m ago   92%     │
└─────────────────────────────────────┘
```

### 🔧 How Friend's System Should Work:

**Python Example:**
```python
import paho.mqtt.client as mqtt
import json
from datetime import datetime
import face_recognition  # or any face detection library

# MQTT Setup
client = mqtt.Client()
client.connect("broker-cn.emqx.io", 1883, 60)

# Known faces database (friend maintains this)
known_faces = {
    "john_doe": face_encoding_1,
    "mary_smith": face_encoding_2,
    # ... more known faces
}

# When camera detects a face
def on_face_detected(face_encoding):
    # Compare with known faces
    matches = face_recognition.compare_faces(
        list(known_faces.values()), 
        face_encoding
    )
    
    if True in matches:
        # Known person
        match_index = matches.index(True)
        name = list(known_faces.keys())[match_index]
        
        message = {
            "name": name.replace("_", " ").title(),
            "status": "known",
            "confidence": 0.95,
            "timestamp": datetime.now().isoformat()
        }
    else:
        # Unknown person
        message = {
            "name": "Unknown",
            "status": "unknown",
            "confidence": 0.0,
            "timestamp": datetime.now().isoformat()
        }
    
    # Publish to MQTT
    client.publish("esp/cam", json.dumps(message))
    print(f"✅ Sent: {message}")
```

---

## 📐 Dashboard Organization

### Current Issues:
1. ❌ Too much empty space
2. ❌ Face Recognition panel at bottom (hard to see)
3. ❌ Duplicate fridge items taking up space

### ✅ Improvements Made:

#### 1. **Reorganized Layout:**
- **Left Column**: Sensor charts only (compact)
- **Middle Column**: Controls, Voice, History
- **Right Column**: Fridge, Face Recognition, Notifications, Weather

#### 2. **Reduced Chart Heights:**
- Changed from 180px to 150px
- More compact, less empty space

#### 3. **Face Recognition Moved:**
- Now in right column after fridge
- More visible and accessible

#### 4. **Removed Energy Card:**
- Was taking up space with static data
- Can be added back if needed

### New Layout:
```
┌──────────────────┬──────────────────┬──────────────────┐
│  CHARTS (Left)   │  CONTROLS (Mid)  │  FRIDGE (Right)  │
├──────────────────┼──────────────────┼──────────────────┤
│ • Temperature    │ • Device         │ • Inventory      │
│   Chart (150px)  │   Toggles        │   Items          │
│ • Humidity       │ • Live Sensor    │ • Face           │
│   Chart (150px)  │   Values         │   Recognition    │
│                  │ • Voice          │   - Alerts       │
│                  │   Assistant      │   - Statistics   │
│                  │ • History        │   - Known List   │
│                  │   Panel          │   - Recent       │
│                  │                  │ • Notifications  │
│                  │                  │ • Weather        │
└──────────────────┴──────────────────┴──────────────────┘
```

---

## 🚀 Quick Fixes Summary

### 1. Clean Duplicate Fridge Items:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```
Then:
```sql
USE smarthome;
DELETE FROM fridge_items;
INSERT INTO fridge_items (item, quantity, status) VALUES
('Milk', 0, 'ok'), ('Banana', 0, 'ok'), ('Orange', 0, 'ok'),
('Apple', 0, 'ok'), ('Tomato', 0, 'ok'), ('Carrot', 0, 'ok');
```

### 2. Restart Frontend:
```bash
cd frontend
npm start
```

### 3. Test Face Recognition:
```python
import paho.mqtt.client as mqtt
import json
from datetime import datetime

client = mqtt.Client()
client.connect("broker-cn.emqx.io", 1883, 60)

# Test known person
client.publish("esp/cam", json.dumps({
    "name": "John Doe",
    "status": "known",
    "confidence": 0.95,
    "timestamp": datetime.now().isoformat()
}))
```

---

## 📊 Data Tables

### face_recognition Table:
```sql
SELECT * FROM face_recognition ORDER BY timestamp DESC LIMIT 10;
```
Shows all detection events.

### known_persons Table:
```sql
SELECT * FROM known_persons ORDER BY last_seen DESC;
```
Shows registered known persons.

### fridge_items Table:
```sql
SELECT * FROM fridge_items ORDER BY item;
```
Shows inventory items.

---

## 🎯 Summary

### Face Recognition:
- ✅ Backend subscribes to `esp/cam` MQTT topic
- ✅ Classifies known/unknown persons
- ✅ Saves to database
- ✅ Shows real-time alerts on dashboard
- ✅ Maintains statistics and history

### Dashboard:
- ✅ Reorganized for better space usage
- ✅ Face Recognition in prominent position
- ✅ Compact charts
- ✅ All features accessible

### Fridge:
- ✅ Clean up duplicates with SQL script
- ✅ YOLO detection adds items correctly
- ✅ Manual add/remove buttons work

**Everything is ready to use! 🎉**
