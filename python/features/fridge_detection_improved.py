import cv2
from ultralytics import YOLO
from collections import defaultdict
import mysql.connector
from datetime import datetime
import paho.mqtt.client as mqtt
import json
import time
import os
import requests
from pathlib import Path

# ============= CONFIGURATION =============
MQTT_BROKER = "broker-cn.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC = "fridge/inventory"
BACKEND_URL = "http://localhost:3000"
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'uploads', 'fridge')

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ============= DATABASE CONNECTION =============
def connect_to_database():
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="password",
            database="smarthome"
        )
        return db
    except mysql.connector.Error as err:
        print(f"❌ Database connection error: {err}")
        return None

# ============= MQTT CLIENT SETUP =============
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker")
    else:
        print(f"❌ MQTT connection failed: {rc}")

def on_disconnect(client, userdata, rc):
    print("🔌 Disconnected from MQTT Broker")

mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_disconnect = on_disconnect

try:
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    mqtt_client.loop_start()
except Exception as e:
    print(f"❌ MQTT connection failed: {e}")

# ============= LOAD YOLO MODEL =============
print("🤖 Loading YOLO model...")
model = YOLO("yolov9c.pt")

# Grocery items to detect
grocery_list = [
    "apple", "banana", "orange", "milk", "bread", 
    "bottle", "wine glass", "cup", "bowl", "egg",
    "cheese", "carrot", "tomato", "potato", "onion"
]

# ============= SAVE DETECTED IMAGE =============
def save_detected_image(frame, item_name, detections):
    """Save the detected frame with bounding boxes"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"fridge_{timestamp}_{item_name.replace(' ', '_')}.jpg"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # Draw detection boxes on frame
        for detection in detections:
            x1, y1, x2, y2 = detection['box']
            label = detection['label']
            conf = detection['confidence']
            
            # Draw rectangle
            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
            # Draw label
            text = f"{label} ({conf:.2f})"
            cv2.putText(frame, text, (int(x1), int(y1) - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Save image
        cv2.imwrite(filepath, frame)
        print(f"📸 Saved image: {filename}")
        return filename
    except Exception as e:
        print(f"❌ Error saving image: {e}")
        return None

# ============= UPDATE INVENTORY WITH IMAGE =============
def update_inventory_with_image(item_name, quantity, frame, detections):
    """Update inventory and save detected image"""
    db = connect_to_database()
    if not db:
        return
    
    try:
        # Save the detected image
        image_filename = save_detected_image(frame, item_name, detections)
        
        cursor = db.cursor()
        
        # Check if item exists
        cursor.execute("SELECT quantity FROM fridge_items WHERE item = %s", (item_name,))
        row = cursor.fetchone()
        
        if row:
            new_quantity = max(0, row[0] + quantity)
            cursor.execute(
                "UPDATE fridge_items SET quantity = %s, status = %s, image_path = %s, updated_at = NOW() WHERE item = %s",
                (new_quantity, "detected", image_filename, item_name)
            )
        else:
            new_quantity = max(0, quantity)
            cursor.execute(
                "INSERT INTO fridge_items (item, quantity, status, image_path, updated_at) VALUES (%s, %s, %s, %s, NOW())",
                (item_name, new_quantity, "detected", image_filename)
            )
        
        db.commit()
        cursor.close()
        
        # Send MQTT update with image info
        inventory_data = {
            "item": item_name,
            "quantity": new_quantity,
            "image_path": image_filename,
            "timestamp": datetime.now().isoformat(),
            "action": "detected"
        }
        
        mqtt_client.publish(MQTT_TOPIC, json.dumps(inventory_data))
        print(f"✅ Updated {item_name}: {new_quantity} items | Image: {image_filename}")
        
    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
    finally:
        db.close()

# ============= MAIN DETECTION LOOP =============
def main():
    print("🚀 Starting Smart Fridge Detection (Improved)...")
    print(f"📁 Saving images to: {UPLOAD_DIR}")
    print(f"🎯 Detecting: {', '.join(grocery_list)}")
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Cannot open webcam")
        return
    
    print("📹 Webcam opened successfully")
    print("💡 Press 'q' to quit, 'r' to reset, 's' to save state")
    
    frame_count = 0
    detection_threshold = 5  # Process every 5th frame
    detected_items = defaultdict(int)
    last_detection_time = {}
    detection_cooldown = 2  # seconds between detections of same item
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Cannot read from webcam")
            break
        
        frame_count += 1
        
        # Process every nth frame
        if frame_count % detection_threshold == 0:
            results = model(frame, verbose=False, conf=0.6)  # Higher confidence threshold
            
            current_detections = defaultdict(list)
            
            for r in results:
                for box in r.boxes:
                    confidence = float(box.conf[0])
                    if confidence > 0.6:
                        class_id = int(box.cls[0])
                        class_name = model.names[class_id].lower()
                        
                        # Check if it's in our grocery list
                        if any(item in class_name for item in grocery_list):
                            # Find matching item
                            matched_item = None
                            for item in grocery_list:
                                if item in class_name or class_name in item:
                                    matched_item = item
                                    break
                            
                            if matched_item:
                                current_detections[matched_item].append({
                                    'box': box.xyxy[0].cpu().numpy(),
                                    'label': matched_item,
                                    'confidence': confidence
                                })
            
            # Update inventory for detected items
            current_time = time.time()
            for item, detections in current_detections.items():
                last_time = last_detection_time.get(item, 0)
                
                # Only update if cooldown has passed
                if current_time - last_time > detection_cooldown:
                    detected_items[item] += len(detections)
                    update_inventory_with_image(item, len(detections), frame, detections)
                    last_detection_time[item] = current_time
        
        # Display frame with info
        y_offset = 30
        cv2.putText(frame, "Smart Fridge Detection", (10, y_offset),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        y_offset += 30
        for item, count in detected_items.items():
            cv2.putText(frame, f"{item}: {count}", (10, y_offset),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            y_offset += 25
        
        cv2.putText(frame, "Press 'q' to quit, 'r' to reset, 's' to save", 
                   (10, frame.shape[0] - 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        cv2.imshow("Smart Fridge Detection", frame)
        
        # Handle key presses
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            detected_items.clear()
            last_detection_time.clear()
            print("🔄 Counts reset")
        elif key == ord('s'):
            print("💾 Saving current state...")
            for item, count in detected_items.items():
                print(f"   • {item}: {count}")
            print("✅ State saved")
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
    print("👋 Fridge detection stopped")

if __name__ == "__main__":
    main()
