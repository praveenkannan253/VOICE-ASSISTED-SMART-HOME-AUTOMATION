#!/usr/bin/env python3
"""
Alternative installation script for Face Recognition with network timeout handling
"""

import subprocess
import sys
import time
import os

def install_with_retry(package, max_retries=3, timeout=300):
    """Install package with retry on timeout"""
    for attempt in range(max_retries):
        try:
            print(f"📦 Installing {package} (attempt {attempt + 1}/{max_retries})...")
            result = subprocess.run([
                sys.executable, "-m", "pip", "install", 
                "--timeout", str(timeout),
                "--retries", "3",
                package
            ], capture_output=True, text=True, timeout=timeout)
            
            if result.returncode == 0:
                print(f"✅ Successfully installed {package}")
                return True
            else:
                print(f"⚠️ Attempt {attempt + 1} failed: {result.stderr}")
                
        except subprocess.TimeoutExpired:
            print(f"⏰ Timeout on attempt {attempt + 1} for {package}")
        except Exception as e:
            print(f"❌ Error on attempt {attempt + 1} for {package}: {e}")
        
        if attempt < max_retries - 1:
            print(f"⏳ Waiting 10 seconds before retry...")
            time.sleep(10)
    
    print(f"❌ Failed to install {package} after {max_retries} attempts")
    return False

def install_lightweight_version():
    """Install lightweight version with just OpenCV"""
    print("🔧 Installing lightweight face detection version...")
    
    packages = [
        "opencv-python",
        "paho-mqtt",
        "numpy"
    ]
    
    success_count = 0
    for package in packages:
        if install_with_retry(package):
            success_count += 1
    
    return success_count == len(packages)

def install_full_version():
    """Install full face recognition version with retry logic"""
    print("🔧 Installing full face recognition version...")
    
    # Install in order of dependency
    packages = [
        "numpy",
        "opencv-python", 
        "dlib",
        "face-recognition"
    ]
    
    success_count = 0
    for package in packages:
        if install_with_retry(package, max_retries=2, timeout=600):
            success_count += 1
        else:
            print(f"⚠️ Skipping {package} due to installation failure")
    
    return success_count >= 2  # At least numpy and opencv

def create_directories():
    """Create necessary directories"""
    directories = ["faces", "captured_faces"]
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"✅ Created directory: {directory}")

def main():
    print("🔧 Alternative Face Recognition Installation")
    print("=" * 50)
    
    # Create directories
    create_directories()
    
    print("\nChoose installation method:")
    print("1. Lightweight version (OpenCV only) - Fast, basic face detection")
    print("2. Full version (face-recognition) - Advanced, may have network issues")
    print("3. Manual installation instructions")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        print("\n🚀 Installing lightweight version...")
        if install_lightweight_version():
            print("\n✅ Lightweight installation completed!")
            print("📝 Use: python face_recognition_simple.py")
        else:
            print("\n❌ Lightweight installation failed")
    
    elif choice == "2":
        print("\n🚀 Installing full version...")
        if install_full_version():
            print("\n✅ Full installation completed!")
            print("📝 Use: python face_recognition_entry_local.py")
        else:
            print("\n❌ Full installation failed")
            print("💡 Try the lightweight version instead")
    
    elif choice == "3":
        print_manual_instructions()
    
    else:
        print("❌ Invalid choice")

def print_manual_instructions():
    """Print manual installation instructions"""
    instructions = """
# Manual Installation Instructions

## Option 1: Lightweight Version (Recommended)
```bash
pip install opencv-python paho-mqtt numpy
python face_recognition_simple.py
```

## Option 2: Full Version (If network allows)
```bash
# Install one by one to avoid timeouts
pip install numpy
pip install opencv-python
pip install dlib
pip install face-recognition
python face_recognition_entry_local.py
```

## Option 3: Using Conda (Alternative)
```bash
conda install opencv
conda install numpy
pip install paho-mqtt
```

## Option 4: Offline Installation
1. Download wheels from: https://pypi.org/project/opencv-python/#files
2. Install locally: pip install opencv_python-4.8.1.78-cp38-cp38-win32.whl

## Troubleshooting
- Use VPN if downloads are slow
- Try different pip mirrors: pip install -i https://pypi.douban.com/simple/ opencv-python
- Use conda instead of pip for heavy packages
"""
    print(instructions)

if __name__ == "__main__":
    main()
