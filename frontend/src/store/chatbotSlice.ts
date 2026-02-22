import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    intent?: string;
    navigateTo?: string | null;
    productIds?: string[];
}

interface ChatbotState {
    messages: ChatMessage[];
    isOpen: boolean;
    isTyping: boolean;
    isSpeaking: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: ChatbotState = {
    messages: [{
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm ShopBot 🛍️ — your AI shopping assistant. Ask me anything: find products, compare items, or get personalized recommendations!",
        timestamp: new Date().toISOString(),
    }],
    isOpen: false, isTyping: false, isSpeaking: false, loading: false, error: null,
};

export const sendChatMessage = createAsyncThunk(
    'chatbot/sendMessage',
    async (
        data: { message: string; sessionId: string | null; history: ChatMessage[] },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.post('/chatbot/message', {
                message: data.message,
                sessionId: data.sessionId,
                history: data.history.slice(-10).map(m => ({ query: m.content, response: '' })),
            });
            return res.data;
        } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Chat failed'); }
    }
);

const chatbotSlice = createSlice({
    name: 'chatbot',
    initialState,
    reducers: {
        toggleChatbot: (s) => { s.isOpen = !s.isOpen; },
        openChatbot: (s) => { s.isOpen = true; },
        closeChatbot: (s) => { s.isOpen = false; },
        addUserMessage: (s, a: PayloadAction<string>) => {
            s.messages.push({ id: Date.now().toString(), role: 'user', content: a.payload, timestamp: new Date().toISOString() });
        },
        setTyping: (s, a: PayloadAction<boolean>) => { s.isTyping = a.payload; },
        setSpeaking: (s, a: PayloadAction<boolean>) => { s.isSpeaking = a.payload; },
        clearMessages: (s) => { s.messages = [initialState.messages[0]]; },
    },
    extraReducers: (builder) => {
        builder.addCase(sendChatMessage.pending, (s) => { s.isTyping = true; s.error = null; });
        builder.addCase(sendChatMessage.rejected, (s, a) => {
            s.isTyping = false;
            s.error = a.payload as string;
        });
        builder.addCase(sendChatMessage.fulfilled, (s, a) => {
            s.isTyping = false;
            s.messages.push({
                id: Date.now().toString(),
                role: 'assistant',
                content: a.payload.response,
                timestamp: new Date().toISOString(),
                intent: a.payload.intent,
                navigateTo: a.payload.navigateTo,
                productIds: a.payload.productIds,
            });
        });
    },
});

export const { toggleChatbot, openChatbot, closeChatbot, addUserMessage, setTyping, setSpeaking, clearMessages } = chatbotSlice.actions;
export default chatbotSlice.reducer;
