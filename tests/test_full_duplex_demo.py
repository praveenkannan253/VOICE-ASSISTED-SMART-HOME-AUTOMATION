#!/usr/bin/env python3
"""
Full Duplex Communication Demo
Tests the complete communication flow: Frontend -> Backend -> ESP32
"""

import json
import time
import requests
import paho.mqtt.publish as publish

# Configuration
BACKEND_URL = "http://localhost:3000"
BROKER = "broker-cn.emqx.io"

def test_backend_connection():
    """Test if backend is running"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/sensors", timeout=5)
        print(f"✅ Backend Status: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Backend Error: {e}")
        return False

def send_sensor_data():
    """Send sensor data to simulate ESP32"""
    data = {
        "temp": 26.5,
        "hum": 65.0,
        "ldr": 320,
        "pir": 1,
        "ir": 1,
        "timestamp": time.time()
    }
    
    try:
        publish.single("esp/sensors", json.dumps(data), hostname=BROKER)
        print(f"📡 Sent sensor data: {data}")
        return True
    except Exception as e:
        print(f"❌ Error sending sensor data: {e}")
        return False

def test_device_commands():
    """Test device control commands"""
    devices = ['fan', 'light', 'ac', 'washing-machine']
    
    for device in devices:
        print(f"\n🔧 Testing {device} control...")
        
        # Test ON command
        try:
            response = requests.post(f"{BACKEND_URL}/api/control", 
                                   json={"device": device, "action": "on"}, 
                                   timeout=5)
            if response.status_code == 200:
                print(f"✅ {device} ON command sent successfully")
            else:
                print(f"❌ {device} ON command failed: {response.status_code}")
        except Exception as e:
            print(f"❌ {device} ON command error: {e}")
        
        time.sleep(1)
        
        # Test OFF command
        try:
            response = requests.post(f"{BACKEND_URL}/api/control", 
                                   json={"device": device, "action": "off"}, 
                                   timeout=5)
            if response.status_code == 200:
                print(f"✅ {device} OFF command sent successfully")
            else:
                print(f"❌ {device} OFF command failed: {response.status_code}")
        except Exception as e:
            print(f"❌ {device} OFF command error: {e}")
        
        time.sleep(1)

def test_face_detection_commands():
    """Test face detection commands"""
    print("\n📷 Testing face detection commands...")
    
    # Test trigger command
    try:
        response = requests.post(f"{BACKEND_URL}/api/face-detection/trigger", 
                               json={"reason": "test_trigger", "priority": "high"}, 
                               timeout=5)
        if response.status_code == 200:
            print("✅ Face detection trigger command sent successfully")
        else:
            print(f"❌ Face detection trigger failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Face detection trigger error: {e}")
    
    time.sleep(1)
    
    # Test configuration command
    try:
        response = requests.post(f"{BACKEND_URL}/api/face-detection/configure", 
                               json={"timeout": 15, "sensitivity": "high", "mode": "manual"}, 
                               timeout=5)
        if response.status_code == 200:
            print("✅ Face detection config command sent successfully")
        else:
            print(f"❌ Face detection config failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Face detection config error: {e}")

def main():
    print("🔧 Full Duplex Communication Demo")
    print("=" * 60)
    print("This demo tests the complete communication flow:")
    print("1. ESP32 → Backend (sensor data)")
    print("2. Frontend → Backend (commands)")
    print("3. Backend → ESP32 (device control)")
    print("4. Backend → Face Detection (commands)")
    print()
    
    # Test 1: Backend connection
    print("1️⃣ Testing Backend Connection...")
    if not test_backend_connection():
        print("❌ Backend not running! Please start it first:")
        print("   cd backend && node server.js")
        return
    
    # Test 2: Send sensor data
    print("\n2️⃣ Testing Sensor Data Flow...")
    send_sensor_data()
    time.sleep(2)
    
    # Test 3: Device commands
    print("\n3️⃣ Testing Device Control Commands...")
    test_device_commands()
    
    # Test 4: Face detection commands
    print("\n4️⃣ Testing Face Detection Commands...")
    test_face_detection_commands()
    
    print("\n✅ Full Duplex Communication Demo Complete!")
    print("\n📊 Check the following for results:")
    print("• Backend server logs for MQTT message processing")
    print("• ESP32 command receiver logs for command reception")
    print("• Frontend dashboard for real-time updates")
    print("• MQTT broker for message flow")

if __name__ == "__main__":
    main()

