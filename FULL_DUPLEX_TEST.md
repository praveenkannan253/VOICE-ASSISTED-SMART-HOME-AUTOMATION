# 🔄 Full Duplex Communication Testing Guide

**Purpose:** Test bidirectional communication between Dashboard ↔ Backend ↔ MQTT ↔ Hardware

---

## 🎯 Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    VOICE COMMAND                            │
│              "Turn on the fan"                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND DASHBOARD                         │
│  - Voice recognition captures command                       │
│  - Parses: device="fan", action="on"                        │
│  - Sends POST to /api/control                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND SERVER                             │
│  - Receives POST /api/control                               │
│  - Publishes to MQTT: home/control/fan -> "on"              │
│  - Logs: 🎤 Voice Command Received                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  MQTT BROKER                                │
│  Topic: home/control/fan                                    │
│  Message: "on"                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  ESP32 HARDWARE                             │
│  - Subscribed to: home/control/fan                          │
│  - Receives: "on"                                           │
│  - Turns on fan relay                                       │
│  - Publishes status back: esp/sensors                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Test 1: Device Control via Dashboard

### Step 1: Open Dashboard
```
http://localhost:3001
```

### Step 2: Toggle a Device
1. Click **Fan** switch to ON
2. Watch backend terminal for:
   ```
   📡 Topic: home/control/fan
   📊 Value: on
   ✅ Status: Data received & processed
   ```

### Step 3: Check Your ESP32
Your ESP32 should receive the message on topic `home/control/fan` with payload `"on"`

**Expected Hardware Topics:**
- `home/control/fan`
- `home/control/light`
- `home/control/ac`
- `home/control/washing-machine`

---

## 🎤 Test 2: Voice Commands

### Step 1: Enable Voice Assistant
1. Click **🎤 Voice Assistant** button in dashboard
2. Allow microphone access

### Step 2: Say Commands
Try these voice commands:

| Command | Expected Device | Expected Action |
|---------|----------------|-----------------|
| "Turn on the fan" | fan | on |
| "Turn off the fan" | fan | off |
| "Turn on the light" | light | on |
| "Turn off the light" | light | off |
| "Turn on the AC" | ac | on |
| "Start washing machine" | washing-machine | on |

### Step 3: Verify MQTT Messages
Check backend terminal for:
```
🎤 Voice Command Received: "Turn on the fan"
📱 Device: fan, Action: on
📤 Published to MQTT: home/control/fan -> on
```

### Step 4: Verify Hardware Receives
Your ESP32 should:
1. Receive message on `home/control/fan`
2. Turn on the fan relay
3. Publish status back to `esp/sensors` or `home/sensors/fan`

---

## 🧊 Test 3: Fridge Detection

### API Test: Get Inventory
```bash
curl http://localhost:3000/api/fridge/inventory
```

**Expected Response:**
```json
{
  "inventory": [
    {
      "item": "milk",
      "quantity": 2,
      "status": "ok",
      "updated_at": "2025-10-05T22:00:00.000Z"
    }
  ]
}
```

### API Test: Add Item
```bash
curl -X POST http://localhost:3000/api/fridge/update \
  -H "Content-Type: application/json" \
  -d '{"item":"milk","quantity":2,"action":"add"}'
```

**Expected Response:**
```json
{
  "status": "OK",
  "item": "milk",
  "quantity": 3
}
```

### API Test: Remove Item
```bash
curl -X POST http://localhost:3000/api/fridge/update \
  -H "Content-Type: application/json" \
  -d '{"item":"milk","quantity":3,"action":"remove"}'
```

### Dashboard Test
1. Open dashboard
2. Find **Fridge Inventory** section
3. Click **+** or **-** buttons
4. Verify real-time updates

---

## 🔄 Test 4: Full Duplex Communication

### Scenario: Complete Round Trip

**Step 1: Voice Command → Hardware**
1. Say: "Turn on the fan"
2. Backend publishes to: `home/control/fan` → `"on"`
3. ESP32 receives and turns on fan

**Step 2: Hardware → Dashboard**
1. ESP32 publishes sensor data to: `esp/sensors`
2. Backend receives and broadcasts via Socket.IO
3. Dashboard updates in real-time

**Step 3: Verify Both Directions**
- ✅ Dashboard → MQTT → Hardware (Control)
- ✅ Hardware → MQTT → Dashboard (Feedback)

---

## 📡 MQTT Topics Reference

### Outgoing (Dashboard → Hardware)
```
home/control/fan          → "on" | "off"
home/control/light        → "on" | "off"
home/control/ac           → "on" | "off"
home/control/washing-machine → "on" | "off"
```

### Incoming (Hardware → Dashboard)
```
esp/sensors               → {"temp":25,"hum":60,"ldr":300,"pir":0,"ir":0}
esp/ec_sensor/sensor/*    → Individual sensor values
home/sensors/fan          → {"state":"on"}
home/sensors/light        → {"state":"off"}
```

---

## 🛠️ ESP32 Code Requirements

Your ESP32 should:

### 1. Subscribe to Control Topics
```cpp
mqtt.subscribe("home/control/fan");
mqtt.subscribe("home/control/light");
mqtt.subscribe("home/control/ac");
mqtt.subscribe("home/control/washing-machine");
```

### 2. Handle Incoming Messages
```cpp
void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  if (String(topic) == "home/control/fan") {
    if (message == "on") {
      digitalWrite(FAN_PIN, HIGH);
    } else {
      digitalWrite(FAN_PIN, LOW);
    }
  }
  // ... handle other devices
}
```

### 3. Publish Sensor Data
```cpp
void publishSensors() {
  String payload = "{\"temp\":" + String(temp) + 
                   ",\"hum\":" + String(hum) + 
                   ",\"ldr\":" + String(ldr) + 
                   ",\"pir\":" + String(pir) + 
                   ",\"ir\":" + String(ir) + "}";
  
  mqtt.publish("esp/sensors", payload.c_str());
}
```

---

## ✅ Test Checklist

### Backend Tests
- [ ] Backend starts with clean output
- [ ] MQTT connection successful
- [ ] Subscribed to `esp/#` and `fridge/inventory`
- [ ] No debug message errors
- [ ] Device control endpoint works (`/api/control`)
- [ ] Voice command endpoint works (`/api/voice-command`)
- [ ] Fridge inventory endpoint works (`/api/fridge/inventory`)

### Dashboard Tests
- [ ] Dashboard loads at http://localhost:3001
- [ ] Socket.IO connected (check console)
- [ ] Device toggles work (Fan, Light, AC, Washing Machine)
- [ ] Voice assistant captures commands
- [ ] Real-time sensor data updates
- [ ] Fridge inventory displays
- [ ] Add/remove fridge items works

### MQTT Tests
- [ ] Backend publishes to `home/control/*` topics
- [ ] Backend receives from `esp/*` topics
- [ ] Messages are properly formatted
- [ ] No JSON parse errors

### Hardware Tests
- [ ] ESP32 receives control commands
- [ ] ESP32 executes actions (turns on/off devices)
- [ ] ESP32 publishes sensor data
- [ ] Data appears in dashboard

### Full Duplex Tests
- [ ] Voice command → MQTT → Hardware (works)
- [ ] Hardware → MQTT → Dashboard (works)
- [ ] Round trip < 1 second
- [ ] No message loss

---

## 🐛 Troubleshooting

### Issue: Hardware Not Receiving Commands
**Check:**
1. ESP32 is connected to MQTT broker
2. ESP32 subscribed to correct topics
3. Backend is publishing to correct topics
4. MQTT broker URL matches in both backend and ESP32

### Issue: Dashboard Not Updating
**Check:**
1. Socket.IO connection (browser console)
2. Backend is broadcasting messages
3. Frontend is listening to `sensor_update` event

### Issue: Voice Commands Not Working
**Check:**
1. Microphone permissions granted
2. Voice recognition parsing correctly
3. Backend receiving POST requests
4. MQTT messages being published

---

## 📊 Success Metrics

**Full Duplex Communication is Working When:**
- ✅ Voice command reaches hardware in < 1 second
- ✅ Hardware state updates appear in dashboard immediately
- ✅ No errors in backend logs
- ✅ All device controls respond correctly
- ✅ Sensor data updates every 2 seconds
- ✅ Fridge inventory updates in real-time

---

## 🎓 Demo for Teachers

### Quick Demo Script

1. **Show Backend:**
   ```bash
   npm run demo
   ```
   - Point out clean, professional output
   - Show MQTT connection
   - Show system information

2. **Show Dashboard:**
   - Open http://localhost:3001
   - Show real-time sensor data
   - Toggle devices (Fan, Light, AC)

3. **Demonstrate Voice Control:**
   - Click voice assistant
   - Say: "Turn on the fan"
   - Show backend logs receiving command
   - Show hardware responding

4. **Show Fridge Detection:**
   - Add/remove items
   - Show real-time updates
   - Explain inventory tracking

5. **Explain Full Duplex:**
   - Draw diagram on board
   - Explain bidirectional flow
   - Show both directions working

---

**🎉 Your system demonstrates complete IoT full duplex communication!**
