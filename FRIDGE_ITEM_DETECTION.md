# Fridge Item Detection & Image Display

## ✅ Feature Implemented

Fridge items now automatically display detected images from the face recognition system!

## How It Works

### System Flow

```
1. Camera detects item (e.g., "milk")
   ↓
2. Image saved to face_recognition table
   - person_name: "milk"
   - image_path: "/path/to/image.jpg"
   - timestamp: detection time
   ↓
3. Fridge inventory endpoint fetches image
   - Queries face_recognition table
   - Matches by item name
   - Returns latest detected image
   ↓
4. Dashboard displays image
   - Shows 60x60px thumbnail
   - Updates in real-time
   - Works across all tabs
```

## Backend Implementation

### Updated Endpoint: `/api/fridge/inventory`

**Response includes detected images:**
```json
{
  "inventory": [
    {
      "item": "milk",
      "quantity": 2,
      "status": "ok",
      "image": "/path/to/detected/image.jpg",
      "updated_at": "2025-11-27T15:30:00Z"
    },
    {
      "item": "bread",
      "quantity": 1,
      "status": "ok",
      "image": null,
      "updated_at": "2025-11-27T15:25:00Z"
    }
  ]
}
```

### Logic

1. **Check stored image first** (image_path in fridge_items table)
2. **If no stored image, fetch from face_recognition:**
   ```sql
   SELECT image_path FROM face_recognition 
   WHERE person_name = ? 
   ORDER BY timestamp DESC LIMIT 1
   ```
3. **Return image or null** if not found

## Frontend Display

### Fridge Panel

```
┌─────────────────────────────────────┐
│ 🧊 Refrigerator Monitoring          │
├─────────────────────────────────────┤
│ [IMG] Milk          Qty: 2 [+][-]   │
│ [IMG] Bread         Qty: 1 [+][-]   │
│ [IMG] Eggs          Qty: 6 [+][-]   │
│       Cheese        Qty: 3 [+][-]   │
└─────────────────────────────────────┘
```

- **[IMG]** = 60x60px detected image
- **No image** = Item detected but no image yet
- **Real-time** = Updates when new detection occurs

## Database Schema

### fridge_items table

```sql
CREATE TABLE fridge_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item VARCHAR(100) NOT NULL,
  quantity INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ok',
  image_path VARCHAR(255),  -- Optional: stored image
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_item (item)
);
```

### face_recognition table

```sql
CREATE TABLE face_recognition (
  id INT AUTO_INCREMENT PRIMARY KEY,
  person_name VARCHAR(100),  -- Item name (e.g., "milk")
  status VARCHAR(20),        -- 'known' or 'unknown'
  confidence FLOAT,
  image_path VARCHAR(255),   -- Detected image path
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(100)
);
```

## How to Test

### Step 1: Setup
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend-vite && npm run dev
```

### Step 2: Simulate Detection
Insert test data into face_recognition table:

```sql
INSERT INTO face_recognition 
(person_name, status, confidence, image_path, location) 
VALUES 
('milk', 'known', 0.95, '/images/milk_detected.jpg', 'fridge'),
('bread', 'known', 0.92, '/images/bread_detected.jpg', 'fridge'),
('eggs', 'known', 0.88, '/images/eggs_detected.jpg', 'fridge');
```

### Step 3: View Dashboard
1. Open `http://localhost:3001`
2. Look at "🧊 Refrigerator Monitoring" panel
3. ✅ Images should appear next to item names

### Step 4: Add Fridge Item
```sql
INSERT INTO fridge_items (item, quantity, status) 
VALUES ('milk', 2, 'ok');
```

Then refresh dashboard - image will auto-display!

## Console Logs

**Backend:**
```
No detected image for cheese
✅ Fridge inventory: Sent 3 items with images
```

**Frontend:**
```
Fridge inventory: [
  { item: 'milk', quantity: 2, image: '/images/milk_detected.jpg' },
  { item: 'bread', quantity: 1, image: '/images/bread_detected.jpg' },
  { item: 'eggs', quantity: 6, image: '/images/eggs_detected.jpg' }
]
```

## Features

✅ **Automatic Detection**
- No manual upload needed
- Uses existing face recognition system
- Matches by item name

✅ **Real-time Display**
- Updates instantly when detected
- Works across all tabs
- Graceful fallback if no image

✅ **Flexible Storage**
- Can use detected images
- Can use stored images
- Prefers stored if available

✅ **Error Handling**
- Missing images don't break UI
- Fallback to text-only display
- Logs errors for debugging

## Integration Points

### Face Recognition System
- Detects items in camera feed
- Saves image_path to database
- Uses person_name field for item identification

### Fridge Inventory System
- Queries face_recognition table
- Matches detected items
- Displays images in UI

### Socket.IO Updates
- Real-time fridge_update events
- Broadcasts new detections
- Updates all connected clients

## Example Workflow

```
1. Camera sees milk in fridge
   ↓
2. Face recognition system:
   - Detects "milk"
   - Saves image: /images/milk_20251127_153000.jpg
   - Inserts into face_recognition table
   ↓
3. Backend /api/fridge/inventory:
   - Queries fridge_items for "milk"
   - Finds no stored image
   - Queries face_recognition for "milk"
   - Gets latest image path
   ↓
4. Frontend displays:
   - [IMG] Milk  Qty: 2 [+][-]
   - Image is 60x60px thumbnail
   ↓
5. Socket.IO broadcasts:
   - All tabs update instantly
   - No refresh needed
```

## Troubleshooting

### Issue: Images not showing
**Check:**
1. Face recognition table has image_path values
2. person_name matches fridge item names (case-sensitive)
3. Image paths are valid/accessible
4. Backend logs show successful queries

### Issue: Wrong images displayed
**Check:**
1. person_name in face_recognition matches item name exactly
2. Latest timestamp is being selected
3. No duplicate entries in database

### Issue: Performance slow
**Check:**
1. Face recognition table has index on person_name
2. Not too many old records (consider archiving)
3. Image paths are optimized

## Future Enhancements

- [ ] Image caching for faster loading
- [ ] Automatic image cleanup (old detections)
- [ ] Multiple images per item
- [ ] Confidence threshold filtering
- [ ] Image compression
- [ ] Batch detection updates

## SQL Queries

### Get all fridge items with latest detected images
```sql
SELECT 
  f.item,
  f.quantity,
  f.status,
  f.image_path,
  (SELECT image_path FROM face_recognition 
   WHERE person_name = f.item 
   ORDER BY timestamp DESC LIMIT 1) as detected_image
FROM fridge_items f
ORDER BY f.updated_at DESC;
```

### Find items without images
```sql
SELECT f.item, f.quantity
FROM fridge_items f
LEFT JOIN face_recognition fr ON f.item = fr.person_name
WHERE f.image_path IS NULL AND fr.image_path IS NULL
GROUP BY f.item;
```

### Get detection statistics
```sql
SELECT 
  person_name,
  COUNT(*) as detection_count,
  MAX(timestamp) as last_detected,
  MAX(image_path) as latest_image
FROM face_recognition
GROUP BY person_name
ORDER BY last_detected DESC;
```

---

**Status:** ✅ Fully implemented  
**Last Updated:** November 27, 2025  
**Commit:** `048c5cd`
