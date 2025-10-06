#!/usr/bin/env python3
"""
Quick system status check
"""

import requests
import json
import time

def check_backend():
    """Check if backend is running"""
    try:
        response = requests.get('http://localhost:3000/api/sensors', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend server: RUNNING")
            print(f"📊 Sensor data: {len(data)} topics")
            
            # Check for face detection results
            if 'esp/cam' in data:
                print("✅ Face detection: ACTIVE")
                print(f"📷 Last result: {data['esp/cam']}")
            else:
                print("⏳ Face detection: Waiting for motion...")
            
            return True
        else:
            print(f"❌ Backend server: ERROR (Status {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Backend server: NOT RUNNING ({e})")
        return False

def check_frontend():
    """Check if frontend is running"""
    try:
        response = requests.get('http://localhost:3001', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend: RUNNING")
            print("🌐 Dashboard: http://localhost:3001")
            return True
        else:
            print(f"❌ Frontend: ERROR (Status {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Frontend: NOT RUNNING ({e})")
        return False

def main():
    print("🔍 Smart Home System Status Check")
    print("=" * 40)
    
    backend_ok = check_backend()
    frontend_ok = check_frontend()
    
    print("\n📋 System Summary:")
    if backend_ok and frontend_ok:
        print("🎉 ALL SYSTEMS OPERATIONAL!")
        print("\n🌐 Open your dashboard: http://localhost:3001")
        print("📷 Face detection will trigger on motion")
        print("📊 Charts will update with sensor data")
    else:
        print("⚠️ Some systems need attention:")
        if not backend_ok:
            print("  - Start backend: cd backend && node server.js")
        if not frontend_ok:
            print("  - Start frontend: cd frontend && npm start")
    
    print("\n💡 Tips:")
    print("- Face detection triggers on PIR/IR motion")
    print("- Check 'captured_faces' folder for photos")
    print("- Dashboard shows real-time sensor data")
    print("- Press Ctrl+C in face detection to stop")

if __name__ == "__main__":
    main()
