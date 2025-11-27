import cv2
from ultralytics import YOLO
from collections import defaultdict
import mysql.connector
from datetime import datetime
import paho.mqtt.client as mqtt
import json
import time
import os
import base64
from pathlib import Path

# ============= CONFIGURATION =============
MQTT_BROKER = "broker-cn.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC = "fridge/inventory"

# Create images directory for detected items
IMAGES_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'uploads', 'fridge')
os.makedirs(IMAGES_DIR, exist_ok=True)
print(f"📁 Images will be saved to: {IMAGES_DIR}")

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
        print("✅ Connected to MQTT Broker for Fridge Detection")
    else:
        print(f"❌ Failed to connect to MQTT, return code: {rc}")

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
# YOLO COCO dataset class names - actual detectable items
# Using exact YOLO class names for reliable detection
grocery_list = [
    # Eggs - Priority item
    "egg", "eggs",
    # Fruits
    "apple", "banana", "orange", "lemon", "lime", "strawberry", "blueberry",
    # Vegetables
    "carrot", "broccoli", "potato", "tomato", "onion", "pepper",
    # Dairy & Food
    "milk", "bread", "cheese", "bottle", "cup", "bowl"
]

# Print available YOLO classes for debugging
print(f"🎯 YOLO Model Classes: {len(model.names)} total")
print(f"📋 Monitoring for: {', '.join(grocery_list)}")

# ============= INVENTORY TRACKING =============
grocery_counts = defaultdict(int)
detected_items = {}  # Track detected items with their images
last_update_time = time.time()
update_interval = 5  # Update every 5 seconds

# ============= SAVE DETECTED ITEM IMAGE =============
def save_detected_image(frame, item_name, box, confidence):
    """
    Extract and save the detected item image from the frame
    Returns the filename if successful
    """
    try:
        # Get bounding box coordinates
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        
        # Add padding to capture context
        padding = 10
        x1 = max(0, x1 - padding)
        y1 = max(0, y1 - padding)
        x2 = min(frame.shape[1], x2 + padding)
        y2 = min(frame.shape[0], y2 + padding)
        
        # Extract the region
        item_image = frame[y1:y2, x1:x2]
        
        if item_image.size == 0:
            return None
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
        filename = f"fridge_{item_name}_{timestamp}.jpg"
        filepath = os.path.join(IMAGES_DIR, filename)
        
        # Save image
        cv2.imwrite(filepath, item_image)
        print(f"📸 Saved image: {filename} ({confidence*100:.1f}%)")
        
        return filename
    except Exception as e:
        print(f"❌ Error saving image: {e}")
        return None

# ============= UPDATE INVENTORY WITH IMAGE =============
def update_inventory(item_name, quantity_change, image_filename=None):
    """Update inventory in database and send MQTT message with image"""
    db = connect_to_database()
    if not db:
        return False
    
    try:
        cursor = db.cursor()
        
        # Check if item exists
        cursor.execute("SELECT quantity FROM fridge_items WHERE item = %s", (item_name,))
        row = cursor.fetchone()
        
        new_quantity = 0
        is_new_item = False
        
        if row:
            # Update existing item
            new_quantity = max(0, row[0] + quantity_change)
            cursor.execute(
                "UPDATE fridge_items SET quantity = %s, image_path = %s, updated_at = NOW() WHERE item = %s",
                (new_quantity, image_filename, item_name)
            )
        else:
            # Insert new item
            is_new_item = True
            new_quantity = max(0, quantity_change)
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
            "is_new": is_new_item,
            "timestamp": datetime.now().isoformat(),
            "action": "detected"
        }
        
        mqtt_client.publish(MQTT_TOPIC, json.dumps(inventory_data))
        
        if is_new_item:
            print(f"🆕 NEW ITEM DETECTED: {item_name}")
        else:
            print(f"📦 Updated {item_name}: {new_quantity} items")
        
        return True
        
    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
        return False
    finally:
        db.close()

# ============= GET CURRENT INVENTORY =============
def get_current_inventory():
    """Get current inventory from database"""
    db = connect_to_database()
    if not db:
        return {}
    
    try:
        cursor = db.cursor()
        cursor.execute("SELECT item, quantity FROM fridge_items")
        inventory = {row[0]: row[1] for row in cursor.fetchall()}
        cursor.close()
        return inventory
    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
        return {}
    finally:
        db.close()

# ============= INITIALIZE DATABASE TABLE =============
def initialize_database():
    """Initialize fridge_items table if it doesn't exist"""
    db = connect_to_database()
    if not db:
        return
    
    try:
        cursor = db.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS fridge_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item VARCHAR(100) NOT NULL,
                quantity INT NOT NULL DEFAULT 0,
                status VARCHAR(50) NOT NULL DEFAULT 'ok',
                image_path VARCHAR(255),
                image_url VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_item (item)
            )
        """)
        db.commit()
        cursor.close()
        print("✅ Database table initialized")
    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
    finally:
        db.close()

# ============= MAIN DETECTION LOOP =============
def main():
    """Main fridge detection loop"""
    print("🚀 Starting Smart Fridge Object Detection...")
    
    # Initialize database
    initialize_database()
    
    # Open webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not open webcam")
        return
    
    print("📹 Webcam opened successfully")
    print("🎯 Detecting groceries: " + ", ".join(grocery_list))
    print("💡 Press 'q' to quit, 'r' to reset counts, 's' to save current state")
    
    frame_count = 0
    detection_threshold = 5  # Process every 5th frame for performance
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Error: Could not read from webcam")
            break
        
        frame_count += 1
        
        # Process every nth frame for better performance
        if frame_count % detection_threshold == 0:
            results = model(frame, verbose=False)
            
            # Reset counts for this frame
            current_frame_detections = defaultdict(list)
            
            for r in results:
                for box in r.boxes:
                    confidence = float(box.conf[0])
                    if confidence > 0.5:  # Only process high-confidence detections
                        class_id = int(box.cls[0])
                        class_name = model.names[class_id].lower()  # Convert to lowercase
                        
                        # Check if detected class matches any in grocery list (case-insensitive)
                        matched_item = None
                        for grocery_item in grocery_list:
                            if class_name == grocery_item.lower() or grocery_item.lower() in class_name:
                                matched_item = grocery_item
                                break
                        
                        if matched_item:
                            current_frame_detections[matched_item].append({
                                'box': box,
                                'confidence': confidence
                            })
                            print(f"✅ Detected: {matched_item} (YOLO: {class_name}, conf: {confidence:.2f})")
            
            # Update inventory for detected items
            for item, detections in current_frame_detections.items():
                if detections:
                    # Save image of the first (best) detection
                    best_detection = max(detections, key=lambda x: x['confidence'])
                    image_filename = save_detected_image(
                        frame, 
                        item, 
                        best_detection['box'],
                        best_detection['confidence']
                    )
                    
                    # Update inventory with image
                    update_inventory(item, len(detections), image_filename)
                    grocery_counts[item] += len(detections)
        
        # Display current counts on frame
        y_offset = 30
        cv2.putText(frame, "Smart Fridge Detection", (10, y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        for item, count in grocery_counts.items():
            y_offset += 25
            cv2.putText(frame, f"{item}: {count}", (10, y_offset), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Show instructions
        cv2.putText(frame, "Press 'q' to quit, 'r' to reset, 's' to save", (10, frame.shape[0] - 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        # Display frame
        cv2.imshow("Smart Fridge Grocery Detection", frame)
        
        # Handle key presses
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            # Reset counts
            grocery_counts.clear()
            print("🔄 Counts reset")
        elif key == ord('s'):
            # Save current state to database
            print("💾 Saving current state...")
            for item, count in grocery_counts.items():
                update_inventory(item, 0)
            print("✅ State saved")
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
    print("👋 Fridge detection stopped")

if __name__ == "__main__":
    main()
