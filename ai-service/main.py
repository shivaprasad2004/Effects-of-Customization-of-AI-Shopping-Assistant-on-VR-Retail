import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import emotion_routes, recommendation_routes, sentiment_routes

app = FastAPI(
    title="AI Shopping Assistant Service",
    description="Microservice for emotion inference, hybrid recommendations, and sentiment analysis.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to internal backend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(emotion_routes.router, prefix="/api/v1/emotion", tags=["Emotion"])
app.include_router(recommendation_routes.router, prefix="/api/v1/recommend", tags=["Recommendation"])
app.include_router(sentiment_routes.router, prefix="/api/v1/sentiment", tags=["Sentiment"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-service"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
