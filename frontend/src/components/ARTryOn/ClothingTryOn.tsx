import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * ClothingTryOn: Simulated AR experience for clothing.
 * Uses a webcam feed overlay with a 2D/3D cloth asset (mocked).
 */
export default function ClothingTryOn({ product }: { product: any }) {
    const [active, setActive] = useState(false);

    return (
        <div className="space-y-4">
            <div className="aspect-[3/4] bg-black rounded-3xl overflow-hidden relative group">
                {!active ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 bg-highlight/20 rounded-full flex items-center justify-center text-3xl mb-4">🤳</div>
                        <h4 className="font-heading text-white mb-2">Virtual Mirror</h4>
                        <p className="text-xs text-white/40 mb-6 font-heading uppercase tracking-widest">Enable camera to see how this fits</p>
                        <button onClick={() => setActive(true)} className="btn-primary px-8">Launch AR</button>
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
                        <div className="absolute inset-x-0 top-0 h-1 bg-highlight/30 z-20 animate-scan pointer-events-none" />

                        {/* Mock Webcam/AR Feed */}
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="w-48 h-64 border-2 border-dashed border-highlight/40 rounded-full flex items-center justify-center text-6xl opacity-30"
                            >
                                👤
                            </motion.div>
                        </div>

                        {/* Asset Overlay */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <img src={product.thumbnailUrl} className="w-32 h-32 object-contain shadow-glow-pink" />
                        </motion.div>

                        <button onClick={() => setActive(false)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full z-30">✕</button>
                    </>
                )}
            </div>

            <div className="flex gap-2">
                {['S', 'M', 'L', 'XL'].map(s => (
                    <button key={s} className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-highlight/10 transition-colors uppercase">{s}</button>
                ))}
            </div>
        </div>
    );
}
