from fastapi import APIRouter, UploadFile, File, HTTPException
from models.emotion_model import EmotionModel
import cv2
import numpy as np
import io

router = APIRouter()
model = EmotionModel()

@router.post("/classify")
async def classify_emotion(file: UploadFile = File(...)):
    """
    Receives image from frontend webcam feed, detects face, and returns emotion.
    """
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
            
        # Optional: Face detection using Haar Cascades might go here
        # For this tool, we assume the frontend sends a cropped face image (48x48)
        
        result = model.predict(img)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def get_status():
    return {"model_loaded": model.model is not None, "classes": list(model.emotions.values())}
