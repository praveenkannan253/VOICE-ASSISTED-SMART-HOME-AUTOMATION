# Quick Reference Card

## 🚀 Start Application (2 Terminals)

**Terminal 1 - Backend:**
```bash
cd backend && npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend-vite && npm run dev
```

**Access:** `http://localhost:3001`

---

## ✨ Features

| Feature | Status | How to Test |
|---------|--------|------------|
| Appliance Toggle | ✅ | Click Fan/Light/Water Motor buttons |
| State Persistence | ✅ | Toggle device, refresh page → state persists |
| Cross-Tab Sync | ✅ | Open 2 tabs, toggle in Tab A → Tab B updates |
| Water Level | ✅ | Check indicator below Water Motor |
| Dark Theme | ✅ | All panels should be dark themed |
| Real-time Charts | ✅ | Look for LDR chart with live data |
| Fridge Images | ✅ | Upload image via curl, see in fridge panel |

---

## 🔧 API Endpoints

### Appliances
- `GET /api/devices` - Get device states
- `POST /api/control` - Toggle device

### Sensors
- `GET /api/sensors` - Get current sensor data
- `GET /api/sensors/history` - Get historical data

### Fridge
- `GET /api/fridge/inventory` - Get fridge items
- `POST /api/fridge/update` - Update fridge item
- `POST /api/fridge/upload-image` - Upload item image
- `GET /api/fridge/image/:filename` - Get item image

### Face Recognition
- `GET /api/face/recent` - Get recent detections
- `POST /api/face/add-person` - Add known person

---

## 📸 Upload Fridge Image

```bash
curl -X POST http://localhost:3000/api/fridge/upload-image \
  -F "image=@image.jpg" \
  -F "item=milk" \
  -F "quantity=2"
```

---

## 🔄 Socket.IO Events

### From Backend
- `sensor_update` - New sensor data
- `fridge_update` - Fridge item changed
- `device_state_change` - Device toggled
- `water_level` - Water level changed

### From Frontend
- None (frontend only listens)

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `frontend-vite/src/App.jsx` | Main React app |
| `backend/server.js` | Express API |
| `backend/uploads/fridge/` | Uploaded images |
| `frontend-vite/src/index.css` | Global styles |

---

## 🐛 Debug Console

**Backend Logs:**
```
🔌 New Socket.IO client connected: abc123
📡 Broadcasting device_state_change to all clients
📸 Fridge image uploaded: milk -> /uploads/fridge/...
```

**Frontend Logs:**
```
Sending command: fan -> on
🔄 Device state change broadcast received
✅ Updated device state
```

---

## 🔄 Git Commands

```bash
# View status
git status

# View backup branch
git branch -a

# Switch to backup
git checkout backup-before-vite-migration

# Switch back to main
git checkout main

# View recent commits
git log --oneline -10

# Push changes
git push origin main
```

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Backend won't start | Check port 3000 is free, run `npm install` |
| Frontend blank | Hard refresh (Ctrl+F5), clear cache |
| Charts not showing | Check Chart.js in Network tab, reload page |
| Cross-tab sync not working | Check Socket.IO in console, restart backend |
| Image upload fails | Check file size < 5MB, file is image format |
| Dark theme broken | Clear cache, check CSS file loaded |

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│  http://localhost:3001                  │
└──────────────────┬──────────────────────┘
                   │ Socket.IO
                   │ HTTP
                   ▼
┌─────────────────────────────────────────┐
│      Backend (Express + Socket.IO)      │
│  http://localhost:3000                  │
└──────────────────┬──────────────────────┘
         │                    │
         │ MQTT               │ MySQL
         ▼                    ▼
    ┌─────────┐          ┌─────────┐
    │   IoT   │          │Database │
    │ Devices │          │ Storage │
    └─────────┘          └─────────┘
```

---

## 📚 Documentation

- `QUICK_START.md` - Getting started
- `CHANGES_SUMMARY.md` - What changed
- `TESTING_CROSS_TAB_SYNC.md` - Testing guide
- `FRIDGE_IMAGE_USAGE.md` - Image upload guide
- `FINAL_SUMMARY.md` - Complete overview

---

## 🎯 Next Steps

1. ✅ Start backend & frontend
2. ✅ Test appliance toggles
3. ✅ Test cross-tab sync (open 2 tabs)
4. ✅ Upload fridge image (use curl)
5. ✅ Check all features working

---

## 📞 Support

**GitHub:** https://github.com/praveenkannan253/VOICE-ASSISTED-SMART-HOME-AUTOMATION

**Latest Commit:** `331ebdc`

**Status:** ✅ Production Ready

---

**Last Updated:** November 27, 2025
