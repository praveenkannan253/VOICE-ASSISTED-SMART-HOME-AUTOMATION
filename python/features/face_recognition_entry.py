import cv2
import face_recognition
import pickle
import time
import os
import json
import paho.mqtt.client as mqtt

# === Load Face Encodings ===
print("[INFO] Loading face encodings...")
data = pickle.load(open(r"E:\face_encodings.pkl", "rb"))

# === MQTT Config ===
BROKER = "broker-cn.emqx.io"
PORT = 1883
TOPIC_SENSORS = "esp/sensors"   # ESP publishes PIR, IR, etc.
TOPIC_RESULT = "esp/cam"        # Python publishes recognition result

SAVE_FOLDER = r"E:\\"
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

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow("Camera", frame)

        # press 'c' to capture early (optional)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('c'):
            break

        # stop after 10 seconds
        if time.time() - start_time > 10:
            print("[INFO] Timeout, no face recognized.")
            break

    # Process last frame
    if ret:
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        boxes = face_recognition.face_locations(rgb_frame)
        encodings = face_recognition.face_encodings(rgb_frame, boxes)

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
        print(f"📥 Received JSON: {data}")

        pir = data.get("pir", 0)
        ir = data.get("ir", 0)

        # === Trigger camera when PIR or IR == 1 ===
        if pir == 1 or ir == 1:
            print("[TRIGGER] PIR/IR detected → Starting recognition")
            result = open_camera_and_recognize()
            feedback = f"RESULT:{result}"
            client.publish(TOPIC_RESULT, feedback)
            print(f"[INFO] Published result -> {feedback}")

    except Exception as e:
        print("⚠ Error parsing message:", e)


# === Setup MQTT ===
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

print("🔗 Connecting to broker...")
mqtt_client.connect(BROKER, PORT, 60)

# Loop forever
mqtt_client.loop_forever()
