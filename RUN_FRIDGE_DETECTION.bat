@echo off
REM Run Fridge Detection System

echo.
echo ============================================
echo Starting Fridge Detection System
echo ============================================
echo.

REM Activate virtual environment
call d:\Documents\SMARTHOME\.venv\Scripts\activate.bat

cd /d d:\Documents\SMARTHOME\python\features

echo Running: python fridge_detection.py
echo.
echo Press Ctrl+C to stop
echo.

python fridge_detection.py

pause
