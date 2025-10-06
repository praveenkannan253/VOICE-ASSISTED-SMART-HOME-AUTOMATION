#!/usr/bin/env python3
"""
ESP32 Command Receiver
Listens for commands from the frontend dashboard and simulates ESP32 responses
"""

import json
import time
import paho.mqtt.client as mqtt
import paho.mqtt.publish as publish

# MQTT Configuration
BROKER = "broker-cn.emqx.io"
PORT = 1883

# Topics
TOPIC_COMMANDS = "home/control"  # Will listen to home/control/+
TOPIC_SENSORS = "esp/sensors"    # Will publish sensor data
TOPIC_STATUS = "esp/status"      # Will publish device status

class ESP32Simulator:
    def __init__(self):
        self.devices = {
            'fan': 'off',
            'light': 'off', 
            'ac': 'off',
            'washing-machine': 'off'
        }
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        
    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("✅ ESP32 Connected to MQTT Broker!")
            # Subscribe to all device control topics
            client.subscribe("home/control/+")
            print("📡 Subscribed to: home/control/+")
            
            # Publish initial status
            self.publish_device_status()
        else:
            print("❌ Failed to connect, return code:", rc)
    
    def on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            command = msg.payload.decode()
            
            print(f"📥 Received command: {topic} -> {command}")
            
            # Extract device name from topic (home/control/fan -> fan)
            device = topic.split('/')[-1]
            
            if device in self.devices:
                # Update device state
                self.devices[device] = command
                print(f"🔧 Device {device} set to: {command}")
                
                # Publish updated status
                self.publish_device_status()
                
                # Simulate device response
                self.simulate_device_response(device, command)
            else:
                print(f"⚠️ Unknown device: {device}")
                
        except Exception as e:
            print(f"❌ Error processing command: {e}")
    
    def publish_device_status(self):
        """Publish current device status"""
        status = {
            "timestamp": time.time(),
            "devices": self.devices,
            "system": "esp32_simulator"
        }
        
        try:
            publish.single(TOPIC_STATUS, json.dumps(status), hostname=BROKER)
            print(f"📤 Published status: {status}")
        except Exception as e:
            print(f"❌ Error publishing status: {e}")
    
    def simulate_device_response(self, device, command):
        """Simulate ESP32 device response"""
        if command == "on":
            print(f"🟢 {device.upper()} turned ON")
            # Simulate device turning on (LED, motor, etc.)
            time.sleep(0.5)
        elif command == "off":
            print(f"🔴 {device.upper()} turned OFF")
            # Simulate device turning off
            time.sleep(0.5)
        
        # Publish sensor data with device state
        self.publish_sensor_data()
    
    def publish_sensor_data(self):
        """Publish sensor data with current device states"""
        import random
        
        # Generate realistic sensor data
        temp = 25 + random.uniform(-2, 3)
        hum = 60 + random.uniform(-5, 10)
        ldr = 300 + random.randint(-50, 50)
        pir = random.choice([0, 1])
        ir = random.choice([0, 1])
        
        # Add device states to sensor data
        sensor_data = {
            "temp": round(temp, 1),
            "hum": round(hum, 1),
            "ldr": ldr,
            "pir": pir,
            "ir": ir,
            "devices": self.devices,  # Include device states
            "timestamp": time.time()
        }
        
        try:
            publish.single(TOPIC_SENSORS, json.dumps(sensor_data), hostname=BROKER)
            print(f"📡 Published sensor data: Temp={sensor_data['temp']}°C, Hum={sensor_data['hum']}%, Devices={self.devices}")
        except Exception as e:
            print(f"❌ Error publishing sensor data: {e}")
    
    def start(self):
        """Start the ESP32 simulator"""
        print("🚀 ESP32 Command Receiver Starting...")
        print("=" * 50)
        print(f"📡 Listening to: {TOPIC_COMMANDS}/*")
        print(f"📤 Publishing to: {TOPIC_SENSORS}")
        print("🔧 Supported devices: fan, light, ac, washing-machine")
        print("Press Ctrl+C to stop")
        print()
        
        try:
            self.client.connect(BROKER, PORT, 60)
            self.client.loop_forever()
        except KeyboardInterrupt:
            print("\n🛑 Stopping ESP32 simulator...")
            self.client.disconnect()
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    esp32 = ESP32Simulator()
    esp32.start()

