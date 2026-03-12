import { motion } from 'framer-motion';
import { Product } from '../../store/productSlice';
import { useDispatch } from 'react-redux';
import { addToCart, selectProduct } from '../../store/productSlice';
import { openModal } from '../../store/uiSlice';

interface Props {
    product: Product;
}

export default function ProductCard({ product }: Props) {
    const dispatch = useDispatch();

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        dispatch(addToCart({ product }));
    };

    const handleOpenDetail = () => {
        dispatch(selectProduct(product));
        dispatch(openModal('productDetail'));
    };

    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

    return (
        <motion.div
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            onClick={handleOpenDetail}
            className="glass-card overflow-hidden group cursor-pointer rounded-2xl hover:border-highlight/20 transition-all duration-300"
        >
            {/* Product Image */}
            <div className="aspect-[4/5] relative bg-white/5 overflow-hidden">
                <img
                    src={product.thumbnailUrl || product.images?.[0] || 'https://via.placeholder.com/400x500?text=Product'}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top-left badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.newArrival && <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm">New</span>}
                    {discount > 0 && <span className="px-2 py-0.5 rounded-md bg-highlight/90 text-white text-[9px] font-bold backdrop-blur-sm">-{discount}%</span>}
                    {product.lowStock && <span className="px-2 py-0.5 rounded-md bg-orange-500/90 text-white text-[9px] font-bold animate-pulse backdrop-blur-sm">Low Stock</span>}
                </div>

                {/* Top-right tech badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {product.model3DUrl && (
                        <span className="w-7 h-7 rounded-lg bg-purple-500/80 backdrop-blur-sm flex items-center justify-center text-xs" title="3D Interactive">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </span>
                    )}
                    {product.arEnabled && (
                        <span className="w-7 h-7 rounded-lg bg-blue-500/80 backdrop-blur-sm flex items-center justify-center text-xs" title={`AR ${product.arType}`}>
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </span>
                    )}
                    {product.crmInsights && (
                        <span className="w-7 h-7 rounded-lg bg-amber-500/80 backdrop-blur-sm flex items-center justify-center text-xs" title="CRM Insights">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </span>
                    )}
                    {product.isAuthenticated && (
                        <span className="w-7 h-7 rounded-lg bg-green-500/80 backdrop-blur-sm flex items-center justify-center text-xs" title="Blockchain Verified">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </span>
                    )}
                </div>

                {/* Live Viewers */}
                {product.liveViewers && product.liveViewers > 10 && (
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-white/90 tracking-wider">{product.liveViewers} viewing</span>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="absolute bottom-3 right-3 flex gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleQuickAdd}
                        className="w-10 h-10 rounded-xl bg-highlight text-white flex items-center justify-center shadow-lg hover:bg-highlight-light transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </motion.button>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-4">
                {/* Brand & Category */}
                <div className="flex items-center gap-2 mb-1.5">
                    {product.brand && <span className="text-[10px] font-medium text-highlight/70 uppercase tracking-wider">{product.brand}</span>}
                    <span className="text-[10px] text-white/30">·</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">{product.category}</span>
                </div>

                <h3 className="font-semibold text-white leading-tight mb-2 truncate group-hover:text-highlight transition-colors text-sm">{product.name}</h3>

                {/* Color swatches */}
                {product.colors?.length > 0 && (
                    <div className="flex gap-1 mb-3">
                        {product.colors.slice(0, 4).map(c => (
                            <div key={c.hex} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c.hex }} />
                        ))}
                        {product.colors.length > 4 && <span className="text-[10px] text-white/30 self-center ml-1">+{product.colors.length - 4}</span>}
                    </div>
                )}

                {/* Price & Rating */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-lg font-bold text-white">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice && (
                            <span className="ml-2 text-xs text-white/30 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-xs text-white/60">{product.rating}</span>
                        <span className="text-[10px] text-white/30">({product.reviewCount})</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
