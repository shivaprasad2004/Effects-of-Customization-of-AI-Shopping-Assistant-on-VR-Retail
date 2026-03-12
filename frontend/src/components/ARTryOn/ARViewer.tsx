import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, RoundedBox } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface Props {
    productName: string;
    arType: 'try-on' | 'room-placement' | '360-view';
    productImages: string[];
    model3DUrl?: string;
    defaultColor?: string;
}

function RotatingProduct({ color }: { color: string }) {
    const ref = useRef<THREE.Mesh>(null);
    return (
        <RoundedBox ref={ref} args={[1.5, 1.5, 1.5]} radius={0.1} smoothness={4} position={[0, 0, 0]} castShadow>
            <meshPhysicalMaterial
                color={color}
                roughness={0.3}
                metalness={0.3}
                clearcoat={0.6}
                clearcoatRoughness={0.15}
                envMapIntensity={1.2}
            />
        </RoundedBox>
    );
}

export default function ARViewer({ productName, arType, productImages, model3DUrl, defaultColor = '#E94560' }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [productPosition, setProductPosition] = useState({ x: 50, y: 50 });
    const [productScale, setProductScale] = useState(1);
    const [productRotation, setProductRotation] = useState(0);
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: arType === 'room-placement' ? 'environment' : 'user', width: 1280, height: 720 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch {
            setError('Camera access denied. Showing demo mode.');
        }
    }, [arType]);

    const stopCamera = useCallback(() => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    }, []);

    useEffect(() => () => stopCamera(), [stopCamera]);

    // Auto-rotate for 360 view
    useEffect(() => {
        if (arType === '360-view') {
            const interval = setInterval(() => setCurrentImageIdx(i => (i + 1) % Math.max(productImages.length, 1)), 3000);
            return () => clearInterval(interval);
        }
    }, [arType, productImages.length]);

    const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setProductPosition({
            x: ((clientX - rect.left) / rect.width) * 100,
            y: ((clientY - rect.top) / rect.height) * 100,
        });
    };

    if (arType === '360-view') {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-['Orbitron'] text-lg text-white">360° View — {productName}</h3>
                    <div className="glass-card px-3 py-1 text-xs text-highlight">360° Interactive</div>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-secondary border border-glass-border" style={{ height: 450 }}>
                    <Canvas shadows camera={{ position: [4, 3, 4], fov: 40 }}>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                        <pointLight position={[-3, 2, -2]} intensity={0.4} color="#E94560" />
                        <Suspense fallback={null}>
                            <RotatingProduct color={defaultColor} />
                            <ContactShadows position={[0, -0.75, 0]} opacity={0.5} scale={5} blur={2.5} />
                            <Environment preset="studio" />
                        </Suspense>
                        <OrbitControls autoRotate autoRotateSpeed={2} enablePan={false} />
                    </Canvas>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {productImages.map((_, i) => (
                            <button key={i} onClick={() => setCurrentImageIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentImageIdx ? 'bg-highlight scale-125' : 'bg-white/30'}`} />
                        ))}
                    </div>
                </div>
                <p className="text-xs text-white/40 text-center">Drag to rotate • Scroll to zoom • Powered by Three.js</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-['Orbitron'] text-lg text-white">
                    {arType === 'try-on' ? 'AR Try-On' : 'AR Room Placement'} — {productName}
                </h3>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cameraActive ? stopCamera : startCamera}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${cameraActive ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-highlight/20 text-highlight border border-highlight/30'}`}
                >
                    {cameraActive ? 'Stop Camera' : 'Start AR Camera'}
                </motion.button>
            </div>

            <div
                ref={containerRef}
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-secondary border border-glass-border cursor-crosshair"
                style={{ height: 450 }}
                onMouseMove={handleDrag}
                onTouchMove={handleDrag}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
            >
                {/* Camera Feed */}
                <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`} />

                {/* Fallback background - context-specific */}
                {!cameraActive && (
                    <div className={`absolute inset-0 flex items-center justify-center ${
                        arType === 'room-placement'
                            ? 'bg-gradient-to-br from-amber-900/60 via-orange-900/40 to-yellow-900/30'
                            : 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900'
                    }`}>
                        <div className="text-center space-y-3">
                            <div className="text-6xl">📷</div>
                            <p className="text-white/60 text-sm">Start camera to experience AR</p>
                            <p className="text-white/40 text-xs">or drag the product overlay below</p>
                        </div>
                    </div>
                )}

                {/* Room placement grid overlay */}
                {arType === 'room-placement' && (
                    <div
                        className="absolute inset-0 pointer-events-none z-[1]"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(233,69,96,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(233,69,96,0.08) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />
                )}

                {/* Try-on: scan line animation */}
                {arType === 'try-on' && (
                    <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
                        <div
                            className="absolute left-0 right-0 h-0.5"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(233,69,96,0.6), transparent)',
                                animation: 'arScanLine 2.5s ease-in-out infinite',
                            }}
                        />
                        <style>{`
                            @keyframes arScanLine {
                                0% { top: -2px; }
                                50% { top: 100%; }
                                100% { top: -2px; }
                            }
                        `}</style>
                    </div>
                )}

                {/* Try-on: body silhouette overlay for positioning guidance */}
                {arType === 'try-on' && !cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
                        <svg width="160" height="320" viewBox="0 0 160 320" fill="none" className="opacity-15">
                            <ellipse cx="80" cy="50" rx="30" ry="38" stroke="white" strokeWidth="1.5" strokeDasharray="6 4" />
                            <path d="M50 88 C50 88 30 100 20 140 L20 200 L55 200 L55 310 L105 310 L105 200 L140 200 L140 140 C130 100 110 88 110 88" stroke="white" strokeWidth="1.5" strokeDasharray="6 4" />
                        </svg>
                    </div>
                )}

                {/* Product Overlay */}
                <motion.div
                    className="absolute pointer-events-none"
                    style={{
                        left: `${productPosition.x}%`,
                        top: `${productPosition.y}%`,
                        transform: `translate(-50%, -50%) scale(${productScale}) rotate(${productRotation}deg)`,
                    }}
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                >
                    <img
                        src={productImages[0]}
                        alt={productName}
                        className="w-48 h-48 object-contain drop-shadow-2xl"
                        style={{ filter: 'drop-shadow(0 0 20px rgba(233,69,96,0.3))' }}
                    />
                </motion.div>

                {/* Controls overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                    <button onClick={() => setProductScale(s => Math.max(0.3, s - 0.1))} className="glass-card w-10 h-10 flex items-center justify-center text-white text-lg hover:bg-white/10">−</button>
                    <button onClick={() => setProductScale(1)} className="glass-card px-4 h-10 flex items-center justify-center text-white/60 text-xs hover:bg-white/10">Reset</button>
                    <button onClick={() => setProductScale(s => Math.min(3, s + 0.1))} className="glass-card w-10 h-10 flex items-center justify-center text-white text-lg hover:bg-white/10">+</button>
                    {arType === 'room-placement' && (
                        <button
                            onClick={() => setProductRotation(r => r + 45)}
                            className="glass-card w-10 h-10 flex items-center justify-center text-white text-lg hover:bg-white/10"
                            title="Rotate 45°"
                        >
                            ↻
                        </button>
                    )}
                </div>

                {/* AR Badge */}
                <div className="absolute top-4 left-4 glass-card px-3 py-1.5 text-xs font-medium">
                    <span className="text-highlight">AR</span>
                    <span className="text-white/60 ml-1">{arType === 'try-on' ? 'Virtual Try-On' : 'Room Placement'}</span>
                </div>
            </div>

            {error && <p className="text-xs text-yellow-400/80">{error}</p>}
            <p className="text-xs text-white/40 text-center">Click and drag to reposition • Use +/− to resize</p>
        </div>
    );
}
