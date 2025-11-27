# Fridge Item Image Upload - Quick Guide

## ✅ Feature Ready

You can now upload and display images for fridge items directly from the dashboard!

## How to Use

### Step 1: Open Dashboard
```
http://localhost:3001
```

### Step 2: Find Fridge Panel
Look for **"🧊 Refrigerator Monitoring"** on the right side of the dashboard.

### Step 3: Upload Image
1. Click the **"📷 Choose Image"** button
2. Select an image file from your computer (JPEG, PNG, WebP, etc.)
3. Enter the item name when prompted (e.g., "milk", "bread", "eggs")
4. Image uploads automatically

### Step 4: View Image
- Image appears as a **60x60px thumbnail** next to the item name
- Shows item quantity and add/remove buttons
- Image persists in the fridge inventory

## Example Workflow

```
Dashboard → 🧊 Refrigerator Monitoring
         → 📷 Choose Image button
         → Select: milk.jpg
         → Enter: "milk"
         → ✅ Image uploaded!
         → [IMG] Milk  Qty: 1 [+][-]
```

## What Happens Behind the Scenes

1. **Frontend:**
   - User selects image file
   - Prompts for item name
   - Calls `uploadFridgeImage()` function
   - Sends FormData to backend

2. **Backend:**
   - Receives image via `/api/fridge/upload-image`
   - Validates file (must be image)
   - Saves to `backend/uploads/fridge/`
   - Returns image URL
   - Broadcasts update via Socket.IO

3. **Frontend (Real-time):**
   - Receives update via Socket.IO
   - Updates fridge inventory
   - Displays image thumbnail
   - Shows success notification

## Console Logs to Watch

**Frontend Console (F12):**
```
📸 Uploading image for: milk
✅ Image uploaded successfully: {
  status: "OK",
  item: "milk",
  image: "/uploads/fridge/fridge_1701086400000_milk.jpg"
}
```

**Backend Console:**
```
📸 Fridge image uploaded: milk -> /uploads/fridge/fridge_1701086400000_milk.jpg
📡 Broadcasting fridge_update to all clients
```

## File Storage

Images are saved in:
```
backend/uploads/fridge/
├── fridge_1701086400000_milk.jpg
├── fridge_1701086401000_bread.jpg
└── fridge_1701086402000_eggs.jpg
```

**Naming Format:** `fridge_[timestamp]_[itemname].jpg`

## Supported Image Formats

✅ JPEG (.jpg, .jpeg)  
✅ PNG (.png)  
✅ WebP (.webp)  
✅ GIF (.gif)  
✅ BMP (.bmp)  

**Max File Size:** 5MB

## Features

- ✅ Upload images directly from dashboard
- ✅ Auto-create fridge items with images
- ✅ Real-time display (no refresh needed)
- ✅ Error handling with notifications
- ✅ Image validation
- ✅ Cross-tab sync (all tabs see new images)
- ✅ Persistent storage

## Troubleshooting

### Issue: "Choose Image" button not working
**Solution:**
- Check browser console (F12) for errors
- Verify backend is running: `npm start`
- Try refreshing the page

### Issue: Image upload fails
**Solution:**
- Check file size (max 5MB)
- Verify file is an image format
- Check backend console for errors
- Ensure `backend/uploads/fridge/` directory exists

### Issue: Image doesn't display
**Solution:**
- Check browser console for image load errors
- Verify image URL is correct
- Check backend is serving static files
- Try a different image file

### Issue: Item name prompt doesn't appear
**Solution:**
- Check browser allows prompts
- Try using a different browser
- Check console for JavaScript errors

## Advanced Usage

### Upload via cURL (Command Line)

```bash
curl -X POST http://localhost:3000/api/fridge/upload-image \
  -F "image=@milk.jpg" \
  -F "item=milk" \
  -F "quantity=2"
```

### Upload via Postman

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/fridge/upload-image`
3. **Body:** form-data
   - `image` (File) → Select image file
   - `item` (Text) → milk
   - `quantity` (Text) → 2
4. **Send**

## Real-time Updates

When you upload an image:
- ✅ All open tabs update instantly (Socket.IO)
- ✅ Image appears in fridge panel
- ✅ Notification shows success
- ✅ Backend logs the upload

## Database Integration (Optional)

To persist images in database, the backend automatically updates:
```sql
UPDATE fridge_items SET image_url = ? WHERE item = ?
```

## Next Steps

1. ✅ Start backend & frontend
2. ✅ Open dashboard
3. ✅ Click "📷 Choose Image"
4. ✅ Select an image file
5. ✅ Enter item name
6. ✅ See image appear in fridge panel!

---

**Status:** ✅ Ready to use  
**Last Updated:** November 27, 2025
