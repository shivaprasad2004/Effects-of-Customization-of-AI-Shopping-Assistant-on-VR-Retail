import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState, AppDispatch, useAppDispatch, useAppSelector } from '../store';
import { updateProfile, ThemeType } from '../store/authSlice';
import { giveConsent } from '../store/emotionSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const STEPS = [
    { id: 'preferences', title: 'Shopping Style', icon: '🛍️' },
    { id: 'avatar', title: 'Virtual Avatar', icon: '👤' },
    { id: 'consent', title: 'AI Research', icon: '🧪' },
];

interface OnboardingForm {
    categories: string[];
    theme: ThemeType;
    avatar: {
        skinTone: string;
        hairColor: string;
        outfit: string;
    };
}

export default function Onboarding() {
    const [step, setStep] = useState(0);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, loading } = useAppSelector((state) => state.auth);

    const [formData, setFormData] = useState<OnboardingForm>({
        categories: user?.preferences?.categories || [],
        theme: (user?.preferences?.theme as ThemeType) || 'futuristic',
        avatar: {
            skinTone: user?.avatar?.skinTone || '#E0AC69',
            hairColor: user?.avatar?.hairColor || '#4B2C20',
            outfit: user?.avatar?.outfit || 'casual',
        }
    });

    const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
    const prev = () => setStep(s => Math.max(s - 1, 0));

    async function handleComplete() {
        await dispatch(updateProfile({
            preferences: {
                categories: formData.categories,
                theme: formData.theme,
                budgetRange: user?.preferences?.budgetRange || { min: 0, max: 1000 },
                style: user?.preferences?.style || 'modern',
                language: user?.preferences?.language || 'en',
                musicEnabled: user?.preferences?.musicEnabled ?? true,
                fontSize: user?.preferences?.fontSize || 'medium'
            },
            avatar: formData.avatar,
            onboardingComplete: true
        }));
        navigate('/vr-store');
    }

    const toggleCategory = (cat: string) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    return (
        <div className="page-container flex flex-col items-center justify-center p-6 min-h-screen">
            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="flex justify-between mb-12 relative px-4">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 -z-10" />
                    <motion.div
                        className="absolute top-1/2 left-0 h-1 bg-highlight -translate-y-1/2 -z-10"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                    />
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-heading text-sm transition-all duration-300 ${i <= step ? 'bg-highlight text-white shadow-glow-pink' : 'bg-primary text-white/30 border border-white/10'
                                }`}>
                                {s.icon}
                            </div>
                            <span className={`text-[10px] font-heading uppercase tracking-widest ${i <= step ? 'text-white' : 'text-white/30'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="glass-card-elevated p-10 min-h-[450px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1"
                            >
                                <h2 className="heading-lg mb-2">Personalize Your Store</h2>
                                <p className="text-white/50 mb-8">What are you interested in today? We'll load matching products for you.</p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {['fashion', 'electronics', 'furniture', 'accessories'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleCategory(cat)}
                                            className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${formData.categories.includes(cat)
                                                ? 'bg-highlight/10 border-highlight text-white shadow-inner-glow'
                                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="capitalize font-heading text-sm">{cat}</span>
                                            {formData.categories.includes(cat) && <span className="text-highlight">✓</span>}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-heading text-white/60 mb-1.5 uppercase tracking-wider">Store Aesthetic</label>
                                    <div className="flex gap-4">
                                        {['futuristic', 'minimalist', 'cozy'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setFormData(f => ({ ...f, theme: t as ThemeType }))}
                                                className={`px-4 py-2 rounded-xl border text-xs font-heading capitalize ${formData.theme === t ? 'bg-white text-primary border-white' : 'border-white/10 text-white/50'
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1"
                            >
                                <h2 className="heading-lg mb-2">Design Your Avatar</h2>
                                <p className="text-white/50 mb-8">This is how you will appear in the 3D VR environment.</p>

                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="w-48 h-64 bg-gradient-cyber rounded-3xl flex items-center justify-center text-8xl shadow-glow-blue border border-white/10">
                                        👤
                                    </div>
                                    <div className="flex-1 space-y-6 w-full">
                                        <div>
                                            <label className="block text-xs font-heading text-white/60 mb-2 uppercase tracking-wider">Outfit Style</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['casual', 'formal', 'futuristic', 'technical'].map(o => (
                                                    <button
                                                        key={o}
                                                        onClick={() => setFormData(f => ({ ...f, avatar: { ...f.avatar, outfit: o } }))}
                                                        className={`px-4 py-2 rounded-xl border text-xs capitalize ${formData.avatar.outfit === o ? 'bg-accent text-white border-accent' : 'border-white/10 text-white/40'
                                                            }`}
                                                    >
                                                        {o}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-heading text-white/60 mb-2 uppercase tracking-wider">Hair Color</label>
                                            <div className="flex gap-3">
                                                {['#4B2C20', '#C9924E', '#E5E5E5', '#242424'].map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => setFormData(f => ({ ...f, avatar: { ...f.avatar, hairColor: c } }))}
                                                        className={`w-8 h-8 rounded-full border-2 ${formData.avatar.hairColor === c ? 'border-white scale-125' : 'border-transparent'}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 flex flex-col items-center text-center"
                            >
                                <div className="w-20 h-20 bg-highlight/20 rounded-full flex items-center justify-center text-4xl mb-6 animate-pulse">🧪</div>
                                <h2 className="heading-lg mb-4">Research Consent</h2>
                                <p className="text-white/60 mb-6 leading-relaxed">
                                    As part of this AI study, we track facial micro-expressions to personalize your recommendations.
                                    Data is processed locally in your browser and anonymized before syncing.
                                </p>
                                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left w-full mb-8">
                                    <div className="flex items-start gap-4">
                                        <input
                                            type="checkbox"
                                            id="consent-check"
                                            className="mt-1 w-5 h-5 accent-highlight rounded border-white/10"
                                            onChange={(e) => {
                                                if (e.target.checked) dispatch(giveConsent());
                                            }}
                                        />
                                        <label htmlFor="consent-check" className="text-sm text-white/80">
                                            I consent to real-time emotion tracking via webcam for research purposes. I understand I can revoke this at any time in settings.
                                        </label>
                                    </div>
                                </div>
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3 text-xs text-yellow-500/80">
                                    ⚠️ Note: Features like "Emotion-Triggered Discounts" require this consent.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center">
                        <button
                            onClick={prev}
                            disabled={step === 0}
                            className={`btn-ghost ${step === 0 ? 'opacity-0' : ''}`}
                        >
                            Back
                        </button>

                        {step < STEPS.length - 1 ? (
                            <button onClick={next} className="btn-primary" id="onboarding-next">
                                Continue →
                            </button>
                        ) : (
                            <button onClick={handleComplete} disabled={loading} className="btn-primary" id="onboarding-complete">
                                {loading ? <LoadingSpinner size="sm" /> : 'Start VR Journey 🚀'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
