import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { RootState } from '../store';
import { setEmotion } from '../store/emotionSlice';
import { addNotification } from '../store/uiSlice';

/**
 * Custom hook that creates and manages the Socket.io connection.
 * Automatically joins session and admin rooms; handles all server events.
 */
export function useSocket() {
    const socketRef = useRef<Socket | null>(null);
    const { token, user } = useSelector((state: RootState) => state.auth);
    const { currentSessionId } = useSelector((state: RootState) => state.session);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!token || !user) return;

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
            auth: { userId: user._id, sessionId: currentSessionId, role: user.role },
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
        socket.on('disconnect', () => console.log('❌ Socket disconnected'));

        // Emotion update from server (e.g. from admin)
        socket.on('emotion:update', (data) => {
            dispatch(setEmotion({ emotion: data.emotion, confidence: data.confidence }));
        });

        // Discount notification
        socket.on('notification:discount', (data) => {
            dispatch(addNotification({ type: 'discount', message: data.message }));
        });

        // Recommendation update
        socket.on('recommendation:update', (data) => {
            dispatch(addNotification({ type: 'recommendation', message: `New recommendation: ${data.products?.[0]?.name || 'Check it out!'}` }));
        });

        // Push notifications
        socket.on('notification:push', (data) => {
            dispatch(addNotification({ type: data.type || 'info', message: data.message }));
        });

        socketRef.current = socket;

        // Heartbeat every 30s
        const hb = setInterval(() => {
            socket.emit('session:heartbeat', { zone: 'vr-store' });
        }, 30000);

        return () => {
            clearInterval(hb);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token, user?._id, currentSessionId]);

    /** Emit zone movement */
    const emitPresence = useCallback((zone: string, position?: { x: number; y: number; z: number }) => {
        socketRef.current?.emit('user:presence', { zone, position });
    }, []);

    /** Emit emotion from face-api detection */
    const emitEmotion = useCallback((emotion: string, confidence: number) => {
        socketRef.current?.emit('emotion:update', { emotion, confidence });
    }, []);

    return { socket: socketRef.current, emitPresence, emitEmotion };
}
