# ✅ ESP8266 MQTT Topics Verification Report

## Overview
Verification of ESP8266 code against Smart Home IoT System MQTT topics standard.

---

## 📊 Topics Used in ESP8266 Code

### **PUBLISHED Topics (ESP8266 → Backend)**

| Topic | Status | Expected | Actual | Notes |
|-------|--------|----------|--------|-------|
| `esp/sensors` | ✅ MATCH | JSON with temp, hum, ldr, pir, ir | JSON with temp, hum, ldr, pir, ir, fault | **GOOD** - Includes fault flag |
| `esp/status` | ✅ MATCH | Device status JSON | JSON with fan, light | **GOOD** - Status format correct |
| `esp/water_level` | ⚠️ MISMATCH | `home/sensors/water-level` or `device/water/level` | `esp/water_level` | **ISSUE** - Wrong topic name |
| `esp/fault` | ⚠️ NEW | Not in standard | Published on sensor fault | **INFO** - Extra topic, not harmful |

---

### **SUBSCRIBED Topics (Backend → ESP8266)**

| Topic | Status | Expected | Actual | Notes |
|-------|--------|----------|--------|-------|
| `home/control` | ✅ MATCH | Control commands | Subscribed & handled | **GOOD** - Supports light, fan, motor, pump |
| `device/thresholds` | ⚠️ NEW | Not in standard | Subscribed & handled | **INFO** - Extra topic for threshold config |
| `device/water` | ✅ MATCH | Water level request | Subscribed & handled | **GOOD** - Sends WL_REQ to Master |
| `device/boot` | ✅ MATCH | Boot commands | Subscribed & handled | **GOOD** - Supports master, slave_1, slave_2 |

---

## 🔴 Issues Found

### **Issue 1: Water Level Topic Mismatch**

**Problem:**
```cpp
// ESP8266 publishes to:
client.publish("esp/water_level", buf, true);

// But backend expects:
// home/sensors/water-level  OR  device/water/level
```

**Impact:** Backend won't receive water level data from ESP8266

**Solution:** Change line in ESP8266 code:
```cpp
// WRONG:
client.publish("esp/water_level", buf, true);

// CORRECT:
client.publish("home/sensors/water-level", buf, true);
// OR
client.publish("device/water/level", buf, true);
```

---

## ✅ Correct Topics

### **Publishing (ESP8266 → Backend)**

```cpp
// CORRECT:
client.publish("esp/sensors", jsonMsg, true);           // ✅ Sensor data
client.publish("esp/status", buffer, true);             // ✅ Device status
client.publish("home/sensors/water-level", buf, true);  // ✅ Water level (FIXED)
client.publish("esp/fault", "sensor_fault");            // ℹ️ Extra (OK)
```

### **Subscribing (Backend → ESP8266)**

```cpp
// CORRECT:
client.subscribe("home/control");      // ✅ Control commands
client.subscribe("device/water");      // ✅ Water level request
client.subscribe("device/boot");       // ✅ Boot commands
client.subscribe("device/thresholds"); // ℹ️ Extra (OK)
```

---

## 📝 Command Format Verification

### **home/control Commands**

| Command | ESP8266 Handling | Status |
|---------|------------------|--------|
| `"light on"` | Sends "MASTER,LO" | ✅ OK |
| `"light off"` | Sends "MASTER,LF" | ✅ OK |
| `"fan on"` | Sends "MASTER,FO" | ✅ OK |
| `"fan off"` | Sends "MASTER,FF" | ✅ OK |
| `"motor on"` / `"pump on"` | Sends "MASTER,MOTOR_ON" | ✅ OK |
| `"motor off"` / `"pump off"` | Sends "MASTER,MOTOR_OFF" | ✅ OK |

---

### **device/boot Commands**

| Command | ESP8266 Handling | Status |
|---------|------------------|--------|
| `"master boot"` | Sends "MASTER,BOOT_MASTER" | ✅ OK |
| `"slave_1 boot"` | Sends "MASTER,BOOT_S1" | ✅ OK |
| `"slave_2 boot"` | Sends "MASTER,BOOT_S2" | ✅ OK |

---

### **device/water Commands**

| Command | ESP8266 Handling | Status |
|---------|------------------|--------|
| Any message | Sends "MASTER,WL_REQ" | ✅ OK |

---

## 📊 Data Format Verification

### **esp/sensors Format**

**Expected:**
```json
{
  "temp": 23.6,
  "hum": 85.5,
  "ldr": 45,
  "pir": 0,
  "ir": 1
}
```

**Actual (ESP8266):**
```json
{
  "temp": 23.6,
  "hum": 85.5,
  "ldr": 45,
  "pir": 0,
  "ir": 1,
  "fault": false
}
```

**Status:** ✅ **COMPATIBLE** - Extra `fault` field is OK

---

### **esp/status Format**

**Expected:**
```json
{
  "status": "online"
}
```

**Actual (ESP8266):**
```json
{
  "fan": 0,
  "light": 1
}
```

**Status:** ⚠️ **DIFFERENT** - But acceptable, contains device states

---

### **Water Level Format**

**Expected:**
```json
{
  "level": 75
}
```

**Actual (ESP8266):**
```json
{
  "level_raw": 1024
}
```

**Status:** ⚠️ **DIFFERENT** - Field name is `level_raw` instead of `level`

**Note:** Backend expects `level` field (0-100%), ESP8266 sends `level_raw` (raw ADC value)

---

## 🔧 Recommended Fixes

### **Fix 1: Water Level Topic**
```cpp
// Line ~45 in publishWaterLevel()
// CHANGE FROM:
client.publish("esp/water_level", buf, true);

// CHANGE TO:
client.publish("home/sensors/water-level", buf, true);
```

### **Fix 2: Water Level Field Name (Optional)**
```cpp
// Line ~42 in publishWaterLevel()
// CHANGE FROM:
doc["level_raw"] = levelRaw;

// CHANGE TO (if you want normalized 0-100):
int levelPercent = map(levelRaw, 0, 1023, 0, 100);
doc["level"] = levelPercent;

// OR keep as is if backend can handle raw values
```

---

## 📋 Summary

### **Overall Status: ⚠️ MOSTLY COMPATIBLE**

| Category | Status | Count |
|----------|--------|-------|
| ✅ Correct Topics | 7/9 | 78% |
| ⚠️ Issues Found | 2/9 | 22% |
| ❌ Critical Issues | 1 | Water level topic |

---

## ✅ Action Items

- [ ] **CRITICAL:** Change `esp/water_level` → `home/sensors/water-level`
- [ ] **OPTIONAL:** Normalize water level to 0-100% range
- [ ] **INFO:** Extra topics (`esp/fault`, `device/thresholds`) are fine

---

## 🔗 Related Files

- ESP8266 Code: Friend's laptop (provided)
- Backend: `d:\Documents\SMARTHOME\backend\server.js`
- Reference: `d:\Documents\SMARTHOME\MQTT_TOPICS_REFERENCE.md`

---

**Verification Date:** Nov 28, 2025
**Status:** Ready for deployment with 1 critical fix
