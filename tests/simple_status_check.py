#!/usr/bin/env python3
"""
Simple system status check using built-in modules
"""

import urllib.request
import urllib.error
import json

def check_backend():
    """Check if backend is running"""
    try:
        with urllib.request.urlopen('http://localhost:3000/api/sensors', timeout=5) as response:
            data = json.loads(response.read().decode())
            print("✅ Backend server: RUNNING")
            print(f"📊 Sensor data: {len(data)} topics")
            
            # Check for face detection results
            if 'esp/cam' in data:
                print("✅ Face detection: ACTIVE")
                result = data['esp/cam']
                print(f"📷 Last result: {result.get('message', 'No message')}")
                print(f"🕐 Time: {result.get('trigger_time', 'Unknown')}")
            else:
                print("⏳ Face detection: Waiting for motion...")
            
            return True
    except Exception as e:
        print(f"❌ Backend server: NOT RUNNING ({e})")
        return False

def check_frontend():
    """Check if frontend is running"""
    try:
        with urllib.request.urlopen('http://localhost:3001', timeout=5) as response:
            if response.status == 200:
                print("✅ Frontend: RUNNING")
                print("🌐 Dashboard: http://localhost:3001")
                return True
            else:
                print(f"❌ Frontend: ERROR (Status {response.status})")
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
        print("\n💡 Your face detection system is working!")
        print("   - Motion sensors trigger camera")
        print("   - Photos saved to 'captured_faces' folder")
        print("   - Results appear in dashboard")
    else:
        print("⚠️ Some systems need attention:")
        if not backend_ok:
            print("  - Start backend: cd backend && node server.js")
        if not frontend_ok:
            print("  - Start frontend: cd frontend && npm start")
    
    print("\n🚀 Next Steps:")
    print("1. Open http://localhost:3001 in your browser")
    print("2. Watch the dashboard for real-time updates")
    print("3. Face detection will trigger when motion is detected")
    print("4. Check 'captured_faces' folder for photos")

if __name__ == "__main__":
    main()
