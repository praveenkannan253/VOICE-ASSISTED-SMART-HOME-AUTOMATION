import cv2
from ultralytics import YOLO
from collections import defaultdict
import mysql.connector
from datetime import datetime
import paho.mqtt.client as mqtt
import json
import time

# ---------------- MQTT Configuration ----------------
MQTT_BROKER = "broker-cn.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC = "fridge/inventory"

# ---------------- Database Connection ----------------
def connect_to_database():
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="password",  # Change to your MySQL password
            database="smarthome"  # Using your existing database
        )
        return db
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

# ---------------- MQTT Client Setup ----------------
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker for Fridge Detection")
    else:
        print(f"❌ Failed to connect to MQTT, return code: {rc}")

def on_disconnect(client, userdata, rc):
    print("🔌 Disconnected from MQTT Broker")

# Initialize MQTT client
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_disconnect = on_disconnect

try:
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    mqtt_client.loop_start()
except Exception as e:
    print(f"❌ MQTT connection failed: {e}")

# ---------------- Load YOLO Model ----------------
print("🤖 Loading YOLO model...")
model = YOLO("yolov9c.pt")
grocery_list = ["apple", "banana", "orange", "milk", "bread", "bottle", "wine glass", "cup", "bowl"]

# ---------------- Inventory Counts ----------------
grocery_counts = defaultdict(int)
last_update_time = time.time()
update_interval = 5  # Update every 5 seconds

# ---------------- Database Functions ----------------
def update_inventory(item_name, quantity_change):
    """Update inventory in database and send MQTT message"""
    db = connect_to_database()
    if not db:
        return
    
    try:
        cursor = db.cursor()
        
        # Check if item exists
        cursor.execute("SELECT quantity FROM fridge_items WHERE item = %s", (item_name,))
        row = cursor.fetchone()
        
        if row:
            # Update existing item
            new_quantity = max(0, row[0] + quantity_change)  # Prevent negative quantities
            cursor.execute(
                "UPDATE fridge_items SET quantity = %s, updated_at = %s WHERE item = %s",
                (new_quantity, datetime.now(), item_name)
            )
        else:
            # Insert new item
            cursor.execute(
                "INSERT INTO fridge_items (item, quantity, status, updated_at) VALUES (%s, %s, %s, %s)",
                (item_name, max(0, quantity_change), "ok", datetime.now())
            )
        
        db.commit()
        cursor.close()
        
        # Send MQTT update
        inventory_data = {
            "item": item_name,
            "quantity": new_quantity if row else max(0, quantity_change),
            "timestamp": datetime.now().isoformat(),
            "action": "detected"
        }
        
        mqtt_client.publish(MQTT_TOPIC, json.dumps(inventory_data))
        print(f"📦 Updated {item_name}: {inventory_data['quantity']} items")
        
    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
    finally:
        db.close()

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

# ---------------- Main Detection Loop ----------------
def main():
    print("🚀 Starting Smart Fridge Object Detection...")
    
    # Initialize database table if it doesn't exist
    db = connect_to_database()
    if db:
        try:
            cursor = db.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS fridge_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    item VARCHAR(100) NOT NULL,
                    quantity INT NOT NULL DEFAULT 0,
                    status VARCHAR(50) NOT NULL DEFAULT 'ok',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            db.commit()
            cursor.close()
            print("✅ Database table initialized")
        except mysql.connector.Error as err:
            print(f"❌ Database setup error: {err}")
        finally:
            db.close()
    
    # Open webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not open webcam")
        return
    
    print("📹 Webcam opened successfully")
    print("🎯 Detecting groceries: " + ", ".join(grocery_list))
    print("💡 Press 'q' to quit, 'r' to reset counts, 's' to save current state")
    
    frame_count = 0
    detection_threshold = 10  # Process every 10th frame for performance
    
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
            current_frame_detections = defaultdict(int)
            
            for r in results:
                for box in r.boxes:
                    confidence = float(box.conf[0])
                    if confidence > 0.5:  # Only process high-confidence detections
                        class_id = int(box.cls[0])
                        class_name = model.names[class_id]
                        
                        if class_name in grocery_list:
                            current_frame_detections[class_name] += 1
            
            # Update inventory for detected items
            for item, count in current_frame_detections.items():
                if count > 0:
                    update_inventory(item, count)
                    grocery_counts[item] += count
        
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
                update_inventory(item, 0)  # Update with current count
            print("✅ State saved")
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
    print("👋 Fridge detection stopped")

if __name__ == "__main__":
    main()
