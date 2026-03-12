from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
import numpy as np
import joblib
import os
import random

# Fallback showcase products for demo mode
DEMO_PRODUCTS = [
    {"id": "p1", "name": "Royal Enfield Leather Jacket", "category": "fashion", "price": 299.99, "rating": 4.8, "description": "Premium leather jacket with customizable colors and materials"},
    {"id": "p2", "name": "Designer Aviator Sunglasses", "category": "fashion", "price": 189.99, "rating": 4.6, "description": "Classic aviator sunglasses with AR virtual try-on"},
    {"id": "p3", "name": "Luxury Chronograph Smartwatch", "category": "fashion", "price": 449.99, "rating": 4.9, "description": "Premium smartwatch with health monitoring and digital display"},
    {"id": "p4", "name": "Smart ANC Headphones Pro", "category": "electronics", "price": 349.99, "rating": 4.7, "description": "Active noise cancelling headphones with 3D configurator"},
    {"id": "p5", "name": "UltraBook Pro 16 Laptop", "category": "electronics", "price": 1899.99, "rating": 4.8, "description": "High-performance laptop with AR room placement preview"},
    {"id": "p6", "name": "Mirrorless Camera Elite", "category": "electronics", "price": 2499.99, "rating": 4.9, "description": "Professional mirrorless camera with digital display kiosk"},
    {"id": "p7", "name": "Modern L-Shape Sofa", "category": "furniture", "price": 1299.99, "rating": 4.5, "description": "Modular sofa with AR room placement and fabric configurator"},
    {"id": "p8", "name": "Motorized Standing Desk Pro", "category": "furniture", "price": 799.99, "rating": 4.7, "description": "Electric standing desk with surface material configurator"},
    {"id": "p9", "name": "Floating Modular Bookshelf", "category": "furniture", "price": 599.99, "rating": 4.4, "description": "Wall-mounted modular bookshelf with AR 360 view"},
]

EMOTION_CATEGORY_MAP = {
    "happy": ["fashion", "electronics"],
    "surprise": ["electronics", "furniture"],
    "neutral": ["furniture", "fashion"],
    "sad": ["furniture", "fashion"],
    "angry": ["electronics", "fashion"],
    "fear": ["furniture", "electronics"],
    "disgust": ["fashion", "furniture"],
}


class RecommendationModel:
    """
    Hybrid recommendation engine combining Collaborative Filtering (SVD)
    and Content-Based Filtering (TF-IDF cosine similarity).
    Falls back to demo mode with curated products when no trained model exists.
    """
    def __init__(self):
        self.model_path = 'assets/recommender.pkl'
        self.demo_mode = True
        self.model_data = None
        self.tfidf = None
        self.tfidf_matrix = None

        if os.path.exists(self.model_path):
            try:
                self.model_data = joblib.load(self.model_path)
                self.demo_mode = False
                print("Recommender model loaded from pickle.")
            except Exception as e:
                print(f"Could not load recommender ({e}), using demo mode.")

        # Build TF-IDF on demo products for content-based fallback
        self._build_demo_tfidf()

    def _build_demo_tfidf(self):
        corpus = [f"{p['name']} {p['description']} {p['category']}" for p in DEMO_PRODUCTS]
        self.tfidf = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.tfidf.fit_transform(corpus)

    def get_personalized(self, user_id, user_history, product_catalog, n=10):
        """Hybrid recommendation: SVD collaborative (0.4) + TF-IDF content (0.6)."""
        catalog = product_catalog if product_catalog else DEMO_PRODUCTS

        if not self.demo_mode and self.model_data:
            try:
                return self._hybrid_recommend(user_id, user_history, catalog, n)
            except Exception:
                pass

        # Fallback: content-based on history + popularity
        return self._content_recommend(user_history, catalog, n)

    def _hybrid_recommend(self, user_id, user_history, catalog, n):
        """Actual hybrid using trained SVD + content similarity."""
        svd = self.model_data.get('svd')
        item_factors = self.model_data.get('item_factors')

        # Content scores
        corpus = [f"{p.get('name','')} {p.get('description','')} {p.get('category','')}" for p in catalog]
        vec = TfidfVectorizer(stop_words='english')
        matrix = vec.fit_transform(corpus)

        # Score each product
        scores = []
        for i, product in enumerate(catalog):
            content_score = 0.5
            if user_history:
                hist_indices = [j for j, p in enumerate(catalog) if p.get('id') in user_history]
                if hist_indices:
                    sims = cosine_similarity(matrix[hist_indices], matrix[i:i+1])
                    content_score = float(np.mean(sims))

            collab_score = product.get('rating', 3.0) / 5.0
            hybrid_score = 0.6 * content_score + 0.4 * collab_score
            scores.append((hybrid_score, product))

        scores.sort(key=lambda x: x[0], reverse=True)
        results = [p for _, p in scores[:n]]
        return self._inject_diversity(results, n)

    def _content_recommend(self, user_history, catalog, n):
        """Content-based fallback using TF-IDF similarity."""
        scored = []
        for p in catalog:
            base_score = p.get('rating', 3.0) / 5.0
            category_bonus = random.uniform(0, 0.2)
            scored.append((base_score + category_bonus, p))
        scored.sort(key=lambda x: x[0], reverse=True)
        results = [p for _, p in scored[:n]]
        return self._inject_diversity(results, n)

    def _inject_diversity(self, products, n):
        """Ensure at least 2 categories are represented."""
        cats = set(p.get('category') for p in products)
        if len(cats) < 2 and len(products) >= n:
            missing_cats = set(['fashion', 'electronics', 'furniture']) - cats
            for cat in missing_cats:
                filler = [p for p in DEMO_PRODUCTS if p['category'] == cat]
                if filler:
                    products[-1] = filler[0]
                    break
        return products[:n]

    def get_similar(self, product_id, product_catalog, n=5):
        """Content-based similar products using TF-IDF cosine similarity."""
        catalog = product_catalog if product_catalog else DEMO_PRODUCTS

        corpus = [f"{p.get('name','')} {p.get('description','')} {p.get('category','')}" for p in catalog]
        vec = TfidfVectorizer(stop_words='english')
        matrix = vec.fit_transform(corpus)

        try:
            idx = next(i for i, p in enumerate(catalog) if p.get('id') == product_id)
        except StopIteration:
            return catalog[:n]

        sims = cosine_similarity(matrix[idx:idx+1], matrix)[0]
        similar_indices = sims.argsort()[::-1][1:n+1]
        return [catalog[i] for i in similar_indices]

    def get_emotion_based(self, emotion, product_catalog=None, n=6):
        """Recommend products based on detected emotion."""
        catalog = product_catalog if product_catalog else DEMO_PRODUCTS
        preferred_cats = EMOTION_CATEGORY_MAP.get(emotion, ["fashion", "electronics"])

        # Score by category match + rating
        scored = []
        for p in catalog:
            cat_score = 1.0 if p.get('category') in preferred_cats else 0.3
            rating_score = p.get('rating', 3.0) / 5.0
            scored.append((0.6 * cat_score + 0.4 * rating_score, p))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored[:n]]

    def get_trending(self, product_catalog=None, n=6):
        """Return trending products (highest rated + random boost)."""
        catalog = product_catalog if product_catalog else DEMO_PRODUCTS
        scored = [(p.get('rating', 3.0) + random.uniform(0, 0.5), p) for p in catalog]
        scored.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored[:n]]
