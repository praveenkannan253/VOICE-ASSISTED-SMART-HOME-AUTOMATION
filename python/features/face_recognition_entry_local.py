import cv2
import face_recognition
import pickle
import time
import os
import json
import paho.mqtt.client as mqtt

# === Load Face Encodings ===
print("[INFO] Loading face encodings...")

# Try to load from E: drive first, then fallback to local
encodings_file = r"E:\face_encodings.pkl"
if not os.path.exists(encodings_file):
    encodings_file = "face_encodings.pkl"
    if not os.path.exists(encodings_file):
        print("❌ No face encodings found!")
        print("Please run create_face_encodings.py first to create face encodings.")
        exit(1)

try:
    data = pickle.load(open(encodings_file, "rb"))
    print(f"✅ Loaded {len(data['names'])} face encodings: {', '.join(data['names'])}")
except Exception as e:
    print(f"❌ Error loading face encodings: {e}")
    exit(1)

# === MQTT Config ===
BROKER = "broker-cn.emqx.io"
PORT = 1883
TOPIC_SENSORS = "esp/sensors"   # ESP publishes PIR, IR, etc.
TOPIC_RESULT = "esp/cam"        # Python publishes recognition result

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

    print("[INFO] Camera opened. Press 'c' to capture or wait for timeout...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Display the frame
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
        
        # Convert to RGB for face recognition
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        boxes = face_recognition.face_locations(rgb_frame)
        encodings = face_recognition.face_encodings(rgb_frame, boxes)

        if len(encodings) == 0:
            print("[INFO] No faces detected in the image")
            recognized_name = "No Face Detected"
        else:
            print(f"[INFO] Found {len(encodings)} face(s) in the image")
            
            for i, encoding in enumerate(encodings):
                matches = face_recognition.compare_faces(data["encodings"], encoding)
                name = "Unknown"
                
                if True in matches:
                    matchedIdxs = [i for (i, b) in enumerate(matches) if b]
                    counts = {}
                    for idx in matchedIdxs:
                        name = data["names"][idx]
                        counts[name] = counts.get(name, 0) + 1
                    name = max(counts, key=counts.get)
                
                recognized_name = name
                print(f"[RESULT] Face {i+1} recognized as: {recognized_name}")

    cap.release()
    cv2.destroyAllWindows()
    return recognized_name


# === MQTT Callbacks ===
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker!")
        client.subscribe(TOPIC_SENSORS)
        print(f"📡 Subscribed to: {TOPIC_SENSORS}")
    else:
        print("❌ Failed to connect, return code:", rc)


def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode()
        data = json.loads(payload)  # parse JSON
        print(f"📥 Received sensor data: {data}")

        pir = data.get("pir", 0)
        ir = data.get("ir", 0)

        # === Trigger camera when PIR or IR == 1 ===
        if pir == 1 or ir == 1:
            print("[TRIGGER] Motion detected (PIR/IR) → Starting face recognition")
            result = open_camera_and_recognize()
            
            # Create result message
            result_data = {
                "timestamp": time.time(),
                "person": result,
                "pir": pir,
                "ir": ir,
                "status": "recognized" if result != "Unknown" and result != "No Face Detected" else "unknown"
            }
            
            # Publish result
            client.publish(TOPIC_RESULT, json.dumps(result_data))
            print(f"[INFO] Published recognition result: {result_data}")

    except Exception as e:
        print("⚠️ Error parsing message:", e)


# === Setup MQTT ===
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

print("🔗 Connecting to MQTT broker...")
try:
    mqtt_client.connect(BROKER, PORT, 60)
    print("✅ Connected to MQTT broker!")
    print("📡 Waiting for motion detection...")
    print("Press Ctrl+C to stop")
    
    # Loop forever
    mqtt_client.loop_forever()
except KeyboardInterrupt:
    print("\n🛑 Stopping face recognition system...")
    mqtt_client.disconnect()
except Exception as e:
    print(f"❌ Error connecting to MQTT: {e}")
