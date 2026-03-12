import numpy as np
from sklearn.decomposition import TruncatedSVD


class CollaborativeFilter:
    """SVD-based collaborative filtering for user-item recommendations."""

    def __init__(self, n_components=12):
        self.svd = TruncatedSVD(n_components=n_components, random_state=42)
        self.user_factors = None
        self.item_factors = None
        self.is_fitted = False

    def fit(self, interaction_matrix: np.ndarray):
        """Fit SVD on user-item interaction matrix."""
        if interaction_matrix.shape[0] < 2 or interaction_matrix.shape[1] < 2:
            return self
        self.user_factors = self.svd.fit_transform(interaction_matrix)
        self.item_factors = self.svd.components_.T
        self.is_fitted = True
        return self

    def recommend(self, user_idx: int, n=10):
        """Get top-N item indices for a user."""
        if not self.is_fitted or user_idx >= self.user_factors.shape[0]:
            return []
        scores = self.user_factors[user_idx] @ self.item_factors.T
        return np.argsort(scores)[::-1][:n].tolist()

    def similar_users(self, user_idx: int, n=5):
        """Find similar users by cosine similarity in latent space."""
        if not self.is_fitted:
            return []
        from sklearn.metrics.pairwise import cosine_similarity
        sims = cosine_similarity([self.user_factors[user_idx]], self.user_factors)[0]
        sims[user_idx] = -1
        return np.argsort(sims)[::-1][:n].tolist()
