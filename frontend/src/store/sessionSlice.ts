import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';

interface SessionState {
    currentSessionId: string | null;
    sessionStatus: 'idle' | 'active' | 'paused' | 'completed';
    groupType: 'A' | 'B' | null;
    startTime: string | null;
    productsViewed: string[];
    zone: string;
    elapsedSeconds: number;
    loading: boolean;
}

const initialState: SessionState = {
    currentSessionId: null,
    sessionStatus: 'idle',
    groupType: null,
    startTime: null,
    productsViewed: [],
    zone: 'entrance',
    elapsedSeconds: 0,
    loading: false,
};

export const startSession = createAsyncThunk(
    'session/start',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.post('/sessions/start');
            return res.data.session;
        } catch (err: any) { return rejectWithValue(err.response?.data?.message); }
    }
);

export const endSession = createAsyncThunk(
    'session/end',
    async (sessionId: string, { rejectWithValue }) => {
        try {
            const res = await api.put(`/sessions/${sessionId}/end`);
            return res.data.session;
        } catch (err: any) { return rejectWithValue(err.response?.data?.message); }
    }
);

export const submitSurvey = createAsyncThunk(
    'session/submitSurvey',
    async (data: { sessionId: string; csat: number; trust: number; easeOfUse: number; recommendation: number; comments?: string }, { rejectWithValue }) => {
        try {
            const { sessionId, ...body } = data;
            const res = await api.post(`/sessions/${sessionId}/survey`, body);
            return res.data;
        } catch (err: any) { return rejectWithValue(err.response?.data?.message); }
    }
);

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setZone: (s, a: PayloadAction<string>) => { s.zone = a.payload; },
        trackProductView: (s, a: PayloadAction<string>) => {
            if (!s.productsViewed.includes(a.payload)) s.productsViewed.push(a.payload);
        },
        tickTimer: (s) => { s.elapsedSeconds += 1; },
        pauseSession: (s) => { s.sessionStatus = 'paused'; },
        resumeSession: (s) => { s.sessionStatus = 'active'; },
        resetSession: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(startSession.pending, (s) => { s.loading = true; });
        builder.addCase(startSession.fulfilled, (s, a) => {
            s.loading = false;
            s.currentSessionId = a.payload._id;
            s.groupType = a.payload.groupType;
            s.startTime = a.payload.startTime;
            s.sessionStatus = 'active';
        });
        builder.addCase(endSession.fulfilled, (s) => {
            s.sessionStatus = 'completed';
            s.loading = false;
        });
    },
});

export const { setZone, trackProductView, tickTimer, pauseSession, resumeSession, resetSession } = sessionSlice.actions;
export default sessionSlice.reducer;
