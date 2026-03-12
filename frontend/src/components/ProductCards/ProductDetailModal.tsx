import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { closeModal } from '../../store/uiSlice';
import { addToCart } from '../../store/productSlice';
import { useBlockchain } from '../../hooks/useBlockchain';
import { lazy, Suspense, useState, useMemo, useEffect } from 'react';
import CRMInsightsBadge from '../CRM/CRMInsightsBadge';

const Product3DConfigurator = lazy(() => import('../Configurator/Product3DConfigurator'));
const ARViewer = lazy(() => import('../ARTryOn/ARViewer'));
const True3DProductViewer = lazy(() => import('../3DViewer/True3DProductViewer'));
const DigitalDisplayMode = lazy(() => import('../Display/DigitalDisplayMode'));

type Tab = '3d' | 'ar' | '360' | 'display' | 'info';
type SelectedSize = number;
type SelectedColor = number;

export default function ProductDetailModal() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { activeModal } = useSelector((state: RootState) => state.ui);
    const { selectedProduct: product } = useSelector((state: RootState) => state.product);
    const { verifyProduct, isConnecting } = useBlockchain();
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [showDigitalDisplay, setShowDigitalDisplay] = useState(false);
    const [selectedColorIdx, setSelectedColorIdx] = useState(0);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);

    // Reset selections when product changes
    useEffect(() => {
        setActiveTab('info');
        setSelectedColorIdx(0);
        setSelectedImageIdx(0);
        setSelectedSizeIdx(0);
    }, [product?._id]);

    const isOpen = activeModal === 'productDetail' && product;
    if (!product) return null;

    const handleVerify = async () => {
        const res = await verifyProduct(product._id);
        if (res?.verified) alert(`Authentic! Hash: ${res.certificateHash}`);
    };

    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

    const tabs: { id: Tab; label: string; icon: string; available: boolean }[] = [
        { id: 'info', label: 'Details', icon: '📋', available: true },
        { id: '3d', label: '3D View', icon: '🎨', available: !!product.configuratorOptions || !!product.model3DUrl },
        { id: 'ar', label: 'AR Try-On', icon: '📱', available: !!product.arEnabled },
        { id: '360', label: 'True 3D', icon: '🔄', available: true },
        { id: 'display', label: 'Display', icon: '🖥️', available: product.displayMode === 'kiosk' || product.showcase === true },
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { dispatch(closeModal()); setActiveTab('info'); }}
                            className="absolute inset-0 bg-primary/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="w-full max-w-5xl glass-card-elevated rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Tab Bar */}
                            <div className="flex items-center border-b border-white/5 px-6 pt-4 gap-1 overflow-x-auto">
                                {tabs.filter(t => t.available).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => tab.id === 'display' ? setShowDigitalDisplay(true) : setActiveTab(tab.id)}
                                        className={`px-4 py-3 text-xs font-medium rounded-t-lg transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'bg-white/5 text-highlight border-b-2 border-highlight' : 'text-white/40 hover:text-white/70'}`}
                                    >
                                        <span>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => { dispatch(closeModal()); setActiveTab('info'); }}
                                    className="ml-auto text-white/30 hover:text-white px-3 py-2 text-lg"
                                >✕</button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'info' && (
                                        <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col md:flex-row">
                                            {/* Left: Media with color tint */}
                                            <div className="w-full md:w-1/2 bg-white/5 relative flex flex-col">
                                                <div className="relative flex-1 min-h-[300px]">
                                                    <img
                                                        src={product.images?.[selectedImageIdx] || product.images?.[0] || product.thumbnailUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {/* Color tint overlay — blends selected color onto product */}
                                                    {product.colors?.length > 0 && selectedColorIdx > 0 && (
                                                        <div
                                                            className="absolute inset-0 mix-blend-multiply opacity-30 transition-all duration-500"
                                                            style={{ backgroundColor: product.colors[selectedColorIdx]?.hex }}
                                                        />
                                                    )}
                                                    {/* Badges */}
                                                    <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                                                        {product.isAuthenticated && <span className="px-2.5 py-1 rounded-lg bg-green-500/80 backdrop-blur-sm text-[10px] font-bold text-white">Blockchain Verified</span>}
                                                        {product.arEnabled && <span className="px-2.5 py-1 rounded-lg bg-blue-500/80 backdrop-blur-sm text-[10px] font-bold text-white">AR Ready</span>}
                                                        {product.model3DUrl && <span className="px-2.5 py-1 rounded-lg bg-purple-500/80 backdrop-blur-sm text-[10px] font-bold text-white">3D Interactive</span>}
                                                    </div>
                                                </div>
                                                {/* Image gallery thumbnails */}
                                                {product.images && product.images.length > 1 && (
                                                    <div className="flex gap-1.5 p-3 bg-black/20">
                                                        {product.images.slice(0, 5).map((img, i) => (
                                                            <button key={i} onClick={() => setSelectedImageIdx(i)}
                                                                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIdx === i ? 'border-highlight' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                                                                <img src={img} className="w-full h-full object-cover" alt={`View ${i + 1}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Info */}
                                            <div className="w-full md:w-1/2 p-8 flex flex-col">
                                                <div className="mb-4">
                                                    {product.brand && <p className="text-xs text-highlight/70 uppercase tracking-widest mb-1">{product.brand}</p>}
                                                    <h2 className="font-['Orbitron'] text-2xl text-white font-bold">{product.name}</h2>
                                                    <p className="text-white/30 text-xs uppercase tracking-wider mt-1">{product.category}</p>
                                                </div>

                                                <div className="flex items-end gap-3 mb-6">
                                                    <span className="text-3xl font-bold text-white">₹{product.price.toLocaleString('en-IN')}</span>
                                                    {product.originalPrice && (
                                                        <>
                                                            <span className="text-lg text-white/30 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                                                            <span className="px-2 py-0.5 rounded-md bg-highlight/20 text-highlight text-xs font-bold">-{discount}%</span>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex-1 space-y-5 overflow-y-auto pr-2">
                                                    <p className="text-white/60 text-sm leading-relaxed">{product.description}</p>

                                                    {/* Rating */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">{[1, 2, 3, 4, 5].map(s => <span key={s} className={`text-sm ${s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-white/15'}`}>★</span>)}</div>
                                                        <span className="text-xs text-white/50">{product.rating} ({product.reviewCount} reviews)</span>
                                                    </div>

                                                    {/* Colors — interactive, changes image tint */}
                                                    {product.colors?.length > 0 && (
                                                        <div>
                                                            <p className="text-[10px] text-white/40 uppercase mb-2">
                                                                Color — <span className="text-highlight">{product.colors[selectedColorIdx]?.name || 'Default'}</span>
                                                            </p>
                                                            <div className="flex gap-2">
                                                                {product.colors.map((c, i) => (
                                                                    <motion.button
                                                                        key={c.hex}
                                                                        whileHover={{ scale: 1.15 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => setSelectedColorIdx(i)}
                                                                        className={`w-9 h-9 rounded-full border-2 transition-all duration-200 ${selectedColorIdx === i ? 'border-highlight ring-2 ring-highlight/30 scale-110' : 'border-white/15 hover:border-white/30'}`}
                                                                        style={{ backgroundColor: c.hex }}
                                                                        title={c.name}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Sizes — interactive */}
                                                    {product.sizes?.length > 0 && (
                                                        <div>
                                                            <p className="text-[10px] text-white/40 uppercase mb-2">
                                                                Size — <span className="text-highlight">{product.sizes[selectedSizeIdx]}</span>
                                                            </p>
                                                            <div className="flex gap-2 flex-wrap">
                                                                {product.sizes.map((s, i) => (
                                                                    <button
                                                                        key={s}
                                                                        onClick={() => setSelectedSizeIdx(i)}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedSizeIdx === i ? 'bg-highlight text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                                                                    >
                                                                        {s}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Specs */}
                                                    {product.specifications && Object.keys(product.specifications).length > 0 && (
                                                        <div>
                                                            <p className="text-[10px] text-white/40 uppercase mb-2">Specifications</p>
                                                            <div className="space-y-1">{Object.entries(product.specifications).map(([k, v]) => (
                                                                <div key={k} className="flex justify-between text-xs py-1.5 border-b border-white/5">
                                                                    <span className="text-white/40 capitalize">{k}</span>
                                                                    <span className="text-white/80">{String(v)}</span>
                                                                </div>
                                                            ))}</div>
                                                        </div>
                                                    )}

                                                    {/* CRM Insights */}
                                                    {product.crmInsights && <CRMInsightsBadge insights={product.crmInsights} />}
                                                </div>

                                                {/* Actions */}
                                                <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => dispatch(addToCart({
                                                                product,
                                                                selectedSize: product.sizes?.[selectedSizeIdx],
                                                                selectedColor: product.colors?.[selectedColorIdx]?.name
                                                            }))}
                                                            className="btn-primary flex-1 py-3"
                                                        >
                                                            Add to Cart
                                                        </button>
                                                        <button onClick={handleVerify} disabled={isConnecting} className="btn-secondary px-5">
                                                            Verify
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === '3d' && (
                                        <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                                            <Suspense fallback={<div className="h-96 flex items-center justify-center text-white/40 animate-pulse">Loading 3D Configurator...</div>}>
                                                <Product3DConfigurator
                                                    productName={product.name}
                                                    configuratorOptions={product.configuratorOptions || { colors: product.colors || [], materials: [], sizes: product.sizes || [] }}
                                                    defaultColor={product.model3DConfig?.defaultColor}
                                                    defaultMaterial={product.model3DConfig?.defaultMaterial}
                                                    productImages={product.images}
                                                />
                                            </Suspense>
                                        </motion.div>
                                    )}

                                    {activeTab === 'ar' && (
                                        <motion.div key="ar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                                            <Suspense fallback={<div className="h-96 flex items-center justify-center text-white/40 animate-pulse">Loading AR Viewer...</div>}>
                                                <ARViewer
                                                    productName={product.name}
                                                    arType={product.arType || 'try-on'}
                                                    productImages={product.images || []}
                                                    model3DUrl={product.model3DUrl}
                                                    defaultColor={product.model3DConfig?.defaultColor || '#E94560'}
                                                />
                                            </Suspense>
                                        </motion.div>
                                    )}

                                    {activeTab === '360' && (
                                        <motion.div key="360" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-['Orbitron'] text-lg text-white">True 3D View — {product.name}</h3>
                                                    <p className="text-xs text-white/35 mt-0.5">Interactive 3D with wireframe, X-ray, exploded views & annotations</p>
                                                </div>
                                                <button
                                                    onClick={() => { dispatch(closeModal()); navigate(`/product-3d/${product._id}`); }}
                                                    className="glass-card px-4 py-2 text-xs text-highlight hover:bg-white/10 transition-all flex items-center gap-2 rounded-xl border border-highlight/20"
                                                >
                                                    <span>Immersive 3D</span>
                                                    <span>↗</span>
                                                </button>
                                            </div>
                                            <Suspense fallback={<div className="h-96 flex items-center justify-center text-white/40 animate-pulse">Loading True 3D View...</div>}>
                                                <True3DProductViewer product={product} compact={true} />
                                            </Suspense>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Full-screen Digital Display */}
            <AnimatePresence>
                {showDigitalDisplay && product && (
                    <Suspense fallback={null}>
                        <DigitalDisplayMode product={product} onClose={() => setShowDigitalDisplay(false)} />
                    </Suspense>
                )}
            </AnimatePresence>
        </>
    );
}
