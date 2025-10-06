#!/usr/bin/env python3
"""
Continuous ESP32 Network Sensor Data Simulator
For hardware connected to separate PC - sends sensor data to development machine
"""

import paho.mqtt.publish as publish
import json
import time
import random
import signal
import sys
import os

# Load network configuration
def load_network_config():
    """Load network configuration from file"""
    try:
        with open('network_config.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ network_config.json not found. Please run network_config.py first.")
        sys.exit(1)

# Load configuration
config = load_network_config()
BROKER = config['development_machine']['mqtt_broker']
TOPIC = "esp/sensors"

def signal_handler(sig, frame):
    print('\n🛑 Stopping ESP32 network simulator...')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def send_sensor_data():
    """Send realistic ESP32 sensor data from hardware machine"""
    # Generate realistic sensor data with some variation
    temp = 25 + random.uniform(-2, 3)  # Temperature between 23-28°C
    hum = 60 + random.uniform(-5, 10)   # Humidity between 55-70%
    ldr = 300 + random.randint(-50, 50)  # Light sensor value
    pir = random.choice([0, 1])         # Motion detection (occasional)
    ir = random.choice([0, 1])          # IR sensor (occasional)
    
    # Add some realistic patterns
    if random.random() < 0.1:  # 10% chance of motion
        pir = 1
        ir = 1
    else:
        pir = 0
        ir = 0
    
    data = {
        "temp": round(temp, 1),
        "hum": round(hum, 1), 
        "ldr": ldr,
        "pir": pir,
        "ir": ir,
        "timestamp": time.time(),
        "hardware_ip": config['hardware_machine']['ip'],
        "source": "hardware_machine"
    }
    
    try:
        publish.single(TOPIC, json.dumps(data), hostname=BROKER)
        print(f"📡 ESP32 Network Data: Temp={data['temp']}°C, Hum={data['hum']}%, LDR={data['ldr']}, PIR={data['pir']}, IR={data['ir']}")
        print(f"🌐 From: {config['hardware_machine']['ip']} -> {config['development_machine']['ip']}")
    except Exception as e:
        print(f"❌ Error sending data: {e}")

def main():
    print("🚀 ESP32 Network Sensor Data Simulator")
    print("=" * 60)
    print(f"🌐 Hardware Machine: {config['hardware_machine']['ip']}")
    print(f"🌐 Development Machine: {config['development_machine']['ip']}")
    print(f"📡 Publishing to: {TOPIC}")
    print(f"🔗 Broker: {BROKER}")
    print("📊 Sending data every 2 seconds...")
    print("Press Ctrl+C to stop")
    print()
    
    try:
        while True:
            send_sensor_data()
            time.sleep(2)
    except KeyboardInterrupt:
        print('\n🛑 Stopping ESP32 network simulator...')

if __name__ == "__main__":
    main()
