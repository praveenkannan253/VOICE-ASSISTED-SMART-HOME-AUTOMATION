# Refrigerator Image Display - Implementation Procedure

## Overview
To display detected images with person names in the refrigerator monitoring panel, follow this procedure.

## Current Status
- ✅ Fridge inventory items are displayed with quantities
- ⏳ Image display requires backend image storage setup

## Implementation Steps

### Step 1: Backend - Image Storage Setup
1. Create an `uploads/fridge` directory in the backend folder
2. When fridge items are detected, save the image to this directory
3. Generate a unique filename: `fridge_item_${timestamp}_${itemName}.jpg`

### Step 2: Backend - Add Image Endpoint
Add this endpoint to `backend/server.js`:

```javascript
// Get fridge item image
app.get('/api/fridge/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads/fridge', filename);
  
  // Security: prevent directory traversal
  if (!filepath.startsWith(path.join(__dirname, 'uploads/fridge'))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  res.sendFile(filepath, (err) => {
    if (err) res.status(404).json({ error: 'Image not found' });
  });
});
```

### Step 3: Update Fridge Data Structure
Modify the fridge inventory to include image filename:

```javascript
{
  item: "Milk",
  quantity: 2,
  status: "ok",
  image: "fridge_item_1234567890_milk.jpg",  // NEW
  updated_at: "2025-11-27T14:30:00Z"
}
```

### Step 4: Frontend - Update Fridge Panel
Update `frontend-vite/src/App.jsx` fridge display:

```jsx
<div className="fridge-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
  <div className="d-flex align-items-center">
    {item.image && (
      <img 
        src={`/api/fridge/image/${item.image}`} 
        alt={item.item}
        style={{ width: '50px', height: '50px', borderRadius: '8px', marginRight: '10px', objectFit: 'cover' }}
        onError={(e) => e.target.style.display = 'none'}
      />
    )}
    <div>
      <span className="fw-bold text-capitalize">{item.item}</span>
      <small className="text-muted d-block">
        {new Date(item.updated_at).toLocaleTimeString()}
      </small>
    </div>
  </div>
  <div className="d-flex align-items-center">
    <span className="badge bg-primary me-2">{item.quantity}</span>
    {/* existing buttons */}
  </div>
</div>
```

### Step 5: Socket.IO Update
When sending fridge updates via Socket.IO, include the image filename:

```javascript
socket.emit('fridge_update', {
  item: 'Milk',
  quantity: 2,
  action: 'update',
  image: 'fridge_item_1234567890_milk.jpg',  // NEW
  alert: null
});
```

## Alternative: Using Base64 Encoding
If you prefer to send images directly via Socket.IO:

```javascript
// Backend: Convert image to base64
const fs = require('fs');
const imageBase64 = fs.readFileSync(imagePath).toString('base64');

socket.emit('fridge_update', {
  item: 'Milk',
  quantity: 2,
  imageBase64: `data:image/jpeg;base64,${imageBase64}`,
  alert: null
});

// Frontend: Display base64 image
<img 
  src={item.imageBase64} 
  alt={item.item}
  style={{ width: '50px', height: '50px', borderRadius: '8px' }}
/>
```

## Testing
1. Add a fridge item with an image
2. Verify the image appears in the dashboard
3. Test image loading error handling (fallback to text-only display)

## Notes
- Images should be compressed before storage (max 500KB recommended)
- Implement image cleanup for old items (older than 30 days)
- Add image upload size limits in backend
- Consider using a CDN for image delivery in production
