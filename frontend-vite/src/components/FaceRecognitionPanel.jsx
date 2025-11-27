import React, { useState, useEffect } from 'react';
import './FaceRecognitionPanel.css';

const FaceRecognitionPanel = ({ socket }) => {
  const [recentDetections, setRecentDetections] = useState([]);
  const [knownPersons, setKnownPersons] = useState([]);
  const [stats, setStats] = useState({
    total_known_persons: 0,
    total_detections: 0,
    known_detections: 0,
    unknown_detections: 0
  });
  const [newPersonName, setNewPersonName] = useState('');
  const [latestDetection, setLatestDetection] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchRecentDetections();
    fetchKnownPersons();
    fetchStats();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRecentDetections();
      fetchKnownPersons();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Listen for real-time face detection events
  useEffect(() => {
    if (!socket) return;

    const handleFaceDetected = (data) => {
      console.log('👤 Face detected:', data);
      setLatestDetection(data);
      
      // Add to recent detections
      setRecentDetections(prev => [data, ...prev].slice(0, 10));
      
      // Refresh data
      fetchKnownPersons();
      fetchStats();

      // Clear latest detection after 5 seconds
      setTimeout(() => {
        setLatestDetection(null);
      }, 5000);
    };

    socket.on('face_detected', handleFaceDetected);

    return () => {
      socket.off('face_detected', handleFaceDetected);
    };
  }, [socket]);

  const fetchRecentDetections = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/face/recent?limit=10');
      const data = await response.json();
      setRecentDetections(data.detections || []);
    } catch (error) {
      console.error('Error fetching recent detections:', error);
    }
  };

  const fetchKnownPersons = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/face/known');
      const data = await response.json();
      setKnownPersons(data.known_persons || []);
    } catch (error) {
      console.error('Error fetching known persons:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/face/stats');
      const data = await response.json();
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const addKnownPerson = async (e) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/api/face/add-known', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPersonName })
      });

      if (response.ok) {
        setNewPersonName('');
        fetchKnownPersons();
        fetchStats();
        alert(`✅ Added ${newPersonName} to known persons`);
      }
    } catch (error) {
      console.error('Error adding known person:', error);
      alert('❌ Failed to add person');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="face-recognition-panel">
      <h2>👤 Face Recognition System</h2>

      {/* Latest Detection Alert */}
      {latestDetection && (
        <div className={`latest-detection ${latestDetection.status}`}>
          <div className="detection-icon">
            {latestDetection.status === 'known' ? '✅' : '⚠️'}
          </div>
          <div className="detection-info">
            <h3>{latestDetection.name}</h3>
            <p className="detection-status">
              {latestDetection.status === 'known' ? 'KNOWN PERSON' : 'UNKNOWN PERSON'}
            </p>
            <p className="detection-confidence">
              Confidence: {(latestDetection.confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.total_known_persons}</div>
          <div className="stat-label">Known Persons</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.total_detections}</div>
          <div className="stat-label">Total Detections</div>
        </div>
        <div className="stat-card known">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.known_detections}</div>
          <div className="stat-label">Known</div>
        </div>
        <div className="stat-card unknown">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{stats.unknown_detections}</div>
          <div className="stat-label">Unknown</div>
        </div>
      </div>

      {/* Add Known Person Form */}
      <div className="add-person-section">
        <h3>➕ Add Known Person</h3>
        <form onSubmit={addKnownPerson} className="add-person-form">
          <input
            type="text"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Enter person's name"
            className="person-input"
          />
          <button type="submit" className="add-btn">Add</button>
        </form>
      </div>

      {/* Known Persons List */}
      <div className="known-persons-section">
        <h3>👥 Known Persons ({knownPersons.length})</h3>
        <div className="known-persons-list">
          {knownPersons.length === 0 ? (
            <p className="empty-message">No known persons yet</p>
          ) : (
            knownPersons.map((person, index) => (
              <div key={index} className="known-person-card">
                <div className="person-avatar">
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <div className="person-details">
                  <h4>{person.name}</h4>
                  <p className="person-visits">Visits: {person.visit_count}</p>
                  <p className="person-last-seen">
                    Last seen: {person.last_seen ? getTimeAgo(person.last_seen) : 'Never'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Detections */}
      <div className="recent-detections-section">
        <h3>🕐 Recent Detections</h3>
        <div className="detections-list">
          {recentDetections.length === 0 ? (
            <p className="empty-message">No detections yet</p>
          ) : (
            recentDetections.map((detection, index) => (
              <div key={index} className={`detection-item ${detection.status}`}>
                <div className="detection-icon-small">
                  {detection.status === 'known' ? '✅' : '⚠️'}
                </div>
                <div className="detection-content">
                  <div className="detection-name">{detection.name}</div>
                  <div className="detection-meta">
                    <span className="detection-time">
                      {getTimeAgo(detection.timestamp)}
                    </span>
                    <span className="detection-confidence-small">
                      {(detection.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceRecognitionPanel;
