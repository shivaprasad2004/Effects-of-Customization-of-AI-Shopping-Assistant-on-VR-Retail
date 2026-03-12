import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    Environment,
    ContactShadows,
    Html,
    RoundedBox,
    Float,
    useProgress,
    Sparkles,
    Edges,
} from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

/**
 * Product360Viewer — TRUE 3D 360° viewer using React Three Fiber.
 *
 * Replaces the old image-sprite 360° viewer with a real-time 3D scene
 * featuring orbit controls, auto-rotation, environment lighting, and
 * multi-angle product display with textured geometry.
 */

interface Props {
    images: string[];
    productName?: string;
    category?: string;
    color?: string;
}

// ── Textured Product Geometry ──
function ProductMesh({
    imageUrl,
    color,
    autoRotate,
}: {
    imageUrl: string;
    color: string;
    autoRotate: boolean;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        if (!imageUrl) return;
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = 'anonymous';
        loader.load(imageUrl, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.needsUpdate = true;
            setTexture(tex);
        });
    }, [imageUrl]);

    useFrame((_, delta) => {
        if (groupRef.current && autoRotate) {
            groupRef.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0.5, 0]}>
            {/* Main product body */}
            <RoundedBox args={[1.6, 1.9, 0.35]} radius={0.05} smoothness={4} castShadow>
                <meshPhysicalMaterial
                    color={color}
                    roughness={0.35}
                    metalness={0.1}
                    clearcoat={0.4}
                    clearcoatRoughness={0.2}
                    envMapIntensity={1.2}
                />
            </RoundedBox>
            {/* Front face with product image */}
            <mesh position={[0, 0, 0.18]} castShadow>
                <planeGeometry args={[1.45, 1.75]} />
                {texture ? (
                    <meshStandardMaterial map={texture} roughness={0.15} metalness={0.02} />
                ) : (
                    <meshStandardMaterial color="#1a1a1a" roughness={0.1} />
                )}
            </mesh>
            {/* Back face */}
            <mesh position={[0, 0, -0.18]} rotation={[0, Math.PI, 0]} castShadow>
                <planeGeometry args={[1.45, 1.75]} />
                {texture ? (
                    <meshStandardMaterial map={texture} roughness={0.15} metalness={0.02} />
                ) : (
                    <meshStandardMaterial color="#1a1a1a" roughness={0.1} />
                )}
            </mesh>
            {/* Edge highlight */}
            <RoundedBox args={[1.62, 1.92, 0.37]} radius={0.06} smoothness={4}>
                <meshStandardMaterial color={color} transparent opacity={0} />
                <Edges threshold={15} color={color} />
            </RoundedBox>
        </group>
    );
}

// ── Display Pedestal ──
function Pedestal({ color }: { color: string }) {
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.z = state.clock.elapsedTime * 0.4;
        }
    });

    return (
        <group position={[0, -0.55, 0]}>
            <mesh receiveShadow>
                <cylinderGeometry args={[1.2, 1.3, 0.05, 64]} />
                <meshPhysicalMaterial color="#0a0a1a" metalness={0.9} roughness={0.1} clearcoat={1} />
            </mesh>
            <mesh ref={ringRef} rotation-x={-Math.PI / 2} position={[0, 0.04, 0]}>
                <torusGeometry args={[1.05, 0.015, 16, 64]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
        </group>
    );
}

// ── Loading ──
function Loader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 relative">
                    <div className="w-12 h-12 border-2 border-white/20 border-t-[#E94560] rounded-full animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                        {Math.round(progress)}%
                    </span>
                </div>
                <span className="text-white/60 text-xs">Loading 3D...</span>
            </div>
        </Html>
    );
}

export default function Product360Viewer({ images, productName, category, color }: Props) {
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [autoRotate, setAutoRotate] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const accentColor = color || '#E94560';
    const currentImage = images[selectedIdx] || images[0] || '';

    // Keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft': setSelectedIdx(p => (p - 1 + images.length) % images.length); break;
                case 'ArrowRight': setSelectedIdx(p => (p + 1) % images.length); break;
                case ' ': e.preventDefault(); setAutoRotate(a => !a); break;
                case 'f': case 'F': toggleFullscreen(); break;
                case 'Escape': if (isFullscreen) { document.exitFullscreen?.(); setIsFullscreen(false); } break;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [images.length, isFullscreen]);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const angle = images.length > 0 ? (selectedIdx / images.length) * 360 : 0;
    const circumference = 2 * Math.PI * 15;

    return (
        <div ref={containerRef} className={isFullscreen ? 'fixed inset-0 z-[200] bg-black/95 flex flex-col' : 'space-y-4'}>
            {/* ── 3D Canvas ── */}
            <div className={`${isFullscreen ? 'flex-1' : 'aspect-square'} w-full relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#050510] to-[#0a0a2a] border border-white/5`}>
                <Canvas
                    shadows
                    camera={{ position: [0, 1.2, 3.8], fov: 42 }}
                    gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
                    dpr={[1, 2]}
                >
                    <fog attach="fog" args={['#050510', 6, 20]} />
                    <ambientLight intensity={0.35} />
                    <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={1024} />
                    <directionalLight position={[-3, 4, -3]} intensity={0.3} color="#E94560" />
                    <spotLight position={[0, 8, 0]} intensity={0.5} angle={0.3} penumbra={0.7} castShadow />
                    <pointLight position={[2, 1, 2]} intensity={0.2} color="#4FC3F7" />
                    <pointLight position={[-2, 1, -2]} intensity={0.2} color="#E94560" />

                    <Suspense fallback={<Loader />}>
                        <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.2}>
                            <ProductMesh
                                imageUrl={currentImage}
                                color={accentColor}
                                autoRotate={autoRotate}
                            />
                        </Float>
                        <Pedestal color={accentColor} />
                        <ContactShadows position={[0, -0.54, 0]} opacity={0.5} scale={6} blur={2} />
                        <Sparkles count={25} scale={5} size={1} speed={0.3} color={accentColor} opacity={0.25} />
                        <Environment preset="city" />
                    </Suspense>

                    <OrbitControls
                        enablePan={false}
                        minDistance={2}
                        maxDistance={8}
                        maxPolarAngle={Math.PI / 1.8}
                        minPolarAngle={Math.PI / 6}
                        target={[0, 0.3, 0]}
                        enableDamping
                        dampingFactor={0.05}
                    />
                </Canvas>

                {/* ── Progress ring (top-right) ── */}
                <div className="absolute top-3 right-3 w-11 h-11 z-10">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="2" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#E94560" strokeWidth="2.5"
                            strokeDasharray={`${(angle / 360) * circumference} ${circumference}`}
                            strokeLinecap="round" className="transition-all duration-300" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/70">{Math.round(angle)}°</span>
                </div>

                {/* ── 3D Badge (top-left) ── */}
                <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E94560] animate-pulse" />
                        <span className="text-[10px] font-bold text-white font-['Orbitron']">3D 360°</span>
                    </div>
                    {productName && <p className="text-[9px] text-white/50 mt-0.5">{productName}</p>}
                </div>

                {/* ── Bottom HUD ── */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                    <div className="flex gap-1">
                        {images.map((_, i) => (
                            <button key={i} onClick={() => setSelectedIdx(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === selectedIdx ? 'bg-[#E94560] w-3' : 'bg-white/25 hover:bg-white/40'}`} />
                        ))}
                    </div>
                    <div className="w-px h-3 bg-white/15" />
                    <button onClick={() => setAutoRotate(a => !a)} title="Auto-rotate (Space)"
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] transition-all ${autoRotate ? 'bg-[#E94560]/20 text-[#E94560]' : 'text-white/40 hover:text-white/70'}`}>
                        {autoRotate ? '⏸' : '▶'}
                    </button>
                    <button onClick={toggleFullscreen} title="Fullscreen (F)"
                        className="w-6 h-6 flex items-center justify-center rounded-full text-white/40 hover:text-white/70 text-[10px] transition-colors">
                        {isFullscreen ? '⊟' : '⊞'}
                    </button>
                    <div className="w-px h-3 bg-white/15" />
                    <span className="text-[7px] text-white/35 uppercase tracking-[0.15em] whitespace-nowrap">Drag to Orbit</span>
                </div>
            </div>

            {/* ── Thumbnail strip ── */}
            <div className={`grid ${images.length <= 3 ? 'grid-cols-3' : images.length <= 4 ? 'grid-cols-4' : images.length <= 5 ? 'grid-cols-5' : 'grid-cols-6'} gap-2 ${isFullscreen ? 'px-6 pb-6 pt-3' : ''}`}>
                {images.slice(0, 6).map((img, i) => (
                    <button key={i} onClick={() => setSelectedIdx(i)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${i === selectedIdx ? 'border-[#E94560] shadow-[0_0_12px_rgba(233,69,96,0.3)]' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                        <img src={img} className="w-full h-full object-cover" alt={`Angle ${i + 1}`} />
                    </button>
                ))}
            </div>

            {/* Fullscreen close */}
            {isFullscreen && (
                <button onClick={() => { document.exitFullscreen?.(); setIsFullscreen(false); }}
                    className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition-colors z-10">
                    ✕
                </button>
            )}
        </div>
    );
}
