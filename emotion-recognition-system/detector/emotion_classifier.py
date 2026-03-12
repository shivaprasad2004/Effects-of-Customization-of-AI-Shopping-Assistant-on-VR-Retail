import numpy as np
import random


EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

# Weighted distribution for realistic demo mode
DEMO_WEIGHTS = [0.05, 0.03, 0.05, 0.25, 0.08, 0.14, 0.40]


class EmotionClassifier:
    """Emotion classifier with demo mode fallback when no model weights are available."""

    def __init__(self, model_path=None):
        self.model = None
        self.demo_mode = True

        if model_path:
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(model_path)
                self.demo_mode = False
            except Exception:
                pass

    def predict(self, face_array: np.ndarray) -> dict:
        """Predict emotion from 48x48 grayscale face array."""
        if self.demo_mode:
            return self._predict_mock()

        try:
            input_data = face_array.reshape(1, 48, 48, 1)
            predictions = self.model.predict(input_data, verbose=0)[0]
            emotion_idx = int(np.argmax(predictions))
            return {
                "emotion": EMOTIONS[emotion_idx],
                "confidence": float(predictions[emotion_idx]),
                "scores": {e: float(predictions[i]) for i, e in enumerate(EMOTIONS)},
            }
        except Exception:
            return self._predict_mock()

    def _predict_mock(self) -> dict:
        """Generate realistic but random emotion predictions."""
        scores = np.random.dirichlet([w * 20 for w in DEMO_WEIGHTS])
        emotion_idx = int(np.argmax(scores))
        return {
            "emotion": EMOTIONS[emotion_idx],
            "confidence": float(scores[emotion_idx]),
            "scores": {e: float(scores[i]) for i, e in enumerate(EMOTIONS)},
            "demo_mode": True,
        }
