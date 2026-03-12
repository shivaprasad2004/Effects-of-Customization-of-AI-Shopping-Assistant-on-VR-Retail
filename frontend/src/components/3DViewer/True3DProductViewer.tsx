import { useRef, useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    Environment,
    ContactShadows,
    Html,
    RoundedBox,
    Float,
    MeshReflectorMaterial,
    Text,
    Sparkles,
    Stars,
    useProgress,
    Center,
    Edges,
    MeshTransmissionMaterial,
    MeshDistortMaterial,
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ── Types ──
interface ProductData {
    name: string;
    category?: string;
    price?: number;
    images?: string[];
    colors?: { name: string; hex: string }[];
    brand?: string;
    specifications?: Record<string, any>;
}

interface Props {
    product: ProductData;
    compact?: boolean;
}

type ViewMode = 'standard' | 'wireframe' | 'exploded' | 'xray';
type EnvPreset = 'city' | 'studio' | 'sunset' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'dawn';

// ── Annotation Hotspot Data ──
interface Hotspot {
    position: [number, number, number];
    label: string;
    description: string;
}

const CATEGORY_HOTSPOTS: Record<string, Hotspot[]> = {
    electronics: [
        { position: [0, 0.15, 0.2], label: 'Display', description: 'High-res AMOLED panel with 120Hz refresh' },
        { position: [0.8, 0, 0], label: 'Ports', description: 'USB-C, HDMI 2.1, Thunderbolt 4' },
        { position: [0, -0.55, 0], label: 'Chassis', description: 'Aerospace-grade aluminum unibody' },
    ],
    fashion: [
        { position: [0, 0.9, 0.5], label: 'Fabric', description: 'Premium organic cotton blend' },
        { position: [0, 0, 0.5], label: 'Stitching', description: 'Double-needle reinforced seams' },
        { position: [0, -0.8, 0.5], label: 'Hem', description: 'Clean finish with hidden stitching' },
    ],
    beauty: [
        { position: [0, 0.9, 0.3], label: 'Cap', description: 'Magnetic closure mechanism' },
        { position: [0, 0, 0.4], label: 'Formula', description: 'Dermatologically tested ingredients' },
        { position: [0, -0.5, 0.4], label: 'Bottle', description: 'Recyclable frosted glass' },
    ],
    default: [
        { position: [0, 0.6, 0.3], label: 'Top', description: 'Premium build quality' },
        { position: [0, 0, 0.3], label: 'Body', description: 'Ergonomic design' },
        { position: [0, -0.6, 0.3], label: 'Base', description: 'Anti-slip surface' },
    ],
};

// ── 3D Annotation Pin ──
function AnnotationPin({ position, label, description, visible }: Hotspot & { visible: boolean }) {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.scale.setScalar(0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.15);
        }
    });

    if (!visible) return null;

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            >
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial
                    color="#E94560"
                    emissive="#E94560"
                    emissiveIntensity={hovered ? 3 : 1.5}
                    toneMapped={false}
                />
            </mesh>
            {/* Pulse ring */}
            <mesh rotation-x={-Math.PI / 2}>
                <ringGeometry args={[0.08, 0.12, 32]} />
                <meshStandardMaterial
                    color="#E94560"
                    emissive="#E94560"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.4}
                    toneMapped={false}
                />
            </mesh>
            {hovered && (
                <Html distanceFactor={5} style={{ pointerEvents: 'none' }}>
                    <div className="bg-black/90 backdrop-blur-xl border border-[#E94560]/30 rounded-xl px-4 py-3 min-w-[180px] shadow-2xl">
                        <p className="text-[#E94560] text-xs font-bold font-['Orbitron'] mb-1">{label}</p>
                        <p className="text-white/70 text-[10px] leading-relaxed">{description}</p>
                    </div>
                </Html>
            )}
        </group>
    );
}

// ── 3D Product Model (Enhanced) ──
function Product3DModel({
    imageUrl,
    color,
    category,
    autoRotate,
    viewMode,
    explodeFactor,
}: {
    imageUrl: string;
    color: string;
    category: string;
    autoRotate: boolean;
    viewMode: ViewMode;
    explodeFactor: number;
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
            groupRef.current.rotation.y += delta * 0.35;
        }
    });

    const isWireframe = viewMode === 'wireframe';
    const isXray = viewMode === 'xray';
    const ef = explodeFactor;

    const getMaterial = (opts?: { metalness?: number; roughness?: number; clearcoat?: number }) => {
        if (isXray) {
            return (
                <meshPhysicalMaterial
                    color={color}
                    transparent
                    opacity={0.25}
                    wireframe={false}
                    roughness={0.1}
                    metalness={0.1}
                    clearcoat={1}
                    side={THREE.DoubleSide}
                />
            );
        }
        if (isWireframe) {
            return (
                <meshStandardMaterial
                    color={color}
                    wireframe
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            );
        }
        return texture ? (
            <meshPhysicalMaterial
                map={texture}
                color={color}
                roughness={opts?.roughness ?? 0.35}
                metalness={opts?.metalness ?? 0.1}
                clearcoat={opts?.clearcoat ?? 0.4}
                clearcoatRoughness={0.2}
                envMapIntensity={1.4}
            />
        ) : (
            <meshPhysicalMaterial
                color={color}
                roughness={opts?.roughness ?? 0.4}
                metalness={opts?.metalness ?? 0.2}
                clearcoat={opts?.clearcoat ?? 0.5}
            />
        );
    };

    const getImageMat = () => {
        if (isXray) return <meshStandardMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />;
        if (isWireframe) return <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={0.2} />;
        return texture ? (
            <meshStandardMaterial map={texture} roughness={0.1} metalness={0.05} />
        ) : (
            <meshStandardMaterial color="#111" roughness={0.1} />
        );
    };

    const renderProduct = () => {
        switch (category) {
            case 'electronics':
                return (
                    <>
                        {/* Front - product image only */}
                        <group position={[0, 0, 0.01 + ef * 0.4]}>
                            <mesh castShadow>
                                <planeGeometry args={[2.0, 1.4]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                        {/* Back */}
                        <group position={[0, 0, -0.01 - ef * 0.4]}>
                            <mesh rotation={[0, Math.PI, 0]} castShadow>
                                <planeGeometry args={[2.0, 1.4]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                    </>
                );

            case 'fashion':
                return (
                    <>
                        {/* Front - product image only */}
                        <group position={[0, 0, 0.01 + ef * 0.5]}>
                            <mesh castShadow>
                                <planeGeometry args={[1.6, 2.4]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                        {/* Back */}
                        <group position={[0, 0, -0.01 - ef * 0.5]}>
                            <mesh rotation={[0, Math.PI, 0]} castShadow>
                                <planeGeometry args={[1.6, 2.4]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                    </>
                );

            case 'beauty':
                return (
                    <>
                        {/* Front - product image only */}
                        <group position={[0, 0, 0.01 + ef * 0.3]}>
                            <mesh castShadow>
                                <planeGeometry args={[1.4, 2.0]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                        {/* Back */}
                        <group position={[0, 0, -0.01 - ef * 0.3]}>
                            <mesh rotation={[0, Math.PI, 0]} castShadow>
                                <planeGeometry args={[1.4, 2.0]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                    </>
                );

            case 'baby_kids':
                return (
                    <>
                        {/* Front - product image only */}
                        <group position={[0, 0, 0.01 + ef * 0.3]}>
                            <mesh castShadow>
                                <planeGeometry args={[1.6, 1.6]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                        {/* Back */}
                        <group position={[0, 0, -0.01 - ef * 0.3]}>
                            <mesh rotation={[0, Math.PI, 0]} castShadow>
                                <planeGeometry args={[1.6, 1.6]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                    </>
                );

            case 'pets':
                return (
                    <>
                        {/* Front - product image only */}
                        <group position={[0, 0, 0.01 + ef * 0.3]}>
                            <mesh castShadow>
                                <planeGeometry args={[1.8, 1.4]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                        {/* Back */}
                        <group position={[0, 0, -0.01 - ef * 0.3]}>
                            <mesh rotation={[0, Math.PI, 0]} castShadow>
                                <planeGeometry args={[1.8, 1.4]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                    </>
                );

            case 'furniture':
                return (
                    <>
                        {/* Front - product image only */}
                        <group position={[0, 0, 0.01 + ef * 0.3]}>
                            <mesh castShadow>
                                <planeGeometry args={[2.2, 1.6]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                        {/* Back */}
                        <group position={[0, 0, -0.01 - ef * 0.3]}>
                            <mesh rotation={[0, Math.PI, 0]} castShadow>
                                <planeGeometry args={[2.2, 1.6]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                    </>
                );

            default:
                return (
                    <>
                        {/* Front - product image only */}
                        <group position={[0, 0, 0.01 + ef * 0.3]}>
                            <mesh castShadow>
                                <planeGeometry args={[1.8, 2.0]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                        {/* Back */}
                        <group position={[0, 0, -0.01 - ef * 0.3]}>
                            <mesh rotation={[0, Math.PI, 0]} castShadow>
                                <planeGeometry args={[1.8, 2.0]} />
                                {getImageMat()}
                            </mesh>
                        </group>
                    </>
                );
        }
    };

    return (
        <group ref={groupRef} position={[0, 0.8, 0]}>
            {renderProduct()}
        </group>
    );
}

// ── Display Stand removed - products float cleanly without support ──

// ── Scene Lighting (Enhanced) ──
function SceneLighting({ accentColor }: { accentColor: string }) {
    return (
        <>
            <ambientLight intensity={0.35} />
            <directionalLight position={[5, 8, 5]} intensity={1.3} castShadow shadow-mapSize={2048} shadow-bias={-0.0001} />
            <directionalLight position={[-5, 4, -3]} intensity={0.4} color="#E94560" />
            <spotLight position={[0, 10, 0]} intensity={0.6} angle={0.3} penumbra={0.8} castShadow />
            <pointLight position={[3, 2, 3]} intensity={0.3} color="#4FC3F7" />
            <pointLight position={[-3, 2, -3]} intensity={0.3} color="#E94560" />
            <pointLight position={[0, 2, -3]} intensity={0.6} color="#4FC3F7" />
            {/* Dynamic accent light based on selected color */}
            <pointLight position={[0, 3, 2]} intensity={0.25} color={accentColor} />
        </>
    );
}

// ── Loading Spinner ──
function Loader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 relative">
                    <div className="w-14 h-14 border-2 border-white/20 border-t-[#E94560] rounded-full animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                        {Math.round(progress)}%
                    </span>
                </div>
                <span className="text-white/60 text-sm font-medium">Loading 3D View...</span>
            </div>
        </Html>
    );
}

// ── Reflective Floor ──
function Floor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
            <planeGeometry args={[50, 50]} />
            <MeshReflectorMaterial
                blur={[300, 100]}
                resolution={1024}
                mixBlur={1}
                mixStrength={40}
                roughness={1}
                depthScale={1.2}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#050510"
                metalness={0.5}
                mirror={0.5}
            />
        </mesh>
    );
}

// ── Ambient Particles ──
function AmbientParticles({ color }: { color: string }) {
    return (
        <>
            <Sparkles count={40} scale={6} size={1.5} speed={0.3} color={color} opacity={0.3} />
            <Sparkles count={20} scale={8} size={2} speed={0.15} color="#4FC3F7" opacity={0.15} />
        </>
    );
}

// ── Screenshot helper ──
function ScreenshotHelper({ onCapture }: { onCapture: (fn: () => void) => void }) {
    const { gl, scene, camera } = useThree();
    useEffect(() => {
        onCapture(() => {
            gl.render(scene, camera);
            const link = document.createElement('a');
            link.download = `product-3d-${Date.now()}.png`;
            link.href = gl.domElement.toDataURL('image/png');
            link.click();
        });
    }, [gl, scene, camera, onCapture]);
    return null;
}

// ── Camera Presets ──
const CAMERA_PRESETS = [
    { name: 'Front', pos: [0, 1.5, 4.5] as [number, number, number], icon: '🎯' },
    { name: 'Top', pos: [0, 6, 0.5] as [number, number, number], icon: '⬆' },
    { name: 'Side', pos: [5, 1.5, 0] as [number, number, number], icon: '➡' },
    { name: 'Close', pos: [0, 1, 2.5] as [number, number, number], icon: '🔍' },
];

function CameraController({ targetPosition }: { targetPosition: [number, number, number] | null }) {
    const { camera } = useThree();
    const target = useRef<[number, number, number] | null>(null);

    useEffect(() => {
        if (targetPosition) target.current = targetPosition;
    }, [targetPosition]);

    useFrame(() => {
        if (target.current) {
            camera.position.lerp(new THREE.Vector3(...target.current), 0.04);
            const dist = camera.position.distanceTo(new THREE.Vector3(...target.current));
            if (dist < 0.05) target.current = null;
        }
    });

    return null;
}

// ── Main Component ──
export default function True3DProductViewer({ product, compact = false }: Props) {
    const [autoRotate, setAutoRotate] = useState(true);
    const [selectedColorIdx, setSelectedColorIdx] = useState(0);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('standard');
    const [envPreset, setEnvPreset] = useState<EnvPreset>('city');
    const [showAnnotations, setShowAnnotations] = useState(false);
    const [showSpecs, setShowSpecs] = useState(false);
    const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null);
    const [explodeFactor, setExplodeFactor] = useState(0);
    const screenshotFnRef = useRef<(() => void) | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentColor = product.colors?.[selectedColorIdx]?.hex || '#E94560';
    const currentImage = product.images?.[selectedImageIdx] || product.images?.[0] || '';
    const category = product.category || 'default';
    const hotspots = CATEGORY_HOTSPOTS[category] || CATEGORY_HOTSPOTS.default;

    // Fullscreen
    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    }, []);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            switch (e.key) {
                case ' ': e.preventDefault(); setAutoRotate(a => !a); break;
                case 'f': case 'F': toggleFullscreen(); break;
                case 'w': case 'W': setViewMode(v => v === 'wireframe' ? 'standard' : 'wireframe'); break;
                case 'x': case 'X': setViewMode(v => v === 'xray' ? 'standard' : 'xray'); break;
                case 'e': case 'E': setViewMode(v => v === 'exploded' ? 'standard' : 'exploded'); break;
                case 'a': case 'A': setShowAnnotations(a => !a); break;
                case 'Escape': if (isFullscreen) document.exitFullscreen?.(); break;
                case '1': setCameraTarget(CAMERA_PRESETS[0].pos); break;
                case '2': setCameraTarget(CAMERA_PRESETS[1].pos); break;
                case '3': setCameraTarget(CAMERA_PRESETS[2].pos); break;
                case '4': setCameraTarget(CAMERA_PRESETS[3].pos); break;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isFullscreen, toggleFullscreen]);

    // Explode animation
    useEffect(() => {
        if (viewMode === 'exploded') {
            const interval = setInterval(() => {
                setExplodeFactor(prev => {
                    if (prev >= 1) { clearInterval(interval); return 1; }
                    return prev + 0.05;
                });
            }, 16);
            return () => clearInterval(interval);
        } else {
            const interval = setInterval(() => {
                setExplodeFactor(prev => {
                    if (prev <= 0) { clearInterval(interval); return 0; }
                    return prev - 0.05;
                });
            }, 16);
            return () => clearInterval(interval);
        }
    }, [viewMode]);

    const envPresets: { id: EnvPreset; label: string; icon: string }[] = [
        { id: 'city', label: 'City', icon: '🏙️' },
        { id: 'studio', label: 'Studio', icon: '📸' },
        { id: 'sunset', label: 'Sunset', icon: '🌅' },
        { id: 'night', label: 'Night', icon: '🌙' },
        { id: 'warehouse', label: 'Warehouse', icon: '🏭' },
        { id: 'forest', label: 'Forest', icon: '🌲' },
        { id: 'apartment', label: 'Apartment', icon: '🏠' },
        { id: 'dawn', label: 'Dawn', icon: '🌄' },
    ];

    const viewModes: { id: ViewMode; label: string; icon: string; shortcut: string }[] = [
        { id: 'standard', label: 'Standard', icon: '🎨', shortcut: '' },
        { id: 'wireframe', label: 'Wireframe', icon: '📐', shortcut: 'W' },
        { id: 'xray', label: 'X-Ray', icon: '🔬', shortcut: 'X' },
        { id: 'exploded', label: 'Exploded', icon: '💥', shortcut: 'E' },
    ];

    const height = compact ? 'h-[520px]' : 'h-[calc(100vh-200px)] min-h-[520px]';

    return (
        <div ref={containerRef} className="w-full space-y-4">
            {/* ── 3D Canvas ── */}
            <div className={`${height} w-full relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#050510] to-[#0a0a2a] border border-white/5 group`}>
                <Canvas
                    shadows
                    camera={{ position: [0, 1.8, 4.5], fov: 45 }}
                    gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
                    dpr={[1, 2]}
                >
                    <fog attach="fog" args={['#050510', 8, 25]} />
                    <SceneLighting accentColor={currentColor} />
                    <CameraController targetPosition={cameraTarget} />
                    <ScreenshotHelper onCapture={(fn) => { screenshotFnRef.current = fn; }} />

                    <Suspense fallback={<Loader />}>
                        <Float speed={1.5} rotationIntensity={viewMode === 'standard' ? 0.1 : 0} floatIntensity={viewMode === 'standard' ? 0.3 : 0}>
                            <Product3DModel
                                imageUrl={currentImage}
                                color={currentColor}
                                category={category}
                                autoRotate={autoRotate}
                                viewMode={viewMode}
                                explodeFactor={explodeFactor}
                            />
                        </Float>

                        {/* Annotation Hotspots */}
                        <group position={[0, 0.8, 0]}>
                            {hotspots.map((h, i) => (
                                <AnnotationPin key={i} {...h} visible={showAnnotations} />
                            ))}
                        </group>

                        <Floor />
                        <ContactShadows position={[0, -0.54, 0]} opacity={0.5} scale={8} blur={2} />
                        <AmbientParticles color={currentColor} />
                        <Environment preset={envPreset} />
                    </Suspense>

                    <OrbitControls
                        enablePan={false}
                        minDistance={2}
                        maxDistance={12}
                        maxPolarAngle={Math.PI / 1.8}
                        minPolarAngle={Math.PI / 6}
                        target={[0, 0.5, 0]}
                        enableDamping
                        dampingFactor={0.05}
                    />
                </Canvas>

                {/* ── Overlay: Product Badge (top-left) ── */}
                <div className="absolute top-4 left-4 z-10 space-y-2">
                    <div className="px-4 py-2.5 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#E94560] animate-pulse" />
                            <span className="text-sm font-bold text-white font-['Orbitron']">TRUE 3D</span>
                            <span className="text-[10px] text-white/40 px-1.5 py-0.5 bg-white/5 rounded">Interactive</span>
                        </div>
                        <p className="text-white text-sm font-medium mt-1">{product.name}</p>
                        {product.brand && <p className="text-[10px] text-[#E94560] uppercase tracking-widest">{product.brand}</p>}
                    </div>
                    {/* View Mode indicator */}
                    {viewMode !== 'standard' && (
                        <div className="px-3 py-1.5 bg-purple-500/15 backdrop-blur-xl rounded-lg border border-purple-500/30">
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                                {viewModes.find(v => v.id === viewMode)?.icon} {viewMode} view
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Overlay: Controls (top-right) ── */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
                    {/* Auto-rotate */}
                    <button
                        onClick={() => setAutoRotate(a => !a)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all border backdrop-blur-md ${
                            autoRotate ? 'bg-[#E94560]/20 border-[#E94560]/40 text-[#E94560]' : 'bg-black/40 border-white/10 text-white/50 hover:text-white/80'
                        }`}
                        title="Auto-rotate (Space)"
                    >
                        {autoRotate ? '⏸' : '▶'}
                    </button>
                    {/* Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm bg-black/40 backdrop-blur-md border border-white/10 text-white/50 hover:text-white/80 transition-all"
                        title="Fullscreen (F)"
                    >
                        {isFullscreen ? '⊟' : '⊞'}
                    </button>
                    {/* Annotations */}
                    <button
                        onClick={() => setShowAnnotations(a => !a)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all border backdrop-blur-md ${
                            showAnnotations ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' : 'bg-black/40 border-white/10 text-white/50 hover:text-white/80'
                        }`}
                        title="Annotations (A)"
                    >
                        📌
                    </button>
                    {/* Screenshot */}
                    <button
                        onClick={() => screenshotFnRef.current?.()}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm bg-black/40 backdrop-blur-md border border-white/10 text-white/50 hover:text-white/80 transition-all"
                        title="Screenshot"
                    >
                        📷
                    </button>
                    {/* Specs toggle */}
                    <button
                        onClick={() => setShowSpecs(s => !s)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all border backdrop-blur-md ${
                            showSpecs ? 'bg-[#4FC3F7]/20 border-[#4FC3F7]/40 text-[#4FC3F7]' : 'bg-black/40 border-white/10 text-white/50 hover:text-white/80'
                        }`}
                        title="Specifications"
                    >
                        📋
                    </button>
                </div>

                {/* ── Overlay: View Mode Switcher (right side, middle) ── */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {viewModes.map(vm => (
                        <button
                            key={vm.id}
                            onClick={() => setViewMode(vm.id)}
                            className={`px-3 py-2 rounded-lg text-[10px] font-medium transition-all border backdrop-blur-md flex items-center gap-1.5 ${
                                viewMode === vm.id
                                    ? 'bg-[#E94560]/20 border-[#E94560]/40 text-[#E94560]'
                                    : 'bg-black/40 border-white/10 text-white/40 hover:text-white/70'
                            }`}
                            title={vm.shortcut ? `${vm.label} (${vm.shortcut})` : vm.label}
                        >
                            <span>{vm.icon}</span>
                            <span className="hidden xl:inline">{vm.label}</span>
                        </button>
                    ))}
                </div>

                {/* ── Overlay: Camera Presets (left side, middle) ── */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {CAMERA_PRESETS.map((cp, i) => (
                        <button
                            key={cp.name}
                            onClick={() => setCameraTarget(cp.pos)}
                            className="px-3 py-2 rounded-lg text-[10px] font-medium bg-black/40 backdrop-blur-md border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5 transition-all flex items-center gap-1.5"
                            title={`${cp.name} (${i + 1})`}
                        >
                            <span>{cp.icon}</span>
                            <span className="hidden xl:inline">{cp.name}</span>
                        </button>
                    ))}
                </div>

                {/* ── Overlay: Environment Switcher (bottom-left) ── */}
                <div className="absolute bottom-4 left-4 z-10 flex gap-1 flex-wrap max-w-[300px]">
                    {envPresets.map(e => (
                        <button
                            key={e.id}
                            onClick={() => setEnvPreset(e.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border backdrop-blur-md ${
                                envPreset === e.id
                                    ? 'bg-[#E94560]/20 border-[#E94560]/40 text-[#E94560]'
                                    : 'bg-black/40 border-white/10 text-white/40 hover:text-white/70'
                            }`}
                        >
                            {e.icon}
                        </button>
                    ))}
                </div>

                {/* ── Overlay: Instructions (bottom-center) ── */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                    <div className="flex items-center gap-3 text-[8px] text-white/40 uppercase tracking-widest">
                        <span>Drag: Orbit</span>
                        <span className="text-white/15">|</span>
                        <span>Scroll: Zoom</span>
                        <span className="text-white/15">|</span>
                        <span>Space: Spin</span>
                        <span className="text-white/15">|</span>
                        <span>W/X/E: Views</span>
                        <span className="text-white/15">|</span>
                        <span>A: Pins</span>
                    </div>
                </div>

                {/* ── Overlay: Price (bottom-right) ── */}
                {product.price && (
                    <div className="absolute bottom-4 right-4 z-10 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                        <span className="text-2xl font-bold text-white font-['Orbitron']">₹{product.price?.toLocaleString('en-IN')}</span>
                    </div>
                )}

                {/* ── Overlay: Specs Panel (right) ── */}
                <AnimatePresence>
                    {showSpecs && product.specifications && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute top-16 right-16 z-10 w-64 max-h-[60%] overflow-y-auto bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 p-4"
                        >
                            <h4 className="text-xs font-bold text-white font-['Orbitron'] mb-3">Specifications</h4>
                            <div className="space-y-1.5">
                                {Object.entries(product.specifications).map(([k, v]) => (
                                    <div key={k} className="flex justify-between text-[10px] py-1 border-b border-white/5">
                                        <span className="text-white/40 capitalize">{k}</span>
                                        <span className="text-white/80">{String(v)}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Color & Image Selector (below canvas) ── */}
            <div className="flex flex-wrap items-center gap-6">
                {/* Color selector */}
                {product.colors && product.colors.length > 1 && (
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">Color</span>
                        <div className="flex gap-2">
                            {product.colors.map((c, i) => (
                                <motion.button
                                    key={c.hex}
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedColorIdx(i)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                                        selectedColorIdx === i
                                            ? 'border-[#E94560] ring-2 ring-[#E94560]/30 scale-110'
                                            : 'border-white/15 hover:border-white/30'
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-white/50">{product.colors[selectedColorIdx]?.name}</span>
                    </div>
                )}

                {/* Image/texture selector */}
                {product.images && product.images.length > 1 && (
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">Texture</span>
                        <div className="flex gap-1.5">
                            {product.images.slice(0, 5).map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImageIdx(i)}
                                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                                        selectedImageIdx === i
                                            ? 'border-[#E94560] shadow-[0_0_8px_rgba(233,69,96,0.3)]'
                                            : 'border-transparent opacity-40 hover:opacity-70'
                                    }`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt={`View ${i + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* View mode pills */}
                <div className="flex items-center gap-2 ml-auto">
                    {viewModes.map(vm => (
                        <button
                            key={vm.id}
                            onClick={() => setViewMode(vm.id)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${
                                viewMode === vm.id
                                    ? 'bg-[#E94560]/15 border-[#E94560]/30 text-[#E94560]'
                                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                            }`}
                        >
                            {vm.icon} {vm.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
