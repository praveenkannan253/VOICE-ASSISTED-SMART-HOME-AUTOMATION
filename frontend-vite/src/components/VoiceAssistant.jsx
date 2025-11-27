import React, { useState, useEffect } from 'react';

function VoiceAssistant({ onCommand, recentDetections = [] }) {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setRecognizedText('Listening...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setRecognizedText(transcript);
      
      // Process the command
      const command = processVoiceCommand(transcript);
      if (command) {
        setLastCommand(`${command.device} → ${command.action}`);
        onCommand(command.device, command.action);
      } else {
        setLastCommand('Command not recognized');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setRecognizedText('Error: ' + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processVoiceCommand = (text) => {
    // Command mapping patterns
    const patterns = [
      // Light commands
      { pattern: /turn on the light|turn on light|light on|switch on light/i, device: 'light', action: 'on' },
      { pattern: /turn off the light|turn off light|light off|switch off light/i, device: 'light', action: 'off' },
      
      // Fan commands
      { pattern: /turn on the fan|turn on fan|fan on|switch on fan/i, device: 'fan', action: 'on' },
      { pattern: /turn off the fan|turn off fan|fan off|switch off fan/i, device: 'fan', action: 'off' },
      
      // AC commands
      { pattern: /turn on the ac|turn on ac|ac on|switch on ac|air conditioning on/i, device: 'ac', action: 'on' },
      { pattern: /turn off the ac|turn off ac|ac off|switch off ac|air conditioning off/i, device: 'ac', action: 'off' },
      
      // Washing Machine commands
      { pattern: /turn on the washing machine|turn on washing machine|washing machine on|washer on/i, device: 'washing-machine', action: 'on' },
      { pattern: /turn off the washing machine|turn off washing machine|washing machine off|washer off/i, device: 'washing-machine', action: 'off' },
      
      // All lights commands
      { pattern: /turn on all lights|all lights on|lights on/i, device: 'all-lights', action: 'on' },
      { pattern: /turn off all lights|all lights off|lights off/i, device: 'all-lights', action: 'off' },
    ];

    // Find matching pattern
    for (const { pattern, device, action } of patterns) {
      if (pattern.test(text)) {
        return { device, action };
      }
    }

    return null;
  };

  if (!isSupported) {
    return (
      <div className="card shadow p-3 voice-panel">
        <h5>🎤 Voice Assistant</h5>
        <div className="voice-box" style={{ color: '#e74c3c' }}>
          Speech recognition not supported in this browser
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow p-3 voice-panel">
      <h5>🎤 Voice Assistant</h5>
      <div className="voice-box">
        <div className="mb-2">
          <button 
            className={`btn ${isListening ? 'btn-danger' : 'btn-warning'} btn-sm`}
            onClick={startListening}
            disabled={isListening}
            style={{ 
              borderRadius: '50%', 
              width: '50px', 
              height: '50px',
              fontSize: '20px'
            }}
          >
            {isListening ? '⏹️' : '🎤'}
          </button>
        </div>
        
        {recognizedText && (
          <div className="mb-2">
            <small style={{ color: '#f1c40f' }}>
              <strong>Heard:</strong> "{recognizedText}"
            </small>
          </div>
        )}
        
        {lastCommand && (
          <div>
            <small style={{ color: lastCommand.includes('not recognized') ? '#e74c3c' : '#2ecc71' }}>
              <strong>Command:</strong> {lastCommand}
            </small>
          </div>
        )}
        
        <div className="mt-2">
          <small style={{ color: '#95a5a6' }}>
            Try: "Turn on the light", "Fan off", "AC on"
          </small>
        </div>
      </div>

      {/* Recent Face Detections */}
      {recentDetections && recentDetections.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h6 style={{ marginBottom: '8px', color: '#ddd' }}>🕐 Recent Detections</h6>
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {recentDetections.slice(0, 5).map((detection, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                background: detection.status === 'known' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)',
                borderLeft: `4px solid ${detection.status === 'known' ? '#4caf50' : '#ff9800'}`,
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                <span style={{ marginRight: '8px', fontSize: '16px' }}>
                  {detection.status === 'known' ? '✅' : '⚠️'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: '600' }}>{detection.name}</div>
                  <div style={{ color: '#aaa', fontSize: '11px' }}>
                    {getTimeAgo(detection.timestamp)} • {(detection.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceAssistant;
