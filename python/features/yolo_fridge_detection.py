"""
YOLO-based Fridge Detection System
Uses YOLOv8 for accurate object detection with backend API integration
Much more accurate than color-based detection
"""

import cv2
import numpy as np
import requests
import time
from datetime import datetime
import json

# Try to import YOLO, fallback to color detection if not available
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
    print("✅ YOLO available - using AI detection")
except ImportError:
    YOLO_AVAILABLE = False
    print("⚠️ YOLO not available - install with: pip install ultralytics")

# Configuration
BACKEND_URL = "http://localhost:3000"
CAMERA_INDEX = 0
DETECTION_INTERVAL = 5  # seconds between detections
CONFIDENCE_THRESHOLD = 0.3  # Lowered from 0.5 for better detection

# Item thresholds (minimum quantity before alert)
THRESHOLDS = {
    "apple": 3,
    "banana": 2,
    "orange": 2,
    "bottle": 1,  # milk bottles
    "cup": 2,
    "bowl": 1,
    "sandwich": 1,
    "hot dog": 1,
    "pizza": 1,
    "donut": 2,
    "cake": 1,
    "carrot": 3,
    "broccoli": 2,
}

# YOLO COCO dataset food items (class names)
FOOD_ITEMS = [
    "banana", "apple", "sandwich", "orange", "broccoli", "carrot",
    "hot dog", "pizza", "donut", "cake", "bottle", "wine glass",
    "cup", "fork", "knife", "spoon", "bowl"
]

class YOLOFridgeDetector:
    def __init__(self):
        self.camera = None
        self.model = None
        self.detected_items = {}
        self.last_detection_time = 0
        
        print("🧊 YOLO Fridge Detection System Starting...")
        print("=" * 60)
        
    def initialize_yolo(self):
        """Initialize YOLO model"""
        if not YOLO_AVAILABLE:
            print("❌ YOLO not available. Please install:")
            print("   pip install ultralytics")
            return False
        
        try:
            print("🤖 Loading YOLO model...")
            # YOLOv8n is fastest, yolov8s is more accurate
            self.model = YOLO("yolov8n.pt")  # Will auto-download if not present
            print("✅ YOLO model loaded successfully")
            return True
        except Exception as e:
            print(f"❌ Error loading YOLO model: {e}")
            return False
    
    def initialize_camera(self):
        """Initialize webcam"""
        print("📷 Initializing camera...")
        self.camera = cv2.VideoCapture(CAMERA_INDEX)
        
        if not self.camera.isOpened():
            print("❌ Error: Could not open camera")
            return False
            
        # Set camera properties
        self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        print("✅ Camera initialized successfully")
        return True
    
    def detect_items_yolo(self, frame):
        """
        Detect items using YOLO
        Returns dictionary of detected items and their counts
        """
        if not self.model:
            return {}
        
        detected = {}
        
        # Run YOLO detection with lower confidence threshold
        results = self.model(frame, verbose=False, conf=CONFIDENCE_THRESHOLD, iou=0.45)
        
        # Process results
        all_detections = []  # For debugging
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get class name
                class_id = int(box.cls[0])
                class_name = self.model.names[class_id]
                confidence = float(box.conf[0])
                
                # Store all detections for debugging
                all_detections.append(f"{class_name}({confidence:.2f})")
                
                # Only count food items
                if class_name in FOOD_ITEMS:
                    # Increment count for this item
                    detected[class_name] = detected.get(class_name, 0) + 1
                    
                    # Draw bounding box on frame
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    
                    # Add label
                    label = f"{class_name}: {confidence:.2f}"
                    cv2.putText(frame, label, (x1, y1 - 10),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Debug: Print all detections
        if all_detections:
            print(f"🔍 All detections: {', '.join(all_detections)}")
        else:
            print("🔍 No objects detected at all")
        
        return detected
    
    def get_current_quantity(self, item):
        """Get current quantity from backend"""
        try:
            url = f"{BACKEND_URL}/api/fridge/inventory"
            response = requests.get(url, timeout=2)
            if response.status_code == 200:
                data = response.json()
                inventory = data.get('inventory', [])
                for inv_item in inventory:
                    if inv_item['item'].lower() == item.lower():
                        qty = inv_item['quantity']
                        print(f"📊 Current {item} quantity in backend: {qty}")
                        return int(qty)  # Ensure it's an integer
            print(f"📊 {item} not found in backend, starting from 0")
            return 0
        except Exception as e:
            print(f"⚠️ Error getting current quantity: {e}")
            print(f"⚠️ Backend might not be running at {BACKEND_URL}")
            return 0
    
    def update_backend(self, item, quantity):
        """Update backend with detected item - increments quantity"""
        try:
            # Capitalize item name
            item_capitalized = item.capitalize()
            
            print(f"\n🔄 Updating {item_capitalized}...")
            
            # Get current quantity first
            current_qty = self.get_current_quantity(item_capitalized)
            new_qty = current_qty + quantity
            
            print(f"➕ Adding {quantity} to existing {current_qty} = {new_qty}")
            
            url = f"{BACKEND_URL}/api/fridge/update"
            data = {
                "item": item_capitalized,
                "quantity": new_qty,
                "action": "set"
            }
            
            response = requests.post(url, json=data, timeout=2)
            if response.status_code == 200:
                print(f"✅ Backend updated: {item_capitalized} = {new_qty}")
                return True
            else:
                print(f"⚠️ Backend returned status {response.status_code}")
                print(f"⚠️ Response: {response.text}")
                return False
                
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to backend at {BACKEND_URL}")
            print(f"⚠️ Make sure backend server is running!")
            return False
        except Exception as e:
            print(f"❌ Error updating backend: {e}")
            return False
    
    def check_thresholds(self, items):
        """Check if any items are below threshold"""
        alerts = []
        
        for item, quantity in items.items():
            threshold = THRESHOLDS.get(item, 1)
            if quantity <= threshold:
                alert_msg = f"⚠️ LOW STOCK: {item.capitalize()} ({quantity} left, threshold: {threshold})"
                alerts.append(alert_msg)
                print(alert_msg)
        
        return alerts
    
    def display_frame(self, frame, detected_items):
        """Display frame with detection info"""
        # Add semi-transparent overlay for text background
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (frame.shape[1], 150), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.3, frame, 0.7, 0, frame)
        
        # Add text overlay
        y_offset = 30
        cv2.putText(frame, "🧊 YOLO Fridge Detection", (10, y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        y_offset += 30
        cv2.putText(frame, f"Time: {datetime.now().strftime('%H:%M:%S')}", 
                   (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        y_offset += 30
        cv2.putText(frame, "Detected Items:", (10, y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        
        y_offset += 30
        if detected_items:
            for item, quantity in detected_items.items():
                threshold = THRESHOLDS.get(item, 1)
                color = (0, 0, 255) if quantity <= threshold else (0, 255, 0)
                text = f"{item.capitalize()}: {quantity}"
                cv2.putText(frame, text, (10, y_offset), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
                y_offset += 25
        else:
            cv2.putText(frame, "No items detected", (10, y_offset), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (128, 128, 128), 1)
        
        # Instructions at bottom
        instructions = "Press 'q' to quit | Press 's' to scan"
        cv2.putText(frame, instructions, 
                   (10, frame.shape[0] - 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
        
        cv2.imshow("YOLO Fridge Detection", frame)
    
    def run(self):
        """Main detection loop"""
        if not self.initialize_yolo():
            print("❌ Cannot start without YOLO model")
            return
        
        if not self.initialize_camera():
            return
        
        print("\n📸 Camera is ready!")
        print("=" * 60)
        print("Instructions:")
        print("1. Show items to the camera")
        print("2. Press 's' to scan and detect items")
        print("3. Press 'q' to quit")
        print("=" * 60)
        print(f"\n🎯 Can detect: {', '.join(FOOD_ITEMS)}")
        print()
        
        try:
            while True:
                ret, frame = self.camera.read()
                if not ret:
                    print("❌ Error reading frame")
                    break
                
                # Display current frame
                display_frame = frame.copy()
                self.display_frame(display_frame, self.detected_items)
                
                # Handle keyboard input
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord('q'):
                    print("\n👋 Exiting...")
                    break
                
                elif key == ord('s'):
                    print("\n🔍 Scanning for items with YOLO...")
                    print(f"⚙️ Using confidence threshold: {CONFIDENCE_THRESHOLD}")
                    detected = self.detect_items_yolo(frame)
                    
                    if detected:
                        print(f"📦 Detected: {detected}")
                        self.detected_items = detected
                        
                        # Update backend
                        for item, quantity in detected.items():
                            self.update_backend(item, quantity)
                        
                        # Check thresholds
                        alerts = self.check_thresholds(detected)
                        
                        if alerts:
                            print("\n🚨 ALERTS:")
                            for alert in alerts:
                                print(f"  {alert}")
                        
                        print("\n✅ Scan complete!")
                    else:
                        print("❌ No food items detected. Try again.")
                    
                    print()
                
        except KeyboardInterrupt:
            print("\n\n⚠️ Interrupted by user")
        
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up resources"""
        if self.camera:
            self.camera.release()
        cv2.destroyAllWindows()
        print("\n✅ Camera released")
        print("👋 YOLO Fridge Detection System stopped")

def main():
    print("\n")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║                                                            ║")
    print("║          🧊 YOLO FRIDGE DETECTION SYSTEM 🧊               ║")
    print("║              (AI-Powered Object Detection)                 ║")
    print("║                                                            ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()
    
    detector = YOLOFridgeDetector()
    detector.run()

if __name__ == "__main__":
    main()
