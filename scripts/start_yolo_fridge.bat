@echo off
echo ========================================
echo   YOLO Fridge Detection System
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [INFO] Checking dependencies...
echo.

REM Check if ultralytics is installed
python -c "import ultralytics" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] ultralytics not found. Installing...
    pip install ultralytics
    echo.
)

REM Check if opencv is installed
python -c "import cv2" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] opencv-python not found. Installing...
    pip install opencv-python
    echo.
)

echo [INFO] All dependencies ready!
echo.
echo ========================================
echo   Starting YOLO Fridge Detection
echo ========================================
echo.
echo Instructions:
echo   1. Show items to the camera
echo   2. Press 's' to scan and detect
echo   3. Press 'q' to quit
echo.
echo ========================================
echo.

REM Start YOLO detection
cd /d "%~dp0\.."
python python/features/yolo_fridge_detection.py

pause
