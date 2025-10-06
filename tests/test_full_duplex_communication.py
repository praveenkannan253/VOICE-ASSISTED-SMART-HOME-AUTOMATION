#!/usr/bin/env python3
"""
Test script for full duplex MQTT communication
"""

import json
import time
import paho.mqtt.publish as publish
import paho.mqtt.client as mqtt

# MQTT Configuration
BROKER = "broker-cn.emqx.io"
PORT = 1883
TOPIC_SENSORS = "esp/sensors"
TOPIC_COMMANDS = "face-detection/commands"
TOPIC_RESULT = "esp/cam"
TOPIC_STATUS = "face-detection/status"

def test_server_to_face_detection():
    """Test server sending commands to face detection"""
    print("🧪 Testing Server → Face Detection Communication")
    print("=" * 50)
    
    # Test 1: Trigger camera manually
    print("📤 Sending manual trigger command...")
    trigger_command = {
        "action": "trigger_camera",
        "reason": "test_trigger",
        "priority": "high",
        "timestamp": time.time()
    }
    publish.single(TOPIC_COMMANDS, json.dumps(trigger_command), hostname=BROKER)
    print(f"✅ Sent: {trigger_command}")
    time.sleep(2)
    
    # Test 2: Configure face detection
    print("\n📤 Sending configuration command...")
    config_command = {
        "action": "configure",
        "timeout": 15,
        "sensitivity": "high",
        "mode": "manual",
        "timestamp": time.time()
    }
    publish.single(TOPIC_COMMANDS, json.dumps(config_command), hostname=BROKER)
    print(f"✅ Sent: {config_command}")
    time.sleep(2)
    
    # Test 3: Request status
    print("\n📤 Sending status request...")
    status_command = {
        "action": "status_request",
        "timestamp": time.time()
    }
    publish.single(TOPIC_COMMANDS, json.dumps(status_command), hostname=BROKER)
    print(f"✅ Sent: {status_command}")

def test_face_detection_to_server():
    """Test face detection sending data to server"""
    print("\n🧪 Testing Face Detection → Server Communication")
    print("=" * 50)
    
    # Test 1: Send sensor data with motion
    print("📤 Sending sensor data with motion...")
    sensor_data = {
        "temp": 26.5,
        "hum": 65.0,
        "ldr": 320,
        "pir": 1,  # Motion detected
        "ir": 1    # IR triggered
    }
    publish.single(TOPIC_SENSORS, json.dumps(sensor_data), hostname=BROKER)
    print(f"✅ Sent: {sensor_data}")
    time.sleep(3)
    
    # Test 2: Send face detection result
    print("\n📤 Sending face detection result...")
    detection_result = {
        "timestamp": int(time.time()),
        "face_detected": True,
        "message": "1 face detected",
        "image_path": "captured_faces/test_capture.jpg",
        "status": "face_detected",
        "reason": "test_detection",
        "pir": 1,
        "ir": 1,
        "trigger_time": time.strftime("%Y-%m-%dT%H:%M:%S")
    }
    publish.single(TOPIC_RESULT, json.dumps(detection_result), hostname=BROKER)
    print(f"✅ Sent: {detection_result}")
    time.sleep(2)
    
    # Test 3: Send status update
    print("\n📤 Sending status update...")
    status_update = {
        "timestamp": time.time(),
        "status": "ready",
        "config": {
            "timeout": 15,
            "sensitivity": "high",
            "mode": "manual"
        },
        "system": "face_detection",
        "version": "1.0"
    }
    publish.single(TOPIC_STATUS, json.dumps(status_update), hostname=BROKER)
    print(f"✅ Sent: {status_update}")

def test_bidirectional_flow():
    """Test complete bidirectional communication flow"""
    print("\n🧪 Testing Complete Bidirectional Flow")
    print("=" * 50)
    
    print("1️⃣ Server → Face Detection: Configure system")
    config = {
        "action": "configure",
        "timeout": 20,
        "sensitivity": "medium",
        "mode": "auto"
    }
    publish.single(TOPIC_COMMANDS, json.dumps(config), hostname=BROKER)
    print(f"   📤 Sent config: {config}")
    time.sleep(1)
    
    print("2️⃣ Face Detection → Server: Status update")
    status = {
        "timestamp": time.time(),
        "status": "ready",
        "config": config,
        "system": "face_detection"
    }
    publish.single(TOPIC_STATUS, json.dumps(status), hostname=BROKER)
    print(f"   📤 Sent status: {status}")
    time.sleep(1)
    
    print("3️⃣ Sensors → Face Detection: Motion detected")
    motion_data = {
        "temp": 25.0,
        "hum": 60.0,
        "ldr": 300,
        "pir": 1,
        "ir": 1
    }
    publish.single(TOPIC_SENSORS, json.dumps(motion_data), hostname=BROKER)
    print(f"   📤 Sent motion: {motion_data}")
    time.sleep(2)
    
    print("4️⃣ Face Detection → Server: Detection result")
    result = {
        "timestamp": int(time.time()),
        "face_detected": False,
        "message": "No faces detected",
        "image_path": "captured_faces/auto_capture.jpg",
        "status": "no_face",
        "reason": "motion_detection",
        "pir": 1,
        "ir": 1
    }
    publish.single(TOPIC_RESULT, json.dumps(result), hostname=BROKER)
    print(f"   📤 Sent result: {result}")
    time.sleep(1)
    
    print("5️⃣ Server → Face Detection: Manual trigger")
    trigger = {
        "action": "trigger_camera",
        "reason": "manual_verification",
        "priority": "normal"
    }
    publish.single(TOPIC_COMMANDS, json.dumps(trigger), hostname=BROKER)
    print(f"   📤 Sent trigger: {trigger}")

def main():
    print("🔧 Full Duplex MQTT Communication Test")
    print("=" * 60)
    print("This test demonstrates bidirectional communication between:")
    print("• Server ↔ Face Detection System")
    print("• Sensors → Face Detection System")
    print("• Face Detection → Dashboard")
    print()
    
    print("Make sure the following are running:")
    print("1. Backend server: cd backend && node server.js")
    print("2. Face detection: python face_recognition_simple.py")
    print("3. Frontend: cd frontend && npm start")
    print()
    
    input("Press Enter to start tests...")
    
    # Run tests
    test_server_to_face_detection()
    time.sleep(3)
    
    test_face_detection_to_server()
    time.sleep(3)
    
    test_bidirectional_flow()
    
    print("\n✅ All tests completed!")
    print("\n📊 Check the following for results:")
    print("• Face detection console for command processing")
    print("• Backend server logs for MQTT messages")
    print("• Frontend dashboard for real-time updates")
    print("• 'captured_faces' folder for saved images")

if __name__ == "__main__":
    main()
