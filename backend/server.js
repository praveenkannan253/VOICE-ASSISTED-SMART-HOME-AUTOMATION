require('dotenv').config();
const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const { pool } = require('./db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'fridge');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadsDir}`);
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const itemName = req.body.item || 'unknown';
    const filename = `fridge_${timestamp}_${itemName}.jpg`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// ===== MQTT broker =====
const MQTT_URL = process.env.MQTT_URL || 'mqtt://broker-cn.emqx.io:1883';
const mqttClient = mqtt.connect(MQTT_URL, {
  clientId: 'smarthome-backend-' + Math.random().toString(16).substr(2, 8),
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

let latest = {}; // cache of latest sensor values

// Add error handling for MQTT connection
mqttClient.on('error', (error) => {
  console.error('❌ MQTT Error:', error);
});

mqttClient.on('offline', () => {
  console.log('⚠️ MQTT Client offline');
});

mqttClient.on('reconnect', () => {
  console.log('🔄 MQTT Client reconnecting...');
});

mqttClient.on('connect', () => {
  console.log('✅ Connected to MQTT');
  console.log('🔗 MQTT URL:', process.env.MQTT_URL || 'mqtt://broker-cn.emqx.io:1883');
  
  // Subscribe to sensor data and status updates from hardware
  mqttClient.subscribe(['esp/sensors', 'esp/status', 'esp/#', 'fridge/inventory', 'esp/cam', 'home/sensors/water-motor', 'home/control'], (err) => {
    if (err) {
      console.error("❌ Subscription error:", err.message);
    } else {
      console.log('📡 Subscribed to:');
      console.log('   • esp/sensors (Sensor data from hardware)');
      console.log('   • esp/status (Device status updates)');
      console.log('   • esp/# (All ESP topics)');
      console.log('   • fridge/inventory (Fridge updates)');
      console.log('   • esp/cam (Face recognition data)');
      console.log('   • home/sensors/water-motor (Water motor status)');
      console.log('   • home/control (Motor control commands from external sources)');
    }
  });
});

// ===== Handle incoming MQTT messages =====
let messageCount = 0;
mqttClient.on('message', (topic, message) => {
  const raw = message.toString();
  
  // Skip debug topics and debug messages completely
  if (topic.includes('/debug') || topic.includes('/status') || 
      raw.startsWith('[D]') || raw.startsWith('[I]') || raw.startsWith('[W]') || raw.startsWith('[E]')) {
    return; // Silently skip debug messages - clean output for presentation
  }

  // Try to parse as JSON, if it fails, treat as simple value
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    // Not JSON, treat as simple value (like "ON", "OFF", numbers)
    data = raw;
  }

  // Only show messages from main sensor topics (skip individual switch states)
  if (topic.includes('/switch/') || topic.includes('/button/')) {
    // Silently skip switch/button state messages for clean output
    latest[topic] = data;
    io.emit('sensor_update', { topic, data });
    return;
  }

  // Handle incoming control commands from external sources (e.g., friend's app)
  if (topic === 'home/control') {
    const command = raw.toLowerCase();
    
    // Parse command: "water-motor on" or "water-motor off"
    if (command.includes('water-motor')) {
      const isOn = command.includes('on');
      
      console.log(`\n👥 EXTERNAL MOTOR COMMAND RECEIVED`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📡 Topic: ${topic}`);
      console.log(`👤 Source: External (Friend's app/device)`);
      console.log(`💧 Command: water-motor ${isOn ? 'ON' : 'OFF'}`);
      console.log(`⚡ Action: ${isOn ? '🟢 TURN ON' : '🔴 TURN OFF'}`);
      console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
      console.log(`📊 Connected clients: ${io.engine.clientsCount}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      
      // Broadcast motor command to all dashboard clients
      io.emit('device_state_change', {
        device: 'water-motor',
        state: isOn ? 'on' : 'off',
        source: 'external',
        timestamp: new Date().toISOString()
      });
      
      // Also broadcast as notification
      io.emit('notification', {
        type: 'info',
        message: `💧 Water Motor turned ${isOn ? 'ON' : 'OFF'} by external command`,
        timestamp: new Date().toISOString()
      });
      
      latest[topic] = { command, state: isOn ? 'on' : 'off' };
      return;
    }
  }

  // Handle water motor status updates
  if (topic === 'home/sensors/water-motor') {
    const motorState = typeof data === 'object' ? data.state : data;
    const isOn = motorState === 'on' || motorState === 'ON' || motorState === 1 || motorState === true;
    
    console.log(`\n💧 WATER MOTOR STATUS UPDATE`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📡 Topic: ${topic}`);
    console.log(`⚡ State: ${isOn ? '🟢 ON' : '🔴 OFF'}`);
    console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    // Broadcast water motor state to all clients
    io.emit('device_state_change', {
      device: 'water-motor',
      state: isOn ? 'on' : 'off',
      timestamp: new Date().toISOString()
    });
    
    latest[topic] = { state: isOn ? 'on' : 'off' };
    return;
  }

  messageCount++;
  
  // Clean, professional logging
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Message #${messageCount} | ${new Date().toLocaleTimeString()}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📡 Topic: ${topic}`);
  
  // Format sensor data nicely
  if (typeof data === 'object') {
    if (data.temp !== undefined) {
      console.log(`🌡️  Temperature: ${data.temp}°C`);
    }
    if (data.hum !== undefined) {
      console.log(`💧 Humidity: ${data.hum}%`);
    }
    if (data.ldr !== undefined) {
      console.log(`💡 Light Level: ${data.ldr}`);
    }
    if (data.pir !== undefined) {
      console.log(`🚶 Motion (PIR): ${data.pir === 1 ? 'Detected' : 'None'}`);
    }
    if (data.ir !== undefined) {
      console.log(`📡 IR Sensor: ${data.ir === 1 ? 'Active' : 'Inactive'}`);
    }
    if (data.state !== undefined) {
      console.log(`⚡ Device State: ${data.state}`);
    }
  } else {
    // Simple value
    console.log(`📊 Value: ${data}`);
  }
  
  // Show current cached sensor values from esp/sensors
  if (latest['esp/sensors']) {
    const espData = latest['esp/sensors'];
    console.log(`\n📋 Current Sensor Status:`);
    console.log(`   🌡️  Temp: ${espData.temp ?? '--'}°C | 💧 Humidity: ${espData.hum ?? '--'}% | 💡 LDR: ${espData.ldr ?? '--'}`);
    console.log(`   🚶 PIR: ${espData.pir === 1 ? 'Motion' : 'No Motion'} | 📡 IR: ${espData.ir === 1 ? 'Active' : 'Inactive'}`);
  }
  
  console.log(`\n✅ Status: Data received & processed`);
  console.log(`💾 Database: Saved successfully`);
  console.log(`📤 Broadcast: Sent to ${io.engine.clientsCount} client(s)`);

  // cache latest value
  latest[topic] = data;

  // broadcast to all connected clients
  io.emit('sensor_update', { topic, data });

  // Handle face recognition data from esp/cam
  if (topic === 'esp/cam' && typeof data === 'object') {
    handleFaceRecognition(data);
  }

  // save to DB (only if it's JSON object)
  if (typeof data === 'object') {
    pool.execute('INSERT INTO sensors (topic, value_json) VALUES (?, ?)', [
      topic,
      JSON.stringify(data)
    ]).catch((err) => {
      console.error('❌ Database Error:', err.message);
    });
  }
});

// ===== Face Recognition Handler =====
async function handleFaceRecognition(data) {
  try {
    const { name, confidence, status, timestamp } = data;
    
    console.log(`\n👤 FACE RECOGNITION DETECTED`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`👤 Person: ${name || 'Unknown'}`);
    console.log(`📊 Status: ${status === 'known' ? '✅ KNOWN' : '⚠️ UNKNOWN'}`);
    console.log(`🎯 Confidence: ${confidence ? (confidence * 100).toFixed(1) + '%' : 'N/A'}`);
    console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Save to face_recognition table
    await pool.execute(
      'INSERT INTO face_recognition (person_name, status, confidence, timestamp) VALUES (?, ?, ?, ?)',
      [name || 'Unknown', status || 'unknown', confidence || 0, timestamp || new Date()]
    );

    // If known person, update known_persons table
    if (status === 'known' && name) {
      await pool.execute(
        `INSERT INTO known_persons (name, last_seen, visit_count) 
         VALUES (?, NOW(), 1) 
         ON DUPLICATE KEY UPDATE last_seen = NOW(), visit_count = visit_count + 1`,
        [name]
      );
    }

    // Broadcast to frontend
    io.emit('face_detected', {
      name: name || 'Unknown',
      status: status || 'unknown',
      confidence: confidence || 0,
      timestamp: timestamp || new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Face recognition handler error:', err);
  }
}

// ===== Socket.IO Connection Handler =====
io.on('connection', (socket) => {
  console.log(`\n🔌 New Socket.IO client connected: ${socket.id}`);
  console.log(`📊 Total connected clients: ${io.engine.clientsCount}`);
  
  socket.on('disconnect', () => {
    console.log(`\n❌ Socket.IO client disconnected: ${socket.id}`);
    console.log(`📊 Total connected clients: ${io.engine.clientsCount}`);
  });
});

// ===== Express routes =====
app.get('/', (_req, res) => {
  res.send('SmartHome API running');
});

app.get('/api/sensors', (req, res) => {
  // If no real data yet, return mock data for UI testing
  if (Object.keys(latest).length === 0) {
    res.json({
      'esp/sensors': {
        temp: 24.5,
        hum: 65,
        ldr: 450,
        pir: 0,
        ir: 0
      }
    });
  } else {
    res.json(latest);
  }
});

// Get device states
app.get('/api/devices', (req, res) => {
  res.json({
    devices: [
      { name: 'fan', state: 'off' },
      { name: 'light', state: 'off' },
      { name: 'ac', state: 'off' },
      { name: 'washing-machine', state: 'off' }
    ]
  });
});

app.post('/api/control', (req, res) => {
  const { device, action } = req.body;
  if (!device || !action) {
    return res.status(400).json({ error: 'device & action required' });
  }

  // Single topic with command format: "device action"
  const controlTopic = 'home/control';
  const command = `${device} ${action}`;
  mqttClient.publish(controlTopic, command);
  
  // Broadcast device state change to all connected clients
  const stateChangeData = {
    device: device,
    state: action === 'on' ? 'on' : 'off',
    timestamp: new Date().toISOString()
  };
  console.log(`📡 Broadcasting device_state_change to all clients:`, stateChangeData);
  io.emit('device_state_change', stateChangeData);
  
  // Enhanced logging for verification
  console.log(`\n🎮 DEVICE CONTROL COMMAND`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📤 Published to MQTT:`);
  console.log(`   Topic: ${controlTopic}`);
  console.log(`   Command: "${command}"`);
  console.log(`   Device: ${device.toUpperCase()}`);
  console.log(`   Action: ${action.toUpperCase()}`);
  console.log(`   Time: ${new Date().toLocaleTimeString()}`);
  console.log(`✅ Command sent successfully!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // publish updated status back to sensor topic (for UI feedback)
  const statusTopic = `home/sensors/${device}`;
  const statusPayload = { state: action };
  mqttClient.publish(statusTopic, JSON.stringify(statusPayload));

  // update cache + notify frontend
  latest[statusTopic] = statusPayload;
  io.emit('sensor_update', { topic: statusTopic, data: statusPayload });

  res.json({ status: 'OK', device, action });
});

// ===== History endpoint =====
app.get('/api/sensors/history', async (req, res) => {
  try {
    const topic = req.query.topic;
    const period = (req.query.period || '24h').toLowerCase();
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    let interval = '24 HOUR';
    if (period.endsWith('h')) interval = `${parseInt(period)} HOUR`;
    if (period.endsWith('d')) interval = `${parseInt(period)} DAY`;

    const [rows] = await pool.execute(
      `SELECT recorded_at, value_json 
       FROM sensors 
       WHERE topic = ? AND recorded_at >= NOW() - INTERVAL ${interval} 
       ORDER BY recorded_at ASC`,
      [topic]
    );

    res.json({ 
      topic, 
      points: rows.map(r => ({ t: r.recorded_at, v: r.value_json })) 
    });

  } catch (err) {
    console.error('⚠️ History error:', err);
    res.status(500).json({ error: 'history_failed' });
  }
});

// ===== Fridge inventory endpoint =====
app.get('/api/fridge/inventory', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT item, quantity, status, image_path, updated_at FROM fridge_items ORDER BY updated_at DESC'
    );
    
    // For each item, try to get the latest detected image from face_recognition table
    const enrichedInventory = await Promise.all(rows.map(async (row) => {
      let detectedImage = row.image_path;
      
      // If no stored image, try to get from face_recognition (detected items)
      if (!detectedImage) {
        try {
          const [faceRows] = await pool.execute(
            'SELECT image_path FROM face_recognition WHERE person_name = ? ORDER BY timestamp DESC LIMIT 1',
            [row.item]
          );
          if (faceRows.length > 0 && faceRows[0].image_path) {
            detectedImage = faceRows[0].image_path;
          }
        } catch (err) {
          console.log(`No detected image for ${row.item}`);
        }
      }
      
      return {
        item: row.item,
        quantity: row.quantity,
        status: row.status,
        image: detectedImage || null,
        updated_at: row.updated_at
      };
    }));
    
    res.json({ inventory: enrichedInventory });
  } catch (err) {
    console.error('⚠️ Fridge inventory error:', err);
    res.status(500).json({ error: 'fridge_inventory_failed' });
  }
});

// ===== Update fridge item endpoint =====
app.post('/api/fridge/update', async (req, res) => {
  try {
    const { item, quantity, action } = req.body;
    
    if (!item || quantity === undefined) {
      return res.status(400).json({ error: 'item and quantity required' });
    }

    let newQuantity = quantity;
    if (action === 'add') {
      newQuantity = quantity + 1;
    } else if (action === 'remove') {
      newQuantity = Math.max(0, quantity - 1);
    } else if (action === 'set') {
      newQuantity = quantity; // Direct set from camera detection
    }

    // Insert or update item
    await pool.execute(
      'INSERT INTO fridge_items (item, quantity, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = ?, updated_at = NOW()',
      [item, newQuantity, 'ok', newQuantity]
    );

    // Check if quantity is below threshold (2)
    const threshold = 2;
    let alert = null;
    if (newQuantity <= threshold) {
      alert = {
        type: 'low_stock',
        item: item,
        quantity: newQuantity,
        message: `Low stock: ${item} (${newQuantity} left)`,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast alert to all clients
      io.emit('fridge_alert', alert);
      
      console.log(`\n🚨 ALERT: Low stock - ${item} (${newQuantity} left)`);
    }

    // Broadcast update to all clients
    io.emit('fridge_update', { item, quantity: newQuantity, action, alert });

    console.log(`\n🧊 Fridge Update: ${item} -> ${newQuantity}`);

    res.json({ status: 'OK', item, quantity: newQuantity, alert });
  } catch (err) {
    console.error('⚠️ Fridge update error:', err);
    res.status(500).json({ error: 'fridge_update_failed' });
  }
});

// ===== Fridge Image Upload Endpoint =====
app.post('/api/fridge/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const { item, quantity } = req.body;
    const imageFilename = req.file.filename;
    const imageUrl = `/uploads/fridge/${imageFilename}`;
    
    console.log(`📸 Fridge image uploaded: ${item} -> ${imageUrl}`);
    
    // Update fridge item with image
    await pool.execute(
      'UPDATE fridge_items SET image_url = ? WHERE item = ?',
      [imageUrl, item]
    );
    
    // Broadcast update with image to all clients
    io.emit('fridge_update', { 
      item, 
      quantity: quantity || 1, 
      action: 'update',
      image: imageUrl,
      alert: null 
    });
    
    res.json({ status: 'OK', item, image: imageUrl });
  } catch (err) {
    console.error('⚠️ Fridge image upload error:', err);
    res.status(500).json({ error: 'image_upload_failed' });
  }
});

// ===== Get Fridge Item Image =====
app.get('/api/fridge/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    
    // Security: prevent directory traversal
    if (!filepath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (err) {
    console.error('⚠️ Image retrieval error:', err);
    res.status(500).json({ error: 'image_retrieval_failed' });
  }
});

// ===== Voice Command Test Endpoint =====
app.post('/api/voice-command', (req, res) => {
  try {
    const { command, device, action } = req.body;
    
    console.log(`\n🎤 Voice Command Received: "${command}"`);
    console.log(`📱 Device: ${device}, Action: ${action}`);
    
    // Publish to device control topic
    const topic = `home/control/${device}`;
    mqttClient.publish(topic, action);
    
    console.log(`📤 Published to MQTT: ${topic} -> ${action}`);
    
    res.json({ 
      status: 'OK', 
      message: `Command sent to ${device}`,
      topic: topic,
      action: action
    });
  } catch (err) {
    console.error('⚠️ Voice command error:', err);
    res.status(500).json({ error: 'voice_command_failed' });
  }
});

// ===== Face Recognition Endpoints =====
// Get recent face detections
app.get('/api/face/recent', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 10, 100)); // Clamp between 1-100
    const [rows] = await pool.execute(
      'SELECT person_name, status, confidence, timestamp FROM face_recognition ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
    
    res.json({ 
      detections: rows.map(row => ({
        name: row.person_name,
        status: row.status,
        confidence: row.confidence,
        timestamp: row.timestamp
      }))
    });
  } catch (err) {
    console.error('⚠️ Face recent error:', err);
    // Return empty array if table doesn't exist or query fails
    res.json({ detections: [] });
  }
});

// Get known persons list
app.get('/api/face/known', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT name, added_at, last_seen, visit_count FROM known_persons ORDER BY last_seen DESC'
    );
    
    res.json({ 
      known_persons: rows.map(row => ({
        name: row.name,
        added_at: row.added_at,
        last_seen: row.last_seen,
        visit_count: row.visit_count
      }))
    });
  } catch (err) {
    console.error('⚠️ Face known error:', err);
    // Return empty array if table doesn't exist or query fails
    res.json({ known_persons: [] });
  }
});

// Add known person
app.post('/api/face/add-known', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'name required' });
    }

    await pool.execute(
      'INSERT INTO known_persons (name) VALUES (?) ON DUPLICATE KEY UPDATE name = name',
      [name]
    );

    console.log(`\n✅ Added known person: ${name}`);

    res.json({ status: 'OK', name });
  } catch (err) {
    console.error('⚠️ Add known person error:', err);
    res.status(500).json({ error: 'add_known_failed' });
  }
});

// Get statistics
app.get('/api/face/stats', async (req, res) => {
  try {
    const [knownCount] = await pool.execute('SELECT COUNT(*) as count FROM known_persons');
    const [totalDetections] = await pool.execute('SELECT COUNT(*) as count FROM face_recognition');
    const [knownDetections] = await pool.execute('SELECT COUNT(*) as count FROM face_recognition WHERE status = "known"');
    const [unknownDetections] = await pool.execute('SELECT COUNT(*) as count FROM face_recognition WHERE status = "unknown"');
    
    res.json({ 
      stats: {
        total_known_persons: knownCount[0].count,
        total_detections: totalDetections[0].count,
        known_detections: knownDetections[0].count,
        unknown_detections: unknownDetections[0].count
      }
    });
  } catch (err) {
    console.error('⚠️ Face stats error:', err);
    res.status(500).json({ error: 'face_stats_failed' });
  }
});

// ===== Start server =====
server.listen(3000, () => {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║          🏠 SMART HOME IoT SYSTEM - BACKEND 🏠            ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n📊 System Information:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 API Server: http://localhost:3000');
  console.log('📡 MQTT Broker: ' + (process.env.MQTT_URL || 'mqtt://broker-cn.emqx.io:1883'));
  console.log('💾 Database: MySQL - ' + (process.env.MYSQL_DATABASE || 'smarthome'));
  console.log('🔌 Socket.IO: Enabled for real-time updates');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ Backend server is ready and waiting for connections...');
  console.log('\n💡 Tip: Open http://localhost:3001 for the dashboard\n');
});
