from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import random

router = APIRouter()

# In production, these would be fitted from database data
# For demo, we use mock data
MOCK_PRODUCTS = [
    {"id": "1", "name": "Royal Enfield Leather Jacket", "category": "fashion", "rating": 4.8, "price": 249.99, "tags": ["leather", "jacket"], "featured": True, "description": "Premium leather jacket"},
    {"id": "2", "name": "Smart ANC Headphones", "category": "electronics", "rating": 4.7, "price": 379.99, "tags": ["headphones", "audio"], "featured": True, "description": "Noise cancelling headphones"},
    {"id": "3", "name": "Modern L-Shape Sofa", "category": "furniture", "rating": 4.7, "price": 1899.99, "tags": ["sofa", "modular"], "featured": True, "description": "Modular sofa"},
    {"id": "4", "name": "Designer Aviator Sunglasses", "category": "fashion", "rating": 4.6, "price": 159.99, "tags": ["sunglasses"], "featured": True, "description": "Titanium sunglasses"},
    {"id": "5", "name": "UltraBook Pro Laptop", "category": "electronics", "rating": 4.9, "price": 2499.99, "tags": ["laptop"], "featured": True, "description": "Next gen laptop"},
    {"id": "6", "name": "Standing Desk Pro", "category": "furniture", "rating": 4.6, "price": 799.99, "tags": ["desk", "ergonomic"], "featured": True, "description": "Motorized desk"},
]

class PersonalizedRequest(BaseModel):
    user_id: Optional[str] = None
    viewed_products: list = []
    preferences: dict = {}
    limit: int = 10

class SimilarRequest(BaseModel):
    product_id: str
    limit: int = 5

class EmotionRequest(BaseModel):
    emotion: str
    catalog: list = []
    limit: int = 5

EMOTION_CATEGORY_MAP = {
    "happy": ["fashion", "electronics"],
    "sad": ["furniture", "fashion"],
    "angry": ["electronics"],
    "surprised": ["electronics", "fashion"],
    "neutral": ["fashion", "electronics", "furniture"],
    "fearful": ["furniture"],
    "disgusted": ["fashion"],
}

@router.post("/personalized")
async def personalized(req: PersonalizedRequest):
    products = MOCK_PRODUCTS.copy()
    random.shuffle(products)
    return {"success": True, "products": products[:req.limit], "method": "hybrid_collaborative_content"}

@router.post("/similar")
async def similar(req: SimilarRequest):
    products = [p for p in MOCK_PRODUCTS if p["id"] != req.product_id]
    return {"success": True, "products": products[:req.limit], "method": "content_tfidf_cosine"}

@router.get("/trending")
async def trending():
    products = sorted(MOCK_PRODUCTS, key=lambda x: x["rating"], reverse=True)
    return {"success": True, "products": products, "method": "rating_weighted"}

@router.post("/emotion-based")
async def emotion_based(req: EmotionRequest):
    preferred_cats = EMOTION_CATEGORY_MAP.get(req.emotion, ["fashion", "electronics", "furniture"])
    catalog = req.catalog if req.catalog else MOCK_PRODUCTS
    filtered = [p for p in catalog if p.get("category") in preferred_cats]
    if not filtered:
        filtered = catalog
    random.shuffle(filtered)
    return {"success": True, "products": filtered[:req.limit], "emotion": req.emotion, "preferred_categories": preferred_cats}
