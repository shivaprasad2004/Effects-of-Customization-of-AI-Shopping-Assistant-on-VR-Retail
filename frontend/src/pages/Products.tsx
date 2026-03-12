import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProducts, fetchShowcase, setFilters } from '../store/productSlice';
import ProductCard from '../components/ProductCards/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';

const LABELS: Record<string, string> = {
    fashion: 'Fashion & Apparel',
    electronics: 'Electronics & Gadgets',
    furniture: 'Home & Furniture',
    home: 'Home & Lifestyle',
    beauty: 'Beauty & Personal Care',
    baby_kids: 'Baby & Kids',
    pets: 'Pet Supplies',
    niche: 'Niche & Emerging',
};

const SUBCATS: Record<string, string[]> = {
    fashion: ['men', 'women', 'children', 'accessories'],
    electronics: ['audio-video', 'computers', 'wearables'],
    home: ['living', 'bedroom', 'kitchen', 'decor'],
    furniture: ['living', 'bedroom', 'office', 'decor'],
    beauty: ['skincare', 'haircare', 'makeup', 'fragrance'],
    baby_kids: ['clothing', 'toys', 'nursery'],
    pets: ['dog', 'cat', 'accessories'],
    niche: ['eco', 'indie', 'limited'],
};

const CAT_ICONS: Record<string, string> = {
    fashion: '👕', electronics: '📱', furniture: '🏠', home: '🏠',
    beauty: '💄', baby_kids: '🧸', pets: '🐾', niche: '✨',
};

export default function ProductsPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { category, sub } = useParams<{ category?: string; sub?: string }>();
    const { products, showcaseProducts, loading, total } = useAppSelector((s) => s.product);
    const { user } = useAppSelector((s) => s.auth);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showShowcase, setShowShowcase] = useState(false);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const params = useMemo(() => {
        const p: any = {};
        if (category) p.category = category;
        if (sub) p.subcategory = sub;
        return p;
    }, [category, sub]);

    useEffect(() => {
        dispatch(setFilters({ category: category || '' }));
        dispatch<any>(fetchProducts(params));
        dispatch(fetchShowcase());
    }, [category, sub, params, dispatch]);

    const categories = Object.keys(LABELS);
    const subcats = SUBCATS[category || ''] || [];

    // Use showcase products as fallback when API returns empty
    const baseProducts = products.length > 0 ? products : showcaseProducts;
    const filteredShowcase = useMemo(() => {
        let filtered = showShowcase ? showcaseProducts : baseProducts;
        if (category) filtered = filtered.filter(p => p.category === category);
        if (sub) filtered = filtered.filter(p => (p as any).subcategory === sub);
        return filtered;
    }, [showShowcase, showcaseProducts, baseProducts, category, sub]);
    const displayProducts = filteredShowcase;

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    {category && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/products')}
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white border border-white/5"
                        >
                            ←
                        </motion.button>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            {category && <span className="text-2xl">{CAT_ICONS[category]}</span>}
                            <h1 className="font-['Orbitron'] text-2xl font-bold text-white">
                                {category ? LABELS[category] : 'All Products'}
                            </h1>
                        </div>
                        <p className="text-white/40 text-xs mt-1">{displayProducts.length || total} items available</p>
                    </div>
                </div>

                {/* View controls */}
                <div className="flex items-center gap-3">
                    {/* Showcase toggle */}
                    <button
                        onClick={() => setShowShowcase(!showShowcase)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showShowcase ? 'bg-highlight/20 text-highlight border border-highlight/30' : 'bg-white/5 text-white/50 border border-white/10 hover:text-white'}`}
                    >
                        ✨ Showcase
                    </button>
                    {/* Grid/List toggle */}
                    <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                        <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 text-xs ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40'}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </button>
                        <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40'}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Nav */}
            {!category && (
                <div className="flex gap-2 mb-6 flex-wrap">
                    {categories.map((cat) => (
                        <Link
                            key={cat}
                            to={`/products/${cat}`}
                            className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-highlight/30 hover:bg-highlight/5 text-xs uppercase tracking-wider transition-all"
                        >
                            <span className="mr-1.5">{CAT_ICONS[cat]}</span>
                            {LABELS[cat]}
                        </Link>
                    ))}
                </div>
            )}

            {/* Subcategory Nav */}
            {category && subcats.length > 0 && (
                <div className="flex gap-2 mb-6 flex-wrap">
                    <Link
                        to={`/products/${category}`}
                        className={`px-3 py-1.5 rounded-lg border text-xs uppercase tracking-wider transition-all ${!sub ? 'bg-highlight/15 border-highlight/30 text-highlight' : 'border-white/10 text-white/50 hover:text-white'}`}
                    >
                        All
                    </Link>
                    {subcats.map((s) => (
                        <Link
                            key={s}
                            to={`/products/${category}/${s}`}
                            className={`px-3 py-1.5 rounded-lg border text-xs uppercase tracking-wider transition-all ${sub === s ? 'bg-highlight/15 border-highlight/30 text-highlight' : 'border-white/10 text-white/50 hover:text-white'}`}
                        >
                            {s}
                        </Link>
                    ))}
                </div>
            )}

            {/* Products Grid */}
            {loading ? (
                <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : displayProducts.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="font-['Orbitron'] text-xl text-white/60 mb-2">No products found</h3>
                    <p className="text-white/30 text-sm">Try a different category or check back later.</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}
                >
                    {displayProducts.map((p) => (
                        <ProductCard key={p._id} product={p} />
                    ))}
                </motion.div>
            )}
        </div>
    );
}
