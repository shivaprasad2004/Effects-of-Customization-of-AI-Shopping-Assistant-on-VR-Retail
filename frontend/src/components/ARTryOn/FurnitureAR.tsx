import { motion } from 'framer-motion';

export default function FurnitureAR({ product }: { product: any }) {
    return (
        <div className="space-y-6">
            <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden relative border border-white/10 group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800')] bg-cover opacity-60 grayscale" />

                <div className="absolute inset-0 border-[2px] border-highlight/20 m-4 pointer-events-none" />
                <div className="absolute top-8 left-8 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-highlight animate-pulse" />
                    <p className="text-[10px] font-heading text-white tracking-widest uppercase bg-black/50 px-3 py-1 rounded-lg">Spatial Mapper Active</p>
                </div>

                <motion.div
                    drag
                    dragConstraints={{ top: -50, left: -50, right: 50, bottom: 50 }}
                    className="absolute inset-0 flex items-center justify-center cursor-move"
                >
                    <div className="relative">
                        <img src={product.thumbnailUrl} className="w-48 h-48 object-contain drop-shadow-cyber" />
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/40 blur-xl rounded-full -z-10" />
                    </div>
                </motion.div>

                <div className="absolute bottom-8 right-8 flex gap-3">
                    <button className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-colors">🔄</button>
                    <button className="w-10 h-10 rounded-xl bg-highlight flex items-center justify-center text-white shadow-glow-pink">📸</button>
                </div>
            </div>

            <div className="p-4 glass-card bg-highlight/5 border-highlight/10">
                <h4 className="text-xs font-heading text-highlight mb-2 uppercase tracking-widest">Spatial Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[9px] text-white/30 uppercase">Dimensions</p>
                        <p className="text-sm text-white">{product.specifications.dimensions || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-white/30 uppercase">Placement</p>
                        <p className="text-sm text-white">Floor / Wall</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
