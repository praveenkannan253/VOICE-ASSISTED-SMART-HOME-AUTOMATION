import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import HistoryPanel from "./components/HistoryPanel";
import VoiceAssistant from "./components/VoiceAssistant";
import FaceRecognitionPanel from "./components/FaceRecognitionPanel";

// Initialize socket with proper error handling
let socket = null;

const initSocket = () => {
  try {
    const backendUrl = window.location.origin.replace(':3001', ':3000');
    console.log('Connecting to backend at:', backendUrl);
    
    socket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      forceNew: true
    });

    // Add socket connection debugging
    socket.on('connect', () => {
      console.log('✅ Socket connected to backend');
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Socket disconnected from backend');
    });

    socket.on('connect_error', (error) => {
      console.log('⚠️ Socket connection error (will retry):', error?.code || error);
    });
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    socket = null;
  }
};

// Initialize socket after a small delay to ensure DOM is ready
setTimeout(initSocket, 100);

function App() {
  const [sensors, setSensors] = useState({});
  const [fridgeInventory, setFridgeInventory] = useState([]);
  const [showAllFridgeItems, setShowAllFridgeItems] = useState(false);
  const [weather, setWeather] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [deviceStates, setDeviceStates] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('deviceStates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved device states:', e);
      }
    }
    return {
      fan: false,
      light: false,
      'water-motor': false
    };
  });
  const [waterLevel, setWaterLevel] = useState(50); // 0-100%
  const [showWaterLevel, setShowWaterLevel] = useState(false); // Show water level only on click
  const [deviceTimers, setDeviceTimers] = useState({}); // Track on/off timings
  const [recentDetections, setRecentDetections] = useState([]); // Face detections for voice panel
  const timerIntervalRef = useRef(null);
  const tempChartRef = useRef(null);
  const humChartRef = useRef(null);
  const tempCanvasRef = useRef(null);
  const humCanvasRef = useRef(null);

  useEffect(() => {
    console.log("Loading initial sensor data...");
    console.log("Backend URL:", window.location.origin.replace(':3001', ':3000'));
    
    fetch("/api/sensors")
      .then((res) => {
        console.log("Sensor response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Initial sensor data:", data);
        setSensors(data);
      })
      .catch((error) => {
        console.error("Error loading initial sensor data:", error);
      });

    fetch("/api/fridge/inventory")
      .then((res) => {
        console.log("Fridge response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Fridge inventory:", data);
        // Normalize items: remove duplicates with case-insensitive matching
        const normalized = [];
        const seen = new Set();
        for (const item of (data.inventory || [])) {
          const key = item.item.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            normalized.push(item);
          }
        }
        setFridgeInventory(normalized);
      })
      .catch((error) => {
        console.error("Error loading fridge inventory:", error);
      });

    // Fetch initial device states only if localStorage is empty
    const saved = localStorage.getItem('deviceStates');
    if (!saved) {
      fetch("/api/devices")
        .then((res) => res.json())
        .then((data) => {
          console.log("Initial device states from API:", data);
          if (data.devices) {
            const states = {};
            data.devices.forEach(device => {
              states[device.name] = device.state === 'on';
            });
            setDeviceStates(states);
            localStorage.setItem('deviceStates', JSON.stringify(states));
          }
        })
        .catch((error) => {
          console.log("Device states endpoint not available, using defaults:", error);
        });
    } else {
      console.log("✅ Loaded device states from localStorage:", JSON.parse(saved));
    }

    // Fetch weather data
    fetchWeather();
    // Update weather every 10 minutes
    const weatherInterval = setInterval(fetchWeather, 600000);

    if (socket) {
      socket.on("sensor_update", ({ topic, data }) => {
        console.log("Received sensor update:", topic, data);
        setSensors((prev) => ({ ...prev, [topic]: data }));
      });

      socket.on("fridge_update", ({ item, quantity, action, alert }) => {
        setFridgeInventory((prev) => {
          const itemLower = item.toLowerCase();
          const existingIndex = prev.findIndex(p => p.item.toLowerCase() === itemLower);
          
          if (existingIndex >= 0) {
            // Update existing item - replace quantity, don't add
            const updated = [...prev];
            updated[existingIndex] = { 
              ...updated[existingIndex], 
              quantity, 
              updated_at: new Date().toISOString() 
            };
            console.log(`Updated fridge item: ${item} -> quantity: ${quantity}`);
            return updated;
          } else {
            // Add new item only if it doesn't exist
            console.log(`Added new fridge item: ${item} with quantity: ${quantity}`);
            return [...prev, { item, quantity, status: 'ok', updated_at: new Date().toISOString() }];
          }
        });
        
        // Add alert to notifications if present
        if (alert) {
          addNotification(alert.message, 'warning');
        }
      });

      socket.on("fridge_alert", (alert) => {
        addNotification(alert.message, 'warning');
      });

      socket.on("fridge_detection", ({ items, count, timestamp }) => {
        if (items && Array.isArray(items)) {
          setFridgeInventory((prev) => {
            const updated = [...prev];
            for (const detectedItem of items) {
              const itemLower = detectedItem.name.toLowerCase();
              const existingIndex = updated.findIndex(p => p.item.toLowerCase() === itemLower);
              
              if (existingIndex >= 0) {
                // Update existing item
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  quantity: detectedItem.quantity,
                  updated_at: new Date().toISOString()
                };
              } else {
                // Add new item
                updated.push({
                  item: detectedItem.name,
                  quantity: detectedItem.quantity,
                  status: 'detected',
                  updated_at: new Date().toISOString()
                });
              }
            }
            return updated;
          });
          addNotification(`Fridge detection: ${count} item(s) detected`, 'info');
        }
      });

      socket.on("water_level", (data) => {
        console.log("Water level update:", data);
        setWaterLevel(data.level || 50);
      });

      socket.on("device_state_change", (data) => {
        console.log("🔄 Device state change broadcast received:", data);
        const isOn = data.state === 'on';
        setDeviceStates(prev => {
          const updated = { ...prev, [data.device]: isOn };
          localStorage.setItem('deviceStates', JSON.stringify(updated));
          console.log("✅ Updated device state:", updated);
          return updated;
        });
      });

      // Listen for reconnection to re-register listeners
      socket.on("reconnect", () => {
        console.log("🔌 Socket reconnected, re-registering listeners");
      });
    }

    return () => {
      clearInterval(weatherInterval);
      if (socket) {
        socket.off("sensor_update");
        socket.off("fridge_update");
        socket.off("fridge_alert");
        socket.off("water_level");
        socket.off("device_state_change");
        socket.off("reconnect");
      }
    };
  }, []);

  useEffect(() => {
    // Wait for Chart.js to load
    const initCharts = () => {
      try {
        console.log("Checking Chart.js availability:", !!window.Chart);
        console.log("Canvas refs:", { temp: !!tempCanvasRef.current, hum: !!humCanvasRef.current });
        
        if (!window.Chart || !tempCanvasRef.current || !humCanvasRef.current) {
          // If Chart.js is not loaded yet, wait a bit and try again
          console.log("Chart.js or canvas not ready, retrying in 100ms...");
          setTimeout(initCharts, 100);
          return;
        }

        // Destroy existing charts if they exist
        if (tempChartRef.current) {
          tempChartRef.current.destroy();
          tempChartRef.current = null;
        }
        if (humChartRef.current) {
          humChartRef.current.destroy();
          humChartRef.current = null;
        }

        const Chart = window.Chart;
        console.log("Initializing main charts...");

        tempChartRef.current = new Chart(tempCanvasRef.current.getContext("2d"), {
        type: "line",
        data: { 
          labels: [], 
          datasets: [{ 
            label: "🌡 Temperature (°C)", 
            data: [], 
            borderColor: "#e74c3c",
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 200);
              gradient.addColorStop(0, 'rgba(231, 76, 60, 0.5)');
              gradient.addColorStop(1, 'rgba(231, 76, 60, 0.0)');
              return gradient;
            },
            fill: true, 
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "#e74c3c",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#e74c3c"
          }] 
        },
        options: { 
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
          },
          scales: { 
            y: { 
              beginAtZero: false,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
                drawBorder: false
              },
              ticks: {
                color: '#aaa',
                font: { size: 11 }
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)',
                drawBorder: false
              },
              ticks: {
                color: '#aaa',
                font: { size: 10 },
                maxRotation: 0
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#fff',
                font: { size: 12, weight: 'bold' },
                padding: 10
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#e74c3c',
              borderWidth: 2,
              padding: 12,
              displayColors: false
            }
          }
        }
      });

      humChartRef.current = new Chart(humCanvasRef.current.getContext("2d"), {
        type: "line",
        data: { 
          labels: [], 
          datasets: [{ 
            label: "💧 Humidity (%)", 
            data: [], 
            borderColor: "#3498db",
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 200);
              gradient.addColorStop(0, 'rgba(52, 152, 219, 0.5)');
              gradient.addColorStop(1, 'rgba(52, 152, 219, 0.0)');
              return gradient;
            },
            fill: true, 
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "#3498db",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#3498db"
          }] 
        },
        options: { 
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
          },
          scales: { 
            y: { 
              beginAtZero: false,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
                drawBorder: false
              },
              ticks: {
                color: '#aaa',
                font: { size: 11 }
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)',
                drawBorder: false
              },
              ticks: {
                color: '#aaa',
                font: { size: 10 },
                maxRotation: 0
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#fff',
                font: { size: 12, weight: 'bold' },
                padding: 10
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#3498db',
              borderWidth: 2,
              padding: 12,
              displayColors: false
            }
          }
        }
      });

        return () => {
          tempChartRef.current && tempChartRef.current.destroy();
          humChartRef.current && humChartRef.current.destroy();
        };
      } catch (error) {
        console.error("Error initializing charts:", error);
      }
    };

    initCharts();
  }, []);

  // Update charts whenever new sensor data arrives
  useEffect(() => {
    const espData = sensors["esp/sensors"];
    if (!espData) return;

    console.log("Updating main charts with sensor data:", espData);
    const now = new Date().toLocaleTimeString();
    const tempVal = espData.temp;
    const humVal = espData.hum;

    const tC = tempChartRef.current;
    const hC = humChartRef.current;
    if (tC && tempVal !== undefined) {
      tC.data.labels.push(now);
      tC.data.datasets[0].data.push(tempVal);
      if (tC.data.labels.length > 10) { tC.data.labels.shift(); tC.data.datasets[0].data.shift(); }
      tC.update();
      console.log("Updated temperature chart with value:", tempVal);
    }
    if (hC && humVal !== undefined) {
      hC.data.labels.push(now);
      hC.data.datasets[0].data.push(humVal);
      if (hC.data.labels.length > 10) { hC.data.labels.shift(); hC.data.datasets[0].data.shift(); }
      hC.update();
      console.log("Updated humidity chart with value:", humVal);
    }
  }, [sensors]);

  // Update running timers every second
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setDeviceTimers(prev => {
        const updated = { ...prev };
        let changed = false;
        for (const device in updated) {
          if (updated[device] && updated[device].isRunning) {
            // Calculate elapsed time since start
            const elapsedSeconds = Math.floor((new Date() - updated[device].startTime) / 1000);
            // Total = accumulated time + current session
            updated[device].duration = updated[device].accumulatedTime + elapsedSeconds;
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    }, 1000);
    
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const sendCommand = (device, action) => {
    console.log(`Sending command: ${device} -> ${action}`);
    // Update local state immediately for UI feedback
    const isOn = action === 'on' || action === true;
    setDeviceStates(prev => {
      const updated = { ...prev, [device]: isOn };
      // Persist to localStorage
      localStorage.setItem('deviceStates', JSON.stringify(updated));
      return updated;
    });
    
    // Track timer for device on/off
    setDeviceTimers(prev => {
      const updated = { ...prev };
      if (isOn) {
        // Device turned on
        if (updated[device] && !updated[device].isRunning) {
          // Resume: continue from where it stopped
          updated[device].startTime = new Date();
          updated[device].isRunning = true;
          console.log(`⏱ ${device} resumed from ${updated[device].accumulatedTime}s`);
        } else {
          // Start fresh timer
          updated[device] = {
            startTime: new Date(),
            duration: 0,
            accumulatedTime: 0,
            isRunning: true
          };
          console.log(`⏱ ${device} started`);
        }
      } else {
        // Device turned off - save accumulated time
        if (updated[device] && updated[device].isRunning) {
          const sessionDuration = Math.floor((new Date() - updated[device].startTime) / 1000);
          updated[device].accumulatedTime += sessionDuration;
          updated[device].duration = updated[device].accumulatedTime;
          updated[device].isRunning = false;
          console.log(`⏱ ${device} stopped. Total: ${updated[device].accumulatedTime}s`);
        }
      }
      return updated;
    });
    
    // Send to backend
    fetch("/api/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device, action }),
    }).catch(err => console.error("Error sending command:", err));
  };

  const updateFridgeItem = (item, quantity, action) => {
    fetch("/api/fridge/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item, quantity, action }),
    });
  };

  const fetchWeather = async () => {
    try {
      // Using Open-Meteo (free, no API key needed)
      // Location: Coimbatore, India (11.0168°N, 76.9558°E)
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=11.0168&longitude=76.9558&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia/Kolkata'
      );
      const data = await response.json();
      
      // Weather code mapping
      const weatherCodes = {
        0: '☀️ Clear',
        1: '🌤 Mainly Clear',
        2: '⛅ Partly Cloudy',
        3: '☁️ Overcast',
        45: '🌫 Foggy',
        48: '🌫 Foggy',
        51: '🌦 Light Drizzle',
        61: '🌧 Light Rain',
        63: '🌧 Moderate Rain',
        65: '🌧 Heavy Rain',
        71: '🌨 Light Snow',
        80: '🌦 Rain Showers',
        95: '⛈ Thunderstorm'
      };
      
      setWeather({
        temp: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        condition: weatherCodes[data.current.weather_code] || '🌤 Partly Cloudy',
        lastUpdate: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeather({
        temp: '--',
        humidity: '--',
        condition: '❌ Unavailable',
        lastUpdate: new Date().toLocaleTimeString()
      });
    }
  };

  const getNotificationEmoji = (type) => {
    switch(type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const addNotification = (message, type = 'info') => {
    const emoji = getNotificationEmoji(type);
    const notification = {
      id: Date.now(),
      message: `${emoji} ${message}`,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep last 10
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleVoiceCommand = (device, action) => {
    if (device === 'all-lights') {
      const lights = ['light'];
      lights.forEach(lightDevice => {
        sendCommand(lightDevice, action);
      });
    } else {
      sendCommand(device, action);
    }
  };


  const getDeviceState = (device) => {
    return deviceStates[device] || false;
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getDeviceTimer = (device) => {
    const timer = deviceTimers[device];
    if (!timer) return null;
    return {
      duration: timer.duration,
      isRunning: timer.isRunning,
      formatted: formatTime(timer.duration)
    };
  };

  const espData = sensors["esp/sensors"] || {};

  return (
    <>
      <nav className="navbar p-3">
        <span className="navbar-brand">🤖 IoT Home Automation Hub</span>
      </nav>

      <div className="container-fluid mt-3">
        <div className="dashboard-grid">
          {/* Charts Section */}
          <div className="card shadow p-3 mb-3">
            <h5>📊 Real-time Sensor Charts</h5>
            <div style={{height: '150px', position: 'relative'}}>
              <canvas ref={tempCanvasRef}></canvas>
            </div>
            <div style={{height: '150px', position: 'relative'}} className="mt-2">
              <canvas ref={humCanvasRef}></canvas>
            </div>
          </div>

          {/* Controls Section */}
          <div className="card shadow p-3 mb-3">
            <h5>🎛 Appliance Controls</h5>
            <div className="control-item">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                <div>
                  <span>Fan</span>
                  {getDeviceTimer("fan") && (
                    <small style={{display: 'block', color: '#00d4ff', fontSize: '0.7rem', marginTop: '2px'}}>
                      ⏱ {getDeviceTimer("fan").formatted}
                    </small>
                  )}
                </div>
                <label className="switch"><input type="checkbox" checked={getDeviceState("fan")} onChange={(e) => sendCommand("fan", e.target.checked ? "on" : "off")} /><span className="slider"></span></label>
              </div>
            </div>
            <div className="control-item">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                <div>
                  <span>Light</span>
                  {getDeviceTimer("light") && (
                    <small style={{display: 'block', color: '#00d4ff', fontSize: '0.7rem', marginTop: '2px'}}>
                      ⏱ {getDeviceTimer("light").formatted}
                    </small>
                  )}
                </div>
                <label className="switch"><input type="checkbox" checked={getDeviceState("light")} onChange={(e) => sendCommand("light", e.target.checked ? "on" : "off")} /><span className="slider"></span></label>
              </div>
            </div>
            
            {/* Water Motor Control with Water Level Display */}
            <div className="control-item" style={{marginBottom: '8px', flexDirection: 'column', alignItems: 'flex-start'}}>
              <div className="d-flex justify-content-between align-items-center mb-1" style={{width: '100%'}}>
                <div>
                  <span style={{fontSize: '0.9rem'}}>💧 Water Motor</span>
                  {getDeviceTimer("water-motor") && (
                    <small style={{display: 'block', color: '#00d4ff', fontSize: '0.7rem', marginTop: '2px'}}>
                      ⏱ {getDeviceTimer("water-motor").formatted}
                    </small>
                  )}
                </div>
                <label className="switch">
                  <input type="checkbox" checked={getDeviceState("water-motor")} onChange={(e) => sendCommand("water-motor", e.target.checked ? "on" : "off")} />
                  <span className="slider"></span>
                </label>
              </div>
              <div style={{marginBottom: '12px'}}>
                <small style={{color: '#aaa', fontSize: '0.8rem', fontWeight: '600'}}>💧 Water Level</small>
                <button
                  className="btn btn-sm"
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    setShowWaterLevel(!showWaterLevel);
                    if (!showWaterLevel && socket) {
                      socket.emit('mqtt_publish', {
                        topic: 'device/water',
                        message: 'check_level'
                      });
                      addNotification('Checking water level...', 'info');
                    }
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🔍 {showWaterLevel ? 'Hide' : 'Check'} Water Level
                </button>
                
                {showWaterLevel && (
                  <div style={{marginTop: '12px', padding: '10px', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '6px', border: '1px solid rgba(0, 212, 255, 0.3)'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                      <div style={{flex: 1}}>
                        <div style={{
                          width: '100%',
                          height: '24px',
                          background: 'rgba(0, 212, 255, 0.2)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid rgba(0, 212, 255, 0.5)'
                        }}>
                          <div style={{
                            width: `${waterLevel}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #00d4ff 0%, #0099cc 100%)',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                      </div>
                      <span style={{fontSize: '0.9rem', color: '#00d4ff', fontWeight: '700', minWidth: '40px'}}>{waterLevel}%</span>
                    </div>
                    <small style={{fontSize: '0.75rem', textAlign: 'center', display: 'block', color: '#00d4ff'}}>
                      {waterLevel > 80 ? '✅ Full' : waterLevel > 40 ? '⚠️ Half' : '🔴 Low'}
                    </small>
                  </div>
                )}
              </div>
            </div>

            {/* ESP32 Boot Control Section */}
            <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
              <small style={{color: '#aaa', fontSize: '0.8rem', fontWeight: '600'}}>🔄 ESP32 Boot Control</small>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginTop: '8px'}}>
                <button 
                  className="btn btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    if (socket) {
                      socket.emit('mqtt_publish', {
                        topic: 'device/boot',
                        message: 'master boot'
                      });
                      addNotification('Master boot command sent', 'info');
                    }
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🔌 Master
                </button>
                <button 
                  className="btn btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    if (socket) {
                      socket.emit('mqtt_publish', {
                        topic: 'device/boot',
                        message: 'slave_1 boot'
                      });
                      addNotification('Slave 1 boot command sent', 'info');
                    }
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🔌 Slave 1
                </button>
                <button 
                  className="btn btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    if (socket) {
                      socket.emit('mqtt_publish', {
                        topic: 'device/boot',
                        message: 'slave_2 boot'
                      });
                      addNotification('Slave 2 boot command sent', 'info');
                    }
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🔌 Slave 2
                </button>
              </div>
            </div>
          </div>

          {/* Sensors Section */}
          <div className="card shadow p-3 mb-3">
            <h5>📡 Live Sensor Data</h5>
            <p>🌡 Temp: {espData.temp ?? "--"} °C</p>
            <p>💧 Humidity: {espData.hum ?? "--"} %</p>
            <p>💡 LDR: {espData.ldr ?? "--"}</p>
            <p>🚶 PIR: {espData.pir === 1 ? "Motion Detected" : "No Motion"}</p>
            <p>📡 IR: {espData.ir ?? "--"}</p>
          </div>

          {/* Fridge Section */}
          <div className="card shadow p-3 mb-3">
            <h5>🧊 Refrigerator Monitoring</h5>
            <div className="fridge-inventory">
              {fridgeInventory.length > 0 ? (
                <>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px', padding: '0'}}>
                    {(showAllFridgeItems ? fridgeInventory : fridgeInventory.slice(0, 3)).map((item, index) => (
                      <div key={index} className="fridge-item" style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '8px',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        minHeight: '150px',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      >
                        {/* Display fridge item image - REAL DETECTED IMAGE */}
                        {item.image_path ? (
                          <img 
                            src={`http://localhost:3000/api/fridge/image/${item.image_path}`}
                            alt={item.item}
                            style={{
                              width: '75px',
                              height: '75px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              border: '2px solid rgba(102, 126, 234, 0.5)',
                              marginBottom: '6px',
                              flexShrink: 0
                            }}
                            onError={(e) => {
                              console.log(`Image load failed for ${item.item}, using placeholder`);
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', minHeight: '60px'}}>
                          <div>
                            <span className="fw-bold text-capitalize" style={{fontSize: '0.8rem', color: '#fff', display: 'block', marginBottom: '2px', wordBreak: 'break-word'}}>{item.item}</span>
                            <small style={{fontSize: '0.65rem', color: '#aaa', display: 'block'}}>
                              {item.updated_at ? new Date(item.updated_at).toLocaleTimeString() : 'N/A'}
                            </small>
                          </div>
                          <div style={{marginTop: '4px'}}>
                            <span className="badge" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontSize: '0.7rem', marginBottom: '4px', display: 'block', padding: '2px 6px'}}>
                              {item.quantity}
                            </span>
                            <div className="btn-group btn-group-sm" style={{width: '100%', display: 'flex', gap: '1px'}}>
                              <button 
                                className="btn btn-outline-success btn-sm"
                                style={{padding: '1px 3px', fontSize: '0.65rem', flex: 1, minWidth: '20px'}}
                                onClick={() => updateFridgeItem(item.item, item.quantity, 'add')}
                              >
                                +
                              </button>
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                style={{padding: '1px 3px', fontSize: '0.65rem', flex: 1, minWidth: '20px'}}
                                onClick={() => updateFridgeItem(item.item, item.quantity, 'remove')}
                                disabled={item.quantity <= 0}
                              >
                                -
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {fridgeInventory.length > 3 && (
                    <button 
                      className="btn btn-sm"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '8px'
                      }}
                      onClick={() => setShowAllFridgeItems(!showAllFridgeItems)}
                    >
                      {showAllFridgeItems ? '📋 Show Less' : `📋 Show More (${fridgeInventory.length - 3})`}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center text-muted py-2">
                  <p className="mb-0">🔍 No items detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Notifications Section */}
          <div className="card shadow p-3 mb-3">
            <h5>🔔 Notifications</h5>
            <div id="notifications" style={{maxHeight: '250px', overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {notifications.length > 0 ? (
                notifications.map(notif => (
                  <div key={notif.id} className={`notification-item ${notif.type === 'warning' ? 'alert-warning' : ''}`} style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: notif.type === 'warning' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                    border: `1px solid ${notif.type === 'warning' ? '#ffc107' : '#4caf50'}`,
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}>
                    <span style={{flex: 1, marginRight: '10px', wordBreak: 'break-word'}}>
                      [{notif.timestamp}] {notif.message}
                    </span>
                    <button onClick={() => removeNotification(notif.id)} style={{
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '0',
                      minWidth: '24px',
                      flexShrink: 0
                    }}>
                      ❌
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-3">
                  <small style={{color: '#aaa'}}>No notifications</small>
                </div>
              )}
            </div>
          </div>

          {/* Weather Section */}
          <div className="card shadow p-3 weather-card">
              <h5 className="mb-3">
                <span className="pulse-icon">🌤</span> Live Weather
              </h5>
              {weather ? (
                <div className="weather-content">
                  <div className="weather-main mb-2">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h3 className="mb-0 weather-temp">{weather.temp}°C</h3>
                        <p className="mb-0 text-muted">{weather.condition}</p>
                      </div>
                      <div className="weather-icon-large">
                        {weather.condition.includes('Clear') ? '☀️' :
                         weather.condition.includes('Rain') ? '🌧️' :
                         weather.condition.includes('Cloud') ? '☁️' : '🌤️'}
                      </div>
                    </div>
                  </div>
                  <div className="weather-details">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">💧 Humidity</span>
                      <strong>{weather.humidity}%</strong>
                    </div>
                    <div className="progress mb-2" style={{height: '4px'}}>
                      <div className="progress-bar bg-info progress-bar-animated" 
                           style={{width: `${weather.humidity}%`}}></div>
                    </div>
                    <small className="text-muted d-block text-center">
                      Updated: {weather.lastUpdate}
                    </small>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mb-0 mt-2 text-muted">Loading weather...</p>
                </div>
              )}
          </div>

          {/* Face Recognition Panel */}
          <FaceRecognitionPanel socket={socket} onRecentDetectionsChange={setRecentDetections} />

          {/* Voice Assistant */}
          <VoiceAssistant onCommand={handleVoiceCommand} recentDetections={recentDetections} />

          {/* History Panel */}
          <HistoryPanel socket={socket} />
        </div>
      </div>
    </>
  );
}

export default App;
