import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState, AppDispatch } from '../../store';
import { sendChatMessage, addUserMessage, toggleChatbot } from '../../store/chatbotSlice';
import { useVoice } from '../../hooks/useVoice';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function ChatWindow() {
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { messages, isOpen, isTyping, error } = useSelector((state: RootState) => state.chatbot);
    const { currentSessionId } = useSelector((state: RootState) => state.session);
    const { isListening, startListening, stopListening, speak } = useVoice();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant' && !isTyping) {
            setTimeout(() => speak(lastMessage.content), 100);
        }
    }, [messages.length, isTyping, speak]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;

        const text = input;
        setInput('');
        dispatch(addUserMessage(text));
        await dispatch(sendChatMessage({
            message: text,
            sessionId: currentSessionId,
            history: messages
        }));
    };

    return (
        <>
            {/* Mini toggle button (visible when closed) */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => dispatch(toggleChatbot())}
                    className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-[#E94560] text-white shadow-[0_0_20px_rgba(233,69,96,0.5)] flex items-center justify-center text-3xl z-50 hover:scale-110 transition-transform overflow-hidden"
                >
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
                        alt="AI Bot"
                        className="w-10 h-10 object-contain"
                    />
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-6 right-6 w-96 h-[550px] glass-card-elevated flex flex-col z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-highlight/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-glow flex items-center justify-center text-xl">🤖</div>
                                <div>
                                    <h3 className="text-sm font-heading font-bold text-white leading-none">ShopBot AI</h3>
                                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Online · AI Assistant</span>
                                </div>
                            </div>
                            <button onClick={() => dispatch(toggleChatbot())} className="text-white/40 hover:text-white">✕</button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                        >
                            {messages.map((m) => (
                                <motion.div
                                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={m.id}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                                        {m.content}
                                        {m.intent && m.intent !== 'general' && (
                                            <div className="mt-2 pt-2 border-t border-white/10 text-[9px] uppercase tracking-tighter font-bold opacity-50">
                                                Intent: {m.intent}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="chat-bubble-bot py-3">
                                        <LoadingSpinner size="sm" />
                                    </div>
                                </div>
                            )}
                            {/* Error state */}
                            {error && !isTyping && (
                                <div className="flex justify-center">
                                    <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] text-center">
                                        Failed to get response. Please try again.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Input */}
                        <div className="p-4 border-t border-white/10 bg-primary/20">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Ask ShopBot..."
                                        className="input-field pr-12"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onMouseDown={startListening}
                                        onMouseUp={stopListening}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-white/30 hover:text-highlight'
                                            }`}
                                    >
                                        {isListening ? '🛑' : '🎤'}
                                    </button>
                                </div>
                                <button type="submit" className="p-3 rounded-xl bg-highlight text-white hover:scale-105 active:scale-95 transition-transform">
                                    📤
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
