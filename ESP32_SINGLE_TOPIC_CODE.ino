/*
 * Smart Home IoT System - ESP32/ESP8266
 * Single Topic Command System
 * 
 * Subscribe to: home/control
 * Commands: "light on", "light off", "fan on", "ac off", etc.
 */

#include <WiFi.h>
#include <PubSubClient.h>

// WiFi credentials
const char* ssid = "YourWiFiName";
const char* password = "YourWiFiPassword";

// MQTT Broker
const char* mqtt_server = "broker-cn.emqx.io";
const int mqtt_port = 1883;

// Pin definitions (adjust according to your hardware)
#define FAN_PIN 2
#define LIGHT_PIN 4
#define AC_PIN 5
#define WASHING_MACHINE_PIN 18

// Sensor pins
#define DHT_PIN 15
#define LDR_PIN 34
#define PIR_PIN 27
#define IR_PIN 26

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  
  // Setup pins
  pinMode(FAN_PIN, OUTPUT);
  pinMode(LIGHT_PIN, OUTPUT);
  pinMode(AC_PIN, OUTPUT);
  pinMode(WASHING_MACHINE_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(IR_PIN, INPUT);
  
  // Connect to WiFi
  connectWiFi();
  
  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
  
  // Connect to MQTT
  reconnectMQTT();
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("✅ WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Convert payload to string
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.println("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.print("📥 Received on topic: ");
  Serial.println(topic);
  Serial.print("📨 Command: ");
  Serial.println(message);
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Parse command (format: "device action")
  message.toLowerCase();
  
  // Handle Fan commands
  if (message == "fan on") {
    digitalWrite(FAN_PIN, HIGH);
    Serial.println("✅ Fan turned ON");
    publishStatus("fan", "on");
  }
  else if (message == "fan off") {
    digitalWrite(FAN_PIN, LOW);
    Serial.println("✅ Fan turned OFF");
    publishStatus("fan", "off");
  }
  
  // Handle Light commands
  else if (message == "light on") {
    digitalWrite(LIGHT_PIN, HIGH);
    Serial.println("✅ Light turned ON");
    publishStatus("light", "on");
  }
  else if (message == "light off") {
    digitalWrite(LIGHT_PIN, LOW);
    Serial.println("✅ Light turned OFF");
    publishStatus("light", "off");
  }
  
  // Handle AC commands
  else if (message == "ac on") {
    digitalWrite(AC_PIN, HIGH);
    Serial.println("✅ AC turned ON");
    publishStatus("ac", "on");
  }
  else if (message == "ac off") {
    digitalWrite(AC_PIN, LOW);
    Serial.println("✅ AC turned OFF");
    publishStatus("ac", "off");
  }
  
  // Handle Washing Machine commands
  else if (message == "washing-machine on") {
    digitalWrite(WASHING_MACHINE_PIN, HIGH);
    Serial.println("✅ Washing Machine turned ON");
    publishStatus("washing-machine", "on");
  }
  else if (message == "washing-machine off") {
    digitalWrite(WASHING_MACHINE_PIN, LOW);
    Serial.println("✅ Washing Machine turned OFF");
    publishStatus("washing-machine", "off");
  }
  
  else {
    Serial.println("⚠️ Unknown command: " + message);
  }
  
  Serial.println();
}

void publishStatus(String device, String state) {
  String payload = "{\"device\":\"" + device + "\",\"state\":\"" + state + "\"}";
  client.publish("esp/status", payload.c_str());
  Serial.println("📤 Status published: " + payload);
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT broker...");
    
    // Create unique client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("connected ✅");
      
      // Subscribe to single control topic
      client.subscribe("home/control");
      Serial.println("📡 Subscribed to: home/control");
      Serial.println("Waiting for commands...\n");
      
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void publishSensorData() {
  // Read sensors (replace with your actual sensor reading code)
  float temp = readTemperature();  // Implement this
  float hum = readHumidity();      // Implement this
  int ldr = analogRead(LDR_PIN);
  int pir = digitalRead(PIR_PIN);
  int ir = digitalRead(IR_PIN);
  
  // Create JSON payload
  String payload = "{";
  payload += "\"temp\":" + String(temp, 1) + ",";
  payload += "\"hum\":" + String(hum, 1) + ",";
  payload += "\"ldr\":" + String(ldr) + ",";
  payload += "\"pir\":" + String(pir) + ",";
  payload += "\"ir\":" + String(ir);
  payload += "}";
  
  // Publish to esp/sensors
  client.publish("esp/sensors", payload.c_str());
  
  Serial.println("📊 Sensor data published:");
  Serial.println(payload);
}

float readTemperature() {
  // Implement DHT sensor reading
  // Example: return dht.readTemperature();
  return 25.5; // Dummy value
}

float readHumidity() {
  // Implement DHT sensor reading
  // Example: return dht.readHumidity();
  return 60.0; // Dummy value
}

void loop() {
  // Maintain MQTT connection
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
  
  // Publish sensor data every 30 seconds
  static unsigned long lastPublish = 0;
  if (millis() - lastPublish > 30000) {
    publishSensorData();
    lastPublish = millis();
  }
}
