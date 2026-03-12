import numpy as np
from .collaborative import CollaborativeFilter
from .content_based import ContentBasedFilter


class HybridEngine:
    """Combines collaborative and content-based filtering with configurable weights."""

    def __init__(self, content_weight=0.6, collab_weight=0.4):
        self.content_filter = ContentBasedFilter()
        self.collab_filter = CollaborativeFilter()
        self.content_weight = content_weight
        self.collab_weight = collab_weight
        self.products = []

    def fit(self, products: list, interaction_matrix=None):
        """Fit both engines."""
        self.products = products
        self.content_filter.fit(products)
        if interaction_matrix is not None and interaction_matrix.shape[0] > 1:
            self.collab_filter.fit(interaction_matrix)
        return self

    def recommend(self, user_idx=None, liked_product_indices=None, n=10, ensure_diversity=True):
        """Get hybrid recommendations with optional diversity injection."""
        scores = np.zeros(len(self.products))

        # Content-based scores
        if liked_product_indices and self.content_filter.is_fitted:
            content_recs = self.content_filter.recommend_for_profile(liked_product_indices, n=len(self.products))
            for idx, score in content_recs:
                scores[idx] += score * self.content_weight

        # Collaborative scores
        if user_idx is not None and self.collab_filter.is_fitted:
            collab_recs = self.collab_filter.recommend(user_idx, n=len(self.products))
            for rank, idx in enumerate(collab_recs):
                scores[idx] += (1.0 - rank / len(collab_recs)) * self.collab_weight

        # If no signal, fallback to rating-based
        if scores.sum() == 0:
            for i, p in enumerate(self.products):
                scores[i] = p.get('rating', 0) * 0.5 + (1 if p.get('featured') else 0) * 0.3

        top_indices = np.argsort(scores)[::-1]

        if ensure_diversity:
            return self._diversify(top_indices, n)

        return [int(i) for i in top_indices[:n]]

    def _diversify(self, sorted_indices, n):
        """Ensure recommendations span at least 2 categories."""
        result = []
        seen_categories = set()
        for idx in sorted_indices:
            cat = self.products[int(idx)].get('category', 'unknown')
            if len(result) < n:
                result.append(int(idx))
                seen_categories.add(cat)
            if len(result) >= n and len(seen_categories) >= 2:
                break
        return result[:n]
