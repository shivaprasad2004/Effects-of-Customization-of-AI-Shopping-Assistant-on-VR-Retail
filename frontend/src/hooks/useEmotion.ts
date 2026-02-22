import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setEmotion } from '../store/emotionSlice';
import api from '../services/api';

/**
 * Custom hook that runs face-api.js emotion detection every 2 seconds.
 * Loads face-api models lazily on first activation.
 * Returns a ref to attach to the video element.
 */
export function useEmotion() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const intervalRef = useRef<NodeJS.Timeout>();
    const modelsLoaded = useRef(false);
    const dispatch = useDispatch();
    const { isActive, consentGiven } = useSelector((state: RootState) => state.emotion);
    const { currentSessionId } = useSelector((state: RootState) => state.session);

    /** Dynamically import face-api.js (heavy lib — load on demand) */
    const loadModels = useCallback(async () => {
        if (modelsLoaded.current) return;
        try {
            const faceapi = await import('face-api.js');
            const MODEL_URL = '/models/face-api';
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            ]);
            modelsLoaded.current = true;
            console.log('✅ face-api.js models loaded');
        } catch (err) {
            console.error('face-api model load failed:', err);
        }
    }, []);

    /** Start webcam and detection loop */
    const startDetection = useCallback(async () => {
        if (!consentGiven) return;
        await loadModels();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error('Webcam access denied:', err);
            return;
        }

        intervalRef.current = setInterval(async () => {
            if (!videoRef.current || !modelsLoaded.current) return;
            try {
                const faceapi = await import('face-api.js');
                const detection = await faceapi
                    .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceExpressions();

                if (!detection) return;

                // Find dominant emotion
                const expressions = detection.expressions;
                const dominant = Object.entries(expressions).reduce<[string, number]>(
                    (max, curr) => (curr[1] > max[1] ? curr as [string, number] : max),
                    ['neutral', 0]
                );

                const emotion = dominant[0] as any;
                const confidence = dominant[1];

                // Smoothing: only update if confidence > 0.4
                if (confidence > 0.4) {
                    dispatch(setEmotion({ emotion, confidence }));

                    // Log to backend
                    if (currentSessionId) {
                        api.post('/emotion/log', {
                            sessionId: currentSessionId,
                            emotion,
                            confidence,
                            dominantEmotions: Object.entries(expressions).map(([e, s]) => ({ emotion: e, score: s })),
                        }).catch(() => { }); // Fire-and-forget
                    }
                }
            } catch (_) { }
        }, 2000); // Detect every 2 seconds
    }, [consentGiven, currentSessionId, dispatch, loadModels]);

    /** Stop webcam and detection */
    const stopDetection = useCallback(() => {
        clearInterval(intervalRef.current);
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        if (isActive && consentGiven) startDetection();
        else stopDetection();
        return () => stopDetection();
    }, [isActive, consentGiven]);

    return { videoRef };
}
