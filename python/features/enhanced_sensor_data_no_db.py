#!/usr/bin/env python3
"""
Enhanced Sensor Data System (No Database)
Uses realistic sensor data simulation without database dependency
For dashboard-only setup with hardware on separate machine
"""

import json
import time
import paho.mqtt.publish as publish
import random

# MQTT Configuration
BROKER = "broker-cn.emqx.io"
TOPIC = "esp/sensors"

class EnhancedSensorDataNoDB:
    def __init__(self):
        self.sensor_history = []
        self.temp_trend = 0
        self.hum_trend = 0
        
    def generate_realistic_sensor_data(self):
        """Generate realistic sensor data with trends and patterns"""
        current_time = time.time()
        
        # Create realistic temperature patterns (day/night cycle)
        hour = (current_time // 3600) % 24
        base_temp = 22 + 6 * (0.5 + 0.5 * (1 + (hour - 12) / 12))  # 22-28°C range
        
        # Add gradual temperature changes
        if len(self.sensor_history) > 0:
            last_temp = self.sensor_history[-1].get('temp', base_temp)
            temp_change = random.uniform(-0.5, 0.5)
            temp = last_temp + temp_change
        else:
            temp = base_temp + random.uniform(-1, 1)
        
        # Create realistic humidity patterns
        base_hum = 60 + 10 * (0.5 + 0.5 * (1 + (hour - 12) / 12))  # 60-70% range
        
        if len(self.sensor_history) > 0:
            last_hum = self.sensor_history[-1].get('hum', base_hum)
            hum_change = random.uniform(-1, 1)
            hum = last_hum + hum_change
        else:
            hum = base_hum + random.uniform(-2, 2)
        
        # Generate light sensor data (realistic day/night pattern)
        if 6 <= hour <= 18:  # Daytime
            ldr_base = 400 + random.randint(-50, 50)
        else:  # Nighttime
            ldr_base = 100 + random.randint(-30, 30)
        
        # Generate motion sensors with realistic patterns
        pir = 0
        ir = 0
        
        # Higher chance of motion during day hours
        motion_chance = 0.1 if 6 <= hour <= 22 else 0.02
        if random.random() < motion_chance:
            pir = 1
            ir = 1
        
        # Create sensor data
        sensor_data = {
            "temp": round(max(18, min(35, temp)), 1),  # Clamp between 18-35°C
            "hum": round(max(30, min(90, hum)), 1),   # Clamp between 30-90%
            "ldr": max(50, min(500, ldr_base)),       # Clamp between 50-500
            "pir": pir,
            "ir": ir,
            "timestamp": current_time,
            "source": "enhanced_simulation",
            "pattern_based": True,
            "hour": hour
        }
        
        # Store in history (keep last 100 readings)
        self.sensor_history.append(sensor_data)
        if len(self.sensor_history) > 100:
            self.sensor_history.pop(0)
        
        return sensor_data
    
    def send_enhanced_sensor_data(self):
        """Send enhanced sensor data"""
        sensor_data = self.generate_realistic_sensor_data()
        
        try:
            publish.single(TOPIC, json.dumps(sensor_data), hostname=BROKER)
            
            print(f"📡 Enhanced Sensor Data: Temp={sensor_data['temp']}°C, Hum={sensor_data['hum']}%, LDR={sensor_data['ldr']}, PIR={sensor_data['pir']}, IR={sensor_data['ir']}")
            print(f"🔧 Source: {sensor_data['source']}, Pattern-based: {sensor_data['pattern_based']}, Hour: {sensor_data['hour']}")
            
        except Exception as e:
            print(f"❌ Error sending data: {e}")
    
    def start(self):
        """Start the enhanced sensor data system"""
        print("🚀 Enhanced Sensor Data System Starting (No Database)")
        print("=" * 60)
        print("📊 Data Source: Enhanced realistic simulation")
        print("🔧 Features: Day/night patterns, realistic trends")
        print("🌐 Hardware: Separate PC (Friend's laptop)")
        print("Press Ctrl+C to stop")
        print()
        
        try:
            while True:
                self.send_enhanced_sensor_data()
                time.sleep(2)  # Send data every 2 seconds
        except KeyboardInterrupt:
            print("\n🛑 Stopping enhanced sensor data system...")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    system = EnhancedSensorDataNoDB()
    system.start()
