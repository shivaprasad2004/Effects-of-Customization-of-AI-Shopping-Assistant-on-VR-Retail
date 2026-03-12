from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from models.emotion_model import EmotionModel
import cv2
import numpy as np

router = APIRouter()
model = EmotionModel()


@router.post("/classify")
async def classify_emotion(file: UploadFile = File(...)):
    """Receives image upload, detects face region, and returns emotion classification."""
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image data")

        # Face detection using Haar cascade
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(img, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        if len(faces) == 0:
            # No face detected - use full image or return mock
            result = model.predict(img)
            result["face_detected"] = False
        else:
            x, y, w, h = faces[0]
            face_roi = img[y:y+h, x:x+w]
            result = model.predict(face_roi)
            result["face_detected"] = True
            result["face_region"] = {"x": int(x), "y": int(y), "w": int(w), "h": int(h)}

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-frame")
async def analyze_frame(data: dict = Body(...)):
    """Analyze a base64-encoded video frame for emotion."""
    try:
        base64_image = data.get("image", "")
        if not base64_image:
            raise HTTPException(status_code=400, detail="No image data provided")

        result = model.predict_from_base64(base64_image)
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
def get_status():
    return {
        "model_loaded": model.model is not None,
        "demo_mode": model.demo_mode,
        "classes": list(model.emotions.values())
    }


@router.get("/health")
def emotion_health():
    return {"status": "healthy", "demo_mode": model.demo_mode}
