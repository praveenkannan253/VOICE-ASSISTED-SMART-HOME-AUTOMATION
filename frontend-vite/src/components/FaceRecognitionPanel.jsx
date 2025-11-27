import React, { useState, useEffect } from 'react';
import './FaceRecognitionPanel.css';

const FaceRecognitionPanel = ({ socket, onRecentDetectionsChange }) => {
  const [recentDetections, setRecentDetections] = useState([]);
  const [knownPersons, setKnownPersons] = useState([]);
  const [showAllPersons, setShowAllPersons] = useState(false);
  const [stats, setStats] = useState({
    total_known_persons: 0,
    total_detections: 0,
    known_detections: 0,
    unknown_detections: 0
  });
  const [newPersonName, setNewPersonName] = useState('');
  const [latestDetection, setLatestDetection] = useState(null);
  const [editingPersonId, setEditingPersonId] = useState(null);
  const [editingPersonName, setEditingPersonName] = useState('');
  
  // Show only 3 persons by default, show all when toggled
  const displayedPersons = showAllPersons ? knownPersons : knownPersons.slice(0, 3);

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
      setRecentDetections(prev => {
        const updated = [data, ...prev].slice(0, 10);
        // Notify parent component
        if (onRecentDetectionsChange) {
          onRecentDetectionsChange(updated);
        }
        return updated;
      });
      
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
  }, [socket, onRecentDetectionsChange]);

  const fetchRecentDetections = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/face/recent?limit=10');
      const data = await response.json();
      const detections = data.detections || [];
      setRecentDetections(detections);
      if (onRecentDetectionsChange) {
        onRecentDetectionsChange(detections);
      }
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

  const updatePersonName = async (oldName) => {
    if (!editingPersonName.trim() || editingPersonName === oldName) {
      setEditingPersonId(null);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/face/update-person', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: editingPersonName })
      });

      if (response.ok) {
        setEditingPersonId(null);
        setEditingPersonName('');
        fetchKnownPersons();
        fetchStats();
        alert(`✅ Updated name to ${editingPersonName}`);
      } else {
        alert('❌ Failed to update person name');
      }
    } catch (error) {
      console.error('Error updating person:', error);
      alert('❌ Failed to update person');
    }
  };

  const deletePersonName = async (personName) => {
    if (!window.confirm(`Are you sure you want to delete ${personName}?`)) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/face/delete-person', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: personName })
      });

      if (response.ok) {
        fetchKnownPersons();
        fetchStats();
        alert(`✅ Deleted ${personName}`);
      } else {
        alert('❌ Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      alert('❌ Failed to delete person');
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
            <>
              {displayedPersons.map((person, index) => (
                <div key={index} className="known-person-card">
                  <div className="person-avatar">
                    {(editingPersonId === person.name ? editingPersonName : person.name).charAt(0).toUpperCase()}
                  </div>
                  <div className="person-details" style={{ flex: 1 }}>
                    {editingPersonId === person.name ? (
                      <input
                        type="text"
                        value={editingPersonName}
                        onChange={(e) => setEditingPersonName(e.target.value)}
                        onBlur={() => updatePersonName(person.name)}
                        onKeyPress={(e) => e.key === 'Enter' && updatePersonName(person.name)}
                        autoFocus
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '2px solid #667eea',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: '600',
                          width: '100%',
                          marginBottom: '4px'
                        }}
                      />
                    ) : (
                      <h4 
                        onClick={() => {
                          setEditingPersonId(person.name);
                          setEditingPersonName(person.name);
                        }}
                        style={{ cursor: 'pointer', marginBottom: '2px', margin: 0 }}
                        title="Click to edit"
                      >
                        {person.name} ✏️
                      </h4>
                    )}
                    <p className="person-visits">Visits: {person.visit_count}</p>
                    <p className="person-last-seen">
                      Last seen: {person.last_seen ? getTimeAgo(person.last_seen) : 'Never'}
                    </p>
                  </div>
                  <button
                    onClick={() => deletePersonName(person.name)}
                    style={{
                      background: 'rgba(231, 76, 60, 0.2)',
                      border: '1px solid #e74c3c',
                      color: '#e74c3c',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      marginLeft: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(231, 76, 60, 0.4)';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(231, 76, 60, 0.2)';
                      e.target.style.transform = 'scale(1)';
                    }}
                    title="Delete person"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {knownPersons.length > 3 && (
                <button 
                  className="see-more-btn"
                  onClick={() => setShowAllPersons(!showAllPersons)}
                >
                  {showAllPersons ? '📋 Show Less' : `📋 See More (${knownPersons.length - 3})`}
                </button>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default FaceRecognitionPanel;
