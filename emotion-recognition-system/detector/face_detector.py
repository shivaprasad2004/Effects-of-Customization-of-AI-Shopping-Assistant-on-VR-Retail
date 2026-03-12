import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image


class FaceDetector:
    """OpenCV Haar cascade face detection."""

    def __init__(self):
        self.cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def detect_from_base64(self, image_b64: str):
        """Detect faces from base64 image, return cropped face regions as grayscale 48x48."""
        try:
            img_data = base64.b64decode(image_b64)
            img = Image.open(BytesIO(img_data)).convert('RGB')
            frame = np.array(img)
            gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)

            faces = self.cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

            results = []
            for (x, y, w, h) in faces:
                face_roi = gray[y:y+h, x:x+w]
                face_resized = cv2.resize(face_roi, (48, 48))
                face_normalized = face_resized / 255.0
                results.append({
                    "face": face_normalized,
                    "bbox": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
                })

            return results
        except Exception as e:
            return []

    def detect_from_array(self, frame: np.ndarray):
        """Detect faces from numpy array."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
        faces = self.cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        results = []
        for (x, y, w, h) in faces:
            face_roi = gray[y:y+h, x:x+w]
            face_resized = cv2.resize(face_roi, (48, 48))
            results.append({"face": face_resized / 255.0, "bbox": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)}})
        return results
