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

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
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
            <div className="control-item">Fan <label className="switch"><input type="checkbox" checked={getDeviceState("fan")} onChange={(e) => sendCommand("fan", e.target.checked ? "on" : "off")} /><span className="slider"></span></label></div>
            <div className="control-item">Light <label className="switch"><input type="checkbox" checked={getDeviceState("light")} onChange={(e) => sendCommand("light", e.target.checked ? "on" : "off")} /><span className="slider"></span></label></div>
            
            {/* Water Motor Control with Water Level Display */}
            <div className="control-item mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>💧 Water Motor Pump</span>
                <label className="switch">
                  <input type="checkbox" checked={getDeviceState("water-motor")} onChange={(e) => sendCommand("water-motor", e.target.checked ? "on" : "off")} />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="water-level-container">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Water Level</small>
                  <small className="badge bg-info">{waterLevel}%</small>
                </div>
                <div className="progress" style={{height: '8px'}}>
                  <div 
                    className="progress-bar bg-info progress-bar-animated" 
                    style={{width: `${waterLevel}%`}}
                  ></div>
                </div>
                <small className="text-muted d-block mt-1">
                  {waterLevel > 80 ? '✅ Tank Full' : waterLevel > 40 ? '⚠️ Tank Half' : '🔴 Tank Low'}
                </small>
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
                fridgeInventory.map((item, index) => (
                  <div key={index} className="fridge-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                    <div className="d-flex align-items-center" style={{flex: 1}}>
                      {/* Display fridge item image if available */}
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.item}
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '8px',
                            marginRight: '12px',
                            objectFit: 'cover',
                            border: '2px solid #ddd'
                          }}
                          onError={(e) => {
                            console.log(`Failed to load image for ${item.item}`);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div>
                        <span className="fw-bold text-capitalize">{item.item}</span>
                        <small className="text-muted d-block">
                          {new Date(item.updated_at).toLocaleTimeString()}
                        </small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge bg-primary me-2">{item.quantity}</span>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-success btn-sm"
                          onClick={() => updateFridgeItem(item.item, item.quantity, 'add')}
                        >
                          +
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => updateFridgeItem(item.item, item.quantity, 'remove')}
                          disabled={item.quantity <= 0}
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </div>
                ))
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
            <div id="notifications" style={{maxHeight: '200px', overflowY: 'auto'}}>
              {notifications.length > 0 ? (
                notifications.map(notif => (
                  <div key={notif.id} className={`notification-item ${notif.type === 'warning' ? 'alert-warning' : ''}`}>
                    <span>[{notif.timestamp}] {notif.message}</span>
                    <button onClick={() => removeNotification(notif.id)}>❌</button>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-2">
                  <small>No notifications</small>
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
          </div>

          {/* Face Recognition Panel */}
          <FaceRecognitionPanel socket={socket} />

          {/* Voice Assistant */}
          <VoiceAssistant onCommand={handleVoiceCommand} />

          {/* History Panel */}
          <HistoryPanel socket={socket} />
        </div>
      </div>
    </>
  );
}

export default App;
