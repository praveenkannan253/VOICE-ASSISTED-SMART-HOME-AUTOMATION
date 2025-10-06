import React from "react";
import HistoryChart from "./HistoryChart";

function HistoryPanel({ socket }) {
  return (
    <>
      <HistoryChart title="💡 Light Level (LDR)" topic="esp/sensors" dataKey="ldr" color="#f1c40f" period="24h" socket={socket} />
    </>
  );
}

export default HistoryPanel;