# How to Run Fridge Detection

## Problem
The `fridge_detection.py` requires `cv2` (OpenCV), but SSL certificate issues prevent installation in MSYS64.

---

## Solution Options

### **Option A: Use Backend API (Recommended)** ⭐

The backend already has fridge detection endpoints! You don't need to run the Python script separately.

**Endpoints:**
- `POST /api/fridge/detect` - Upload image and detect items
- `GET /api/fridge/items` - Get detected items
- `POST /api/fridge/update` - Update item quantity

**How to use:**
1. Make sure backend is running: `npm start` (in backend folder)
2. Upload image via API or frontend
3. Backend handles YOLO detection automatically
4. Results appear in dashboard

**Advantages:**
- ✅ No SSL issues
- ✅ No separate Python environment
- ✅ Real-time updates via Socket.IO
- ✅ Already integrated with dashboard
- ✅ Database storage included

---

### **Option B: Fix SSL Certificate Issue**

**Step 1: Update Python SSL Certificates**
```powershell
# In PowerShell (with venv activated)
python -m pip install --upgrade certifi
```

**Step 2: Run the certificate installer**
```powershell
python -m certifi
```

**Step 3: Try installing OpenCV again**
```powershell
pip install opencv-python pillow numpy
```

**Step 4: Run fridge detection**
```powershell
python python\features\fridge_detection.py
```

---

### **Option C: Use Alternative PyPI Mirror**

If Option B doesn't work, use a mirror:

```powershell
pip install -i https://mirrors.aliyun.com/pypi/simple/ opencv-python pillow numpy
```

Then run:
```powershell
python python\features\fridge_detection.py
```

---

### **Option D: Use Conda (If Available)**

If you have Anaconda/Miniconda installed:

```bash
conda activate your_env_name
conda install opencv pillow numpy
python python\features\fridge_detection.py
```

---

## Recommended Workflow

### **For Development/Testing:**
1. Use **Option A** (Backend API)
2. Upload images via API
3. Check results in dashboard

### **For Production/Standalone:**
1. Try **Option B** (Fix SSL)
2. If fails, use **Option C** (Mirror)
3. If still fails, use **Option D** (Conda)

---

## Quick Test

### **Test Backend API:**
```bash
# Make sure backend is running
npm start  # in backend folder

# In another terminal, test the endpoint
curl -X GET http://localhost:3000/api/fridge/items
```

### **Test Python Script:**
```powershell
# Activate venv
& .\.venv\Scripts\Activate.ps1

# Run script
python python\features\fridge_detection.py
```

---

## Troubleshooting

### **If you see: `ModuleNotFoundError: No module named 'cv2'`**
- Run: `pip install opencv-python`
- If fails, use Option C (mirror)

### **If you see: `SSL: CERTIFICATE_VERIFY_FAILED`**
- Run: `python -m certifi`
- Then retry installation

### **If backend API doesn't work**
- Check backend is running: `npm start`
- Check port 3000 is accessible
- Check database connection

---

## File Locations

- **Fridge Detection Script:** `python/features/fridge_detection.py`
- **YOLO Model:** `yolov9c.pt` (in root directory)
- **Backend API:** `backend/server.js`
- **Frontend:** `frontend-vite/src/App.jsx`

---

## Next Steps

1. **Try Option A first** (use backend API)
2. **If you need standalone script**, try Option B or C
3. **Report any errors** for further troubleshooting

