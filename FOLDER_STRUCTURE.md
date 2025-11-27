# 📁 Project Folder Structure

## Complete Project Organization

```
d:\Documents\SMARTHOME\
│
├── 📚 DOCUMENTATION (Root Level - Essential Only)
│   ├── README.md                    ← Main project documentation
│   ├── CLEANUP_SUMMARY.md           ← Cleanup report
│   └── FOLDER_STRUCTURE.md          ← This file
│
├── 🚀 STARTUP SCRIPTS (Root Level)
│   ├── START_PROJECT.bat            ← Start all services
│   ├── STOP_PROJECT.bat             ← Stop all services
│   ├── RUN_FRIDGE_DETECTION.bat     ← Run fridge detection
│   ├── RUN_FRIDGE_DETECTION.ps1     ← PowerShell version
│   └── install_python_deps.bat      ← Install Python packages
│
├── 🐍 PYTHON CONFIGURATION (Root Level)
│   └── requirements.txt              ← Python dependencies
│
├── 🤖 AI MODELS (Root Level)
│   ├── yolov8n.pt                   ← YOLO v8 nano model
│   └── yolov9c.pt                   ← YOLO v9 compact model
│
├── 📖 ORGANIZED DOCUMENTATION FOLDER
│   └── docs/
│       ├── README.md                ← Documentation index
│       │
│       ├── features/                ← Feature documentation
│       │   ├── FACE_RECOGNITION_SYSTEM.md
│       │   ├── FACE_RECOGNITION_GUIDE.md
│       │   ├── FRIDGE_DETECTION_DISPLAY.md
│       │   ├── FRIDGE_ITEM_DETECTION.md
│       │   ├── WATER_MOTOR_MQTT.md
│       │   └── ESP8266_COMPATIBILITY.md
│       │
│       ├── setup/                   ← Setup & installation
│       │   ├── RUN_FRIDGE_DETECTION.md
│       │   ├── STARTUP_GUIDE.md
│       │   ├── HOW_TO_RUN_PROJECT.md
│       │   └── QUICK_START.md
│       │
│       ├── guides/                  ← Implementation & testing
│       │   ├── IMPLEMENTATION_SUMMARY.md
│       │   ├── DASHBOARD_IMPROVEMENTS.md
│       │   ├── TESTING_CROSS_TAB_SYNC.md
│       │   └── TESTING_CHECKLIST.md
│       │
│       └── reference/               ← Quick reference
│           ├── QUICK_REFERENCE.md
│           ├── SYSTEM_OVERVIEW.md
│           └── FEATURES_OVERVIEW.md
│
├── 💻 BACKEND (Node.js + Express)
│   └── backend/
│       ├── server.js                ← Main server file
│       ├── package.json             ← Dependencies
│       ├── package-lock.json
│       ├── schema.sql               ← Database schema
│       ├── uploads/                 ← Uploaded files
│       │   └── fridge/              ← Fridge detection images
│       ├── routes/                  ← API routes
│       ├── middleware/              ← Express middleware
│       └── config/                  ← Configuration files
│
├── 🎨 FRONTEND (React + Vite)
│   ├── frontend-vite/               ← NEW: Vite version (ACTIVE)
│   │   ├── src/
│   │   │   ├── App.jsx              ← Main component
│   │   │   ├── main.jsx
│   │   │   ├── index.css            ← Global styles
│   │   │   └── components/
│   │   │       ├── HistoryPanel.jsx
│   │   │       ├── HistoryChart.jsx
│   │   │       ├── VoiceAssistant.jsx
│   │   │       ├── FaceRecognitionPanel.jsx
│   │   │       └── FaceRecognitionPanel.css
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── index.html
│   │
│   └── frontend/                    ← OLD: Create React App (Legacy)
│       ├── src/
│       ├── package.json
│       └── public/
│
├── 🐍 PYTHON SCRIPTS
│   └── python/
│       ├── features/
│       │   ├── fridge_detection.py  ← Main fridge detection script
│       │   ├── face_recognition.py  ← Face recognition script
│       │   └── mqtt_handler.py      ← MQTT utilities
│       ├── utils/
│       └── config/
│
├── 📸 FACE RECOGNITION DATA
│   ├── captured_faces/              ← Captured detection images
│   └── faces/                       ← Known person face images
│
├── 🔧 UTILITIES & SCRIPTS
│   ├── scripts/                     ← Utility scripts
│   └── tests/                       ← Test files
│
├── ⚙️ CONFIGURATION FILES
│   ├── .git/                        ← Git repository
│   ├── .gitignore                   ← Git ignore rules
│   ├── .vscode/                     ← VS Code settings
│   ├── .venv/                       ← Python virtual environment
│   └── .hintrc                      ← HTML hint configuration
```

---

## 📊 File Statistics

### Root Directory
```
Total Files: 20
├── Documentation: 3
├── Scripts: 5
├── Configuration: 1
├── Models: 2
└── Directories: 9
```

### Documentation (docs/)
```
Total Files: 17
├── features/: 6 files
├── setup/: 4 files
├── guides/: 4 files
└── reference/: 3 files
```

### Backend
```
Key Files:
├── server.js (Main server)
├── package.json (Dependencies)
├── schema.sql (Database)
└── uploads/fridge/ (Images)
```

### Frontend
```
Active: frontend-vite/
├── src/App.jsx (Main component)
├── src/index.css (Styles)
├── src/components/ (React components)
└── package.json (Dependencies)

Legacy: frontend/ (Old version)
```

### Python
```
Key Files:
├── fridge_detection.py (Main script)
├── face_recognition.py (Face detection)
└── mqtt_handler.py (MQTT utilities)
```

---

## 🎯 Quick Navigation

### To Access Documentation
```
docs/
├── Getting started? → docs/setup/QUICK_START.md
├── Face recognition? → docs/features/FACE_RECOGNITION_SYSTEM.md
├── Fridge detection? → docs/features/FRIDGE_DETECTION_DISPLAY.md
├── Water motor? → docs/features/WATER_MOTOR_MQTT.md
├── Testing? → docs/guides/TESTING_CHECKLIST.md
└── Quick reference? → docs/reference/QUICK_REFERENCE.md
```

### To Run Services
```
1. Start backend:
   cd backend && npm start

2. Start frontend:
   cd frontend-vite && npm run dev

3. Run fridge detection:
   python python/features/fridge_detection.py
   OR
   .\RUN_FRIDGE_DETECTION.bat
```

### To Access Code
```
Backend: backend/server.js
Frontend: frontend-vite/src/App.jsx
Python: python/features/fridge_detection.py
Database: backend/schema.sql
```

---

## 🔄 Data Flow

```
Camera/Sensors
    ↓
Python Scripts (python/features/)
    ├─ fridge_detection.py
    ├─ face_recognition.py
    └─ mqtt_handler.py
    ↓
MQTT Broker (broker-cn.emqx.io)
    ↓
Backend (backend/server.js)
    ├─ Receives MQTT messages
    ├─ Stores in database
    ├─ Serves images from uploads/fridge/
    └─ Broadcasts via Socket.IO
    ↓
Frontend (frontend-vite/src/)
    ├─ App.jsx (Main component)
    ├─ Components (Face, Fridge, etc.)
    └─ Displays real-time data
    ↓
Dashboard (http://localhost:3001)
```

---

## 📦 Directory Purposes

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `backend/` | Node.js API server | server.js, schema.sql |
| `frontend-vite/` | React UI (Vite) | App.jsx, components/ |
| `frontend/` | Old React UI | (Legacy, not used) |
| `python/` | Python scripts | fridge_detection.py |
| `docs/` | Documentation | 17 markdown files |
| `captured_faces/` | Detection images | Auto-generated |
| `faces/` | Known face images | Manual uploads |
| `scripts/` | Utility scripts | Helper functions |
| `tests/` | Test files | Testing utilities |
| `.venv/` | Python environment | Virtual environment |

---

## 🚀 Getting Started

### 1. First Time Setup
```bash
# Install Python dependencies
.\install_python_deps.bat

# Install Node dependencies
cd backend && npm install
cd ../frontend-vite && npm install
```

### 2. Start Services
```bash
# Option 1: Use batch file
.\START_PROJECT.bat

# Option 2: Manual (3 terminals)
# Terminal 1:
cd backend && npm start

# Terminal 2:
cd frontend-vite && npm run dev

# Terminal 3:
python python/features/fridge_detection.py
```

### 3. Access Dashboard
```
http://localhost:3001
```

---

## 📚 Documentation Quick Links

### Setup
- `docs/setup/QUICK_START.md` - Get started in 5 minutes
- `docs/setup/STARTUP_GUIDE.md` - Complete startup guide
- `docs/setup/HOW_TO_RUN_PROJECT.md` - Detailed instructions
- `docs/setup/RUN_FRIDGE_DETECTION.md` - Run fridge detection

### Features
- `docs/features/FACE_RECOGNITION_SYSTEM.md` - Face recognition
- `docs/features/FRIDGE_DETECTION_DISPLAY.md` - Fridge detection
- `docs/features/WATER_MOTOR_MQTT.md` - Water motor control
- `docs/features/ESP8266_COMPATIBILITY.md` - Hardware info

### Guides
- `docs/guides/IMPLEMENTATION_SUMMARY.md` - What's implemented
- `docs/guides/DASHBOARD_IMPROVEMENTS.md` - Dashboard changes
- `docs/guides/TESTING_CHECKLIST.md` - Testing procedures
- `docs/guides/TESTING_CROSS_TAB_SYNC.md` - Cross-tab testing

### Reference
- `docs/reference/QUICK_REFERENCE.md` - Quick commands
- `docs/reference/SYSTEM_OVERVIEW.md` - System architecture
- `docs/reference/FEATURES_OVERVIEW.md` - Feature list

---

## 🧹 Cleanup Summary

### Removed (13 files)
- Redundant documentation files
- Outdated guides
- Duplicate requirements files

### Organized (17 files)
- Moved to `docs/` folder
- Organized by category
- Easy to navigate

### Result
- ✅ Clean root directory (50% reduction)
- ✅ Professional structure
- ✅ Easy to maintain
- ✅ Better navigation

---

## 🔐 Important Files

### Configuration
- `.gitignore` - Git configuration
- `requirements.txt` - Python dependencies
- `backend/package.json` - Node dependencies
- `backend/schema.sql` - Database schema

### Startup
- `START_PROJECT.bat` - Start all services
- `STOP_PROJECT.bat` - Stop all services
- `RUN_FRIDGE_DETECTION.bat` - Run detection
- `install_python_deps.bat` - Install packages

### Models
- `yolov8n.pt` - YOLO v8 model (small)
- `yolov9c.pt` - YOLO v9 model (compact)

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Total Files | 100+ |
| Documentation Files | 17 |
| Backend Files | 20+ |
| Frontend Files | 30+ |
| Python Files | 10+ |
| Total Lines of Code | 5000+ |
| Total Documentation | 2000+ lines |

---

## ✅ Verification Checklist

- ✅ All documentation organized
- ✅ Redundant files removed
- ✅ Root directory clean
- ✅ Navigation clear
- ✅ All files accessible
- ✅ Git history preserved
- ✅ Project functional
- ✅ Professional structure

---

**Last Updated:** November 27, 2025  
**Status:** ✅ ORGANIZED & CLEAN  
**Commit:** `408b980`

🎉 **Project structure is now professional and well-organized!**
