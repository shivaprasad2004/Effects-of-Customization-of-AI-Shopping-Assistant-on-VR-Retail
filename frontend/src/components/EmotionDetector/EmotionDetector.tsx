import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../store';
import { useEmotion } from '../../hooks/useEmotion';
import { toggleEmotionPanel, addNotification } from '../../store/uiSlice';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export default function EmotionDetector() {
    const dispatch = useDispatch();
    const { current, confidence, history, isActive, discountTriggered } = useSelector((state: RootState) => state.emotion);
    const { showEmotionPanel } = useSelector((state: RootState) => state.ui);
    const { videoRef } = useEmotion();

    // Notification for discount
    useEffect(() => {
        if (discountTriggered) {
            dispatch(addNotification({
                type: 'discount',
                message: 'Frustration detected. Enjoy 15% OFF as a gesture of goodwill!'
            }));
        }
    }, [discountTriggered, dispatch]);

    const emotionColors: any = {
        happy: '#10B981', neutral: '#6B7280', angry: '#EF4444',
        sad: '#3B82F6', surprised: '#F59E0B', fearful: '#8B5CF6'
    };

    return (
        <AnimatePresence>
            {showEmotionPanel && (
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="fixed top-24 left-6 w-80 glass-card-elevated z-40 overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <span className="text-xs font-heading font-bold text-white/70">EMOTION ENGINE</span>
                        <button onClick={() => dispatch(toggleEmotionPanel())} className="text-white/30 hover:text-highlight">✕</button>
                    </div>

                    {!isActive ? (
                        <div className="p-8 text-center">
                            <p className="text-xs text-white/40 mb-4">Detection is paused or consent not given.</p>
                            <button className="btn-secondary text-[10px] px-4 py-2">Check Consent</button>
                        </div>
                    ) : (
                        <>
                            {/* Webcam Feed */}
                            <div className="relative aspect-video bg-black overflow-hidden group">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-80 transition-opacity"
                                />

                                {/* HUD Overlay */}
                                <div className="absolute inset-0 border-[20px] border-transparent border-t-highlight/10 border-b-highlight/10 pointer-events-none" />

                                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                        <span className="text-[10px] font-heading font-bold text-white">LIVE ANALYTICS</span>
                                    </div>
                                </div>
                            </div>

                            {/* Real-time Status */}
                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-white/40 font-heading tracking-widest uppercase">Current State</span>
                                        <span className="text-2xl font-black font-heading capitalize" style={{ color: emotionColors[current] || '#fff' }}>
                                            {current}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-white/40 font-heading tracking-widest uppercase">Confidence</span>
                                        <span className="text-lg font-bold text-white">{(confidence * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                {/* Micro-chart of recent history */}
                                <div className="h-16 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={history.slice(-20)}>
                                            <Line
                                                type="monotone"
                                                dataKey="confidence"
                                                stroke={emotionColors[current] || '#E94560'}
                                                strokeWidth={2}
                                                dot={false}
                                                isAnimationActive={false}
                                            />
                                            <YAxis domain={[0, 1]} hide />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Experimental metrics */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                        <p className="text-[8px] text-white/30 uppercase mb-1">Frustration</p>
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500 transition-all duration-500"
                                                style={{ width: `${Math.min(100, (history.filter(h => ['angry', 'disgusted'].includes(h.emotion)).length / 20) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                        <p className="text-[8px] text-white/30 uppercase mb-1">Arousal</p>
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-highlight w-[65%] shadow-glow-pink" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
