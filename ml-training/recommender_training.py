import pandas as pd
import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os
import argparse


CATEGORIES = ['fashion', 'electronics', 'furniture', 'accessories']
PRODUCT_NAMES = [
    'Leather Jacket', 'Aviator Sunglasses', 'Smartwatch', 'Slim Chinos', 'Sneakers',
    'ANC Headphones', 'Laptop Pro', 'Camera Elite', 'Smart Monitor', 'Wireless Charger',
    'L-Shape Sofa', 'Standing Desk', 'Bookshelf', 'Coffee Table', 'Bed Frame',
    'Backpack', 'Wallet', 'Scented Candle', 'Watch Pro', 'Sunglasses',
]


def generate_synthetic_data(n_users=100, n_products=50):
    """Generate synthetic user-item interaction matrix."""
    print(f"Generating synthetic data: {n_users} users x {n_products} products")

    # Sparse interaction matrix (most entries zero)
    interactions = np.zeros((n_users, n_products))
    for u in range(n_users):
        # Each user rates 5-15 random products
        n_rated = np.random.randint(5, 15)
        rated_products = np.random.choice(n_products, n_rated, replace=False)
        for p in rated_products:
            interactions[u, p] = np.random.uniform(1, 5)

    # Product descriptions for content-based
    products = []
    for i in range(n_products):
        cat = CATEGORIES[i % len(CATEGORIES)]
        name = PRODUCT_NAMES[i % len(PRODUCT_NAMES)]
        products.append({
            'id': f'product_{i}',
            'name': f'{name} {i}',
            'category': cat,
            'description': f'High quality {cat} product. {name} with premium features.',
            'rating': np.random.uniform(3.5, 5.0),
            'price': np.random.uniform(20, 2000),
        })

    return interactions, products


def train_recommender(interactions_csv=None, demo=False):
    if demo or not interactions_csv or not os.path.exists(str(interactions_csv)):
        print("Running in DEMO mode with synthetic data...")
        interactions, products = generate_synthetic_data()
    else:
        print(f"Loading data from {interactions_csv}")
        df = pd.read_csv(interactions_csv)
        interactions = df.pivot(index='user_id', columns='product_id', values='rating').fillna(0).values
        products = []

    # Collaborative: SVD
    print("Training SVD collaborative filter...")
    svd = TruncatedSVD(n_components=12, random_state=42)
    user_factors = svd.fit_transform(interactions)
    item_factors = svd.components_.T
    print(f"  Explained variance ratio: {svd.explained_variance_ratio_.sum():.3f}")

    # Content-based: TF-IDF
    print("Building TF-IDF content filter...")
    if products:
        corpus = [f"{p['name']} {p['description']} {p['category']}" for p in products]
        vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(corpus)
    else:
        vectorizer = None
        tfidf_matrix = None

    model_data = {
        'svd': svd,
        'user_factors': user_factors,
        'item_factors': item_factors,
        'vectorizer': vectorizer,
        'tfidf_matrix': tfidf_matrix,
        'products': products,
        'n_users': interactions.shape[0],
        'n_products': interactions.shape[1],
    }

    os.makedirs('assets', exist_ok=True)
    joblib.dump(model_data, 'assets/recommender.pkl')
    print(f"Hybrid Recommender model saved to assets/recommender.pkl")
    print(f"  Users: {interactions.shape[0]}, Products: {interactions.shape[1]}")
    print(f"  SVD components: 12, TF-IDF features: {tfidf_matrix.shape[1] if tfidf_matrix is not None else 0}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Recommendation Model Training')
    parser.add_argument('--demo', action='store_true', help='Use synthetic data')
    parser.add_argument('--data', type=str, default=None, help='Path to interactions CSV')
    args = parser.parse_args()

    train_recommender(interactions_csv=args.data, demo=args.demo)
