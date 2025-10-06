# 🌐 Smart Home Network Setup Guide

## Overview
This guide helps you set up the Smart Home system when the ESP32 hardware is connected to a separate PC/laptop.

## 🌐 Network Architecture

```
Development Machine (Your PC)          Hardware Machine (ESP32 PC)
┌─────────────────────────────┐       ┌─────────────────────────────┐
│  Frontend Dashboard         │       │  ESP32 Hardware             │
│  Backend Server             │       │  Network Command Receiver    │
│  Face Detection             │       │  Network Sensor Simulator   │
│  MQTT Client                │       │  MQTT Client                │
└─────────────────────────────┘       └─────────────────────────────┘
            │                                       │
            └─────────── MQTT Broker ──────────────┘
                   (broker-cn.emqx.io)
```

## 🚀 Quick Setup

### Step 1: Configure Network
Run on your development machine:
```bash
python network_config.py
```
Enter the IP address of your hardware machine when prompted.

### Step 2: Copy Files to Hardware Machine
Copy these files to your hardware machine:
- `network_config.json`
- `esp32_network_receiver.py`
- `esp32_network_simulator.py`
- `hardware_machine_setup.bat`

### Step 3: Start Hardware Machine
On your hardware machine, run:
```bash
hardware_machine_setup.bat
```

### Step 4: Start Development System
On your development machine, run:
```bash
start_network_system.bat
```

## 📋 Detailed Setup Instructions

### Development Machine Setup

1. **Configure Network Settings:**
   ```bash
   python network_config.py
   ```
   - Enter your hardware machine's IP address
   - Configuration will be saved to `network_config.json`

2. **Start the Development System:**
   ```bash
   start_network_system.bat
   ```
   This will start:
   - Backend server (port 3000)
   - Frontend dashboard (port 3001)
   - ESP32 command receiver (simulated)
   - ESP32 sensor simulator (simulated)
   - Face detection system

### Hardware Machine Setup

1. **Copy Network Configuration:**
   - Copy `network_config.json` from development machine
   - Place it in the same directory as the Python scripts

2. **Install Dependencies:**
   ```bash
   pip install paho-mqtt
   ```

3. **Start Hardware Services:**
   ```bash
   hardware_machine_setup.bat
   ```
   This will start:
   - ESP32 network command receiver
   - ESP32 network sensor simulator

## 🔧 Configuration Files

### network_config.json
```json
{
  "development_machine": {
    "ip": "192.168.1.50",
    "hostname": "dev-pc",
    "platform": "Windows",
    "mqtt_broker": "broker-cn.emqx.io",
    "mqtt_port": 1883
  },
  "hardware_machine": {
    "ip": "192.168.1.100",
    "hostname": "hardware-pc",
    "mqtt_broker": "broker-cn.emqx.io",
    "mqtt_port": 1883
  },
  "mqtt_topics": {
    "commands": "home/control",
    "sensors": "esp/sensors",
    "status": "esp/status",
    "face_detection": "face-detection/commands"
  }
}
```

## 📡 MQTT Topics

| Topic | Direction | Description |
|-------|-----------|-------------|
| `home/control/+` | Dev → Hardware | Device control commands |
| `esp/sensors` | Hardware → Dev | Sensor data |
| `esp/status` | Hardware → Dev | Device status |
| `face-detection/commands` | Dev → Hardware | Face detection commands |

## 🌐 Network Requirements

### Firewall Settings
- **Development Machine:** Allow inbound connections on ports 3000, 3001
- **Hardware Machine:** Allow outbound connections on port 1883 (MQTT)
- **Both Machines:** Allow outbound connections to broker-cn.emqx.io:1883

### Network Connectivity
- Both machines must have internet access
- Both machines must be able to reach broker-cn.emqx.io:1883
- No direct connection between machines required (MQTT broker handles communication)

## 🔍 Troubleshooting

### Common Issues

1. **"Network configuration not found"**
   - Run `python network_config.py` first
   - Ensure `network_config.json` exists

2. **"Failed to connect to MQTT broker"**
   - Check internet connection
   - Verify firewall settings
   - Try different MQTT broker

3. **"Hardware machine not responding"**
   - Check IP address in `network_config.json`
   - Verify hardware machine is running the services
   - Check MQTT broker connectivity

4. **"Commands not reaching hardware"**
   - Verify MQTT topics are correct
   - Check hardware machine logs
   - Ensure both machines are connected to same MQTT broker

### Debug Commands

**Check Network Configuration:**
```bash
python -c "import json; print(json.load(open('network_config.json')))"
```

**Test MQTT Connection:**
```bash
python -c "import paho.mqtt.publish as publish; publish.single('test/topic', 'test message', hostname='broker-cn.emqx.io')"
```

**Check Hardware Machine IP:**
```bash
ipconfig  # Windows
ifconfig  # Linux/Mac
```

## 📊 System Monitoring

### Development Machine Logs
- Backend server logs in "Backend Server" window
- ESP32 command receiver logs in "ESP32 Command Receiver" window
- ESP32 sensor simulator logs in "ESP32 Sensor Simulator" window

### Hardware Machine Logs
- ESP32 network receiver logs in "ESP32 Network Receiver" window
- ESP32 network simulator logs in "ESP32 Network Simulator" window

### Dashboard Access
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **Sensor Data:** http://localhost:3000/api/sensors

## 🔄 Communication Flow

1. **User toggles device in dashboard**
2. **Frontend sends command to backend**
3. **Backend publishes to MQTT broker**
4. **Hardware machine receives command**
5. **Hardware machine updates device state**
6. **Hardware machine publishes sensor data**
7. **Development machine receives sensor data**
8. **Dashboard updates with new data**

## 📝 File Structure

```
Development Machine:
├── network_config.py
├── start_network_system.bat
├── backend/
├── frontend/
└── ... (other development files)

Hardware Machine:
├── network_config.json
├── esp32_network_receiver.py
├── esp32_network_simulator.py
├── hardware_machine_setup.bat
└── ... (other hardware files)
```

## 🎯 Next Steps

1. **Test the system** by toggling devices in the dashboard
2. **Monitor logs** to ensure communication is working
3. **Customize device responses** in the hardware machine scripts
4. **Add real ESP32 integration** by modifying the hardware scripts
5. **Set up automatic startup** on both machines

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify network configuration
3. Check MQTT broker connectivity
4. Review system logs for error messages
5. Ensure both machines are running the correct services
