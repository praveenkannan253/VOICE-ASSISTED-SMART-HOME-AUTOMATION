import React from "react";
import HistoryChart from "./HistoryChart";

function HistoryPanel({ socket }) {
  return (
    <div className="history-panel card shadow p-3 mb-3">
      <h5 style={{color: '#fff', marginBottom: '16px'}}>💡 Light Level (LDR)</h5>
      <div className="chart-container">
        <HistoryChart title="" topic="esp/sensors" dataKey="ldr" color="#f1c40f" period="24h" socket={socket} />
      </div>
    </div>
  );
}

export default HistoryPanel;
