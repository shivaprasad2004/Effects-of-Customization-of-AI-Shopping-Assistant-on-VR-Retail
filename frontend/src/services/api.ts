import axios from 'axios';

let getStore: (() => any) | null = null;
export const attachStore = (getter: () => any) => {
    getStore = getter;
};

/**
 * Axios instance pre-configured with base URL and JWT auth header.
 * Includes a response interceptor for automatic token refresh.
 */
const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// ── Request interceptor: attach access token ──────────────────
api.interceptors.request.use((config) => {
    const token = getStore ? getStore().getState().auth.token : localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Response interceptor: refresh token on 401 ───────────────
let isRefreshing = false;
type QueueEntry = { resolve: (token: string | null) => void; reject: (err: any) => void };
let failedQueue: QueueEntry[] = [];

function processQueue(error: any, token: string | null = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken =
                    getStore ? getStore().getState().auth.refreshToken : localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                const res = await axios.post(
                    (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/refresh',
                    { refreshToken }
                );
                const { accessToken, refreshToken: newRefresh } = res.data;
                if (getStore) {
                    const { setTokens } = await import('../store/authSlice');
                    getStore().dispatch(setTokens({ accessToken, refreshToken: newRefresh }));
                }
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefresh);
                processQueue(null, accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                try {
                    if (getStore) {
                        const { logout } = await import('../store/authSlice');
                        getStore().dispatch(logout());
                    }
                } finally {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                }
                window.location.href = '/login';
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
