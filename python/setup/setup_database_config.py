#!/usr/bin/env python3
"""
Database Configuration Setup
Helps configure MySQL connection for the Smart Home system
"""

import mysql.connector
import json
import os

def test_database_connection(host, user, password, database):
    """Test database connection with given credentials"""
    try:
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        connection.close()
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def setup_database_config():
    """Interactive database configuration setup"""
    print("🔧 Smart Home Database Configuration Setup")
    print("=" * 50)
    print()
    
    # Get database configuration
    host = input("Enter MySQL host (default: localhost): ").strip() or "localhost"
    user = input("Enter MySQL username (default: root): ").strip() or "root"
    password = input("Enter MySQL password: ").strip()
    database = input("Enter database name (default: smarthome): ").strip() or "smarthome"
    
    print()
    print("🔍 Testing database connection...")
    
    # Test connection
    if test_database_connection(host, user, password, database):
        print("✅ Database connection successful!")
        
        # Create configuration file
        config = {
            'host': host,
            'user': user,
            'password': password,
            'database': database
        }
        
        # Save to multiple files
        files_to_update = [
            'enhanced_sensor_data.py',
            'dashboard_only_system.py'
        ]
        
        for filename in files_to_update:
            if os.path.exists(filename):
                update_database_config_in_file(filename, config)
                print(f"✅ Updated {filename}")
        
        # Save configuration to JSON file
        with open('database_config.json', 'w') as f:
            json.dump(config, f, indent=2)
        print("✅ Saved configuration to database_config.json")
        
        print()
        print("🎉 Database configuration complete!")
        print("You can now run the Smart Home system.")
        
    else:
        print("❌ Database connection failed!")
        print("Please check your MySQL credentials and try again.")
        print()
        print("Common solutions:")
        print("1. Make sure MySQL is running")
        print("2. Check username and password")
        print("3. Ensure the database exists")
        print("4. Check if MySQL allows connections from localhost")

def update_database_config_in_file(filename, config):
    """Update database configuration in a Python file"""
    try:
        with open(filename, 'r') as f:
            content = f.read()
        
        # Find and replace the DB_CONFIG section
        import re
        pattern = r"DB_CONFIG = \{[^}]+\}"
        replacement = f"""DB_CONFIG = {{
    'host': '{config['host']}',
    'user': '{config['user']}',
    'password': '{config['password']}',
    'database': '{config['database']}'
}}"""
        
        updated_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        with open(filename, 'w') as f:
            f.write(updated_content)
            
    except Exception as e:
        print(f"⚠️ Error updating {filename}: {e}")

def main():
    setup_database_config()

if __name__ == "__main__":
    main()
