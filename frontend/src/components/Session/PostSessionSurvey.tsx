import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { endSession } from '../../store/sessionSlice';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';

const QUESTIONS = [
    { id: 'csat', label: 'Overall Satisfaction', type: 'rating' },
    { id: 'trust', label: 'Trust in AI Recommendations', type: 'rating' },
    { id: 'immersion', label: 'VR Store Realism', type: 'rating' },
    { id: 'feedback', label: 'Additional Comments', type: 'text' },
];

export default function PostSessionSurvey() {
    const [step, setStep] = useState(0);
    const [responses, setResponses] = useState<any>({});
    const [sending, setSending] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleRating = (qid: string, val: number) => {
        setResponses({ ...responses, [qid]: val });
        setTimeout(() => {
            if (step < QUESTIONS.length - 1) setStep(step + 1);
        }, 300);
    };

    const handleFinish = async () => {
        setSending(true);
        // Logic to sync survey to backend session record
        await new Promise(r => setTimeout(r, 1500));
        navigate('/');
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-primary/95 backdrop-blur-xl">
            <div className="w-full max-w-lg glass-card-elevated p-10">
                <div className="mb-8">
                    <h2 className="heading-lg text-2xl mb-2">Shopping Experience Survey</h2>
                    <p className="text-white/40 text-sm">Help us improve our AI researchers' findings.</p>
                </div>

                <div className="min-h-[250px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <span className="text-[10px] font-heading text-highlight uppercase tracking-[0.2em] mb-4 block">Question {step + 1} of {QUESTIONS.length}</span>
                            <h3 className="text-xl font-bold text-white mb-8">{QUESTIONS[step].label}</h3>

                            {QUESTIONS[step].type === 'rating' ? (
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => handleRating(QUESTIONS[step].id, v)}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold transition-all border ${responses[QUESTIONS[step].id] === v
                                                    ? 'bg-highlight border-highlight text-white shadow-glow-pink'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                                }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    className="input-field min-h-[120px]"
                                    placeholder="Share your thoughts..."
                                    onChange={(e) => setResponses({ ...responses, [QUESTIONS[step].id]: e.target.value })}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-12 flex justify-between items-center">
                    <button
                        onClick={() => setStep(s => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="text-white/40 hover:text-white disabled:opacity-0 transition-all font-heading uppercase tracking-widest text-[10px]"
                    >
                        Previous
                    </button>

                    {step < QUESTIONS.length - 1 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!responses[QUESTIONS[step].id] && QUESTIONS[step].type === 'rating'}
                            className="btn-secondary px-8"
                        >
                            Next →
                        </button>
                    ) : (
                        <button onClick={handleFinish} disabled={sending} className="btn-primary px-8">
                            {sending ? <LoadingSpinner size="sm" /> : 'Complete Survey'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
