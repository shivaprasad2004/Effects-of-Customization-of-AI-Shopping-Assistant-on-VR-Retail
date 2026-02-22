import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useEffect, useState } from 'react';

/**
 * MiniMap: A 2D top-down view of the VR store.
 * Displays zone boundaries, entrance, and real-time player position.
 */
export default function MiniMap() {
    const { showMiniMap, playerPose } = useSelector((state: RootState) => state.ui);
    const [playerPos, setPlayerPos] = useState({ x: 50, y: 50 });

    // Map 3D (-50 to 50) coordinates to 2D (0 to 100) percentage
    useEffect(() => {
        const x = ((playerPose.x + 50) / 100) * 100;
        const y = ((playerPose.z + 50) / 100) * 100;
        setPlayerPos({ x, y });
    }, [playerPose.x, playerPose.z]);

    if (!showMiniMap) return null;

    const zones = [
        { id: 'fashion', label: 'Fashion', x: 0, y: 0, w: 50, h: 50, color: 'bg-highlight/20' },
        { id: 'electronics', label: 'Electronics', x: 50, y: 0, w: 50, h: 50, color: 'bg-accent/20' },
        { id: 'furniture', label: 'Furniture', x: 0, y: 50, w: 50, h: 50, color: 'bg-emerald-500/10' },
        { id: 'checkout', label: 'Checkout', x: 50, y: 50, w: 50, h: 50, color: 'bg-amber-500/10' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-48 h-48 glass-card border-white/20 p-2 relative overflow-hidden"
        >
            <div className="w-full h-full bg-primary/40 rounded-lg relative overflow-hidden border border-white/10">
                {/* Zone Boundaries */}
                {zones.map(z => (
                    <div
                        key={z.id}
                        className={`absolute ${z.color} border border-white/5 flex items-center justify-center`}
                        style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%` }}
                    >
                        <span className="text-[6px] font-heading text-white/20 uppercase tracking-tighter">{z.label}</span>
                    </div>
                ))}

                {/* Entrance Marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[8px] border border-white/20">
                    L
                </div>

                {/* Player Cursor */}
                <motion.div
                    className="absolute w-3 h-3 z-10"
                    style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
                >
                    {/* Animated dot and pulse */}
                    <div className="w-full h-full bg-white rounded-full shadow-glow-blue relative">
                        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75" />
                    </div>
                    {/* Direction triangle */}
                    <motion.div
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-white"
                        style={{ transform: `translateX(-50%) rotate(${playerPose.rotY}rad)` }}
                    />
                </motion.div>
            </div>

            {/* Zoom / Info */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-highlight animate-pulse" />
                <span className="text-[7px] font-heading text-white/50 tracking-widest uppercase">GPS Synced</span>
            </div>
        </motion.div>
    );
}
