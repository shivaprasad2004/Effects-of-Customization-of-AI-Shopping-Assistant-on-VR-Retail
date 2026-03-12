from fastapi import APIRouter, Body
from models.recommendation_model import RecommendationModel
from typing import List, Dict, Optional

router = APIRouter()
model = RecommendationModel()


@router.post("/personalized")
def get_personalized_recommendations(
    user_id: str = Body(...),
    history: List[str] = Body(default=[]),
    catalog: List[Dict] = Body(default=[])
):
    """Hybrid recommendation: collaborative + content-based filtering."""
    recommendations = model.get_personalized(user_id, history, catalog)
    return {
        "user_id": user_id,
        "recommendations": recommendations,
        "method": "hybrid",
        "demo_mode": model.demo_mode
    }


@router.post("/similar")
def get_similar_products(
    product_id: str = Body(...),
    catalog: List[Dict] = Body(default=[])
):
    """Content-based similar product recommendations."""
    products = model.get_similar(product_id, catalog)
    return {"product_id": product_id, "similar_products": products}


@router.post("/emotion-based")
def get_emotion_based_recommendations(
    emotion: str = Body(...),
    catalog: List[Dict] = Body(default=[])
):
    """Recommend products based on user's detected emotion."""
    recommendations = model.get_emotion_based(emotion, catalog)
    return {
        "emotion": emotion,
        "recommendations": recommendations,
        "method": "emotion-adaptive"
    }


@router.get("/trending")
def get_trending_products():
    """Return trending / popular products."""
    products = model.get_trending()
    return {"trending": products, "method": "popularity-boost"}


@router.get("/health")
def recommend_health():
    return {"status": "healthy", "demo_mode": model.demo_mode}
