from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


class ContentBasedFilter:
    """TF-IDF + cosine similarity content-based recommendation engine."""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
        self.tfidf_matrix = None
        self.products = []
        self.is_fitted = False

    def fit(self, products: list):
        """Fit on product descriptions + tags + category."""
        self.products = products
        corpus = []
        for p in products:
            text = f"{p.get('name', '')} {p.get('description', '')} {p.get('category', '')} {' '.join(p.get('tags', []))}"
            corpus.append(text)
        if len(corpus) < 2:
            return self
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
        self.is_fitted = True
        return self

    def similar(self, product_idx: int, n=10):
        """Find N most similar products by content."""
        if not self.is_fitted or product_idx >= self.tfidf_matrix.shape[0]:
            return []
        sims = cosine_similarity(self.tfidf_matrix[product_idx:product_idx+1], self.tfidf_matrix)[0]
        sims[product_idx] = -1
        indices = np.argsort(sims)[::-1][:n]
        return [(int(i), float(sims[i])) for i in indices]

    def recommend_for_profile(self, liked_indices: list, n=10):
        """Recommend based on a user's liked product indices."""
        if not self.is_fitted or not liked_indices:
            return []
        profile = self.tfidf_matrix[liked_indices].mean(axis=0)
        profile = np.asarray(profile)
        sims = cosine_similarity(profile, self.tfidf_matrix)[0]
        for idx in liked_indices:
            sims[idx] = -1
        indices = np.argsort(sims)[::-1][:n]
        return [(int(i), float(sims[i])) for i in indices]
