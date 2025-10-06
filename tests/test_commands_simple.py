#!/usr/bin/env python3
"""
Simple Full Duplex Communication Test
Tests MQTT command flow without HTTP dependencies
"""

import json
import time
import paho.mqtt.publish as publish

# MQTT Configuration
BROKER = "broker-cn.emqx.io"

def test_device_commands():
    """Test device control commands via MQTT"""
    print("🔧 Testing Device Control Commands...")
    print("=" * 50)
    
    devices = ['fan', 'light', 'ac', 'washing-machine']
    
    for device in devices:
        print(f"\n📤 Testing {device} control...")
        
        # Test ON command
        try:
            publish.single(f"home/control/{device}", "on", hostname=BROKER)
            print(f"✅ {device} ON command sent")
        except Exception as e:
            print(f"❌ {device} ON command error: {e}")
        
        time.sleep(1)
        
        # Test OFF command
        try:
            publish.single(f"home/control/{device}", "off", hostname=BROKER)
            print(f"✅ {device} OFF command sent")
        except Exception as e:
            print(f"❌ {device} OFF command error: {e}")
        
        time.sleep(1)

def test_face_detection_commands():
    """Test face detection commands via MQTT"""
    print("\n📷 Testing Face Detection Commands...")
    print("=" * 50)
    
    # Test trigger command
    trigger_command = {
        "action": "trigger_camera",
        "reason": "test_trigger",
        "priority": "high",
        "timestamp": time.time()
    }
    
    try:
        publish.single("face-detection/commands", json.dumps(trigger_command), hostname=BROKER)
        print("✅ Face detection trigger command sent")
    except Exception as e:
        print(f"❌ Face detection trigger error: {e}")
    
    time.sleep(1)
    
    # Test configuration command
    config_command = {
        "action": "configure",
        "timeout": 15,
        "sensitivity": "high",
        "mode": "manual",
        "timestamp": time.time()
    }
    
    try:
        publish.single("face-detection/commands", json.dumps(config_command), hostname=BROKER)
        print("✅ Face detection config command sent")
    except Exception as e:
        print(f"❌ Face detection config error: {e}")

def test_sensor_data():
    """Test sensor data publishing"""
    print("\n📡 Testing Sensor Data Publishing...")
    print("=" * 50)
    
    sensor_data = {
        "temp": 26.5,
        "hum": 65.0,
        "ldr": 320,
        "pir": 1,
        "ir": 1,
        "timestamp": time.time()
    }
    
    try:
        publish.single("esp/sensors", json.dumps(sensor_data), hostname=BROKER)
        print(f"✅ Sensor data sent: {sensor_data}")
    except Exception as e:
        print(f"❌ Sensor data error: {e}")

def main():
    print("🔧 Full Duplex MQTT Communication Test")
    print("=" * 60)
    print("This test demonstrates the complete MQTT communication flow:")
    print("1. ESP32 → Backend (sensor data)")
    print("2. Backend → ESP32 (device control)")
    print("3. Backend → Face Detection (commands)")
    print()
    
    # Test 1: Sensor data
    test_sensor_data()
    time.sleep(2)
    
    # Test 2: Device commands
    test_device_commands()
    
    # Test 3: Face detection commands
    test_face_detection_commands()
    
    print("\n✅ Full Duplex Communication Test Complete!")
    print("\n📊 Check the following for results:")
    print("• ESP32 command receiver logs for command reception")
    print("• Face detection system logs for command processing")
    print("• Backend server logs for MQTT message processing")
    print("• Frontend dashboard for real-time updates")

if __name__ == "__main__":
    main()

