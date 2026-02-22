import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type EmotionType = 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised' | 'neutral';

interface EmotionEntry {
    emotion: EmotionType;
    confidence: number;
    timestamp: string;
}

interface EmotionState {
    current: EmotionType;
    confidence: number;
    isActive: boolean;         // Webcam + detection running
    consentGiven: boolean;
    history: EmotionEntry[];
    discountTriggered: boolean;
    frustrationCount: number;
}

const initialState: EmotionState = {
    current: 'neutral',
    confidence: 0,
    isActive: false,
    consentGiven: false,
    history: [],
    discountTriggered: false,
    frustrationCount: 0,
};

const FRUSTRATION_EMOTIONS: EmotionType[] = ['angry', 'disgusted', 'fearful'];

const emotionSlice = createSlice({
    name: 'emotion',
    initialState,
    reducers: {
        setEmotion: (s, a: PayloadAction<{ emotion: EmotionType; confidence: number }>) => {
            s.current = a.payload.emotion;
            s.confidence = a.payload.confidence;
            s.history.push({ ...a.payload, timestamp: new Date().toISOString() });
            // Keep last 200 entries
            if (s.history.length > 200) s.history = s.history.slice(-200);
            // Track frustration
            if (FRUSTRATION_EMOTIONS.includes(a.payload.emotion)) {
                s.frustrationCount += 1;
                if (s.frustrationCount >= 3) s.discountTriggered = true;
            } else {
                // Reset frustration counter on positive emotion
                if (a.payload.emotion === 'happy') s.frustrationCount = Math.max(0, s.frustrationCount - 1);
            }
        },
        activateEmotion: (s) => { s.isActive = true; },
        deactivateEmotion: (s) => { s.isActive = false; s.current = 'neutral'; },
        giveConsent: (s) => { s.consentGiven = true; },
        revokeConsent: (s) => { s.consentGiven = false; s.isActive = false; },
        resetDiscount: (s) => { s.discountTriggered = false; s.frustrationCount = 0; },
        clearEmotionHistory: (s) => { s.history = []; },
    },
});

export const {
    setEmotion, activateEmotion, deactivateEmotion,
    giveConsent, revokeConsent, resetDiscount, clearEmotionHistory,
} = emotionSlice.actions;
export default emotionSlice.reducer;
