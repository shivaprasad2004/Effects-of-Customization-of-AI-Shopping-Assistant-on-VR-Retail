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

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={handleOpenDetail}
            className="glass-card overflow-hidden group cursor-pointer"
        >
            {/* Product Image */}
            <div className="aspect-[4/5] relative bg-white/5 overflow-hidden">
                <img
                    src={product.thumbnailUrl || product.images[0] || 'https://via.placeholder.com/400x500?text=Product'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.newArrival && <span className="badge-success text-[10px]">NEW</span>}
                    {product.isAuthenticated && <span className="badge-highlight text-[10px]">VERIFIED</span>}
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                        onClick={handleQuickAdd}
                        className="w-10 h-10 rounded-full bg-highlight text-white flex items-center justify-center shadow-glow-pink hover:scale-110 transition-transform"
                    >
                        🛒
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:scale-110 transition-transform">
                        👁️
                    </button>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-4">
                <p className="text-[10px] font-heading text-white/40 uppercase tracking-widest mb-1">{product.category}</p>
                <h3 className="font-bold text-white leading-tight mb-2 truncate group-hover:text-highlight transition-colors">{product.name}</h3>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-white">${product.price}</span>
                        {product.originalPrice && (
                            <span className="text-xs text-white/30 line-through">${product.originalPrice}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <span className="text-yellow-400">★</span>
                        <span className="text-white/70">{product.rating}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
