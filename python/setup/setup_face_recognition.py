#!/usr/bin/env python3
"""
Setup script for Face Recognition Entry Detection System
"""

import os
import subprocess
import sys

def install_requirements():
    """Install required Python packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "face_recognition_requirements.txt"])
        print("✅ Requirements installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    print("📁 Creating directories...")
    
    directories = ["faces", "captured_faces"]
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"✅ Created directory: {directory}")
        else:
            print(f"📁 Directory already exists: {directory}")

def create_sample_instructions():
    """Create instructions for adding face images"""
    instructions = """
# Face Recognition Setup Instructions

## Step 1: Add Face Images
1. Place face images in the 'faces' folder
2. Name the files with the person's name (e.g., John.jpg, Jane.png)
3. Use clear, front-facing photos for best results

## Step 2: Generate Face Encodings
Run: python create_face_encodings.py

## Step 3: Start Face Recognition
Run: python face_recognition_entry_local.py

## Step 4: Test the System
1. Start the backend server: cd backend && node server.js
2. Start the frontend: cd frontend && npm start
3. Send test data: python continuous_test_data.py
4. The system will detect motion and trigger face recognition

## Troubleshooting
- Make sure your camera is accessible
- Check that face encodings are created successfully
- Verify MQTT broker connection
- Check console logs for errors
"""
    
    with open("FACE_RECOGNITION_SETUP.md", "w") as f:
        f.write(instructions)
    print("📝 Created setup instructions: FACE_RECOGNITION_SETUP.md")

def main():
    print("🔧 Face Recognition Entry Detection Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("face_recognition_requirements.txt"):
        print("❌ Please run this script from the project root directory")
        return
    
    # Install requirements
    if not install_requirements():
        print("❌ Failed to install requirements")
        return
    
    # Create directories
    create_directories()
    
    # Create instructions
    create_sample_instructions()
    
    print("\n✅ Setup completed!")
    print("\nNext steps:")
    print("1. Add face images to the 'faces' folder")
    print("2. Run: python create_face_encodings.py")
    print("3. Run: python face_recognition_entry_local.py")
    print("4. Start your backend and frontend servers")

if __name__ == "__main__":
    main()
