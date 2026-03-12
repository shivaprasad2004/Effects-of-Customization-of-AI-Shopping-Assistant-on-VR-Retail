import { useRef, useState } from 'react';
import { Text, Float, Html, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Product } from '../../store/productSlice';
import { useDispatch } from 'react-redux';
import { selectProduct } from '../../store/productSlice';
import { openModal } from '../../store/uiSlice';
import * as THREE from 'three';

interface Props {
    product: Product;
    position: [number, number, number];
}

/**
 * ProductDisplay: Enhanced 3D product with holographic pedestal,
 * rotating base, floating price tag, and interaction glow.
 */
export default function ProductDisplay({ product, position }: Props) {
    const dispatch = useDispatch();
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null);
    const baseRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.PointLight>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.008;
        }
        if (baseRef.current) {
            baseRef.current.rotation.y += 0.005;
        }
        // Pulse glow on hover
        if (glowRef.current) {
            glowRef.current.intensity = hovered
                ? 1.5 + Math.sin(state.clock.elapsedTime * 4) * 0.5
                : 0.3;
        }
    });

    const handleClick = () => {
        dispatch(selectProduct(product));
        dispatch(openModal('productDetail'));
    };

    const productColor = product.colors?.[0]?.hex || '#0F3460';
    const isShowcase = product.showcase;

    return (
        <group position={position}>
            {/* Holographic Pedestal Base */}
            <group ref={baseRef as any} position={[0, 0, 0]}>
                {/* Outer ring */}
                <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
                    <torusGeometry args={[1.2, 0.03, 16, 64]} />
                    <meshStandardMaterial color="#E94560" emissive="#E94560" emissiveIntensity={2} toneMapped={false} transparent opacity={0.7} />
                </mesh>
                {/* Inner disc */}
                <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
                    <circleGeometry args={[1.1, 64]} />
                    <meshStandardMaterial color="#0F3460" emissive="#0F3460" emissiveIntensity={0.5} transparent opacity={0.3} metalness={0.9} roughness={0.1} />
                </mesh>
                {/* Pedestal cylinder */}
                <mesh position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.9, 1.0, 0.3, 32]} />
                    <meshStandardMaterial color="#16213E" metalness={0.95} roughness={0.05} />
                </mesh>
            </group>

            {/* Product 3D Model */}
            <Float speed={hovered ? 4 : 2} rotationIntensity={hovered ? 0.8 : 0.3} floatIntensity={hovered ? 0.8 : 0.4}>
                <mesh
                    ref={meshRef}
                    position={[0, 1.2, 0]}
                    onPointerEnter={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
                    onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default'; }}
                    onClick={handleClick}
                    castShadow
                >
                    {product.category === 'electronics' ? (
                        <RoundedBox args={[1, 0.7, 1]} radius={0.08} smoothness={4}>
                            <meshPhysicalMaterial color={productColor} metalness={0.7} roughness={0.15} clearcoat={0.8} emissive={hovered ? '#E94560' : '#000'} emissiveIntensity={hovered ? 0.4 : 0} />
                        </RoundedBox>
                    ) : product.category === 'fashion' ? (
                        <mesh>
                            <cylinderGeometry args={[0.4, 0.55, 1.4, 32]} />
                            <meshPhysicalMaterial color={productColor} roughness={0.6} metalness={0.1} emissive={hovered ? '#E94560' : '#000'} emissiveIntensity={hovered ? 0.3 : 0} />
                        </mesh>
                    ) : (
                        <RoundedBox args={[1.2, 0.8, 0.8]} radius={0.05} smoothness={4}>
                            <meshPhysicalMaterial color={productColor} roughness={0.4} metalness={0.2} clearcoat={0.3} emissive={hovered ? '#E94560' : '#000'} emissiveIntensity={hovered ? 0.3 : 0} />
                        </RoundedBox>
                    )}
                </mesh>
            </Float>

            {/* Product Name */}
            <Text position={[0, 2.4, 0]} fontSize={0.18} color="white" anchorX="center" anchorY="middle" font="/fonts/Orbitron-Bold.ttf" maxWidth={2.5}>
                {product.name}
            </Text>

            {/* Price Tag */}
            <Html position={[0, 2.1, 0]} center distanceFactor={6}>
                <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '14px', fontWeight: 'bold', color: '#E94560', whiteSpace: 'nowrap' }}>
                    ₹{product.price?.toLocaleString('en-IN')}
                </span>
            </Html>

            {/* Tech badges */}
            {isShowcase && (
                <group position={[0, 2.7, 0]}>
                    <Float speed={3} floatIntensity={0.2}>
                        <mesh position={[-0.5, 0, 0]}>
                            <boxGeometry args={[0.3, 0.15, 0.01]} />
                            <meshStandardMaterial color={product.arEnabled ? '#2196F3' : '#333'} emissive={product.arEnabled ? '#2196F3' : '#000'} emissiveIntensity={product.arEnabled ? 2 : 0} />
                        </mesh>
                        {product.model3DUrl && (
                            <mesh position={[0, 0, 0]}>
                                <boxGeometry args={[0.3, 0.15, 0.01]} />
                                <meshStandardMaterial color="#9C27B0" emissive="#9C27B0" emissiveIntensity={2} />
                            </mesh>
                        )}
                        {product.isAuthenticated && (
                            <mesh position={[0.5, 0, 0]}>
                                <boxGeometry args={[0.3, 0.15, 0.01]} />
                                <meshStandardMaterial color="#4CAF50" emissive="#4CAF50" emissiveIntensity={2} />
                            </mesh>
                        )}
                    </Float>
                </group>
            )}

            {/* Dynamic glow light */}
            <pointLight ref={glowRef} position={[0, 1.5, 0]} color="#E94560" distance={4} />

            {/* Hover info overlay */}
            <Html distanceFactor={10} position={[1.2, 1, 0]}>
                <div className={`transition-all duration-300 ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                    <div className="glass-card-elevated p-3 w-48 pointer-events-none rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            {product.brand && <span className="text-[8px] text-highlight uppercase tracking-widest font-bold">{product.brand}</span>}
                            {product.isAuthenticated && <span className="text-[8px] text-green-400">✓ Verified</span>}
                        </div>
                        <p className="text-[10px] text-white/60 line-clamp-2 mb-2">{product.description}</p>
                        <div className="flex gap-1.5 flex-wrap">
                            {product.arEnabled && <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[7px] font-bold">AR</span>}
                            {product.model3DUrl && <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[7px] font-bold">3D</span>}
                            {product.displayMode === 'configurator' && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[7px] font-bold">MiY</span>}
                        </div>
                        <p className="text-[8px] text-white/30 mt-2">Click to explore</p>
                    </div>
                </div>
            </Html>
        </group>
    );
}
