import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addToCart } from '../store/productSlice';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { showcaseProducts } from '../data/showcaseProducts';
import True3DProductViewer from '../components/3DViewer/True3DProductViewer';

/**
 * Product3DExplorer — Full-screen immersive 3D product viewer page.
 * Route: /product-3d/:id
 *
 * Enhanced with:
 * - Collapsible side panel with product details
 * - Quick add-to-cart from 3D view
 * - Share / copy link functionality
 * - Keyboard navigation guide
 */
export default function Product3DExplorer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const storeProducts = useSelector((state: RootState) => state.product.products);
    const selectedProduct = useSelector((state: RootState) => state.product.selectedProduct);

    const [showPanel, setShowPanel] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [shareToast, setShareToast] = useState(false);

    const product = useMemo(() => {
        if (selectedProduct && selectedProduct._id === id) return selectedProduct;
        const found = storeProducts.find(p => p._id === id);
        if (found) return found;
        return showcaseProducts.find(p => p._id === id);
    }, [id, storeProducts, selectedProduct]);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard?.writeText(url).then(() => {
            setShareToast(true);
            setTimeout(() => setShareToast(false), 2000);
        });
    };

    const handleAddToCart = () => {
        if (!product) return;
        dispatch(addToCart({ product }));
    };

    if (!product) {
        return (
            <div className="fixed inset-0 bg-[#050510] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="text-6xl">🔍</div>
                    <h1 className="text-2xl font-['Orbitron'] text-white">Product Not Found</h1>
                    <p className="text-white/50 text-sm">The product you're looking for doesn't exist.</p>
                    <button onClick={() => navigate(-1)} className="btn-primary px-6 py-2">Go Back</button>
                </motion.div>
            </div>
        );
    }

    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

    const shortcuts = [
        { key: 'Space', action: 'Toggle auto-rotate' },
        { key: 'F', action: 'Toggle fullscreen' },
        { key: 'W', action: 'Wireframe view' },
        { key: 'X', action: 'X-Ray view' },
        { key: 'E', action: 'Exploded view' },
        { key: 'A', action: 'Toggle annotations' },
        { key: '1-4', action: 'Camera presets' },
        { key: 'Esc', action: 'Exit fullscreen' },
    ];

    return (
        <div className="fixed inset-0 bg-[#050510] z-50 flex flex-col">
            {/* ── Top Bar ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/40 backdrop-blur-md z-10"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all border border-white/10"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="font-['Orbitron'] text-lg text-white font-bold">{product.name}</h1>
                        <div className="flex items-center gap-3 mt-0.5">
                            {product.brand && (
                                <span className="text-[10px] text-[#E94560] uppercase tracking-widest font-bold">{product.brand}</span>
                            )}
                            <span className="text-[10px] text-white/30 uppercase">{product.category}</span>
                            {product.rating && (
                                <span className="text-[10px] text-yellow-400">
                                    {'★'.repeat(Math.round(product.rating))} <span className="text-white/30">{product.rating}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Shortcuts help */}
                    <button
                        onClick={() => setShowShortcuts(s => !s)}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all border border-white/10 text-sm"
                        title="Keyboard shortcuts"
                    >
                        ⌨
                    </button>
                    {/* Share */}
                    <button
                        onClick={handleShare}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all border border-white/10 text-sm"
                        title="Copy link"
                    >
                        🔗
                    </button>
                    {/* Info Panel toggle */}
                    <button
                        onClick={() => setShowPanel(p => !p)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all border ${
                            showPanel ? 'bg-[#E94560]/20 border-[#E94560]/40 text-[#E94560]' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                        title="Product details"
                    >
                        📋
                    </button>

                    {product.price && (
                        <div className="text-right ml-2">
                            <span className="text-2xl font-bold text-white font-['Orbitron']">₹{product.price.toLocaleString('en-IN')}</span>
                            {product.originalPrice && (
                                <span className="ml-2 text-sm text-white/30 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                            )}
                        </div>
                    )}
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all border border-white/10"
                    >
                        ✕
                    </button>
                </div>
            </motion.div>

            {/* ── Main Content ── */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* 3D Viewer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`flex-1 p-4 overflow-hidden transition-all duration-300 ${showPanel ? 'pr-0' : ''}`}
                >
                    <True3DProductViewer product={product} compact={false} />
                </motion.div>

                {/* ── Side Panel ── */}
                <AnimatePresence>
                    {showPanel && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 360, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="border-l border-white/5 bg-black/40 backdrop-blur-md overflow-y-auto"
                        >
                            <div className="p-6 space-y-6 w-[360px]">
                                <div>
                                    <h2 className="font-['Orbitron'] text-xl text-white font-bold">{product.name}</h2>
                                    {product.brand && <p className="text-xs text-[#E94560] uppercase tracking-widest mt-1">{product.brand}</p>}
                                </div>

                                {/* Price */}
                                <div className="flex items-end gap-3">
                                    <span className="text-3xl font-bold text-white font-['Orbitron']">₹{product.price.toLocaleString('en-IN')}</span>
                                    {product.originalPrice && (
                                        <>
                                            <span className="text-lg text-white/30 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                                            <span className="px-2 py-0.5 rounded-md bg-[#E94560]/20 text-[#E94560] text-xs font-bold">-{discount}%</span>
                                        </>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-white/60 text-sm leading-relaxed">{product.description}</p>

                                {/* Rating */}
                                <div className="flex items-center gap-2">
                                    <div className="flex">{[1, 2, 3, 4, 5].map(s => <span key={s} className={`text-sm ${s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-white/15'}`}>★</span>)}</div>
                                    <span className="text-xs text-white/50">{product.rating} ({product.reviewCount} reviews)</span>
                                </div>

                                {/* Colors */}
                                {product.colors?.length > 0 && (
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase mb-2">Available Colors</p>
                                        <div className="flex gap-2">
                                            {product.colors.map(c => (
                                                <div key={c.hex} className="w-8 h-8 rounded-full border border-white/15" style={{ backgroundColor: c.hex }} title={c.name} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sizes */}
                                {product.sizes?.length > 0 && (
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase mb-2">Available Sizes</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {product.sizes.map(s => (
                                                <span key={s} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-white/60 border border-white/10">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Specs */}
                                {product.specifications && Object.keys(product.specifications).length > 0 && (
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase mb-2">Specifications</p>
                                        <div className="space-y-1">
                                            {Object.entries(product.specifications).map(([k, v]) => (
                                                <div key={k} className="flex justify-between text-xs py-1.5 border-b border-white/5">
                                                    <span className="text-white/40 capitalize">{k}</span>
                                                    <span className="text-white/80">{String(v)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add to cart */}
                                <button onClick={handleAddToCart} className="btn-primary w-full py-3 text-sm font-bold">
                                    Add to Cart — ₹{product.price.toLocaleString('en-IN')}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Keyboard Shortcuts Overlay ── */}
                <AnimatePresence>
                    {showShortcuts && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-4 right-4 z-20 w-72 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-2xl"
                        >
                            <h4 className="text-xs font-bold text-white font-['Orbitron'] mb-3 flex items-center justify-between">
                                Keyboard Shortcuts
                                <button onClick={() => setShowShortcuts(false)} className="text-white/40 hover:text-white">✕</button>
                            </h4>
                            <div className="space-y-2">
                                {shortcuts.map(s => (
                                    <div key={s.key} className="flex items-center justify-between text-xs">
                                        <kbd className="px-2 py-0.5 bg-white/10 rounded text-white/70 font-mono text-[10px]">{s.key}</kbd>
                                        <span className="text-white/50">{s.action}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Share Toast ── */}
                <AnimatePresence>
                    {shareToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-5 py-2.5 bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-xl"
                        >
                            <span className="text-green-400 text-sm font-medium">✓ Link copied to clipboard!</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Bottom Info Bar ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-6 py-3 border-t border-white/5 bg-black/40 backdrop-blur-md"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {product.isAuthenticated && (
                            <span className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                                Blockchain Verified
                            </span>
                        )}
                        {product.arEnabled && (
                            <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                AR Ready
                            </span>
                        )}
                        {product.model3DUrl && (
                            <span className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                                3D Model
                            </span>
                        )}
                        {product.stock !== undefined && product.stock <= 5 && (
                            <span className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                Only {product.stock} left!
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-[9px] text-white/25 uppercase tracking-widest">
                        <span>Three.js</span>
                        <span>·</span>
                        <span>WebGL 2.0</span>
                        <span>·</span>
                        <span>React Three Fiber</span>
                        <span>·</span>
                        <span>PBR Materials</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
