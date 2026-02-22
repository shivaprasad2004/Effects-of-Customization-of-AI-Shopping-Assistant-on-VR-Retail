import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { removeFromCompare, clearCompare } from '../../store/productSlice';
import { closeModal } from '../../store/uiSlice';

export default function ProductComparison() {
    const dispatch = useDispatch();
    const { compareList } = useSelector((state: RootState) => state.product);
    const { activeModal } = useSelector((state: RootState) => state.ui);

    const isOpen = activeModal === 'comparison';

    if (compareList.length === 0) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => dispatch(closeModal())}
                        className="absolute inset-0 bg-primary/90 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="w-full max-w-6xl glass-card-elevated p-8 overflow-x-auto"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="heading-lg text-2xl">Product Analysis</h2>
                            <div className="flex gap-4">
                                <button onClick={() => dispatch(clearCompare())} className="text-xs text-white/40 hover:text-highlight uppercase tracking-widest font-heading">Clear All</button>
                                <button onClick={() => dispatch(closeModal())} className="text-white/30 hover:text-white">✕</button>
                            </div>
                        </div>

                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr>
                                    <th className="p-4 border-b border-white/10 text-[10px] font-heading text-white/30 uppercase tracking-widest">Feature</th>
                                    {compareList.map(p => (
                                        <th key={p._id} className="p-4 border-b border-white/10 w-64">
                                            <div className="flex items-center gap-3">
                                                <img src={p.thumbnailUrl} className="w-12 h-12 rounded-lg object-cover" />
                                                <div>
                                                    <p className="text-white font-bold text-sm truncate w-40">{p.name}</p>
                                                    <button onClick={() => dispatch(removeFromCompare(p._id))} className="text-[10px] text-highlight hover:underline">Remove</button>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr>
                                    <td className="p-4 border-b border-white/5 font-bold text-white/60">Price</td>
                                    {compareList.map(p => <td key={p._id} className="p-4 border-b border-white/5 text-highlight font-black">${p.price}</td>)}
                                </tr>
                                <tr>
                                    <td className="p-4 border-b border-white/5 font-bold text-white/60">Rating</td>
                                    {compareList.map(p => <td key={p._id} className="p-4 border-b border-white/5 text-white">⭐ {p.rating}</td>)}
                                </tr>
                                <tr>
                                    <td className="p-4 border-b border-white/5 font-bold text-white/60">Brand</td>
                                    {compareList.map(p => <td key={p._id} className="p-4 border-b border-white/5 text-white/70">{p.brand}</td>)}
                                </tr>
                                {/* Map dynamic specifications keys */}
                                {Array.from(new Set(compareList.flatMap(p => Object.keys(p.specifications)))).map(key => (
                                    <tr key={key}>
                                        <td className="p-4 border-b border-white/5 font-bold text-white/60 capitalize">{key}</td>
                                        {compareList.map(p => (
                                            <td key={p._id} className="p-4 border-b border-white/5 text-white/40 italic">
                                                {(p.specifications as any)[key] || '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
