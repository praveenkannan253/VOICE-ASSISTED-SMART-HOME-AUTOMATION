import React from "react";

function DeviceCard({ title, status, onOn, onOff }) {
  return (
    <div className="border rounded-lg p-4 shadow">
      <h3 className="text-lg font-bold">{title}</h3>
      <p>Status: {status || "--"}</p>
      {onOn && onOff && (
        <div className="mt-2">
          <button className="bg-green-500 text-white px-2 py-1 mr-2" onClick={onOn}>
            ON
          </button>
          <button className="bg-red-500 text-white px-2 py-1" onClick={onOff}>
            OFF
          </button>
        </div>
      )}
    </div>
  );
}

export default DeviceCard;


