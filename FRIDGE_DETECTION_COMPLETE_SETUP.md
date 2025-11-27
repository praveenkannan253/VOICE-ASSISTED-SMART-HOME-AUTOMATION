# Fridge Detection - Complete Setup & Troubleshooting

## 🎯 Problem Summary

The fridge detection Python file requires OpenCV (cv2), but SSL certificate issues prevent installation in MSYS64 environment.

---

## ✅ Solution: Use Backend API (Recommended)

The backend already has fridge detection built-in! You don't need to run the Python script separately.

### **How It Works:**

1. **Upload Image** → Frontend sends image to backend
2. **Backend Detects** → Uses YOLO model to detect items
3. **Database Stores** → Saves detected items with images
4. **Dashboard Shows** → Real-time display with images

---

## 🚀 Step-by-Step Setup

### **Step 1: Start Backend**

```powershell
cd backend
npm install  # if not done
npm start
```

You should see:
```
✅ Server running on port 3000
✅ Connected to MQTT broker
✅ Database connected
```

### **Step 2: Start Frontend**

In a new terminal:
```powershell
cd frontend-vite
npm install  # if not done
npm run dev
```

You should see:
```
✅ Local: http://localhost:3001
```

### **Step 3: Open Dashboard**

Open browser: `http://localhost:3001`

### **Step 4: Upload Fridge Image**

1. Go to Fridge Inventory section
2. Click "Upload Image" button
3. Select image with fridge items (eggs, milk, etc.)
4. Backend detects items automatically
5. Results appear with images in dashboard

---

## 📊 Backend Fridge Detection Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/fridge/inventory` | GET | Get all detected items |
| `/api/fridge/update` | POST | Update item quantity |
| `/api/fridge/upload-image` | POST | Upload & detect items |
| `/api/fridge/image/:filename` | GET | Get item image |

---

## 🔧 If You Need Python Script (Advanced)

### **Option A: Fix SSL Certificate**

```powershell
# Activate venv
& .\.venv\Scripts\Activate.ps1

# Fix SSL
python -m pip install --upgrade certifi
python -m certifi

# Install OpenCV
pip install opencv-python pillow numpy

# Run script
python python\features\fridge_detection.py
```

### **Option B: Use Alternative Mirror**

```powershell
# Activate venv
& .\.venv\Scripts\Activate.ps1

# Install with mirror
pip install -i https://mirrors.aliyun.com/pypi/simple/ opencv-python pillow numpy

# Run script
python python\features\fridge_detection.py
```

### **Option C: Use Conda**

```bash
conda activate your_env
conda install opencv pillow numpy
python python\features\fridge_detection.py
```

---

## 🖼️ Fridge Detection Image Display

### **What Gets Displayed:**

- ✅ Detected item name (e.g., "Eggs")
- ✅ Confidence score (e.g., "95%")
- ✅ Thumbnail image of detected item
- ✅ Quantity counter
- ✅ Last updated time

### **Example Display:**

```
🥚 Eggs
├─ Confidence: 95%
├─ Quantity: 12
├─ Image: [thumbnail]
└─ Updated: 2 hours ago
```

---

## 📁 File Structure

```
backend/
├── server.js              # Main server with fridge endpoints
├── db.js                  # Database connection
└── uploads/
    └── fridge/            # Stored fridge item images

frontend-vite/
├── src/
│   ├── App.jsx            # Main dashboard
│   └── components/
│       └── FridgePanel.jsx # Fridge display component

python/
├── features/
│   └── fridge_detection.py # Standalone detection (optional)
└── core/
    └── esp32_command_receiver.py
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001
- [ ] Dashboard accessible at http://localhost:3001
- [ ] Can upload images
- [ ] Detected items appear in dashboard
- [ ] Images display with captions
- [ ] Quantity can be updated

---

## 🆘 Troubleshooting

### **Q: "Cannot GET /api/fridge/inventory"**
A: Backend not running. Run `npm start` in backend folder.

### **Q: Images not showing**
A: Check uploads folder exists: `backend/uploads/fridge/`

### **Q: Detection not working**
A: Check YOLO model exists: `yolov9c.pt` in root directory

### **Q: Python script SSL error**
A: Use Option B (mirror) or Option C (Conda)

### **Q: Database connection error**
A: Check MySQL is running and credentials are correct

---

## 🎯 Recommended Workflow

1. **Use Backend API** (easiest, no setup)
2. **Upload images** via dashboard
3. **View results** with images
4. **Update quantities** as needed
5. **Only use Python script** if you need standalone detection

---

## 📝 Notes

- Backend handles all YOLO detection
- Images stored in `backend/uploads/fridge/`
- Database tracks all items
- Real-time updates via Socket.IO
- No need to run Python script separately

---

## 🚀 Quick Test

```powershell
# Test backend
curl http://localhost:3000/api/fridge/inventory

# Expected response:
# [{"item":"eggs","quantity":12,"image_path":"fridge_123_eggs.jpg"}]
```

