import numpy as np
import cv2
import os
import random

class EmotionModel:
    """
    Emotion recognition model with demo_mode fallback.
    Uses CNN when weights are available, otherwise returns weighted random predictions.
    """
    def __init__(self):
        self.emotions = {0: 'angry', 1: 'disgust', 2: 'fear', 3: 'happy', 4: 'sad', 5: 'surprise', 6: 'neutral'}
        self.model_path = 'assets/emotion_model.h5'
        self.demo_mode = True
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                import tensorflow as tf
                from tensorflow.keras.models import load_model
                self.model = load_model(self.model_path)
                self.demo_mode = False
                print("Emotion model loaded from weights.")
            except Exception as e:
                print(f"Could not load TF model ({e}), running in demo mode.")
                self.demo_mode = True
        else:
            print("No emotion model weights found. Running in DEMO mode.")
            self.demo_mode = True

    def predict(self, face_image):
        """
        Input: Grayscale face image (any size, resized to 48x48)
        Output: Dict with dominant emotion and scores
        """
        if self.demo_mode:
            return self._predict_mock()

        img = cv2.resize(face_image, (48, 48))
        img = img.astype('float32') / 255.0
        img = np.expand_dims(img, axis=0)
        img = np.expand_dims(img, axis=-1)

        preds = self.model.predict(img, verbose=0)[0]
        dominant_idx = np.argmax(preds)

        return {
            "dominant_emotion": self.emotions[dominant_idx],
            "confidence": float(preds[dominant_idx]),
            "scores": {self.emotions[i]: float(preds[i]) for i in range(7)}
        }

    def _predict_mock(self):
        """Weighted random prediction biased toward neutral and happy."""
        weights = [0.05, 0.02, 0.05, 0.25, 0.08, 0.15, 0.40]  # angry, disgust, fear, happy, sad, surprise, neutral
        # Add noise
        scores = [w + random.uniform(-0.03, 0.03) for w in weights]
        total = sum(scores)
        scores = [s / total for s in scores]
        dominant_idx = scores.index(max(scores))

        return {
            "dominant_emotion": self.emotions[dominant_idx],
            "confidence": float(scores[dominant_idx]),
            "scores": {self.emotions[i]: float(scores[i]) for i in range(7)},
            "demo_mode": True
        }

    def predict_from_base64(self, base64_str):
        """Decode base64 image and predict emotion."""
        import base64
        img_bytes = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return self._predict_mock()
        return self.predict(img)
