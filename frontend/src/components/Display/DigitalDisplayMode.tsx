import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '../../store/productSlice';

interface Props {
    product: Product;
    onClose: () => void;
}

export default function DigitalDisplayMode({ product, onClose }: Props) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const slides = product.images?.length ? product.images : [product.thumbnailUrl || ''];

    const nextSlide = useCallback(() => {
        setCurrentSlide(i => (i + 1) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(nextSlide, 8000);
        return () => clearInterval(timer);
    }, [isPaused, nextSlide]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

    const specs = Object.entries(product.specifications || {}).slice(0, 6);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0A0A1A] via-[#1A1A2E] to-[#0D0D1A] overflow-hidden"
            onClick={() => setIsPaused(p => !p)}
        >
            {/* Close Button */}
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-6 right-6 z-50 glass-card w-12 h-12 flex items-center justify-center text-white/60 hover:text-white text-2xl transition-all hover:bg-white/10">
                ✕
            </button>

            {/* Kiosk Badge */}
            <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-highlight animate-pulse" />
                    <span className="text-sm font-['Orbitron'] text-highlight">DIGITAL DISPLAY</span>
                </div>
                {product.isAuthenticated && (
                    <div className="glass-card px-3 py-2 flex items-center gap-2">
                        <span className="text-green-400">🔗</span>
                        <span className="text-xs text-green-400">Blockchain Verified</span>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="h-full flex">
                {/* Left: Image Carousel */}
                <div className="w-1/2 h-full relative flex items-center justify-center p-12">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentSlide}
                            src={slides[currentSlide]}
                            alt={product.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-2xl"
                        />
                    </AnimatePresence>

                    {/* Slide indicators */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-highlight' : 'w-1.5 bg-white/30'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Product Info */}
                <div className="w-1/2 h-full flex flex-col justify-center p-12 space-y-8">
                    {/* Brand & Name */}
                    <div>
                        {product.brand && <p className="text-highlight text-sm font-medium tracking-widest uppercase mb-2">{product.brand}</p>}
                        <h1 className="font-['Orbitron'] text-4xl lg:text-5xl text-white font-bold leading-tight">{product.name}</h1>
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-4">
                        <span className="text-5xl font-bold text-white">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice && (
                            <>
                                <span className="text-2xl text-white/30 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                                <span className="px-3 py-1 bg-highlight/20 text-highlight rounded-full text-sm font-bold">-{discount}%</span>
                            </>
                        )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} className={`text-xl ${s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-white/20'}`}>★</span>
                            ))}
                        </div>
                        <span className="text-white/60 text-lg">{product.rating} ({product.reviewCount} reviews)</span>
                    </div>

                    {/* Description */}
                    <p className="text-white/70 text-lg leading-relaxed">{product.description}</p>

                    {/* Specs Grid */}
                    {specs.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            {specs.map(([key, value]) => (
                                <div key={key} className="glass-card p-3">
                                    <p className="text-xs text-white/40 uppercase tracking-wider">{key}</p>
                                    <p className="text-sm text-white font-medium mt-0.5">{String(value)}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Colors */}
                    {product.colors?.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-white/50">Available in:</span>
                            <div className="flex gap-2">
                                {product.colors.map(c => (
                                    <div key={c.hex} className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: c.hex }} title={c.name} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-2">
                        {product.arEnabled && <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/20">AR {product.arType === 'try-on' ? 'Try-On' : product.arType === 'room-placement' ? 'Room View' : '360°'}</span>}
                        {product.displayMode === 'configurator' && <span className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium border border-purple-500/20">3D Configurator</span>}
                        {product.model3DUrl && <span className="px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/20">3D Interactive</span>}
                        {product.isAuthenticated && <span className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/20">Blockchain Verified</span>}
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="flex items-center gap-4 glass-card p-4">
                        <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center">
                            <div className="grid grid-cols-5 gap-0.5 w-14 h-14">
                                {Array.from({ length: 25 }).map((_, i) => (
                                    <div key={i} className={`${Math.random() > 0.4 ? 'bg-black' : 'bg-white'}`} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-white font-medium">Scan to explore</p>
                            <p className="text-xs text-white/50 mt-1">View in AR on your device</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            {!isPaused && (
                <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-highlight"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
                    key={currentSlide}
                />
            )}
        </motion.div>
    );
}
