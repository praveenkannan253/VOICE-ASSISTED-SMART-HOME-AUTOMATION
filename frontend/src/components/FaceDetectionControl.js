import React, { useState } from 'react';

function FaceDetectionControl({ faceRecognition, onTrigger, onConfigure }) {
  const [config, setConfig] = useState({
    timeout: 10,
    sensitivity: 'medium',
    mode: 'auto'
  });

  const handleTrigger = () => {
    if (onTrigger) {
      onTrigger('manual_trigger', 'normal');
    }
  };

  const handleConfigure = () => {
    if (onConfigure) {
      onConfigure(config);
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="card shadow p-3">
      <h5>🎛️ Face Detection Control</h5>
      
      <div className="mb-3">
        <button 
          className="btn btn-primary me-2"
          onClick={handleTrigger}
          disabled={faceRecognition?.status === 'processing'}
        >
          📷 Trigger Camera
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={() => window.location.reload()}
        >
          🔄 Refresh Status
        </button>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Timeout (seconds)</label>
          <input 
            type="number" 
            className="form-control"
            value={config.timeout}
            onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
            min="5"
            max="30"
          />
        </div>
        
        <div className="col-md-4">
          <label className="form-label">Sensitivity</label>
          <select 
            className="form-select"
            value={config.sensitivity}
            onChange={(e) => handleConfigChange('sensitivity', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div className="col-md-4">
          <label className="form-label">Mode</label>
          <select 
            className="form-select"
            value={config.mode}
            onChange={(e) => handleConfigChange('mode', e.target.value)}
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
            <option value="motion_only">Motion Only</option>
          </select>
        </div>
      </div>

      <button 
        className="btn btn-success"
        onClick={handleConfigure}
      >
        ⚙️ Apply Configuration
      </button>

      {faceRecognition?.status && (
        <div className="mt-3">
          <small className="text-muted">
            Status: <span className={faceRecognition.status === 'processing' ? 'text-warning' : 'text-success'}>
              {faceRecognition.status}
            </span>
          </small>
        </div>
      )}
    </div>
  );
}

export default FaceDetectionControl;
