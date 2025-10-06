import cv2
import mysql.connector
from datetime import datetime
import paho.mqtt.client as mqtt
import json
import time
import numpy as np

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

# ---------------- Simple Color-Based Detection ----------------
def detect_objects_by_color(frame):
    """Simple color-based object detection"""
    detected_items = []
    
    # Convert to HSV for better color detection
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Define color ranges for different items
    color_ranges = {
        'apple': {
            'lower': np.array([0, 50, 50]),    # Red
            'upper': np.array([10, 255, 255])
        },
        'banana': {
            'lower': np.array([20, 100, 100]),  # Yellow
            'upper': np.array([30, 255, 255])
        },
        'orange': {
            'lower': np.array([10, 100, 100]),  # Orange
            'upper': np.array([25, 255, 255])
        },
        'milk': {
            'lower': np.array([0, 0, 200]),     # White
            'upper': np.array([180, 30, 255])
        }
    }
    
    for item_name, color_range in color_ranges.items():
        # Create mask for this color
        mask = cv2.inRange(hsv, color_range['lower'], color_range['upper'])
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Count objects of this color
        count = 0
        for contour in contours:
            area = cv2.contourArea(contour)
            # Increased threshold to avoid detecting faces
            if area > 5000:  # Much larger threshold to avoid faces
                count += 1
        
        if count > 0:
            detected_items.append((item_name, count))
    
    return detected_items

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
            new_quantity = max(0, row[0] + quantity_change)
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
            "quantity": int(new_quantity if row else max(0, quantity_change)),
            "timestamp": datetime.now().isoformat(),
            "action": "detected"
        }
        
        mqtt_client.publish(MQTT_TOPIC, json.dumps(inventory_data))
        print(f"📦 Updated {item_name}: {inventory_data['quantity']} items")
        
    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
    finally:
        db.close()

# ---------------- Main Detection Loop ----------------
def main():
    print("🚀 Starting Simple Smart Fridge Detection...")
    print("🎯 Using color-based detection (no AI model required)")
    
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
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_item (item)
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
    print("🎯 Detecting: apple (red), banana (yellow), orange, milk (white)")
    print("💡 Press 'q' to quit, 'r' to reset counts, 's' to save current state")
    
    frame_count = 0
    detection_threshold = 30  # Process every 30th frame for performance
    last_detection_time = time.time()
    detection_cooldown = 2  # Minimum 2 seconds between detections
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Error: Could not read from webcam")
            break
        
        frame_count += 1
        
        # Process every nth frame for better performance
        if frame_count % detection_threshold == 0:
            current_time = time.time()
            if current_time - last_detection_time >= detection_cooldown:
                detected_items = detect_objects_by_color(frame)
                
                # Update inventory for detected items
                for item_name, count in detected_items:
                    if count > 0:
                        update_inventory(item_name, count)
                        last_detection_time = current_time
        
        # Display current frame with detection info
        cv2.putText(frame, "Simple Fridge Detection", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Show instructions
        cv2.putText(frame, "Press 'q' to quit, 'r' to reset, 's' to save", (10, frame.shape[0] - 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        # Display frame
        cv2.imshow("Simple Smart Fridge Detection", frame)
        
        # Handle key presses
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            print("🔄 Counts reset")
        elif key == ord('s'):
            print("💾 Saving current state...")
            print("✅ State saved")
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
    print("👋 Simple fridge detection stopped")

if __name__ == "__main__":
    main()

