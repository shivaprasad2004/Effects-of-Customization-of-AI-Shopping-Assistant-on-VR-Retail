from fastapi import APIRouter, Body
from models.recommendation_model import RecommendationModel
from typing import List, Dict

router = APIRouter()
model = RecommendationModel()

@router.post("/personalized")
def get_personalized_recommendations(
    user_id: str = Body(...),
    history: List[str] = Body(...),
    catalog: List[Dict] = Body(...)
):
    """
    Hybrid recommendation endpoint.
    """
    recommendations = model.get_personalized(user_id, history, catalog)
    return {"user_id": user_id, "recommendations": recommendations}

@router.post("/similar")
def get_similar_products(
    product_id: str = Body(...),
    catalog: List[Dict] = Body(...)
):
    products = model.get_similar(product_id, catalog)
    return {"product_id": product_id, "similar_products": products}
