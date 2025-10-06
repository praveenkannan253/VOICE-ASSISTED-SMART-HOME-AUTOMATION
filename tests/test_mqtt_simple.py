import paho.mqtt.publish as publish
import json
import time
import random

# Test with a more reliable MQTT broker
broker = "broker.hivemq.com"  # Free public broker
topic = "esp/sensors"

print("Testing MQTT connection...")

# Send test data every 3 seconds for 1 minute
for i in range(20):
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
    
    print(f"[{i+1}/20] Sending sensor data: {data}")
    
    try:
        publish.single(topic, json.dumps(data), hostname=broker)
        print(f"✅ Successfully sent to {broker}")
    except Exception as e:
        print(f"❌ Error sending to {broker}: {e}")
    
    time.sleep(3)

print("Test data sending completed!")
