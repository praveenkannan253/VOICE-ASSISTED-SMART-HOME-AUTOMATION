import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

function HistoryChart({ title, topic, dataKey, color = "#3498db", period = "24h", socket }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    // Wait for Chart.js to load
    const initChart = () => {
      const Chart = window.Chart;
      console.log(`HistoryChart ${title}: Checking Chart.js availability:`, !!Chart);
      console.log(`HistoryChart ${title}: Canvas ref:`, !!canvasRef.current);
      
      if (!Chart || !canvasRef.current) {
        // If Chart.js is not loaded yet, wait a bit and try again
        console.log(`HistoryChart ${title}: Chart.js or canvas not ready, retrying in 100ms...`);
        setTimeout(initChart, 100);
        return;
      }
      console.log(`HistoryChart ${title}: Initializing chart...`);

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

      async function loadHistory() {
        try {
          console.log(`Loading history for ${title} (topic: ${topic}, dataKey: ${dataKey})`);
          const response = await fetch(`/api/sensors/history?topic=${encodeURIComponent(topic)}&period=${encodeURIComponent(period)}`);
          const json = await response.json();
          console.log(`History API response for ${title}:`, json);
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
            console.log(`Loaded ${data.length} historical data points for ${title}`);
          } else {
            console.log(`No historical data available for ${title}`);
          }
        } catch (e) {
          console.error('Error loading history:', e);
          console.log(`Will show live data only for ${title}`);
        }
      }

      loadHistory();

      function handleLive({ topic: t, data }) {
        console.log(`HistoryChart ${title} received sensor update:`, t, data);
        if (t !== topic) return;
        const chart = chartRef.current;
        if (!chart) return;
        
        const now = new Date().toLocaleTimeString();
        const value = data?.[dataKey] ?? null;
        
        if (value !== null) {
          // Clear "No Data" placeholder if this is the first real data point
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
          console.log(`Updated ${title} with live data:`, value);
        }
      }

      socket && socket.on("sensor_update", handleLive);

      return () => {
        socket && socket.off("sensor_update", handleLive);
        chartRef.current && chartRef.current.destroy();
      };
    };

    initChart();
  }, [title, topic, dataKey, color, period, socket]);

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.h5
        className="text-white font-semibold mb-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h5>
      <div style={{height: '200px', position: 'relative'}}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </motion.div>
  );
}

export default HistoryChart;