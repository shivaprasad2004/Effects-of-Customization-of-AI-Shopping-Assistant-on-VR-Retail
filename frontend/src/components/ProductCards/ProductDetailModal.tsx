import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { closeModal } from '../../store/uiSlice';
import { addToCart } from '../../store/productSlice';
import { useBlockchain } from '../../hooks/useBlockchain';

export default function ProductDetailModal() {
    const dispatch = useDispatch();
    const { activeModal } = useSelector((state: RootState) => state.ui);
    const { selectedProduct } = useSelector((state: RootState) => state.product);
    const { verifyProduct, isConnecting } = useBlockchain();

    const isOpen = activeModal === 'productDetail' && selectedProduct;

    if (!selectedProduct) return null;

    const handleVerify = async () => {
        const res = await verifyProduct(selectedProduct._id);
        if (res?.verified) {
            alert(`✅ Authentic! Certificate Hash: ${res.certificateHash}`);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => dispatch(closeModal())}
                        className="absolute inset-0 bg-primary/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-4xl glass-card-elevated overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                    >
                        {/* Left: Media Area */}
                        <div className="w-full md:w-1/2 bg-white/5 relative">
                            <img
                                src={selectedProduct.images[0]}
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="badge-highlight">GROUP {selectedProduct.vrZone?.toUpperCase()}</span>
                                {selectedProduct.isAuthenticated && <span className="badge-success">CERTIFIED</span>}
                            </div>
                        </div>

                        {/* Right: Info Area */}
                        <div className="w-full md:w-1/2 p-8 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="heading-lg mb-1">{selectedProduct.name}</h2>
                                    <p className="text-white/40 text-sm font-heading">{selectedProduct.category.toUpperCase()} · {selectedProduct.brand}</p>
                                </div>
                                <button onClick={() => dispatch(closeModal())} className="text-white/30 hover:text-white">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                                <div>
                                    <span className="text-3xl font-black text-white">${selectedProduct.price}</span>
                                    {selectedProduct.originalPrice && (
                                        <span className="ml-3 text-lg text-white/30 line-through">${selectedProduct.originalPrice}</span>
                                    )}
                                </div>

                                <p className="text-white/60 leading-relaxed text-sm">
                                    {selectedProduct.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-[10px] text-white/40 uppercase mb-1">Authenticity</p>
                                        <p className="text-xs text-white">Blockchain Secured</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-[10px] text-white/40 uppercase mb-1">Rating</p>
                                        <p className="text-xs text-white">⭐ {selectedProduct.rating} ({selectedProduct.reviewCount} Reviews)</p>
                                    </div>
                                </div>

                                {/* Dynamic specs */}
                                <div className="space-y-2">
                                    <p className="text-[10px] text-white/40 uppercase mb-2">Specifications</p>
                                    {Object.entries(selectedProduct.specifications).map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-xs py-1 border-b border-white/5">
                                            <span className="text-white/50 capitalize">{k}</span>
                                            <span className="text-white">{v as any}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => dispatch(addToCart({ product: selectedProduct }))}
                                        className="btn-primary flex-1"
                                    >
                                        Add to Cart 🛒
                                    </button>
                                    <button
                                        onClick={handleVerify}
                                        disabled={isConnecting}
                                        className="btn-secondary px-6"
                                    >
                                        📜 Verify
                                    </button>
                                </div>
                                <p className="text-[9px] text-center text-white/30 uppercase tracking-widest">
                                    Available for AI-customized 3D Try-On in VR Store
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
