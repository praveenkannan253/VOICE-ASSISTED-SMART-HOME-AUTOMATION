#!/usr/bin/env python3
"""
Test script to verify the face detection system is working
"""

import json
import time
import paho.mqtt.publish as publish

def test_face_detection_trigger():
    """Send test data to trigger face detection"""
    print("🧪 Testing Face Detection System")
    print("=" * 40)
    
    # Test data with motion detection
    test_data = {
        "temp": 25.5,
        "hum": 60.0,
        "ldr": 300,
        "pir": 1,  # Motion detected
        "ir": 1    # IR sensor triggered
    }
    
    print("📡 Sending test data with motion detection...")
    print(f"Data: {test_data}")
    
    try:
        # Send to MQTT broker
        publish.single("esp/sensors", json.dumps(test_data), hostname="broker-cn.emqx.io")
        print("✅ Test data sent successfully!")
        print("📷 Face detection should trigger now...")
        print("💡 Check the face detection console for camera activation")
        
    except Exception as e:
        print(f"❌ Error sending test data: {e}")

def test_no_motion():
    """Send test data without motion"""
    print("\n🧪 Testing No Motion Scenario")
    print("=" * 40)
    
    test_data = {
        "temp": 24.0,
        "hum": 58.0,
        "ldr": 280,
        "pir": 0,  # No motion
        "ir": 0    # No IR trigger
    }
    
    print("📡 Sending test data without motion...")
    print(f"Data: {test_data}")
    
    try:
        publish.single("esp/sensors", json.dumps(test_data), hostname="broker-cn.emqx.io")
        print("✅ Test data sent successfully!")
        print("📷 Face detection should NOT trigger (no motion)")
        
    except Exception as e:
        print(f"❌ Error sending test data: {e}")

if __name__ == "__main__":
    print("🔧 Face Detection System Test")
    print("Make sure the following are running:")
    print("1. Backend server: cd backend && node server.js")
    print("2. Face detection: python face_recognition_simple.py")
    print("3. Frontend: cd frontend && npm start")
    print()
    
    # Test with motion
    test_face_detection_trigger()
    
    # Wait a bit
    time.sleep(3)
    
    # Test without motion
    test_no_motion()
    
    print("\n✅ Test completed!")
    print("Check your face detection console and dashboard for results.")



