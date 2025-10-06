import cv2
import time
import os
import json
import paho.mqtt.client as mqtt
import base64
from datetime import datetime

# === MQTT Config ===
BROKER = "broker-cn.emqx.io"
PORT = 1883
TOPIC_SENSORS = "esp/sensors"   # ESP publishes PIR, IR, etc.
TOPIC_RESULT = "esp/cam"        # Python publishes recognition result
TOPIC_COMMANDS = "face-detection/commands"  # Server sends commands
TOPIC_STATUS = "face-detection/status"      # Python publishes status

SAVE_FOLDER = "captured_faces"
if not os.path.exists(SAVE_FOLDER):
    os.makedirs(SAVE_FOLDER)

# === Configuration ===
config = {
    "timeout": 10,
    "sensitivity": "medium",
    "mode": "auto",
    "status": "ready"
}

# Simple face detection using OpenCV's built-in Haar Cascade
def detect_faces_in_image(image_path):
    """Simple face detection using OpenCV Haar Cascade"""
    try:
        # Load the image
        image = cv2.imread(image_path)
        if image is None:
            return False, "Could not load image"
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Load the Haar cascade for face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) > 0:
            return True, f"Found {len(faces)} face(s)"
        else:
            return False, "No faces detected"
            
    except Exception as e:
        return False, f"Error: {str(e)}"

def open_camera_and_capture(reason="motion_detection"):
    """Open camera and capture image for face detection"""
    print(f"[INFO] Opening camera for face detection (reason: {reason})...")
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    start_time = time.time()
    
    if not cap.isOpened():
        print("[ERROR] Camera not accessible!")
        return {"error": "Camera not accessible", "reason": reason}

    print(f"[INFO] Camera opened. Press 'c' to capture or wait for timeout ({config['timeout']}s)...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Display the frame
        cv2.imshow("Face Detection - Press 'c' to capture", frame)

        # press 'c' to capture early (optional)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('c'):
            print("[INFO] Manual capture triggered")
            break

        # stop after configured timeout
        if time.time() - start_time > config['timeout']:
            print(f"[INFO] Timeout ({config['timeout']}s), no capture triggered.")
            break

    # Process last frame
    if ret:
        # Save the captured frame
        timestamp = int(time.time())
        frame_path = os.path.join(SAVE_FOLDER, f"capture_{timestamp}.jpg")
        cv2.imwrite(frame_path, frame)
        print(f"[INFO] Frame saved to {frame_path}")
        
        # Detect faces in the captured image
        face_detected, message = detect_faces_in_image(frame_path)
        
        result = {
            "timestamp": timestamp,
            "face_detected": face_detected,
            "message": message,
            "image_path": frame_path,
            "status": "face_detected" if face_detected else "no_face",
            "reason": reason,
            "config_used": config
        }
        
        cap.release()
        cv2.destroyAllWindows()
        return result
    else:
        cap.release()
        cv2.destroyAllWindows()
        return {"error": "Failed to capture image", "reason": reason}

def handle_server_command(command):
    """Handle commands from the server"""
    try:
        action = command.get('action')
        print(f"[COMMAND] Received command: {action}")
        
        if action == 'trigger_camera':
            reason = command.get('reason', 'server_command')
            priority = command.get('priority', 'normal')
            print(f"[COMMAND] Triggering camera (reason: {reason}, priority: {priority})")
            
            # Update status
            config['status'] = 'processing'
            publish_status()
            
            # Trigger face detection
            result = open_camera_and_capture(reason)
            
            # Publish result
            mqtt_client.publish(TOPIC_RESULT, json.dumps(result))
            print(f"[COMMAND] Published result: {result}")
            
            # Update status back to ready
            config['status'] = 'ready'
            publish_status()
            
        elif action == 'configure':
            print(f"[COMMAND] Updating configuration: {command}")
            config.update({
                'timeout': command.get('timeout', config['timeout']),
                'sensitivity': command.get('sensitivity', config['sensitivity']),
                'mode': command.get('mode', config['mode'])
            })
            print(f"[CONFIG] Updated config: {config}")
            publish_status()
            
        elif action == 'status_request':
            print("[COMMAND] Status requested by server")
            publish_status()
            
        else:
            print(f"[COMMAND] Unknown action: {action}")
            
    except Exception as e:
        print(f"[COMMAND] Error handling command: {e}")

def publish_status():
    """Publish current status to server"""
    status = {
        "timestamp": time.time(),
        "status": config['status'],
        "config": config,
        "system": "face_detection",
        "version": "1.0"
    }
    
    mqtt_client.publish(TOPIC_STATUS, json.dumps(status))
    print(f"[STATUS] Published status: {status}")

# === MQTT Callbacks ===
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker!")
        # Subscribe to multiple topics for full duplex communication
        client.subscribe(TOPIC_SENSORS)
        client.subscribe(TOPIC_COMMANDS)
        print(f"📡 Subscribed to: {TOPIC_SENSORS}")
        print(f"📡 Subscribed to: {TOPIC_COMMANDS}")
        
        # Publish initial status
        publish_status()
    else:
        print("❌ Failed to connect, return code:", rc)

def on_message(client, userdata, msg):
    try:
        topic = msg.topic
        payload = msg.payload.decode()
        data = json.loads(payload)  # parse JSON
        
        if topic == TOPIC_SENSORS:
            print(f"📥 Received sensor data: {data}")
            handle_sensor_data(data)
        elif topic == TOPIC_COMMANDS:
            print(f"📥 Received server command: {data}")
            handle_server_command(data)
        else:
            print(f"📥 Received unknown message on {topic}: {data}")

    except Exception as e:
        print("⚠️ Error parsing message:", e)

def handle_sensor_data(data):
    """Handle sensor data and trigger face detection if motion detected"""
    pir = data.get("pir", 0)
    ir = data.get("ir", 0)

    # === Trigger camera when PIR or IR == 1 ===
    if pir == 1 or ir == 1:
        print("[TRIGGER] Motion detected (PIR/IR) → Starting face detection")
        
        # Update status
        config['status'] = 'processing'
        publish_status()
        
        result = open_camera_and_capture("motion_detection")
        
        # Add sensor data to result
        result.update({
            "pir": pir,
            "ir": ir,
            "trigger_time": datetime.now().isoformat()
        })
        
        # Publish result
        mqtt_client.publish(TOPIC_RESULT, json.dumps(result))
        print(f"[INFO] Published detection result: {result}")
        
        # Update status back to ready
        config['status'] = 'ready'
        publish_status()

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
    print("\n🛑 Stopping face detection system...")
    mqtt_client.disconnect()
except Exception as e:
    print(f"❌ Error connecting to MQTT: {e}")
