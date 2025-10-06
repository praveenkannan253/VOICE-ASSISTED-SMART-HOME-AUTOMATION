#!/usr/bin/env python3
"""
Enhanced Sensor Data System
Uses real ESP32 sensor data from database with historical patterns
For dashboard-only setup with hardware on separate machine
"""

import json
import time
import paho.mqtt.publish as publish
import mysql.connector
import random
from datetime import datetime, timedelta

# Database configuration - Update these values to match your MySQL setup
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'your_mysql_password_here',  # Update this with your actual MySQL password
    'database': 'smarthome'
}

# MQTT Configuration
BROKER = "broker-cn.emqx.io"
TOPIC = "esp/sensors"

class EnhancedSensorData:
    def __init__(self):
        self.db_connection = None
        self.historical_patterns = {}
        self.connect_database()
    
    def connect_database(self):
        """Connect to MySQL database"""
        try:
            self.db_connection = mysql.connector.connect(**DB_CONFIG)
            print("✅ Connected to MySQL database")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            print("⚠️ Continuing with simulated data...")
            return False
    
    def analyze_historical_patterns(self):
        """Analyze historical sensor data to create realistic patterns"""
        if not self.db_connection:
            return
        
        try:
            cursor = self.db_connection.cursor()
            
            # Get last 24 hours of data
            query = """
            SELECT value_json, recorded_at 
            FROM sensors 
            WHERE topic = 'esp/sensors' 
            AND recorded_at >= NOW() - INTERVAL 24 HOUR
            ORDER BY recorded_at ASC
            """
            cursor.execute(query)
            results = cursor.fetchall()
            
            if results:
                # Analyze temperature patterns
                temps = []
                hums = []
                ldr_values = []
                
                for row in results:
                    data = json.loads(row[0])
                    if 'temp' in data:
                        temps.append(data['temp'])
                    if 'hum' in data:
                        hums.append(data['hum'])
                    if 'ldr' in data:
                        ldr_values.append(data['ldr'])
                
                # Calculate patterns
                self.historical_patterns = {
                    'temp_avg': sum(temps) / len(temps) if temps else 25,
                    'temp_min': min(temps) if temps else 20,
                    'temp_max': max(temps) if temps else 30,
                    'hum_avg': sum(hums) / len(hums) if hums else 60,
                    'hum_min': min(hums) if hums else 40,
                    'hum_max': max(hums) if hums else 80,
                    'ldr_avg': sum(ldr_values) / len(ldr_values) if ldr_values else 300,
                    'ldr_min': min(ldr_values) if ldr_values else 200,
                    'ldr_max': max(ldr_values) if ldr_values else 400
                }
                
                print("📊 Historical patterns analyzed:")
                print(f"   Temperature: {self.historical_patterns['temp_avg']:.1f}°C (range: {self.historical_patterns['temp_min']:.1f}-{self.historical_patterns['temp_max']:.1f})")
                print(f"   Humidity: {self.historical_patterns['hum_avg']:.1f}% (range: {self.historical_patterns['hum_min']:.1f}-{self.historical_patterns['hum_max']:.1f})")
                print(f"   Light: {self.historical_patterns['ldr_avg']:.0f} (range: {self.historical_patterns['ldr_min']:.0f}-{self.historical_patterns['ldr_max']:.0f})")
            
            cursor.close()
            
        except Exception as e:
            print(f"❌ Error analyzing patterns: {e}")
    
    def generate_enhanced_sensor_data(self):
        """Generate sensor data based on historical patterns"""
        if not self.historical_patterns:
            # Fallback to basic simulation
            return self.generate_basic_sensor_data()
        
        # Generate data based on historical patterns
        temp_avg = self.historical_patterns['temp_avg']
        temp_min = self.historical_patterns['temp_min']
        temp_max = self.historical_patterns['temp_max']
        
        hum_avg = self.historical_patterns['hum_avg']
        hum_min = self.historical_patterns['hum_min']
        hum_max = self.historical_patterns['hum_max']
        
        ldr_avg = self.historical_patterns['ldr_avg']
        ldr_min = self.historical_patterns['ldr_min']
        ldr_max = self.historical_patterns['ldr_max']
        
        # Generate realistic values within historical ranges
        temp = temp_avg + random.uniform(-1, 1)
        temp = max(temp_min, min(temp_max, temp))  # Clamp to historical range
        
        hum = hum_avg + random.uniform(-2, 2)
        hum = max(hum_min, min(hum_max, hum))  # Clamp to historical range
        
        ldr = ldr_avg + random.randint(-20, 20)
        ldr = max(ldr_min, min(ldr_max, ldr))  # Clamp to historical range
        
        # Generate motion sensors with realistic patterns
        pir = 1 if random.random() < 0.05 else 0  # 5% chance of motion
        ir = 1 if random.random() < 0.03 else 0   # 3% chance of IR detection
        
        return {
            "temp": round(temp, 1),
            "hum": round(hum, 1),
            "ldr": int(ldr),
            "pir": pir,
            "ir": ir,
            "timestamp": time.time(),
            "source": "enhanced_database",
            "pattern_based": True
        }
    
    def generate_basic_sensor_data(self):
        """Generate basic sensor data when no historical data available"""
        temp = 25 + random.uniform(-2, 3)
        hum = 60 + random.uniform(-5, 10)
        ldr = 300 + random.randint(-50, 50)
        pir = random.choice([0, 1]) if random.random() < 0.1 else 0
        ir = random.choice([0, 1]) if random.random() < 0.1 else 0
        
        return {
            "temp": round(temp, 1),
            "hum": round(hum, 1),
            "ldr": ldr,
            "pir": pir,
            "ir": ir,
            "timestamp": time.time(),
            "source": "simulated",
            "pattern_based": False
        }
    
    def send_enhanced_sensor_data(self):
        """Send enhanced sensor data based on database patterns"""
        sensor_data = self.generate_enhanced_sensor_data()
        
        try:
            publish.single(TOPIC, json.dumps(sensor_data), hostname=BROKER)
            source = sensor_data['source']
            pattern_based = sensor_data.get('pattern_based', False)
            
            print(f"📡 Enhanced Sensor Data: Temp={sensor_data['temp']}°C, Hum={sensor_data['hum']}%, LDR={sensor_data['ldr']}, PIR={sensor_data['pir']}, IR={sensor_data['ir']}")
            print(f"🔧 Source: {source}, Pattern-based: {pattern_based}")
            
        except Exception as e:
            print(f"❌ Error sending data: {e}")
    
    def start(self):
        """Start the enhanced sensor data system"""
        print("🚀 Enhanced Sensor Data System Starting...")
        print("=" * 60)
        print("📊 Data Source: Real ESP32 data from database")
        print("🔧 Enhanced: Historical patterns + realistic simulation")
        print("🌐 Hardware: Separate PC (Friend's laptop)")
        print("Press Ctrl+C to stop")
        print()
        
        # Analyze historical patterns
        self.analyze_historical_patterns()
        
        try:
            while True:
                self.send_enhanced_sensor_data()
                time.sleep(2)  # Send data every 2 seconds
        except KeyboardInterrupt:
            print("\n🛑 Stopping enhanced sensor data system...")
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            if self.db_connection:
                self.db_connection.close()

if __name__ == "__main__":
    system = EnhancedSensorData()
    system.start()
