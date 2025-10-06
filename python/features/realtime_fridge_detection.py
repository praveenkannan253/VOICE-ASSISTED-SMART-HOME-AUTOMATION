"""
Real-time Fridge Detection System
Uses PC camera to detect items and update dashboard with alerts
"""

import cv2
import numpy as np
import requests
import time
from datetime import datetime
import json

# Configuration
BACKEND_URL = "http://localhost:3000"
CAMERA_INDEX = 0  # 0 for default webcam
DETECTION_INTERVAL = 5  # seconds between detections
CONFIDENCE_THRESHOLD = 0.5

# Item thresholds (minimum quantity before alert)
THRESHOLDS = {
    "milk": 1,
    "banana": 2,
    "orange": 2,
    "apple": 3,
    "tomato": 2,
    "carrot": 3,
    "egg": 6,
    "bread": 1,
    "cheese": 1,
    "yogurt": 2
}

# Item categories for detection
FOOD_ITEMS = {
    # Fruits
    "banana": ["banana", "bananas"],
    "apple": ["apple", "apples"],
    "orange": ["orange", "oranges"],
    
    # Vegetables
    "tomato": ["tomato", "tomatoes"],
    "carrot": ["carrot", "carrots"],
    
    # Dairy
    "milk": ["milk", "milk bottle", "milk carton"],
    "cheese": ["cheese"],
    "yogurt": ["yogurt", "yoghurt"],
    
    # Others
    "egg": ["egg", "eggs"],
    "bread": ["bread", "loaf"]
}

class FridgeDetector:
    def __init__(self):
        self.camera = None
        self.detected_items = {}
        self.last_detection_time = 0
        
        print("🧊 Fridge Detection System Starting...")
        print("=" * 60)
        
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
    
    def detect_items_simple(self, frame):
        """
        Simple detection using color and shape
        Detects the MOST PROMINENT item only to avoid false positives
        """
        detected = {}
        
        # Convert to HSV for color detection
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Collect all color detections with pixel counts
        color_detections = []
        
        # Yellow detection (Banana)
        yellow_lower = np.array([20, 100, 100])
        yellow_upper = np.array([30, 255, 255])
        yellow_mask = cv2.inRange(hsv, yellow_lower, yellow_upper)
        yellow_pixels = cv2.countNonZero(yellow_mask)
        if yellow_pixels > 8000:  # Increased threshold
            color_detections.append(("banana", yellow_pixels))
        
        # Red detection (Apple, Tomato)
        red_lower = np.array([0, 100, 100])
        red_upper = np.array([10, 255, 255])
        red_mask = cv2.inRange(hsv, red_lower, red_upper)
        red_pixels = cv2.countNonZero(red_mask)
        if red_pixels > 8000:  # Increased threshold
            color_detections.append(("apple", red_pixels))
        
        # Orange detection
        orange_lower = np.array([10, 100, 100])
        orange_upper = np.array([20, 255, 255])
        orange_mask = cv2.inRange(hsv, orange_lower, orange_upper)
        orange_pixels = cv2.countNonZero(orange_mask)
        if orange_pixels > 8000:  # Increased threshold
            color_detections.append(("orange", orange_pixels))
        
        # White detection (Milk, Egg)
        white_lower = np.array([0, 0, 200])
        white_upper = np.array([180, 30, 255])
        white_mask = cv2.inRange(hsv, white_lower, white_upper)
        white_pixels = cv2.countNonZero(white_mask)
        if white_pixels > 10000:  # Increased threshold
            color_detections.append(("milk", white_pixels))
        
        # Only return the MOST PROMINENT item (highest pixel count)
        if color_detections:
            color_detections.sort(key=lambda x: x[1], reverse=True)
            detected[color_detections[0][0]] = 1  # Only the top detection
        
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
                        return inv_item['quantity']
            return 0
        except Exception as e:
            print(f"⚠️ Error getting current quantity: {e}")
            return 0
    
    def update_backend(self, item, quantity):
        """Update backend with detected item - increments quantity"""
        try:
            # Capitalize item name (milk -> Milk)
            item_capitalized = item.capitalize()
            
            # Get current quantity first
            current_qty = self.get_current_quantity(item_capitalized)
            new_qty = current_qty + quantity  # Increment instead of set
            
            url = f"{BACKEND_URL}/api/fridge/update"
            data = {
                "item": item_capitalized,
                "quantity": new_qty,
                "action": "set"
            }
            
            response = requests.post(url, json=data, timeout=2)
            if response.status_code == 200:
                print(f"✅ Updated {item_capitalized}: {str(current_qty)} -> {str(new_qty)}")
                return True
            else:
                print(f"⚠️ Failed to update {item_capitalized}")
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
        # Add text overlay
        y_offset = 30
        cv2.putText(frame, "🧊 Fridge Detection System", (10, y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        y_offset += 40
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
        
        # Instructions
        cv2.putText(frame, "Press 'q' to quit | Press 's' to scan", 
                   (10, frame.shape[0] - 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
        
        cv2.imshow("Fridge Detection", frame)
    
    def run(self):
        """Main detection loop"""
        if not self.initialize_camera():
            return
        
        print("\n📸 Camera is ready!")
        print("=" * 60)
        print("Instructions:")
        print("1. Show items to the camera (milk, fruits, vegetables)")
        print("2. Press 's' to scan and detect items")
        print("3. Press 'q' to quit")
        print("=" * 60)
        print()
        
        try:
            while True:
                ret, frame = self.camera.read()
                if not ret:
                    print("❌ Error reading frame")
                    break
                
                # Display current frame
                self.display_frame(frame, self.detected_items)
                
                # Handle keyboard input
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord('q'):
                    print("\n👋 Exiting...")
                    break
                
                elif key == ord('s'):
                    print("\n🔍 Scanning for items...")
                    detected = self.detect_items_simple(frame)
                    
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
                        print("❌ No items detected. Try again.")
                    
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
        print("👋 Fridge Detection System stopped")

def main():
    print("\n")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║                                                            ║")
    print("║          🧊 FRIDGE DETECTION SYSTEM 🧊                    ║")
    print("║                                                            ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()
    
    detector = FridgeDetector()
    detector.run()

if __name__ == "__main__":
    main()
