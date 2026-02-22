import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Product360Viewer: Interactive 360-degree product preview.
 * Allows users to drag horizontally to spin the product (simulated with CSS/Image rotation).
 */
export default function Product360Viewer({ images }: { images: string[] }) {
    const [index, setIndex] = useState(0);
    const startX = useRef(0);

    const handleDrag = (e: any) => {
        const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const diff = x - startX.current;
        if (Math.abs(diff) > 10) {
            const step = diff > 0 ? -1 : 1;
            setIndex(prev => (prev + step + images.length) % images.length);
            startX.current = x;
        }
    };

    return (
        <div className="space-y-4">
            <div
                className="aspect-square bg-white/5 rounded-3xl overflow-hidden cursor-move relative touch-none"
                onMouseDown={e => startX.current = e.clientX}
                onMouseMove={e => e.buttons === 1 && handleDrag(e)}
                onTouchStart={e => startX.current = e.touches[0].clientX}
                onTouchMove={handleDrag}
            >
                <div className="absolute inset-0 border-[20px] border-transparent border-t-white/5 border-b-white/5 pointer-events-none" />

                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full p-8 flex items-center justify-center"
                >
                    <img
                        src={images[index] || images[0]}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        alt="Product 360 view"
                        draggable={false}
                    />
                </motion.div>

                {/* HUD UI */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3">
                    <div className="flex gap-1">
                        {images.map((_, i) => (
                            <div key={i} className={`w-1 h-1 rounded-full ${i === index ? 'bg-highlight' : 'bg-white/20'}`} />
                        ))}
                    </div>
                    <span className="text-[8px] font-heading text-white/50 uppercase tracking-widest">Drag to Rotate</span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${i === index ? 'border-highlight' : 'border-transparent opacity-50'}`}
                    >
                        <img src={img} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
