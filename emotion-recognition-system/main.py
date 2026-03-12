from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.emotion import router as emotion_router

app = FastAPI(title="VR Retail Emotion Recognition System", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(emotion_router, prefix="/api/v1/emotion")

@app.get("/health")
def health():
    return {"status": "ok", "service": "emotion-recognition-system", "port": 8082}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8082, reload=True)
