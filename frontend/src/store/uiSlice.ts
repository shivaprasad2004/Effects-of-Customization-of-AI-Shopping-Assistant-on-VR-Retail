import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
    id: string;
    type: 'discount' | 'recommendation' | 'info' | 'success' | 'error';
    message: string;
    timestamp: string;
}

interface UIState {
    theme: 'dark' | 'light';
    fontSize: 'small' | 'medium' | 'large';
    musicEnabled: boolean;
    vrZone: 'entrance' | 'fashion' | 'electronics' | 'furniture' | 'checkout';
    showMiniMap: boolean;
    playerPose: { x: number; z: number; rotY: number };
    notifications: Notification[];
    isLoading: boolean;
    activeModal: string | null;
    showEmotionPanel: boolean;
}

const initialState: UIState = {
    theme: 'dark',
    fontSize: 'medium',
    musicEnabled: true,
    vrZone: 'entrance',
    showMiniMap: true,
    playerPose: { x: 0, z: 0, rotY: 0 },
    notifications: [],
    isLoading: false,
    activeModal: null,
    showEmotionPanel: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleTheme: (s) => { s.theme = s.theme === 'dark' ? 'light' : 'dark'; },
        setFontSize: (s, a: PayloadAction<'small' | 'medium' | 'large'>) => { s.fontSize = a.payload; },
        toggleMusic: (s) => { s.musicEnabled = !s.musicEnabled; },
        setVRZone: (s, a: PayloadAction<UIState['vrZone']>) => { s.vrZone = a.payload; },
        toggleMiniMap: (s) => { s.showMiniMap = !s.showMiniMap; },
        setPlayerPose: (s, a: PayloadAction<{ x: number; z: number; rotY: number }>) => {
            s.playerPose = a.payload;
        },
        addNotification: (s, a: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
            s.notifications.push({ ...a.payload, id: Date.now().toString(), timestamp: new Date().toISOString() });
            // Keep last 5 notifications
            if (s.notifications.length > 5) s.notifications = s.notifications.slice(-5);
        },
        dismissNotification: (s, a: PayloadAction<string>) => {
            s.notifications = s.notifications.filter(n => n.id !== a.payload);
        },
        setLoading: (s, a: PayloadAction<boolean>) => { s.isLoading = a.payload; },
        openModal: (s, a: PayloadAction<string>) => { s.activeModal = a.payload; },
        closeModal: (s) => { s.activeModal = null; },
        toggleEmotionPanel: (s) => { s.showEmotionPanel = !s.showEmotionPanel; },
    },
});

export const {
    toggleTheme, setFontSize, toggleMusic, setVRZone, toggleMiniMap, setPlayerPose,
    addNotification, dismissNotification, setLoading, openModal, closeModal, toggleEmotionPanel,
} = uiSlice.actions;
export default uiSlice.reducer;
