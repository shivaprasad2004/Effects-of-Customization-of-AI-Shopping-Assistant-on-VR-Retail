from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from detector.face_detector import FaceDetector
from detector.emotion_classifier import EmotionClassifier

router = APIRouter()

face_detector = FaceDetector()
emotion_classifier = EmotionClassifier()


class DetectRequest(BaseModel):
    image: str  # base64 encoded image


@router.post("/detect")
async def detect_emotion(req: DetectRequest):
    """Detect faces and classify emotions from base64 image."""
    faces = face_detector.detect_from_base64(req.image)

    if not faces:
        # If no face detected, return mock prediction
        mock = emotion_classifier._predict_mock()
        return {"success": True, "faces_detected": 0, "primary_emotion": mock, "all_faces": [], "note": "No face detected, showing demo prediction"}

    results = []
    for face_data in faces:
        prediction = emotion_classifier.predict(face_data["face"])
        results.append({**prediction, "bbox": face_data["bbox"]})

    primary = max(results, key=lambda x: x["confidence"])

    return {
        "success": True,
        "faces_detected": len(faces),
        "primary_emotion": primary,
        "all_faces": results,
    }


@router.get("/status")
async def model_status():
    return {
        "service": "emotion-recognition",
        "model_loaded": not emotion_classifier.demo_mode,
        "demo_mode": emotion_classifier.demo_mode,
        "supported_emotions": ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"],
        "face_detector": "OpenCV Haar Cascade",
    }


@router.get("/health")
async def health():
    return {"status": "ok", "service": "emotion-recognition"}
