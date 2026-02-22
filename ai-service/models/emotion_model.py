import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
import cv2
import os

class EmotionModel:
    """
    Emotion recognition model using a CNN architecture based on FER-2013.
    """
    def __init__(self):
        self.emotions = {0: 'angry', 1: 'disgust', 2: 'fear', 3: 'happy', 4: 'sad', 5: 'surprise', 6: 'neutral'}
        self.model_path = 'assets/emotion_model.h5'
        self.model = self._load_or_build_model()

    def _load_or_build_model(self):
        if os.path.exists(self.model_path):
            return load_model(self.model_path)
        
        # Build FER-2013 architecture shell if no weights found
        model = Sequential([
            Conv2D(64, (3,3), activation='relu', input_shape=(48,48,1)),
            BatchNormalization(),
            MaxPooling2D(2,2),
            Dropout(0.25),
            
            Conv2D(128, (5,5), activation='relu'),
            BatchNormalization(),
            MaxPooling2D(2,2),
            Dropout(0.25),
            
            Conv2D(512, (3,3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D(2,2),
            Dropout(0.25),
            
            Flatten(),
            Dense(256, activation='relu'),
            BatchNormalization(),
            Dropout(0.5),
            Dense(7, activation='softmax')
        ])
        
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        return model

    def predict(self, face_image):
        """
        Input: Grayscale face image (48x48)
        Output: Dict with dominant emotion and scores
        """
        img = cv2.resize(face_image, (48, 48))
        img = img.astype('float32') / 255.0
        img = np.expand_dims(img, axis=0)
        img = np.expand_dims(img, axis=-1)
        
        preds = self.model.predict(img)[0]
        dominant_idx = np.argmax(preds)
        
        return {
            "dominant_emotion": self.emotions[dominant_idx],
            "confidence": float(preds[dominant_idx]),
            "scores": {self.emotions[i]: float(preds[i]) for i in range(7)}
        }
