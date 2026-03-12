import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
import os
import argparse


EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']


def build_model():
    model = Sequential([
        Conv2D(64, (3, 3), activation='relu', input_shape=(48, 48, 1)),
        BatchNormalization(),
        MaxPooling2D(2, 2),
        Dropout(0.25),

        Conv2D(128, (5, 5), activation='relu'),
        BatchNormalization(),
        MaxPooling2D(2, 2),
        Dropout(0.25),

        Conv2D(512, (3, 3), activation='relu'),
        BatchNormalization(),
        MaxPooling2D(2, 2),
        Dropout(0.25),

        Flatten(),
        Dense(256, activation='relu'),
        BatchNormalization(),
        Dropout(0.5),
        Dense(7, activation='softmax')
    ])

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model


def generate_synthetic_data(n_per_class=50):
    """Generate synthetic 48x48 grayscale images for demo training."""
    print(f"Generating {n_per_class * 7} synthetic training images...")
    images = []
    labels = []
    for i, emotion in enumerate(EMOTIONS):
        for _ in range(n_per_class):
            # Create synthetic face-like patterns with random noise
            img = np.random.rand(48, 48).astype(np.float32) * 0.3
            # Add simple geometric features to differentiate classes
            center = (24, 24)
            # Vary patterns by emotion index
            img[20:28, 15:20] = 0.5 + i * 0.05  # "eye" left
            img[20:28, 28:33] = 0.5 + i * 0.05  # "eye" right
            img[32:36, 18:30] = 0.4 + i * 0.08  # "mouth"
            images.append(img)
            label = np.zeros(7)
            label[i] = 1.0
            labels.append(label)

    return np.array(images).reshape(-1, 48, 48, 1), np.array(labels)


def train(dataset_path=None, demo=False, epochs=50):
    model = build_model()

    if demo or not dataset_path or not os.path.exists(str(dataset_path)):
        print("Running in DEMO mode with synthetic data...")
        X_train, y_train = generate_synthetic_data(n_per_class=50)
        epochs = min(epochs, 5)  # Limit epochs in demo
        model.fit(X_train, y_train, batch_size=32, epochs=epochs, validation_split=0.2, verbose=1)
    else:
        print(f"Training on dataset: {dataset_path}")
        train_datagen = ImageDataGenerator(rescale=1./255, rotation_range=10, zoom_range=0.1, horizontal_flip=True)
        train_generator = train_datagen.flow_from_directory(
            os.path.join(dataset_path, 'train'),
            target_size=(48, 48), color_mode='grayscale',
            batch_size=64, class_mode='categorical'
        )
        model.fit(train_generator, epochs=epochs)

    os.makedirs('assets', exist_ok=True)
    model.save('assets/emotion_model.h5')
    print(f"Model saved to assets/emotion_model.h5")
    print(f"Model parameters: {model.count_params():,}")
    return model


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Emotion Recognition Model Training')
    parser.add_argument('--demo', action='store_true', help='Use synthetic data for demo training')
    parser.add_argument('--dataset-path', type=str, default=None, help='Path to FER-2013 dataset')
    parser.add_argument('--epochs', type=int, default=50, help='Number of training epochs')
    args = parser.parse_args()

    print("Starting Emotion Model Training Pipeline...")
    train(dataset_path=args.dataset_path, demo=args.demo, epochs=args.epochs)
