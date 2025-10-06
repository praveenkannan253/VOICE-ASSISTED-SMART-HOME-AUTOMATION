import React from 'react';
import DeviceCard from './DeviceCard.js';

function Dashboard({ devices }) {
  if (!devices || devices.length === 0) {
    return <div>No devices online</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} />)
      )}
    </div>
  );
}

export default Dashboard;



