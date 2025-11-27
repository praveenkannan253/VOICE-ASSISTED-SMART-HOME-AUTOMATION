# Quick Start: Fridge Detection

## 🚀 Fastest Way to Run Fridge Detection

### **Step 1: Activate Virtual Environment**
```powershell
& .\.venv\Scripts\Activate.ps1
```

You should see `(.venv)` in your terminal.

---

### **Step 2: Choose Your Method**

#### **Method 1: Use Backend API (Easiest)** ⭐⭐⭐

No installation needed! The backend already handles fridge detection.

```powershell
# Make sure backend is running
cd backend
npm start

# In another terminal, test it
curl http://localhost:3000/api/fridge/items
```

**Then upload images via the dashboard!**

---

#### **Method 2: Run Python Script (Requires OpenCV)**

**Install dependencies:**
```powershell
# Try with mirror (if SSL fails)
pip install -i https://mirrors.aliyun.com/pypi/simple/ opencv-python pillow numpy
```

**Run the script:**
```powershell
python python\features\fridge_detection.py
```

---

#### **Method 3: Fix SSL and Install Normally**

```powershell
# Fix SSL certificates
python -m pip install --upgrade certifi
python -m certifi

# Install OpenCV
pip install opencv-python pillow numpy

# Run script
python python\features\fridge_detection.py
```

---

## 📊 Comparison

| Method | Ease | Speed | Setup | Notes |
|--------|------|-------|-------|-------|
| Backend API | ⭐⭐⭐ | Fast | None | Recommended! |
| Python Script | ⭐ | Slow | Complex | Requires OpenCV |
| Fix SSL | ⭐⭐ | Medium | Moderate | May not work |

---

## ✅ Verify Installation

### **Check Python:**
```powershell
python --version
```

### **Check Pip:**
```powershell
pip --version
```

### **Check Virtual Environment:**
```powershell
# Should show (.venv) prefix
```

### **Check OpenCV (if installed):**
```powershell
python -c "import cv2; print(cv2.__version__)"
```

---

## 🎯 Recommended Path

1. **Use Backend API** (no setup needed)
2. **Upload images** via dashboard
3. **View results** in real-time
4. **If you need standalone**, try Method 2 or 3

---

## 📁 Important Files

- Backend: `backend/server.js`
- Fridge Detection: `python/features/fridge_detection.py`
- YOLO Model: `yolov9c.pt`
- Dashboard: `frontend-vite/src/App.jsx`

---

## 🆘 Troubleshooting

**Q: `ModuleNotFoundError: No module named 'cv2'`**
A: Use Method 2 or 3 to install OpenCV

**Q: `SSL: CERTIFICATE_VERIFY_FAILED`**
A: Use Method 3 to fix SSL certificates

**Q: Backend API not working**
A: Make sure `npm start` is running in backend folder

**Q: Virtual environment not activated**
A: Run: `& .\.venv\Scripts\Activate.ps1`

---

## 🎉 Success Indicators

✅ Virtual environment activated (see `(.venv)`)
✅ Backend running on port 3000
✅ Dashboard accessible at `http://localhost:3001`
✅ Can upload images and see detections

