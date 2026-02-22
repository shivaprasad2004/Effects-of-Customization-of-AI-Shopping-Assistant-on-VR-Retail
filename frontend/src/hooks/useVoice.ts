import { useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addUserMessage, sendChatMessage } from '../store/chatbotSlice';
import { RootState, AppDispatch } from '../store';
import { useSelector } from 'react-redux';

/**
 * Custom hook for Web Speech API — voice input and text-to-speech output.
 */
export function useVoice() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { currentSessionId } = useSelector((state: RootState) => state.session);
    const { messages } = useSelector((state: RootState) => state.chatbot);

    /** Start speech recognition */
    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            // Auto-send to chatbot
            dispatch(addUserMessage(text));
            dispatch(sendChatMessage({ message: text, sessionId: currentSessionId, history: messages }));
        };

        recognition.start();
        recognitionRef.current = recognition;
    }, [currentSessionId, messages, dispatch]);

    /** Stop speech recognition */
    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    /** Text-to-speech for chatbot responses */
    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Female'));
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.speak(utterance);
    }, []);

    const stopSpeaking = useCallback(() => window.speechSynthesis.cancel(), []);

    return { isListening, transcript, startListening, stopListening, speak, stopSpeaking };
}
