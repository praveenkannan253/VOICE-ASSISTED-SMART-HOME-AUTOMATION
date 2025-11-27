# ESP32 Boot Control System Guide

## Overview

The dashboard now includes **Master/Slave1/Slave2 Boot Control** buttons that allow you to remotely reboot ESP32 nodes via MQTT commands. When a node fails or becomes unresponsive, you can trigger a reboot directly from the dashboard.

---

## Features

✅ **Three Boot Buttons:**
- 🔄 **Master Boot** - Reboot the master ESP32 node
- 🔄 **Slave1 Boot** - Reboot the first slave ESP32 node
- 🔄 **Slave2 Boot** - Reboot the second slave ESP32 node

✅ **Real-time Notifications:**
- Shows when reboot command is sent
- Shows when node reboots successfully
- Shows error if reboot fails

✅ **MQTT Integration:**
- Commands sent via MQTT topics
- Acknowledgments received from nodes
- Persistent logging in backend

✅ **Socket.IO Broadcasting:**
- Real-time updates to all connected clients
- Automatic notification display
- Status tracking

---

## How It Works

### 1. User Clicks Boot Button
```
Dashboard → Click "Master Boot" button
```

### 2. Frontend Sends Request
```javascript
sendRebootCommand('master')
  ↓
POST /api/reboot { node: 'master' }
```

### 3. Backend Processes Request
```
Backend validates node name
  ↓
Publishes to MQTT: esp/reboot/master
  ↓
Broadcasts to all clients: reboot_command event
  ↓
Shows notification: "🔄 Reboot command sent to master"
```

### 4. ESP32 Receives Command
```
ESP32 subscribes to: esp/reboot/master
  ↓
Receives: REBOOT command
  ↓
Performs system reboot
```

### 5. ESP32 Sends Acknowledgment
```
After reboot, ESP32 publishes to: esp/reboot/master/ack
  ↓
Message: "OK" or status code
```

### 6. Backend Receives Acknowledgment
```
Backend receives on: esp/reboot/master/ack
  ↓
Broadcasts to all clients: reboot_ack event
  ↓
Shows notification: "✅ MASTER rebooted successfully"
```

---

## MQTT Topics

### Command Topics (Frontend → ESP32)
```
esp/reboot/master      → Send REBOOT command to master
esp/reboot/slave1      → Send REBOOT command to slave1
esp/reboot/slave2      → Send REBOOT command to slave2
```

### Acknowledgment Topics (ESP32 → Backend)
```
esp/reboot/master/ack  → Master reboot acknowledgment
esp/reboot/slave1/ack  → Slave1 reboot acknowledgment
esp/reboot/slave2/ack  → Slave2 reboot acknowledgment
```

### Command Format
```
Topic: esp/reboot/{node}
Payload: REBOOT
```

### Acknowledgment Format
```
Topic: esp/reboot/{node}/ack
Payload: OK (or any status message)
```

---

## API Endpoint

### POST /api/reboot

**Request:**
```json
{
  "node": "master"  // or "slave1", "slave2"
}
```

**Response:**
```json
{
  "status": "OK",
  "node": "master",
  "message": "Reboot command sent to master",
  "topic": "esp/reboot/master"
}
```

**Error Response:**
```json
{
  "error": "Invalid node. Must be: master, slave1, or slave2"
}
```

---

## Frontend Implementation

### Button Component
```jsx
<button 
  className="btn btn-warning btn-sm"
  onClick={() => sendRebootCommand('master')}
>
  🔄 Master Boot
</button>
```

### Send Reboot Command
```javascript
const sendRebootCommand = (nodeId) => {
  console.log(`Sending reboot command to: ${nodeId}`);
  
  fetch("/api/reboot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ node: nodeId }),
  })
  .then(res => res.json())
  .then(data => {
    console.log(`Reboot command sent to ${nodeId}:`, data);
    addNotification(`🔄 Reboot command sent to ${nodeId}`, 'info');
  })
  .catch(err => {
    console.error(`Error sending reboot to ${nodeId}:`, err);
    addNotification(`❌ Failed to send reboot to ${nodeId}`, 'error');
  });
};
```

### Listen for Acknowledgments
```javascript
socket.on("reboot_ack", (data) => {
  console.log("✅ Reboot acknowledgment received:", data);
  addNotification(`✅ ${data.node.toUpperCase()} rebooted successfully`, 'success');
});
```

---

## Backend Implementation

### Reboot Endpoint
```javascript
app.post('/api/reboot', (req, res) => {
  const { node } = req.body;
  
  // Validate node
  const validNodes = ['master', 'slave1', 'slave2'];
  if (!validNodes.includes(node.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid node' });
  }

  // Publish to MQTT
  const rebootTopic = `esp/reboot/${node.toLowerCase()}`;
  mqttClient.publish(rebootTopic, 'REBOOT');
  
  // Broadcast to clients
  io.emit('reboot_command', {
    type: 'reboot',
    node: node.toLowerCase(),
    timestamp: new Date().toISOString()
  });

  res.json({ status: 'OK', node, message: 'Reboot command sent' });
});
```

### Handle Acknowledgments
```javascript
mqttClient.on('message', (topic, message) => {
  // Handle reboot acknowledgments
  if (topic.includes('esp/reboot') && topic.includes('ack')) {
    const nodeMatch = topic.match(/esp\/reboot\/(\w+)\/ack/);
    if (nodeMatch) {
      const node = nodeMatch[1];
      
      // Broadcast to all clients
      io.emit('reboot_ack', {
        node: node,
        status: message.toString(),
        timestamp: new Date().toISOString()
      });
    }
  }
});
```

---

## ESP32 Implementation Example

### Arduino Code (Pseudo-code)

```cpp
// Subscribe to reboot topic
mqttClient.subscribe("esp/reboot/master");

// Handle incoming messages
void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  // Check if reboot command
  if (String(topic) == "esp/reboot/master" && message == "REBOOT") {
    Serial.println("Reboot command received!");
    
    // Send acknowledgment before rebooting
    mqttClient.publish("esp/reboot/master/ack", "OK");
    
    // Wait a bit for message to be sent
    delay(1000);
    
    // Perform reboot
    ESP.restart();
  }
}
```

---

## Notifications

### Notification Types

**Info (Blue):**
```
🔄 Reboot command sent to master
```

**Success (Green):**
```
✅ MASTER rebooted successfully
```

**Error (Red):**
```
❌ Failed to send reboot to master
```

---

## Troubleshooting

### Button Not Working
1. Check backend is running: `npm start` in backend folder
2. Check MQTT broker is connected
3. Check browser console for errors
4. Verify node name is valid (master, slave1, slave2)

### No Acknowledgment Received
1. Check ESP32 is subscribed to `esp/reboot/{node}/ack`
2. Verify ESP32 is publishing acknowledgment after reboot
3. Check MQTT broker logs
4. Verify network connectivity

### Reboot Command Not Reaching ESP32
1. Check ESP32 is subscribed to `esp/reboot/{node}`
2. Verify MQTT broker is running
3. Check firewall/network settings
4. Verify MQTT URL in backend .env file

---

## Testing

### Manual Test

1. **Click Master Boot button**
   - Check notification: "🔄 Reboot command sent to master"
   - Check backend logs for MQTT publish

2. **Simulate ESP32 Response**
   - Publish to `esp/reboot/master/ack` with payload "OK"
   - Check notification: "✅ MASTER rebooted successfully"

3. **Check Logs**
   ```
   Backend: 🔄 ESP32 REBOOT COMMAND
   Backend: ✅ ESP32 REBOOT ACKNOWLEDGMENT
   Frontend: ✅ Reboot acknowledgment received
   ```

---

## Dashboard Location

The boot control buttons are located in the **"🔌 ESP32 Boot Controls"** card on the dashboard, positioned between:
- Appliance Controls (above)
- Live Sensor Data (below)

---

## Security Notes

⚠️ **Important:**
- Reboot commands are sent via MQTT without authentication
- Consider adding authentication/authorization in production
- Validate node names on both frontend and backend
- Log all reboot commands for audit trail
- Consider rate limiting to prevent abuse

---

## Future Enhancements

- [ ] Add confirmation dialog before reboot
- [ ] Add reboot history log
- [ ] Add scheduled reboot feature
- [ ] Add reboot reason/comment field
- [ ] Add authentication for reboot commands
- [ ] Add reboot status indicator (online/offline)
- [ ] Add automatic reboot on failure detection

---

## Related Files

- **Frontend:** `frontend-vite/src/App.jsx`
- **Backend:** `backend/server.js`
- **API Endpoint:** `POST /api/reboot`
- **MQTT Topics:** `esp/reboot/{node}`, `esp/reboot/{node}/ack`

