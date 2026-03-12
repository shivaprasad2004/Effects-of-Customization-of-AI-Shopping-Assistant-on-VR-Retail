import React, { useState, useRef, Suspense, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    Environment,
    ContactShadows,
    Html,
    RoundedBox,
    Sparkles,
    Edges,
    useProgress,
    Float,
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import type { ConfiguratorOptions } from '../../store/productSlice';

interface Props {
    productName: string;
    configuratorOptions: ConfiguratorOptions;
    defaultColor?: string;
    defaultMaterial?: string;
    productImages?: string[];
    onConfigChange?: (config: { color: string; material: string; size: string }) => void;
}

type ViewAngle = 'free' | 'front' | 'back' | 'side' | 'top';

// ── Animated Camera ──
function AnimatedCamera({ targetPos }: { targetPos: [number, number, number] | null }) {
    const { camera } = useThree();
    const target = useRef<[number, number, number] | null>(null);

    useEffect(() => {
        if (targetPos) target.current = targetPos;
    }, [targetPos]);

    useFrame(() => {
        if (target.current) {
            camera.position.lerp(new THREE.Vector3(...target.current), 0.05);
            if (camera.position.distanceTo(new THREE.Vector3(...target.current)) < 0.05) {
                target.current = null;
            }
        }
    });
    return null;
}

// ── Product with configurable material ──
function ConfigurableProduct({
    imageUrl,
    color,
    roughness,
    metalness,
    autoRotate,
    showEdges,
}: {
    imageUrl: string;
    color: string;
    roughness: number;
    metalness: number;
    autoRotate: boolean;
    showEdges: boolean;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useMemo(() => {
        if (!imageUrl) return;
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = 'anonymous';
        loader.load(imageUrl, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            setTexture(tex);
        });
    }, [imageUrl]);

    useFrame((_, delta) => {
        if (groupRef.current && autoRotate) groupRef.current.rotation.y += delta * 0.3;
    });

    return (
        <group ref={groupRef}>
            {/* Front face - the product image */}
            <mesh position={[0, 0.6, 0.01]} castShadow>
                <planeGeometry args={[2.0, 2.4]} />
                {texture ? (
                    <meshStandardMaterial map={texture} transparent color={color} roughness={0.2} metalness={0} side={THREE.FrontSide} />
                ) : (
                    <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
                )}
            </mesh>

            {/* Back face */}
            <mesh position={[0, 0.6, -0.01]} rotation={[0, Math.PI, 0]} castShadow>
                <planeGeometry args={[2.0, 2.4]} />
                {texture ? (
                    <meshStandardMaterial map={texture} transparent color={color} roughness={0.2} metalness={0} side={THREE.FrontSide} />
                ) : (
                    <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
                )}
            </mesh>

            {showEdges && (
                <mesh position={[0, 0.6, 0]}>
                    <boxGeometry args={[2.05, 2.45, 0.04]} />
                    <meshStandardMaterial visible={false} />
                    <Edges threshold={15} color={color} />
                </mesh>
            )}
        </group>
    );
}

function LoadingIndicator() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 relative">
                    <div className="w-10 h-10 border-2 border-white/20 border-t-[#E94560] rounded-full animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">{Math.round(progress)}%</span>
                </div>
                <span className="text-white/60 text-xs">Loading 3D...</span>
            </div>
        </Html>
    );
}

// ── Material Preview Swatch ──
function MaterialSwatch({ roughness, metalness, color }: { roughness: number; metalness: number; color: string }) {
    return (
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
            <Canvas camera={{ position: [0, 0, 2], fov: 40 }} gl={{ antialias: true }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 2, 2]} intensity={1} />
                <mesh>
                    <sphereGeometry args={[0.6, 32, 32]} />
                    <meshPhysicalMaterial color={color} roughness={roughness} metalness={metalness} clearcoat={0.3} />
                </mesh>
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}

const VIEW_ANGLES: { id: ViewAngle; label: string; icon: string; pos: [number, number, number] }[] = [
    { id: 'free', label: 'Free', icon: '🎯', pos: [0, 1.5, 4.5] },
    { id: 'front', label: 'Front', icon: '⬆', pos: [0, 0.6, 4] },
    { id: 'back', label: 'Back', icon: '⬇', pos: [0, 0.6, -4] },
    { id: 'side', label: 'Side', icon: '➡', pos: [4, 0.6, 0] },
    { id: 'top', label: 'Top', icon: '🔝', pos: [0, 5, 0.5] },
];

export default function Product3DConfigurator({
    productName,
    configuratorOptions,
    defaultColor,
    defaultMaterial,
    productImages,
    onConfigChange,
}: Props) {
    const [selectedColor, setSelectedColor] = useState(
        configuratorOptions.colors[0] || { name: 'Default', hex: defaultColor || '#FFFFFF' }
    );
    const [selectedMaterial, setSelectedMaterial] = useState(
        configuratorOptions.materials[0] || { name: 'Standard', texture: 'standard', roughness: 0.5, metalness: 0 }
    );
    const [selectedSize, setSelectedSize] = useState(configuratorOptions.sizes?.[0] || '');
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [autoRotate, setAutoRotate] = useState(true);
    const [showEdges, setShowEdges] = useState(false);
    const [envPreset, setEnvPreset] = useState<'city' | 'studio' | 'sunset' | 'warehouse'>('city');
    const [viewAngle, setViewAngle] = useState<ViewAngle>('free');
    const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null);
    const [configHistory, setConfigHistory] = useState<string[]>([]);

    const handleColorChange = (c: typeof selectedColor) => {
        setSelectedColor(c);
        onConfigChange?.({ color: c.hex, material: selectedMaterial.name, size: selectedSize });
        setConfigHistory(prev => [...prev.slice(-9), `Color → ${c.name}`]);
    };

    const handleMaterialChange = (m: typeof selectedMaterial) => {
        setSelectedMaterial(m);
        onConfigChange?.({ color: selectedColor.hex, material: m.name, size: selectedSize });
        setConfigHistory(prev => [...prev.slice(-9), `Material → ${m.name}`]);
    };

    const handleSizeChange = (s: string) => {
        setSelectedSize(s);
        onConfigChange?.({ color: selectedColor.hex, material: selectedMaterial.name, size: s });
        setConfigHistory(prev => [...prev.slice(-9), `Size → ${s}`]);
    };

    const currentImage = productImages?.[selectedImageIdx] || productImages?.[0] || '';

    const envOptions: { id: typeof envPreset; label: string; icon: string }[] = [
        { id: 'city', label: 'City', icon: '🏙️' },
        { id: 'studio', label: 'Studio', icon: '📸' },
        { id: 'sunset', label: 'Sunset', icon: '🌅' },
        { id: 'warehouse', label: 'Warehouse', icon: '🏭' },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* ── 3D Viewer ── */}
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0a0a1a] to-[#141428] border border-white/5 group" style={{ minHeight: 480 }}>
                <Canvas shadows camera={{ position: [0, 1.5, 4.5], fov: 40 }} gl={{ antialias: true, powerPreference: 'high-performance' }} dpr={[1, 2]}>
                    <fog attach="fog" args={['#0a0a1a', 8, 22]} />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow shadow-mapSize={1024} />
                    <directionalLight position={[-3, 4, -3]} intensity={0.3} color="#E94560" />
                    <spotLight position={[0, 6, 0]} intensity={0.4} angle={0.4} penumbra={0.5} />
                    <pointLight position={[2, 1, 2]} intensity={0.2} color="#4FC3F7" />
                    <pointLight position={[-2, 1, -2]} intensity={0.2} color={selectedColor.hex} />

                    <AnimatedCamera targetPos={cameraTarget} />

                    <Suspense fallback={<LoadingIndicator />}>
                        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.15}>
                            {currentImage ? (
                                <ConfigurableProduct
                                    imageUrl={currentImage}
                                    color={selectedColor.hex}
                                    roughness={selectedMaterial.roughness}
                                    metalness={selectedMaterial.metalness}
                                    autoRotate={autoRotate}
                                    showEdges={showEdges}
                                />
                            ) : (
                                <mesh position={[0, 0.5, 0]}>
                                    <boxGeometry args={[1.5, 1.8, 0.5]} />
                                    <meshPhysicalMaterial color={selectedColor.hex} roughness={selectedMaterial.roughness} metalness={selectedMaterial.metalness} clearcoat={0.4} />
                                    {showEdges && <Edges threshold={15} color={selectedColor.hex} />}
                                </mesh>
                            )}
                        </Float>
                        <ContactShadows position={[0, -0.65, 0]} opacity={0.6} scale={4} blur={2.5} />
                        <Sparkles count={15} scale={4} size={1} speed={0.2} color={selectedColor.hex} opacity={0.2} />
                        <Environment preset={envPreset} />
                    </Suspense>

                    <OrbitControls enablePan={false} minDistance={2} maxDistance={8} target={[0, 0.5, 0]} enableDamping dampingFactor={0.05} />
                </Canvas>

                {/* Active config overlay (top-left) */}
                <div className="absolute top-4 left-4 space-y-2 z-10">
                    <div className="px-3 py-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#E94560] animate-pulse" />
                            <span className="text-xs font-bold text-white font-['Orbitron']">3D CONFIGURATOR</span>
                        </div>
                        <p className="text-white/70 text-xs mt-0.5">{productName}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: selectedColor.hex }} />
                        <span className="text-[10px] text-white/60">{selectedColor.name}</span>
                        {selectedMaterial.name !== 'Standard' && (
                            <>
                                <span className="text-white/20">|</span>
                                <span className="text-[10px] text-white/60">{selectedMaterial.name}</span>
                            </>
                        )}
                        {selectedSize && (
                            <>
                                <span className="text-white/20">|</span>
                                <span className="text-[10px] text-white/60">{selectedSize}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Controls (top-right) */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
                    <button onClick={() => setAutoRotate(a => !a)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs transition-all border backdrop-blur-md ${autoRotate ? 'bg-[#E94560]/20 border-[#E94560]/40 text-[#E94560]' : 'bg-black/40 border-white/10 text-white/50 hover:text-white/80'}`}
                        title="Auto-rotate">
                        {autoRotate ? '⏸' : '▶'}
                    </button>
                    <button onClick={() => setShowEdges(e => !e)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all border backdrop-blur-md ${showEdges ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-black/40 border-white/10 text-white/50 hover:text-white/80'}`}
                        title="Wireframe edges">
                        📐
                    </button>
                </div>

                {/* View angle buttons (bottom-left) */}
                <div className="absolute bottom-4 left-4 z-10 flex gap-1">
                    {VIEW_ANGLES.map(va => (
                        <button key={va.id} onClick={() => { setViewAngle(va.id); setCameraTarget(va.pos); }}
                            className={`px-2 py-1.5 rounded-lg text-[10px] transition-all border backdrop-blur-md ${viewAngle === va.id ? 'bg-[#E94560]/20 border-[#E94560]/40 text-[#E94560]' : 'bg-black/40 border-white/10 text-white/40 hover:text-white/70'}`}>
                            {va.icon}
                        </button>
                    ))}
                </div>

                {/* Environment (bottom-center) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1">
                    {envOptions.map(e => (
                        <button key={e.id} onClick={() => setEnvPreset(e.id)}
                            className={`px-2 py-1.5 rounded-lg text-[10px] transition-all border backdrop-blur-md ${envPreset === e.id ? 'bg-[#E94560]/20 border-[#E94560]/40 text-[#E94560]' : 'bg-black/40 border-white/10 text-white/40 hover:text-white/70'}`}>
                            {e.icon}
                        </button>
                    ))}
                </div>

                {/* Image selector (bottom-right) */}
                {productImages && productImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 z-10 flex gap-1.5">
                        {productImages.slice(0, 4).map((img, i) => (
                            <button key={i} onClick={() => setSelectedImageIdx(i)}
                                className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIdx === i ? 'border-[#E94560]' : 'border-transparent opacity-40 hover:opacity-70'}`}>
                                <img src={img} className="w-full h-full object-cover" alt={`View ${i + 1}`} />
                            </button>
                        ))}
                    </div>
                )}

                {/* Instructions (bottom-center overlay) */}
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-black/40 backdrop-blur rounded-full">
                    <span className="text-[8px] text-white/30 uppercase tracking-widest">Drag to rotate · Scroll to zoom</span>
                </div>
            </div>

            {/* ── Configuration Panel ── */}
            <div className="w-full lg:w-80 space-y-5">
                <div>
                    <h3 className="font-['Orbitron'] text-lg text-white">{productName}</h3>
                    <p className="text-xs text-white/35 mt-1">Customize color, material & size in real-time 3D</p>
                </div>

                {/* Color Picker */}
                <div>
                    <label className="text-sm text-white/60 mb-3 block flex items-center justify-between">
                        <span>Color</span>
                        <span className="text-[#E94560] text-xs font-medium">{selectedColor.name}</span>
                    </label>
                    <div className="flex gap-3 flex-wrap">
                        {configuratorOptions.colors.map((c) => (
                            <motion.button
                                key={c.hex}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleColorChange(c)}
                                className={`w-11 h-11 rounded-full border-2 transition-all duration-200 ${selectedColor.hex === c.hex ? 'border-[#E94560] ring-2 ring-[#E94560]/30 scale-110' : 'border-white/15 hover:border-white/30'}`}
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Material Picker (Enhanced with live 3D swatch) */}
                {configuratorOptions.materials.length > 0 && (
                    <div>
                        <label className="text-sm text-white/60 mb-3 block">Material</label>
                        <div className="space-y-2">
                            {configuratorOptions.materials.map((m) => (
                                <motion.button
                                    key={m.name}
                                    whileHover={{ x: 4 }}
                                    onClick={() => handleMaterialChange(m)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${selectedMaterial.name === m.name ? 'bg-[#E94560]/15 text-[#E94560] border border-[#E94560]/30' : 'bg-white/5 text-white/70 border border-transparent hover:bg-white/10'}`}
                                >
                                    <MaterialSwatch roughness={m.roughness} metalness={m.metalness} color={selectedColor.hex} />
                                    <div className="flex-1">
                                        <span className="block">{m.name}</span>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[10px] text-white/30">Rough: {m.roughness}</span>
                                            <span className="text-[10px] text-white/30">Metal: {m.metalness}</span>
                                        </div>
                                    </div>
                                    {selectedMaterial.name === m.name && (
                                        <span className="text-[#E94560] text-xs">✓</span>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Size Picker */}
                {configuratorOptions.sizes.length > 0 && (
                    <div>
                        <label className="text-sm text-white/60 mb-3 block flex items-center justify-between">
                            <span>Size</span>
                            {selectedSize && <span className="text-[#E94560] text-xs font-medium">{selectedSize}</span>}
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {configuratorOptions.sizes.map((s) => (
                                <motion.button
                                    key={s}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSizeChange(s)}
                                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${selectedSize === s ? 'bg-[#E94560] text-white shadow-[0_0_12px_rgba(233,69,96,0.3)]' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                                >
                                    {s}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Config History */}
                {configHistory.length > 0 && (
                    <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-widest mb-2 block">Recent Changes</label>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                            {configHistory.slice(-4).reverse().map((entry, i) => (
                                <div key={i} className="text-[10px] text-white/40 flex items-center gap-2">
                                    <div className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-[#E94560]' : 'bg-white/20'}`} />
                                    {entry}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tech Badge */}
                <div className="p-3 mt-4 bg-white/[0.03] rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-white/40">Real-time 3D · Three.js · WebGL · R3F</span>
                </div>
            </div>
        </div>
    );
}
