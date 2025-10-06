#!/usr/bin/env python3
"""
Real ESP8266 Integration System
Works with your actual ESP8266 hardware and face recognition
"""

import cv2
import face_recognition
import pickle
import time
import os
import json
import paho.mqtt.client as mqtt

# === Load Face Encodings ===
print("[INFO] Loading face encodings...")
try:
    data = pickle.load(open("face_encodings.pkl", "rb"))
    print("✅ Face encodings loaded successfully")
except FileNotFoundError:
    print("⚠️ Face encodings file not found. Using dummy recognition.")
    data = {"encodings": [], "names": []}

# === MQTT Config ===
BROKER = "broker-cn.emqx.io"
PORT = 1883
TOPIC_SENSORS = "esp/sensors"   # ESP8266 publishes sensor data
TOPIC_RESULT = "esp/cam"        # Python publishes recognition result
TOPIC_COMMANDS = "home/control" # Server sends device commands
TOPIC_STATUS = "esp/status"     # ESP8266 publishes status

SAVE_FOLDER = "captured_faces"
if not os.path.exists(SAVE_FOLDER):
    os.makedirs(SAVE_FOLDER)

# === Face Recognition Function ===
def open_camera_and_recognize():
    print("[INFO] Opening camera for recognition...")
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    start_time = time.time()
    recognized_name = "Unknown"

    if not cap.isOpened():
        print("[ERROR] Camera not accessible!")
        return "Unknown"

    print("[INFO] Camera opened. Press 'c' to capture or wait for timeout (10s)...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow("Face Recognition - Press 'c' to capture", frame)

        # press 'c' to capture early (optional)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('c'):
            print("[INFO] Manual capture triggered")
            break

        # stop after 10 seconds
        if time.time() - start_time > 10:
            print("[INFO] Timeout, no face recognized.")
            break

    # Process last frame
    if ret:
        # Save the captured frame
        timestamp = int(time.time())
        frame_path = os.path.join(SAVE_FOLDER, f"capture_{timestamp}.jpg")
        cv2.imwrite(frame_path, frame)
        print(f"[INFO] Frame saved to {frame_path}")
        
        # Face recognition
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        boxes = face_recognition.face_locations(rgb_frame)
        encodings = face_recognition.face_encodings(rgb_frame, boxes)

        if len(encodings) > 0 and len(data["encodings"]) > 0:
            for encoding in encodings:
                matches = face_recognition.compare_faces(data["encodings"], encoding)
                name = "Unknown"
                if True in matches:
                    matchedIdxs = [i for (i, b) in enumerate(matches) if b]
                    counts = {}
                    for i in matchedIdxs:
                        name = data["names"][i]
                        counts[name] = counts.get(name, 0) + 1
                    name = max(counts, key=counts.get)
                recognized_name = name
                print(f"[RESULT] Recognized: {recognized_name}")
        else:
            print("[RESULT] No faces detected or no encodings available")
            recognized_name = "No Face Detected"

    cap.release()
    cv2.destroyAllWindows()
    return recognized_name

# === MQTT Callbacks ===
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker!")
        # Subscribe to sensor data from ESP8266
        client.subscribe(TOPIC_SENSORS)
        print(f"📡 Subscribed to: {TOPIC_SENSORS}")
        
        # Publish initial status
        publish_status()
    else:
        print("❌ Failed to connect, return code:", rc)

def on_message(client, userdata, msg):
    try:
        topic = msg.topic
        payload = msg.payload.decode()
        data = json.loads(payload)  # parse JSON
        
        print(f"📥 Received from {topic}: {data}")

        if topic == TOPIC_SENSORS:
            handle_sensor_data(data)
        else:
            print(f"📥 Unknown topic: {topic}")

    except Exception as e:
        print("⚠️ Error parsing message:", e)

def handle_sensor_data(data):
    """Handle sensor data from ESP8266"""
    pir = data.get("pir", 0)
    ir = data.get("ir", 0)
    temp = data.get("temp", 0)
    hum = data.get("hum", 0)
    ldr = data.get("ldr", 0)

    print(f"📊 Sensor Data: Temp={temp}°C, Hum={hum}%, LDR={ldr}, PIR={pir}, IR={ir}")

    # === Trigger camera when PIR or IR == 1 ===
    if pir == 1 or ir == 1:
        print("[TRIGGER] PIR/IR detected → Starting face recognition")
        
        # Publish status update
        publish_status("processing")
        
        # Start face recognition
        result = open_camera_and_recognize()
        
        # Publish result
        result_data = {
            "timestamp": int(time.time()),
            "face_detected": result != "Unknown" and result != "No Face Detected",
            "recognized_name": result,
            "status": "face_recognized" if result != "Unknown" else "no_face",
            "trigger_reason": "motion_detection",
            "pir": pir,
            "ir": ir
        }
        
        client.publish(TOPIC_RESULT, json.dumps(result_data))
        print(f"[INFO] Published result: {result_data}")
        
        # Publish status back to ready
        publish_status("ready")

def publish_status(status="ready"):
    """Publish system status"""
    status_data = {
        "timestamp": time.time(),
        "status": status,
        "system": "face_recognition",
        "version": "1.0"
    }
    
    client.publish(TOPIC_STATUS, json.dumps(status_data))
    print(f"[STATUS] Published status: {status}")

# === Setup MQTT ===
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

print("🔗 Connecting to MQTT broker...")
try:
    client.connect(BROKER, PORT, 60)
    print("✅ Connected to MQTT broker!")
    print("📡 Waiting for ESP8266 sensor data...")
    print("Press Ctrl+C to stop")
    
    # Loop forever
    client.loop_forever()
except KeyboardInterrupt:
    print("\n🛑 Stopping face recognition system...")
    client.disconnect()
except Exception as e:
    print(f"❌ Error connecting to MQTT: {e}")

