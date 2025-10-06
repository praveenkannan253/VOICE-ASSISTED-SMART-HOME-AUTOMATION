import paho.mqtt.publish as publish
import json
import time
import random

print("Starting continuous sensor data transmission...")
print("Press Ctrl+C to stop")

try:
    while True:
        # Generate realistic sensor data with some variation
        temp = 25 + random.uniform(-2, 3)  # Temperature between 23-28°C
        hum = 60 + random.uniform(-5, 10)  # Humidity between 55-70%
        ldr = 300 + random.randint(-50, 50)  # Light sensor value
        pir = random.choice([0, 1])  # Motion detection
        ir = random.choice([0, 1])   # IR sensor
        
        data = {
            "temp": round(temp, 1),
            "hum": round(hum, 1), 
            "ldr": ldr,
            "pir": pir,
            "ir": ir
        }
        
        print(f"Sending sensor data: {data}")
        publish.single("esp/sensors", json.dumps(data), hostname="broker-cn.emqx.io")
        time.sleep(3)  # Send data every 3 seconds
        
except KeyboardInterrupt:
    print("\nStopping continuous data transmission...")



