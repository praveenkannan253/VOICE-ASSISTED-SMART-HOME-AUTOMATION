# 🧊 Real-time Fridge Detection System - Setup Guide

## 🎯 What It Does

- **Opens your PC camera** to detect items
- **Recognizes** milk, fruits, vegetables automatically
- **Updates dashboard** in real-time
- **Sends alerts** when items go below threshold
- **No manual entry** needed!

---

## 📋 Prerequisites

### 1. Install Python Packages
```bash
pip install opencv-python numpy requests
```

### 2. Ensure Backend is Running
```bash
cd backend
npm run demo
```

### 3. Ensure Frontend is Running
```bash
cd frontend
npm start
```

---

## 🚀 How to Run

### Step 1: Start the Fridge Detection System
```bash
cd d:\Documents\SMARTHOME
python python\features\realtime_fridge_detection.py
```

### Step 2: Use the Camera
1. **Camera window will open** showing live feed
2. **Show items to camera** (milk bottle, banana, apple, orange, etc.)
3. **Press 's'** to scan and detect items
4. **Items are automatically** sent to dashboard
5. **Press 'q'** to quit

---

## 🎨 Detection Features

### Supported Items:
- 🍌 **Banana** (yellow color detection)
- 🍎 **Apple** (red color detection)
- 🍊 **Orange** (orange color detection)
- 🥛 **Milk** (white color detection)
- 🍅 **Tomato** (red color detection)
- 🥕 **Carrot** (orange color detection)
- 🥚 **Egg** (white color detection)
- 🍞 **Bread** (brown color detection)
- 🧀 **Cheese** (yellow color detection)

### Threshold Alerts:
```python
THRESHOLDS = {
    "milk": 1,      # Alert when ≤ 1
    "banana": 2,    # Alert when ≤ 2
    "orange": 2,
    "apple": 3,
    "tomato": 2,
    "carrot": 3,
    "egg": 6,
    "bread": 1,
    "cheese": 1,
    "yogurt": 2
}
```

---

## 📊 How It Works

### 1. Camera Detection
```
Camera Feed → Color Detection → Item Recognition → Count Items
```

### 2. Backend Update
```
Python Script → POST /api/fridge/update → Database → Socket.IO Broadcast
```

### 3. Dashboard Update
```
Socket.IO Event → Frontend Receives → UI Updates → Shows Alert if Low
```

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| **s** | Scan for items |
| **q** | Quit program |

---

## 📸 Camera Window Display

```
┌─────────────────────────────────────┐
│ 🧊 Fridge Detection System          │
│ Time: 22:57:45                      │
│                                     │
│ Detected Items:                     │
│ • Banana: 2                         │
│ • Apple: 3                          │
│ • Milk: 1 ⚠️ (LOW STOCK)            │
│                                     │
│ [Live Camera Feed]                  │
│                                     │
│ Press 'q' to quit | Press 's' scan │
└─────────────────────────────────────┘
```

---

## 🚨 Alert System

### When Item Goes Below Threshold:
1. **Console shows**: `⚠️ LOW STOCK: Milk (1 left, threshold: 1)`
2. **Dashboard shows**: Red badge or notification
3. **Real-time update**: No refresh needed

---

## 🔧 Customization

### Change Thresholds
Edit `python/features/realtime_fridge_detection.py`:
```python
THRESHOLDS = {
    "milk": 2,      # Change to 2
    "banana": 5,    # Change to 5
    # Add more items...
}
```

### Change Detection Interval
```python
DETECTION_INTERVAL = 10  # Scan every 10 seconds
```

### Add New Items
```python
FOOD_ITEMS = {
    "watermelon": ["watermelon"],
    "grapes": ["grapes", "grape"],
    # Add more...
}
```

---

## 🎯 Usage Example

### Scenario 1: Adding Items
```
1. Open camera
2. Show banana to camera
3. Press 's' to scan
4. Console: "✅ Updated banana: 1"
5. Dashboard updates automatically
```

### Scenario 2: Low Stock Alert
```
1. Milk quantity = 1 (threshold = 1)
2. Camera detects: Milk: 1
3. Console: "⚠️ LOW STOCK: Milk (1 left)"
4. Dashboard shows alert
```

---

## 🐛 Troubleshooting

### Camera Not Opening
```bash
# Try different camera index
CAMERA_INDEX = 1  # Change in script
```

### Items Not Detected
- **Ensure good lighting**
- **Hold item steady** for 2-3 seconds
- **Try different angles**
- **Adjust color thresholds** in script

### Backend Not Updating
- **Check backend is running** on port 3000
- **Check network connection**
- **Verify API endpoint**: http://localhost:3000/api/fridge/update

---

## 🎓 For Your Teacher Presentation

### Demo Flow:
1. **Start backend** (clean output)
2. **Start frontend** (dashboard visible)
3. **Start fridge detection** (camera opens)
4. **Show banana** → Press 's' → Dashboard updates
5. **Show milk** → Press 's' → Low stock alert
6. **Explain**: "Real-time detection with automatic inventory management"

### Key Points to Highlight:
- ✅ **No manual entry** - Camera does everything
- ✅ **Real-time updates** - Instant dashboard refresh
- ✅ **Smart alerts** - Automatic low stock warnings
- ✅ **IoT integration** - Camera → Backend → Dashboard
- ✅ **Practical application** - Real-world fridge management

---

## 📈 Future Enhancements

1. **Use YOLO/TensorFlow** for better accuracy
2. **Add expiry date tracking**
3. **Generate shopping lists** automatically
4. **Mobile notifications** for alerts
5. **Barcode scanning** for packaged items

---

## ✅ Quick Start Checklist

- [ ] Install opencv-python, numpy, requests
- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001
- [ ] Database has fridge_items table
- [ ] Camera is connected and working
- [ ] Run: `python python\features\realtime_fridge_detection.py`
- [ ] Press 's' to scan items
- [ ] Check dashboard for updates

---

**🎉 Your smart fridge is now live!**
