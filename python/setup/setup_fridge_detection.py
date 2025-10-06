#!/usr/bin/env python3
"""
Smart Fridge Detection Setup Script
This script helps you set up the fridge detection system
"""

import mysql.connector
import sys

def setup_database():
    """Setup the database table for fridge items"""
    try:
        # Connect to MySQL
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="password",  # Change this to your MySQL password
            database="smarthome"
        )
        
        cursor = db.cursor()
        
        # Create fridge_items table
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
        
        # Insert some sample data
        sample_items = [
            ("apple", 3),
            ("banana", 5),
            ("milk", 2),
            ("bread", 1)
        ]
        
        for item, qty in sample_items:
            cursor.execute("""
                INSERT IGNORE INTO fridge_items (item, quantity) 
                VALUES (%s, %s)
            """, (item, qty))
        
        db.commit()
        cursor.close()
        db.close()
        
        print("✅ Database setup completed successfully!")
        print("📦 Sample fridge items added:")
        for item, qty in sample_items:
            print(f"   - {item}: {qty}")
            
    except mysql.connector.Error as err:
        print(f"❌ Database setup failed: {err}")
        print("💡 Make sure MySQL is running and credentials are correct")
        return False
    
    return True

def check_dependencies():
    """Check if required Python packages are installed"""
    required_packages = [
        'cv2', 'ultralytics', 'mysql.connector', 'paho.mqtt'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'cv2':
                import cv2
            elif package == 'ultralytics':
                from ultralytics import YOLO
            elif package == 'mysql.connector':
                import mysql.connector
            elif package == 'paho.mqtt':
                import paho.mqtt.client as mqtt
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n💡 Install missing packages with:")
        print("   pip install -r requirements.txt")
        return False
    else:
        print("✅ All required packages are installed!")
        return True

def main():
    print("🚀 Smart Fridge Detection Setup")
    print("=" * 40)
    
    # Check dependencies
    print("\n1. Checking Python dependencies...")
    if not check_dependencies():
        print("\n❌ Please install missing dependencies first")
        return
    
    # Setup database
    print("\n2. Setting up database...")
    if not setup_database():
        print("\n❌ Database setup failed")
        return
    
    print("\n✅ Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update MySQL credentials in fridge_detection.py")
    print("2. Run: python fridge_detection.py")
    print("3. Open your Smart Home dashboard to see real-time inventory")
    print("\n🎯 The system will:")
    print("   - Detect groceries using your webcam")
    print("   - Update inventory in real-time")
    print("   - Send data to your Smart Home dashboard")
    print("   - Store data in MySQL database")

if __name__ == "__main__":
    main()
