import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchTrending, fetchShowcase } from '../store/productSlice';
import ProductCard from '../components/ProductCards/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import AnimatedGradientBg from '../components/ui/AnimatedGradientBg';

// ── Animated Counter Hook ──
function useCountUp(end: number, duration = 2000, start = 0) {
    const [count, setCount] = useState(start);
    const [hasStarted, setHasStarted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasStarted) return;
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setCount(Math.floor(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [hasStarted, end, duration, start]);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setHasStarted(true); },
            { threshold: 0.3 }
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return { count, ref };
}

// ── Floating Particles Background ──
function FloatingParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-highlight/20"
                    initial={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                        y: Math.random() * 800,
                        opacity: 0,
                    }}
                    animate={{
                        y: [null, -100],
                        opacity: [0, 0.6, 0],
                    }}
                    transition={{
                        duration: 4 + Math.random() * 6,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: 'linear',
                    }}
                    style={{ left: `${Math.random() * 100}%` }}
                />
            ))}
        </div>
    );
}

export default function Home() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const { trending, showcaseProducts, loading } = useAppSelector((state) => state.product);
    const [activePillar, setActivePillar] = useState<number | null>(null);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchTrending());
        dispatch(fetchShowcase());
    }, [dispatch]);

    // Auto-cycle tech pillars
    useEffect(() => {
        const interval = setInterval(() => {
            setActivePillar(prev => (prev === null || prev >= 3) ? 0 : prev + 1);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const stat1 = useCountUp(1250, 2500);
    const stat2 = useCountUp(98, 2000);
    const stat3 = useCountUp(50, 1800);
    const stat4 = useCountUp(4.9, 2200, 0);

    const categories = [
        { id: 'fashion', name: 'Fashion & Apparel', icon: '👕', desc: 'Latest trends in clothing and accessories', gradient: 'from-rose-500/20 to-pink-500/5', accent: 'rose' },
        { id: 'electronics', name: 'Electronics & Gadgets', icon: '📱', desc: 'Cutting-edge tech and smart devices', gradient: 'from-blue-500/20 to-cyan-500/5', accent: 'blue' },
        { id: 'furniture', name: 'Home & Furniture', icon: '🏠', desc: 'Elevate your living space', gradient: 'from-emerald-500/20 to-teal-500/5', accent: 'emerald' },
        { id: 'beauty', name: 'Beauty & Personal Care', icon: '💄', desc: 'Premium skincare and cosmetics', gradient: 'from-purple-500/20 to-violet-500/5', accent: 'purple' },
        { id: 'baby_kids', name: 'Baby & Kids', icon: '🧸', desc: 'Everything for little ones', gradient: 'from-yellow-500/20 to-amber-500/5', accent: 'yellow' },
        { id: 'pets', name: 'Pet Supplies', icon: '🐾', desc: 'Quality products for pets', gradient: 'from-orange-500/20 to-red-500/5', accent: 'orange' },
        { id: 'niche', name: 'Niche & Emerging', icon: '✨', desc: 'Unique sustainable discoveries', gradient: 'from-teal-500/20 to-emerald-500/5', accent: 'teal' },
    ];

    const techPillars = [
        {
            icon: '🎨',
            title: '3D Configurator',
            desc: 'Customize products in real-time',
            color: 'purple',
            borderColor: 'border-purple-500/30 hover:border-purple-400/60',
            bgActive: 'bg-purple-500/10',
            route: '/products',
            stats: { label: 'Configurations', value: '2.5K+' },
            features: ['Real-time color swap', 'Material preview', 'Size visualization', 'WebGL powered'],
            techStack: 'Three.js · R3F · WebGL 2.0',
        },
        {
            icon: '📱',
            title: 'Augmented Reality',
            desc: 'See it in your space',
            color: 'blue',
            borderColor: 'border-blue-500/30 hover:border-blue-400/60',
            bgActive: 'bg-blue-500/10',
            route: '/products',
            stats: { label: 'AR Sessions', value: '890+' },
            features: ['Virtual try-on', 'Room placement', '360° product view', 'Camera integration'],
            techStack: 'WebXR · MediaDevices API',
        },
        {
            icon: '🖥️',
            title: 'Digital Display',
            desc: 'In-store kiosk experience',
            color: 'emerald',
            borderColor: 'border-emerald-500/30 hover:border-emerald-400/60',
            bgActive: 'bg-emerald-500/10',
            route: '/products',
            stats: { label: 'Displays Active', value: '45+' },
            features: ['Full-screen showcase', 'Auto slideshow', 'QR code scan', 'Touch optimized'],
            techStack: 'Framer Motion · Adaptive UI',
        },
        {
            icon: '📊',
            title: 'CRM Intelligence',
            desc: 'Dynamics 365 powered insights',
            color: 'amber',
            borderColor: 'border-amber-500/30 hover:border-amber-400/60',
            bgActive: 'bg-amber-500/10',
            route: '/analytics',
            stats: { label: 'Data Points', value: '15K+' },
            features: ['Conversion tracking', 'Engagement scoring', 'Audience insights', 'Session analytics'],
            techStack: 'Dynamics 365 · Salesforce CRM',
        },
    ];

    const getColorClass = (color: string, type: 'text' | 'bg' | 'border' | 'ring') => {
        const map: Record<string, Record<string, string>> = {
            purple: { text: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/40', ring: 'ring-purple-500/20' },
            blue: { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/40', ring: 'ring-blue-500/20' },
            emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', ring: 'ring-emerald-500/20' },
            amber: { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', ring: 'ring-amber-500/20' },
        };
        return map[color]?.[type] || '';
    };

    return (
        <div className="page-container px-6 py-8 relative">
            <FloatingParticles />

            {/* ── Hero Section ─── */}
            <section className="max-w-7xl mx-auto mb-20">
                <AnimatedGradientBg className="glass-card-elevated rounded-3xl p-8 md:p-14 relative overflow-hidden">
                    {/* Decorative grid */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }} />

                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 relative z-10">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-highlight/10 border border-highlight/20 px-4 py-1.5 rounded-full mb-6">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-xs text-white/60">AI + Blockchain Powered</span>
                                <span className="text-[10px] text-highlight/60 ml-1">v2.0</span>
                            </motion.div>
                            <h1 className="font-['Orbitron'] text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
                                Welcome back,<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-highlight via-pink-400 to-highlight-light animate-gradient-x">
                                    {user?.name || 'Shopper'}
                                </span>
                            </h1>
                            <p className="text-white/45 text-lg mb-10 max-w-xl leading-relaxed">
                                Experience the future of retail with immersive VR shopping, AI recommendations, and blockchain-verified authenticity.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(233,69,96,0.3)' }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/vr-store')} className="btn-primary text-base px-10 py-4 relative overflow-hidden group">
                                    <span className="relative z-10 flex items-center gap-2">
                                        🥽 Enter VR Store
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-highlight to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/products')} className="btn-ghost text-base px-10 py-4 flex items-center gap-2">
                                    🛍️ Browse Products
                                </motion.button>
                            </div>
                        </div>
                        <div className="flex-1 max-w-md">
                            <motion.div
                                animate={{ y: [0, -10, 0], rotateZ: [2, -1, 2] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                className="glass-card p-8 border-highlight/10 relative"
                            >
                                {/* Glowing orb */}
                                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-highlight/10 blur-2xl" />
                                <div className="aspect-square bg-gradient-to-br from-highlight/20 via-purple-500/15 to-accent/20 rounded-2xl flex items-center justify-center text-8xl mb-5 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                    <span className="relative z-10">🥽</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-highlight/70 uppercase tracking-[0.2em] mb-1">AI Personalized</p>
                                        <p className="text-xl font-bold text-white font-['Orbitron']">Smart VR</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-bold flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                            LIVE
                                        </span>
                                        <span className="text-[9px] text-white/30">WebXR Ready</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </AnimatedGradientBg>
            </section>

            {/* ── Live Stats Bar ─── */}
            <section className="max-w-7xl mx-auto mb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { ref: stat1.ref, value: stat1.count.toLocaleString(), suffix: '+', label: 'Products', icon: '📦', color: 'text-highlight' },
                        { ref: stat2.ref, value: stat2.count, suffix: '%', label: 'Satisfaction', icon: '⭐', color: 'text-yellow-400' },
                        { ref: stat3.ref, value: stat3.count, suffix: 'K+', label: 'Users', icon: '👥', color: 'text-blue-400' },
                        { ref: stat4.ref, value: '4.9', suffix: '/5', label: 'Rating', icon: '🏆', color: 'text-emerald-400' },
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            ref={s.ref}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-5 rounded-2xl text-center group hover:border-highlight/20 transition-all"
                        >
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
                            <div className={`text-2xl font-bold font-['Orbitron'] ${s.color}`}>
                                {s.value}{s.suffix}
                            </div>
                            <p className="text-[11px] text-white/35 mt-1">{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Technology Pillars (Dynamic & Interactive) ─── */}
            <section className="max-w-7xl mx-auto mb-20">
                <div className="mb-8">
                    <span className="text-xs font-['Orbitron'] text-highlight tracking-[0.2em] uppercase block mb-1">Technology</span>
                    <h2 className="font-['Orbitron'] text-2xl text-white font-bold mb-2">Core Experience Pillars</h2>
                    <p className="text-white/35 text-sm">Click to explore each technology powering your shopping experience</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {techPillars.map((p, i) => (
                        <motion.div
                            key={p.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -6, scale: 1.02 }}
                            onClick={() => setActivePillar(activePillar === i ? null : i)}
                            className={`glass-card p-6 rounded-2xl border ${p.borderColor} transition-all cursor-pointer group relative overflow-hidden ${
                                activePillar === i ? `${p.bgActive} ring-1 ${getColorClass(p.color, 'ring')}` : ''
                            }`}
                        >
                            {/* Active indicator line */}
                            {activePillar === i && (
                                <motion.div
                                    layoutId="pillarIndicator"
                                    className={`absolute top-0 left-0 right-0 h-0.5 ${getColorClass(p.color, 'bg')}`}
                                    style={{ background: `linear-gradient(90deg, transparent, var(--tw-gradient-to), transparent)` }}
                                />
                            )}

                            {/* Animated background glow */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${
                                p.color === 'purple' ? 'from-purple-500/5' : p.color === 'blue' ? 'from-blue-500/5' : p.color === 'emerald' ? 'from-emerald-500/5' : 'from-amber-500/5'
                            } to-transparent`} />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-3xl group-hover:scale-110 transition-transform">{p.icon}</div>
                                    <div className={`text-[9px] font-bold uppercase tracking-widest ${getColorClass(p.color, 'text')} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        {p.stats.value}
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-white transition-colors">{p.title}</h3>
                                <p className="text-[11px] text-white/40 mb-3">{p.desc}</p>

                                {/* Progress bar animation */}
                                <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${getColorClass(p.color, 'bg')}`}
                                        initial={{ width: '0%' }}
                                        animate={{ width: activePillar === i ? '100%' : '0%' }}
                                        transition={{ duration: 4, ease: 'linear' }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Expanded Pillar Detail ── */}
                <AnimatePresence mode="wait">
                    {activePillar !== null && (
                        <motion.div
                            key={activePillar}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="overflow-hidden"
                        >
                            <div className={`glass-card rounded-2xl p-8 border ${getColorClass(techPillars[activePillar].color, 'border')} relative overflow-hidden`}>
                                {/* Background decoration */}
                                <div className={`absolute -right-20 -top-20 w-60 h-60 rounded-full ${getColorClass(techPillars[activePillar].color, 'bg')} blur-3xl opacity-20`} />

                                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-4xl">{techPillars[activePillar].icon}</span>
                                            <div>
                                                <h3 className="font-['Orbitron'] text-xl text-white font-bold">{techPillars[activePillar].title}</h3>
                                                <p className="text-xs text-white/40">{techPillars[activePillar].techStack}</p>
                                            </div>
                                        </div>
                                        <p className="text-white/60 text-sm mb-6 leading-relaxed">{techPillars[activePillar].desc}</p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => { e.stopPropagation(); navigate(techPillars[activePillar].route); }}
                                            className={`px-6 py-2.5 rounded-xl text-sm font-medium ${getColorClass(techPillars[activePillar].color, 'bg')} ${getColorClass(techPillars[activePillar].color, 'text')} border ${getColorClass(techPillars[activePillar].color, 'border')} transition-all hover:scale-105`}
                                        >
                                            Explore {techPillars[activePillar].title} →
                                        </motion.button>
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Key Features</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {techPillars[activePillar].features.map((f, fi) => (
                                                <motion.div
                                                    key={f}
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: fi * 0.1 }}
                                                    className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2.5"
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${getColorClass(techPillars[activePillar].color, 'bg')}`} />
                                                    <span className="text-xs text-white/60">{f}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex items-center gap-4">
                                            <div className={`px-3 py-1.5 rounded-lg ${getColorClass(techPillars[activePillar].color, 'bg')} border ${getColorClass(techPillars[activePillar].color, 'border')}`}>
                                                <p className="text-[9px] text-white/40 uppercase">{techPillars[activePillar].stats.label}</p>
                                                <p className={`text-lg font-bold font-['Orbitron'] ${getColorClass(techPillars[activePillar].color, 'text')}`}>{techPillars[activePillar].stats.value}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                                <span className="text-[10px] text-white/30">Active & Running</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* ── Featured Showcase ─── */}
            {showcaseProducts.length > 0 && (
                <section className="max-w-7xl mx-auto mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="text-xs font-['Orbitron'] text-highlight tracking-[0.2em] uppercase block mb-1">Featured</span>
                            <h2 className="font-['Orbitron'] text-2xl text-white font-bold">Showcase Products</h2>
                            <p className="text-white/40 text-sm mt-1">Products featuring 3D Configurator, AR, and Digital Display technologies</p>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/products')} className="btn-ghost text-xs px-4 py-2 flex items-center gap-1">
                            View All <span>→</span>
                        </motion.button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {showcaseProducts.slice(0, 6).map((p, i) => (
                            <motion.div
                                key={p._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <ProductCard product={p} />
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Categories Grid ─── */}
            <section className="max-w-7xl mx-auto mb-20">
                <div className="mb-8">
                    <span className="text-xs font-['Orbitron'] text-highlight tracking-[0.2em] uppercase block mb-1">Categories</span>
                    <h2 className="font-['Orbitron'] text-2xl text-white font-bold mb-2">Shop by Category</h2>
                    <p className="text-white/40 text-sm">Explore specialized sections with curated products.</p>
                </div>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {categories.map((cat) => (
                        <motion.div
                            key={cat.id}
                            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            onHoverStart={() => setHoveredCategory(cat.id)}
                            onHoverEnd={() => setHoveredCategory(null)}
                            onClick={() => navigate(`/products/${cat.id}`)}
                            className="glass-card p-7 cursor-pointer group hover:border-highlight/20 transition-all rounded-2xl relative overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            {/* Animated corner accent */}
                            <motion.div
                                className="absolute top-0 right-0 w-16 h-16 bg-highlight/5 rounded-bl-3xl"
                                animate={{ opacity: hoveredCategory === cat.id ? 1 : 0, scale: hoveredCategory === cat.id ? 1 : 0.5 }}
                                transition={{ duration: 0.3 }}
                            />

                            <div className="relative z-10">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{cat.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-highlight transition-colors">{cat.name}</h3>
                                <p className="text-white/35 text-xs leading-relaxed mb-4">{cat.desc}</p>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-highlight opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                    Explore <span className="text-sm">→</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ── Trending Products ─── */}
            {(trending.length > 0 || loading) && (
                <section className="max-w-7xl mx-auto mb-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="text-xs font-['Orbitron'] text-highlight tracking-[0.2em] uppercase block mb-1">Trending</span>
                            <h2 className="font-['Orbitron'] text-2xl text-white font-bold">Popular Right Now</h2>
                            <p className="text-white/35 text-sm mt-1">What shoppers are loving today</p>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/products')} className="btn-ghost text-xs px-4 py-2 flex items-center gap-1">
                            See All <span>→</span>
                        </motion.button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                            : trending.slice(0, 8).map((p, i) => (
                                <motion.div
                                    key={p._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <ProductCard product={p} />
                                </motion.div>
                            ))
                        }
                    </div>
                </section>
            )}
        </div>
    );
}
