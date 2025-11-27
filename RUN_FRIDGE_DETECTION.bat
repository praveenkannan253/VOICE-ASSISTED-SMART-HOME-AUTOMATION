@echo off
REM Run Fridge Detection System using virtual environment Python

echo.
echo ============================================
echo Starting Fridge Detection System
echo ============================================
echo.

echo Running: python fridge_detection.py
echo.
echo Press Ctrl+C to stop
echo.

REM Use full path to virtual environment Python
d:\Documents\SMARTHOME\.venv\Scripts\python.exe d:\Documents\SMARTHOME\python\features\fridge_detection.py

pause
