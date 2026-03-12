from fastapi import APIRouter, Body, HTTPException
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from typing import List
import re

router = APIRouter()
analyzer = SentimentIntensityAnalyzer()


def _analyze_single(text: str) -> dict:
    """Analyze a single text string for sentiment."""
    vader_scores = analyzer.polarity_scores(text)
    blob = TextBlob(text)

    compound = vader_scores['compound']
    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"

    # Extract keywords (simple: nouns and adjectives from TextBlob)
    keywords = list(set(
        word.lower() for word, tag in blob.tags
        if tag in ('NN', 'NNS', 'JJ', 'JJS', 'JJR') and len(word) > 2
    ))[:10]

    return {
        "text": text[:200],
        "score": compound,
        "polarity": blob.sentiment.polarity,
        "subjectivity": blob.sentiment.subjectivity,
        "label": label,
        "keywords": keywords,
        "vader_detail": {
            "pos": vader_scores['pos'],
            "neg": vader_scores['neg'],
            "neu": vader_scores['neu'],
        }
    }


@router.post("/analyze")
def analyze_sentiment(text: str = Body(..., embed=True)):
    """Ensemble sentiment analysis using VADER + TextBlob with structured output."""
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    return _analyze_single(text)


@router.post("/batch")
def batch_analyze(texts: List[str] = Body(...)):
    """Batch sentiment analysis for multiple texts."""
    if not texts:
        raise HTTPException(status_code=400, detail="Texts list cannot be empty")
    if len(texts) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 texts per batch")

    results = [_analyze_single(t) for t in texts]

    avg_score = sum(r['score'] for r in results) / len(results)
    overall_label = "positive" if avg_score >= 0.05 else "negative" if avg_score <= -0.05 else "neutral"

    return {
        "results": results,
        "summary": {
            "count": len(results),
            "average_score": round(avg_score, 4),
            "overall_label": overall_label,
            "positive_count": sum(1 for r in results if r['label'] == 'positive'),
            "negative_count": sum(1 for r in results if r['label'] == 'negative'),
            "neutral_count": sum(1 for r in results if r['label'] == 'neutral'),
        }
    }


@router.get("/health")
def sentiment_health():
    return {"status": "healthy", "analyzers": ["vader", "textblob"]}
