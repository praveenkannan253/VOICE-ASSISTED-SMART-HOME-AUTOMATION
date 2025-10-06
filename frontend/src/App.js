import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import HistoryPanel from "./components/HistoryPanel";
import VoiceAssistant from "./components/VoiceAssistant";
import FaceRecognitionPanel from "./components/FaceRecognitionPanel";

const socket = io(window.location.origin.replace(':3001', ':3000'));

// Add socket connection debugging
socket.on('connect', () => {
  console.log('✅ Socket connected to backend');
});

socket.on('disconnect', () => {
  console.log('❌ Socket disconnected from backend');
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
});

function App() {
  const [sensors, setSensors] = useState({});
  const [fridgeInventory, setFridgeInventory] = useState([]);
  const [weather, setWeather] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const tempChartRef = useRef(null);
  const humChartRef = useRef(null);
  const tempCanvasRef = useRef(null);
  const humCanvasRef = useRef(null);

  useEffect(() => {
    console.log("Loading initial sensor data...");
    fetch("/api/sensors")
      .then((res) => res.json())
      .then((data) => {
        console.log("Initial sensor data:", data);
        setSensors(data);
      })
      .catch((error) => {
        console.error("Error loading initial sensor data:", error);
      });

    fetch("/api/fridge/inventory")
      .then((res) => res.json())
      .then((data) => setFridgeInventory(data.inventory || []));

    // Fetch weather data
    fetchWeather();
    // Update weather every 10 minutes
    const weatherInterval = setInterval(fetchWeather, 600000);

    socket.on("sensor_update", ({ topic, data }) => {
      console.log("Received sensor update:", topic, data);
      setSensors((prev) => ({ ...prev, [topic]: data }));
    });

    return () => clearInterval(weatherInterval);

    socket.on("fridge_update", ({ item, quantity, action, alert }) => {
      setFridgeInventory((prev) => {
        const itemLower = item.toLowerCase();
        const existing = prev.find(p => p.item.toLowerCase() === itemLower);
        if (existing) {
          // Update existing item (case-insensitive match)
          return prev.map(p => p.item.toLowerCase() === itemLower ? { ...p, quantity, updated_at: new Date().toISOString() } : p);
        } else {
          // Add new item
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

    return () => {
      socket.off("sensor_update");
      socket.off("fridge_update");
    };
  }, []);

  useEffect(() => {
    // Wait for Chart.js to load
    const initCharts = () => {
      console.log("Checking Chart.js availability:", !!window.Chart);
      console.log("Canvas refs:", { temp: !!tempCanvasRef.current, hum: !!humCanvasRef.current });
      
      if (!window.Chart || !tempCanvasRef.current || !humCanvasRef.current) {
        // If Chart.js is not loaded yet, wait a bit and try again
        console.log("Chart.js or canvas not ready, retrying in 100ms...");
        setTimeout(initCharts, 100);
        return;
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
    fetch("/api/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device, action }),
    });
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
    const sensorData = sensors[`home/sensors/${device}`];
    return sensorData?.state === 'on';
  };

  const espData = sensors["esp/sensors"] || {};

  return (
    <>
      <nav className="navbar p-3">
        <span className="navbar-brand">🏠 Smart Home Dashboard</span>
      </nav>

      <div className="container-fluid mt-3">
        <div className="row g-3">
          {/* Left Column - Charts & Face Recognition */}
          <div className="col-lg-4">
            <div className="card shadow p-3 mb-3">
              <h5>📊 Real-time Sensor Charts</h5>
              <div style={{height: '150px', position: 'relative'}}>
                <canvas ref={tempCanvasRef}></canvas>
              </div>
              <div style={{height: '150px', position: 'relative'}} className="mt-2">
                <canvas ref={humCanvasRef}></canvas>
              </div>
            </div>

            {/* Face Recognition Panel */}
            <FaceRecognitionPanel socket={socket} />
          </div>

          {/* Middle Column - Controls & Sensors */}
          <div className="col-lg-4">
            <div className="card shadow p-3 mb-3">
              <h5>🎛 Appliance Controls</h5>
              <div className="control-item">Fan <label className="switch"><input type="checkbox" checked={getDeviceState("fan")} onChange={(e) => sendCommand("fan", e.target.checked ? "on" : "off")} /><span className="slider"></span></label></div>
              <div className="control-item">Light <label className="switch"><input type="checkbox" checked={getDeviceState("light")} onChange={(e) => sendCommand("light", e.target.checked ? "on" : "off")} /><span className="slider"></span></label></div>
              <div className="control-item">AC <label className="switch"><input type="checkbox" checked={getDeviceState("ac")} onChange={(e) => sendCommand("ac", e.target.checked ? "on" : "off")} /><span className="slider"></span></label></div>
              <div className="control-item">Washing Machine <label className="switch"><input type="checkbox" checked={getDeviceState("washing-machine")} onChange={(e) => sendCommand("washing-machine", e.target.checked ? "on" : "off")} /><span className="slider"></span></label></div>
            </div>

            <div className="card shadow p-3 mb-3">
              <h5>📡 Live Sensor Data</h5>
              <p>🌡 Temp: {espData.temp ?? "--"} °C</p>
              <p>💧 Humidity: {espData.hum ?? "--"} %</p>
              <p>💡 LDR: {espData.ldr ?? "--"}</p>
              <p>🚶 PIR: {espData.pir === 1 ? "Motion Detected" : "No Motion"}</p>
              <p>📡 IR: {espData.ir ?? "--"}</p>
            </div>

            <VoiceAssistant onCommand={handleVoiceCommand} />
            
            <HistoryPanel socket={socket} />
          </div>

          {/* Right Column - Fridge, Notifications, Energy, Weather */}
          <div className="col-lg-4">
            <div className="card shadow p-3 mb-3">
              <h5>🧊 Refrigerator Monitoring</h5>
              <div className="fridge-inventory">
                {fridgeInventory.length > 0 ? (
                  fridgeInventory.map((item, index) => (
                    <div key={index} className="fridge-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                      <div>
                        <span className="fw-bold text-capitalize">{item.item}</span>
                        <small className="text-muted d-block">
                          {new Date(item.updated_at).toLocaleTimeString()}
                        </small>
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

            <div className="card shadow p-3 mb-3 energy-card">
              <h5 className="mb-3">
                <span className="pulse-icon">⚡</span> Energy Usage
              </h5>
              <div className="energy-stats">
                <div className="stat-item mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Today</span>
                    <span className="badge bg-success">12.5 kWh</span>
                  </div>
                  <div className="progress mt-1" style={{height: '6px'}}>
                    <div className="progress-bar bg-success progress-bar-animated" 
                         style={{width: '45%'}}></div>
                  </div>
                  <small className="text-muted">Cost: $2.10</small>
                </div>
                <div className="stat-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">This Week</span>
                    <span className="badge bg-warning">85 kWh</span>
                  </div>
                  <div className="progress mt-1" style={{height: '6px'}}>
                    <div className="progress-bar bg-warning progress-bar-animated" 
                         style={{width: '75%'}}></div>
                  </div>
                  <small className="text-muted">Cost: $14.00</small>
                </div>
              </div>
            </div>

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
        </div>
      </div>
    </>
  );
}

export default App;