#!/usr/bin/env python3
"""
Simple test for bidirectional MQTT communication
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

def test_communication():
    print("🧪 Testing Bidirectional MQTT Communication")
    print("=" * 50)
    
    # Test 1: Send sensor data with motion
    print("📤 1. Sending sensor data with motion...")
    sensor_data = {
        "temp": 26.5,
        "hum": 65.0,
        "ldr": 320,
        "pir": 1,  # Motion detected
        "ir": 1    # IR triggered
    }
    publish.single(TOPIC_SENSORS, json.dumps(sensor_data), hostname=BROKER)
    print(f"✅ Sent sensor data: {sensor_data}")
    time.sleep(2)
    
    # Test 2: Send face detection result
    print("\n📤 2. Sending face detection result...")
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
    print(f"✅ Sent detection result: {detection_result}")
    time.sleep(2)
    
    # Test 3: Send server command
    print("\n📤 3. Sending server command...")
    trigger_command = {
        "action": "trigger_camera",
        "reason": "test_trigger",
        "priority": "high",
        "timestamp": time.time()
    }
    publish.single(TOPIC_COMMANDS, json.dumps(trigger_command), hostname=BROKER)
    print(f"✅ Sent command: {trigger_command}")
    time.sleep(2)
    
    # Test 4: Send status update
    print("\n📤 4. Sending status update...")
    status_update = {
        "timestamp": time.time(),
        "status": "ready",
        "config": {
            "timeout": 10,
            "sensitivity": "medium",
            "mode": "auto"
        },
        "system": "face_detection",
        "version": "1.0"
    }
    publish.single(TOPIC_STATUS, json.dumps(status_update), hostname=BROKER)
    print(f"✅ Sent status: {status_update}")
    
    print("\n✅ All MQTT messages sent successfully!")
    print("\n📊 Check the following for results:")
    print("• Backend server logs for MQTT message reception")
    print("• Face detection system logs for command processing")
    print("• Frontend dashboard for real-time updates")

if __name__ == "__main__":
    test_communication()
