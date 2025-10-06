@echo off
echo Setting up Face Recognition Entry Detection System...
echo.

echo Installing Python requirements...
pip install -r face_recognition_requirements.txt

echo.
echo Creating directories...
if not exist "faces" mkdir faces
if not exist "captured_faces" mkdir captured_faces

echo.
echo Setup completed!
echo.
echo Next steps:
echo 1. Add face images to the 'faces' folder
echo 2. Run: python create_face_encodings.py
echo 3. Run: python face_recognition_entry_local.py
echo 4. Start your backend and frontend servers
echo.
pause
