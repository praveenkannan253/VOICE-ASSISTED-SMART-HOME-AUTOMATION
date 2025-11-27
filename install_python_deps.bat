@echo off
REM Install Python dependencies for Fridge Detection

echo.
echo ============================================
echo Installing Python Dependencies
echo ============================================
echo.

REM Upgrade pip first
echo [1/5] Upgrading pip...
python -m ensurepip --upgrade
python -m pip install --upgrade pip

REM Install dependencies
echo [2/5] Installing opencv-python...
python -m pip install opencv-python

echo [3/5] Installing ultralytics (YOLO)...
python -m pip install ultralytics

echo [4/5] Installing mysql-connector-python...
python -m pip install mysql-connector-python

echo [5/5] Installing paho-mqtt...
python -m pip install paho-mqtt

echo.
echo ============================================
echo Installation Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Run: python fridge_detection.py
echo 2. Open dashboard: http://localhost:3001
echo.
pause
