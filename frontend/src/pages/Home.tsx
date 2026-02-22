import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { RootState, AppDispatch, useAppDispatch, useAppSelector } from '../store';
import { fetchTrending } from '../store/productSlice';
import ProductCard from '../components/ProductCards/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Home() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const { trending, loading } = useAppSelector((state) => state.product);

    useEffect(() => {
        dispatch(fetchTrending());
    }, [dispatch]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <div className="page-container px-6 py-8">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative glass-card-elevated p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center gap-10"
                >
                    {/* Glow effect background */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-highlight/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex-1 z-10">
                        <h1 className="heading-xl mb-4">Welcome to the<br />Future of Retail</h1>
                        <p className="text-white/70 text-lg mb-8 max-w-xl">
                            Experience an AI-powered personalized VR shopping journey. Our assistant learns from your emotions and preferences to build a store tailored just for you.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate('/vr-store')}
                                className="btn-primary text-base px-8 py-4"
                            >
                                Enter VR Store
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="btn-secondary text-base px-8 py-4"
                            >
                                View Profile
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative z-10 w-full max-w-sm">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="glass-card p-6 rotate-3 shadow-glow-pink"
                        >
                            <div className="aspect-square bg-gradient-cyber rounded-xl flex items-center justify-center text-7xl mb-4">
                                🥽
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-heading text-highlight mb-1 uppercase tracking-widest">Active Session</p>
                                    <p className="text-xl font-bold text-white">Group {user?.groupType} Dashboard</p>
                                </div>
                                <div className="badge-success">LIVE</div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Featured Products */}
            <section className="max-w-7xl mx-auto mb-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="heading-lg mb-2">Trending Now</h2>
                        <p className="text-white/50">Top picks based on popular demand across the platform.</p>
                    </div>
                    <Link to="/vr-store" className="text-highlight hover:underline font-medium text-sm">View All →</Link>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {trending.slice(0, 4).map(product => (
                            <motion.div key={product._id} variants={itemVariants}>
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </section>

            {/* Experiment Info (Group A/B Variant) */}
            <section className="max-w-7xl mx-auto mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6">
                        <div className="w-12 h-12 rounded-xl bg-highlight/20 flex items-center justify-center text-highlight text-2xl mb-4">🤖</div>
                        <h3 className="font-heading text-lg mb-2">Integrated AI</h3>
                        <p className="text-sm text-white/50 leading-relaxed">
                            Our GPT-4 assistant helps you find exactly what you need with real-time intent detection.
                        </p>
                    </div>
                    <div className="glass-card p-6">
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent text-2xl mb-4">😊</div>
                        <h3 className="font-heading text-lg mb-2">Emotion Aware</h3>
                        <p className="text-sm text-white/50 leading-relaxed">
                            We use advanced computer vision to understand your sentiment and adjust the experience live.
                        </p>
                    </div>
                    <div className="glass-card p-6">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 text-2xl mb-4">⛓️</div>
                        <h3 className="font-heading text-lg mb-2">Blockchain Proof</h3>
                        <p className="text-sm text-white/50 leading-relaxed">
                            Every premium product is backed by an on-chain authenticity certificate for your peace of mind.
                        </p>
                    </div>
                </div>
            </section>

            {user?.groupType === 'B' && (
                <section className="max-w-7xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="p-8 rounded-3xl bg-gradient-glow flex flex-col items-center text-center gap-6"
                    >
                        <h2 className="heading-lg">Exclusive for Group B</h2>
                        <p className="max-w-2xl text-white/90">
                            As part of the experimental group, you have access to the full AI customization suite including
                            dynamic store layouts and emotion-triggered rewards.
                        </p>
                        <button className="btn-primary bg-white text-primary hover:bg-white/90 shadow-none px-8">Explore Live Features</button>
                    </motion.div>
                </section>
            )}
        </div>
    );
}
