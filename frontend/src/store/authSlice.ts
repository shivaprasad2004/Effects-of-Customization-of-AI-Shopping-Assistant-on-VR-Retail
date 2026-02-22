import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';

export type ThemeType = 'futuristic' | 'cozy' | 'minimalist';
export type GenderType = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'participant' | 'researcher' | 'admin';
    groupType: 'A' | 'B' | null;
    preferences: {
        categories: string[];
        budgetRange: { min: number; max: number };
        style: string;
        language: string;
        theme: ThemeType;
        musicEnabled: boolean;
        fontSize: string;
    };
    loyaltyTokens: number;
    walletAddress: string | null;
    onboardingComplete: boolean;
    emotionConsentGiven: boolean;
    avatar: { skinTone: string; hairColor: string; outfit: string };
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    loading: boolean;
    error: string | null;
}

// Load persisted auth from localStorage
const persistedToken = localStorage.getItem('accessToken');
const persistedUser = localStorage.getItem('user');

const initialState: AuthState = {
    user: persistedUser ? JSON.parse(persistedUser) : null,
    token: persistedToken || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    loading: false,
    error: null,
};

// ── Async thunks ─────────────────────────────────────────────
export const registerUser = createAsyncThunk(
    'auth/register',
    async (data: { name: string; email: string; password: string; age?: number; gender?: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/register', data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Registration failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (data: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/login', data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Login failed');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (data: Partial<User>, { rejectWithValue }) => {
        try {
            const res = await api.put('/users/profile', data);
            return res.data.user;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Update failed');
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        },
        setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
            state.token = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            localStorage.setItem('accessToken', action.payload.accessToken);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
        },
        clearError(state) { state.error = null; },
    },
    extraReducers: (builder) => {
        // Register
        builder.addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; });
        builder.addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });
        builder.addCase(registerUser.fulfilled, (s, a) => {
            s.loading = false;
            s.user = a.payload.user;
            s.token = a.payload.accessToken;
            s.refreshToken = a.payload.refreshToken;
            localStorage.setItem('accessToken', a.payload.accessToken);
            localStorage.setItem('refreshToken', a.payload.refreshToken);
            localStorage.setItem('user', JSON.stringify(a.payload.user));
        });
        // Login
        builder.addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; });
        builder.addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });
        builder.addCase(loginUser.fulfilled, (s, a) => {
            s.loading = false;
            s.user = a.payload.user;
            s.token = a.payload.accessToken;
            s.refreshToken = a.payload.refreshToken;
            localStorage.setItem('accessToken', a.payload.accessToken);
            localStorage.setItem('refreshToken', a.payload.refreshToken);
            localStorage.setItem('user', JSON.stringify(a.payload.user));
        });
        // Update profile
        builder.addCase(updateProfile.fulfilled, (s, a) => {
            s.user = a.payload;
            localStorage.setItem('user', JSON.stringify(a.payload));
        });
    },
});

export const { logout, setTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
