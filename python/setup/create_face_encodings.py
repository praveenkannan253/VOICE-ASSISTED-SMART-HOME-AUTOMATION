import face_recognition
import cv2
import pickle
import os
import json

def create_face_encodings():
    """
    Create face encodings for known faces.
    Place images of known faces in a 'faces' folder with filenames as person names.
    Example: faces/John.jpg, faces/Jane.jpg, etc.
    """
    
    # Create faces directory if it doesn't exist
    faces_dir = "faces"
    if not os.path.exists(faces_dir):
        os.makedirs(faces_dir)
        print(f"Created {faces_dir} directory. Please add face images there.")
        return
    
    # Get all image files from faces directory
    image_files = [f for f in os.listdir(faces_dir) 
                   if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
    
    if not image_files:
        print(f"No image files found in {faces_dir} directory.")
        print("Please add face images with filenames as person names (e.g., John.jpg, Jane.png)")
        return
    
    print(f"Found {len(image_files)} face images:")
    for img in image_files:
        print(f"  - {img}")
    
    encodings = []
    names = []
    
    for image_file in image_files:
        # Extract name from filename (without extension)
        name = os.path.splitext(image_file)[0]
        image_path = os.path.join(faces_dir, image_file)
        
        print(f"Processing {name}...")
        
        # Load image
        image = face_recognition.load_image_file(image_path)
        
        # Find face locations
        face_locations = face_recognition.face_locations(image)
        
        if len(face_locations) == 0:
            print(f"  ⚠️  No face found in {image_file}")
            continue
        elif len(face_locations) > 1:
            print(f"  ⚠️  Multiple faces found in {image_file}, using the first one")
        
        # Get face encodings
        face_encodings = face_recognition.face_encodings(image, face_locations)
        
        if len(face_encodings) > 0:
            encodings.append(face_encodings[0])
            names.append(name)
            print(f"  ✅ Face encoding created for {name}")
        else:
            print(f"  ❌ Failed to create encoding for {name}")
    
    if len(encodings) == 0:
        print("❌ No face encodings were created!")
        return
    
    # Save encodings to pickle file
    data = {"encodings": encodings, "names": names}
    
    # Save to E: drive as specified in the original code
    save_path = r"E:\face_encodings.pkl"
    try:
        with open(save_path, "wb") as f:
            pickle.dump(data, f)
        print(f"✅ Face encodings saved to {save_path}")
        print(f"📊 Created encodings for {len(names)} people: {', '.join(names)}")
    except Exception as e:
        print(f"❌ Error saving to E: drive: {e}")
        # Fallback to current directory
        save_path = "face_encodings.pkl"
        with open(save_path, "wb") as f:
            pickle.dump(data, f)
        print(f"✅ Face encodings saved to {save_path}")
        print(f"📊 Created encodings for {len(names)} people: {', '.join(names)}")

if __name__ == "__main__":
    print("🔍 Face Encoding Creator")
    print("=" * 50)
    print("Instructions:")
    print("1. Create a 'faces' folder in this directory")
    print("2. Add face images with filenames as person names")
    print("3. Example: faces/John.jpg, faces/Jane.png")
    print("4. Run this script to generate encodings")
    print("=" * 50)
    
    create_face_encodings()
