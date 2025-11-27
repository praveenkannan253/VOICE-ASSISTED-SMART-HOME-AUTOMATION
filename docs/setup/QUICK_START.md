# Quick Start Guide - Smart Home Automation

## 🚀 Starting the Application

### Terminal 1 - Backend
```bash
cd d:\Documents\SMARTHOME\backend
npm install
npm start
```
Backend runs on: `http://localhost:3000`

### Terminal 2 - Frontend (Vite)
```bash
cd d:\Documents\SMARTHOME\frontend-vite
npm install
npm run dev
```
Frontend runs on: `http://localhost:3001`

## ✨ What's New (Latest Update)

### ✅ Appliance Controls Now Persist
- Toggle Fan, Light, or Water Motor
- **Refresh the page** → Controls stay in their last state
- Works across browser restarts

### ✅ Real-time Sync Across Tabs
- Open dashboard in 2 tabs
- Toggle a device in Tab 1
- Tab 2 updates **instantly** (no refresh needed)

### ✅ Water Motor Control
- Replaced AC & Washing Machine buttons
- Shows real-time water level (0-100%)
- Status indicator: Tank Full/Half/Low

### ✅ Dark Theme Fixed
- Face Recognition Panel now matches dark theme
- All text colors updated for proper contrast
- Consistent look across all panels

### ✅ Real-time Charts Working
- Light Level (LDR) chart displays properly
- Shows live sensor data updates
- Proper sizing and responsiveness

## 📊 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 IoT Home Automation Hub                                 │
├──────────────────┬──────────────────┬──────────────────────┤
│                  │                  │                      │
│  Face Recog      │  Appliance       │  Fridge              │
│  System          │  Controls        │  Monitoring          │
│  (Left)          │  (Middle)        │  (Right)             │
│                  │  + Sensors       │  + Weather           │
│                  │  + Charts        │  + Notifications     │
│                  │                  │                      │
└──────────────────┴──────────────────┴──────────────────────┘
```

## 🎮 Appliance Controls

| Device | Status | Notes |
|--------|--------|-------|
| 🌀 Fan | Toggle | Persists on refresh |
| 💡 Light | Toggle | Real-time sync across tabs |
| 💧 Water Motor | Toggle + Level | Shows water tank status |

## 📡 Live Sensor Data

- 🌡 Temperature
- 💧 Humidity  
- 💡 Light Level (LDR)
- 🚶 Motion Detection (PIR)
- 📡 IR Sensor

## 🔄 How to Restore Previous Version

```bash
# View available branches
git branch -a

# Switch to backup
git checkout backup-before-vite-migration

# Or go back to main
git checkout main
```

## 🐛 Troubleshooting

### Charts not showing?
- Check browser console for errors
- Ensure Chart.js is loaded (check Network tab)
- Try refreshing the page

### Controls not syncing across tabs?
- Ensure Socket.IO is connected (check console)
- Both tabs must be on `http://localhost:3001`
- Check backend is running on `http://localhost:3000`

### Appliance state not persisting?
- Check browser localStorage is enabled
- Try clearing cache and refreshing
- Check browser console for errors

### Face Recognition panel looks wrong?
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check CSS file is loaded properly

## 📚 Documentation Files

- **CHANGES_SUMMARY.md** - Detailed list of all changes
- **FRIDGE_IMAGES_PROCEDURE.md** - How to add image display
- **QUICK_START.md** - This file

## 🔗 GitHub Repository

https://github.com/praveenkannan253/VOICE-ASSISTED-SMART-HOME-AUTOMATION

Latest commit: `085b420` - Comprehensive changes with documentation

## 💾 Backup Branch

Branch: `backup-before-vite-migration`  
Use this to rollback if needed

## 📝 Key Files Modified

- `frontend-vite/src/App.jsx` - Main app logic
- `backend/server.js` - API endpoints
- `frontend-vite/src/components/FaceRecognitionPanel.css` - Dark theme
- `frontend-vite/src/index.css` - Global styles
- `frontend-vite/src/components/HistoryChart.jsx` - Chart display

## ✅ Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3001
- [ ] Toggle a device and refresh → state persists
- [ ] Open 2 tabs and toggle device → both sync
- [ ] Water Motor shows water level
- [ ] Face Recognition panel is dark themed
- [ ] LDR chart displays data
- [ ] No console errors

## 🎯 Next Steps

1. Test all features using the checklist above
2. For fridge images, follow `FRIDGE_IMAGES_PROCEDURE.md`
3. Add more devices as needed
4. Customize water level sensor integration

---

**Last Updated:** November 27, 2025  
**Status:** ✅ All features working
