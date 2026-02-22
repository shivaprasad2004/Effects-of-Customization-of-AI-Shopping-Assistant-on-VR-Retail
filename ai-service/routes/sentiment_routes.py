from fastapi import APIRouter, Body
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

router = APIRouter()
analyzer = SentimentIntensityAnalyzer()

@router.post("/analyze")
def analyze_sentiment(text: str = Body(..., embed=True)):
    """
    Ensemble sentiment analysis using VADER (rule-based) and TextBlob (polarity).
    Used for chatbot messages to adjust assistant personality.
    """
    vader_scores = analyzer.polarity_scores(text)
    blob = TextBlob(text)
    
    # Map to custom research scale (-1.0 to 1.0)
    sentiment = {
        "score": vader_scores['compound'],
        "polarity": blob.sentiment.polarity,
        "subjectivity": blob.sentiment.subjectivity,
        "label": "positive" if vader_scores['compound'] >= 0.05 else "negative" if vader_scores['compound'] <= -0.05 else "neutral"
    }
    
    return sentiment
