import React from 'react';

function FaceRecognition({ faceRecognition }) {
  return (
    <div className="card shadow p-3">
      <h5>👤 Face Detection</h5>
      {faceRecognition.face_detected !== undefined ? (
        <div>
          <p><strong>Face Detection:</strong> 
            <span className={faceRecognition.face_detected ? 'text-success' : 'text-warning'}>
              {faceRecognition.face_detected ? '✅ Face Detected' : '❌ No Face'}
            </span>
          </p>
          <p><strong>Message:</strong> {faceRecognition.message}</p>
          <p><strong>Time:</strong> {new Date(faceRecognition.timestamp * 1000).toLocaleString()}</p>
          {faceRecognition.pir === 1 && <p><strong>Trigger:</strong> Motion Sensor (PIR)</p>}
          {faceRecognition.ir === 1 && <p><strong>Trigger:</strong> IR Sensor</p>}
          {faceRecognition.image_path && (
            <p><strong>Image:</strong> {faceRecognition.image_path}</p>
          )}
        </div>
      ) : faceRecognition.error ? (
        <div>
          <p className="text-danger"><strong>Error:</strong> {faceRecognition.error}</p>
        </div>
      ) : (
        <p className="text-muted">No face detection data available</p>
      )}
    </div>
  );
}

export default FaceRecognition;
