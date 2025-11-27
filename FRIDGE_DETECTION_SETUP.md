# Fridge Detection Setup Guide

## Issue: SSL Certificate Verification Failed

### Problem
When trying to run the fridge detection script, you get:
```
ModuleNotFoundError: No module named 'cv2'
```

When trying to install opencv-python, you get:
```
ssl.SSLCertVerificationError: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed
```

### Root Cause
Your Python environment (MSYS64) has SSL certificate verification issues preventing pip from downloading packages from PyPI.

---

## Solution Options

### Option 1: Use Pre-built Wheel (Recommended)
Download opencv-python wheel directly and install offline:

1. Download from: https://pypi.org/project/opencv-python/
2. Choose the correct wheel for your Python version (e.g., `opencv_python-4.12.0.88-cp311-cp311-win_amd64.whl`)
3. Place in `d:\Documents\SMARTHOME\`
4. Install: `pip install opencv_python-4.12.0.88-cp311-cp311-win_amd64.whl`

### Option 2: Fix SSL Certificate (Advanced)
Update Python's SSL certificates:

```powershell
# In PowerShell as Administrator
python -m pip install --upgrade certifi
```

Then run:
```powershell
# Run Python's certificate installer
python -m certifi
```

### Option 3: Bypass SSL Verification (Not Recommended)
```powershell
pip install --trusted-host pypi.python.org --trusted-host pypi.org --trusted-host files.pythonhosted.org opencv-python
```

### Option 4: Use Conda Instead of Pip
If you have Anaconda/Miniconda installed:
```bash
conda install opencv pillow numpy
```

---

## Required Dependencies for Fridge Detection

The fridge detection script requires:
- **opencv-python** (cv2) - Image processing
- **pillow** - Image handling
- **numpy** - Numerical operations
- **yolov8** - Object detection (already in requirements.txt)

---

## Testing After Installation

Once dependencies are installed, test with:

```bash
cd d:\Documents\SMARTHOME\python\features
python fridge_detection.py
```

---

## Alternative: Use Backend API

Instead of running fridge detection locally, you can:

1. **Use the backend API endpoint:**
   - POST `/api/fridge/detect` - Detects items from uploaded image
   - GET `/api/fridge/items` - Gets detected items
   - POST `/api/fridge/update` - Updates item quantity

2. **The backend handles:**
   - YOLO object detection
   - Image processing
   - Database storage
   - Real-time updates via Socket.IO

---

## Quick Fix Checklist

- [ ] Check Python version: `python --version`
- [ ] Check pip version: `pip --version`
- [ ] Try Option 1 (Pre-built wheel)
- [ ] If that fails, try Option 2 (Fix SSL)
- [ ] If still failing, use Option 4 (Conda)
- [ ] Test with: `python -c "import cv2; print(cv2.__version__)"`

---

## Support

If you continue to have issues:
1. Check your internet connection
2. Try from a different network (corporate firewalls often block PyPI)
3. Use a VPN if behind a corporate proxy
4. Consider using Docker for isolated Python environment

