@echo off
echo Quick Face Detection Setup
echo ==========================

echo Installing lightweight packages...
pip install opencv-python --timeout 60
pip install paho-mqtt --timeout 60
pip install numpy --timeout 60

echo.
echo Creating directories...
if not exist "faces" mkdir faces
if not exist "captured_faces" mkdir captured_faces

echo.
echo Setup completed!
echo.
echo To test the system:
echo 1. Start backend: cd backend && node server.js
echo 2. Start frontend: cd frontend && npm start  
echo 3. Start face detection: python face_recognition_simple.py
echo 4. Send test data: python continuous_test_data.py
echo.
pause
