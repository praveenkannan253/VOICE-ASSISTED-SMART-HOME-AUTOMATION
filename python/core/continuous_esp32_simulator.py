#!/usr/bin/env python3
"""
Continuous ESP32 sensor data simulator
Sends realistic sensor data every 2 seconds to simulate ESP32
"""

import paho.mqtt.publish as publish
import json
import time
import random
import signal
import sys

# MQTT Configuration
BROKER = "broker-cn.emqx.io"
TOPIC = "esp/sensors"

def signal_handler(sig, frame):
    print('\n🛑 Stopping ESP32 simulator...')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def send_sensor_data():
    """Send realistic ESP32 sensor data"""
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
        "timestamp": time.time()
    }
    
    try:
        publish.single(TOPIC, json.dumps(data), hostname=BROKER)
        print(f"📡 ESP32 Data: Temp={data['temp']}°C, Hum={data['hum']}%, LDR={data['ldr']}, PIR={data['pir']}, IR={data['ir']}")
    except Exception as e:
        print(f"❌ Error sending data: {e}")

def main():
    print("🚀 ESP32 Sensor Data Simulator")
    print("=" * 50)
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
        print('\n🛑 Stopping ESP32 simulator...')

if __name__ == "__main__":
    main()

