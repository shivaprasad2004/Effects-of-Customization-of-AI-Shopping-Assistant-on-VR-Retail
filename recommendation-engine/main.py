from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.recommend import router as recommend_router

app = FastAPI(title="VR Retail Recommendation Engine", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(recommend_router, prefix="/api/v1/recommend")

@app.get("/health")
def health():
    return {"status": "ok", "service": "recommendation-engine", "port": 8081}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8081, reload=True)
