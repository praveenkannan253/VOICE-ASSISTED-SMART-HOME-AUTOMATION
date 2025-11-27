import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

function HistoryChart({ title, topic, dataKey, color = "#3498db", period = "24h", socket }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    try {
      // Destroy existing chart if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const Chart = window.Chart;
      if (!Chart || !canvasRef.current) {
        console.log(`HistoryChart ${title}: Chart.js or canvas not ready`);
        return;
      }

      // Initialize chart
      chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
        type: "line",
        data: { 
          labels: ["No Data"], 
          datasets: [{ 
            label: title, 
            data: [0], 
            borderColor: color, 
            backgroundColor: color + "33", 
            fill: true, 
            tension: 0.3 
          }] 
        },
        options: { 
          responsive: true,
          maintainAspectRatio: false,
          scales: { 
            y: { beginAtZero: false },
            x: {
              display: true,
              title: {
                display: true,
                text: 'Time'
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          }
        }
      });

      // Load historical data
      (async () => {
        try {
          const response = await fetch(`/api/sensors/history?topic=${encodeURIComponent(topic)}&period=${encodeURIComponent(period)}`);
          if (!response.ok) {
            console.log(`History endpoint returned ${response.status} for ${title}`);
            return;
          }
          
          const json = await response.json();
          const labels = [];
          const data = [];
          
          for (const p of json.points || []) {
            const time = new Date(p.t);
            labels.push(time.toLocaleTimeString());
            let value = null;
            
            try {
              const parsed = typeof p.v === 'string' ? JSON.parse(p.v) : p.v;
              value = parsed?.[dataKey] ?? null;
            } catch (_) {
              value = null;
            }
            
            if (typeof value === 'string' && !isNaN(Number(value))) {
              value = Number(value);
            }
            data.push(value);
          }
          
          const chart = chartRef.current;
          if (chart && data.length > 0) {
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.update();
            console.log(`Loaded ${data.length} points for ${title}`);
          } else {
            console.log(`No historical data for ${title}, showing live data only`);
          }
        } catch (e) {
          console.log(`History load skipped for ${title} (will show live data):`, e.message);
        }
      })();

      // Handle live updates
      const handleLive = ({ topic: t, data }) => {
        if (t !== topic) return;
        const chart = chartRef.current;
        if (!chart) return;
        
        const now = new Date().toLocaleTimeString();
        const value = data?.[dataKey] ?? null;
        
        if (value !== null) {
          if (chart.data.labels.length === 1 && chart.data.labels[0] === "No Data") {
            chart.data.labels = [];
            chart.data.datasets[0].data = [];
          }
          
          chart.data.labels.push(now);
          chart.data.datasets[0].data.push(typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value);
          
          if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
          }
          chart.update();
        }
      };

      if (socket) {
        socket.on("sensor_update", handleLive);
      }

      return () => {
        if (socket) {
          socket.off("sensor_update", handleLive);
        }
        if (chartRef.current) {
          chartRef.current.destroy();
        }
      };
    } catch (error) {
      console.error(`HistoryChart ${title} error:`, error);
    }
  }, [title, topic, dataKey, color, period, socket]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
    >
      <h5 className="text-white font-semibold mb-3" style={{ opacity: 1, transform: "none" }}>
        {title}
      </h5>
      <div className="chart-container">
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
      </div>
    </motion.div>
  );
}

export default HistoryChart;
