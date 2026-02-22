import { useRef, useState, useEffect } from 'react';
import { Text, Float, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Product } from '../../store/productSlice';
import { useDispatch } from 'react-redux';
import { selectProduct } from '../../store/productSlice';
import { openModal } from '../../store/uiSlice';

interface Props {
    product: Product;
    position: [number, number, number];
}

/**
 * ProductDisplay: A 3D representation of a product.
 * Features a floating 3D model (placeholder box/sphere), 3D text label,
 * and a hover-active Html hotspot for quick info.
 */
export default function ProductDisplay({ product, position }: Props) {
    const dispatch = useDispatch();
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<any>(null);

    // Simple rotation animation
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    const handleClick = () => {
        dispatch(selectProduct(product));
        dispatch(openModal('productDetail'));
    };

    return (
        <group position={position}>
            {/* 3D Model Placeholder (Sphere/Box based on category) */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh
                    ref={meshRef}
                    onPointerEnter={() => setHovered(true)}
                    onPointerLeave={() => setHovered(false)}
                    onClick={handleClick}
                    castShadow
                >
                    {product.category === 'electronics' ? (
                        <boxGeometry args={[1, 1, 1]} />
                    ) : product.category === 'fashion' ? (
                        <cylinderGeometry args={[0.5, 0.5, 1.5, 32]} />
                    ) : (
                        <sphereGeometry args={[0.7, 32, 32]} />
                    )}
                    <meshStandardMaterial
                        color={hovered ? '#E94560' : '#0F3460'}
                        metalness={0.8}
                        roughness={0.2}
                        emissive={hovered ? '#E94560' : '#000'}
                        emissiveIntensity={0.5}
                    />
                </mesh>
            </Float>

            {/* 3D Label */}
            <Text
                position={[0, 1.5, 0]}
                fontSize={0.2}
                color="white"
                font="/fonts/Orbitron-Bold.ttf"
                anchorX="center"
                anchorY="middle"
            >
                {product.name}
            </Text>

            <Text
                position={[0, 1.2, 0]}
                fontSize={0.15}
                color="#E94560"
                font="/fonts/Orbitron-Regular.ttf"
                anchorX="center"
                anchorY="middle"
            >
                ${product.price}
            </Text>

            {/* Glow highlight for hovered state */}
            {hovered && (
                <pointLight intensity={0.5} color="#E94560" distance={3} />
            )}

            {/* Interaction Hotspot (HTML Overlay) */}
            <Html distanceFactor={10} position={[0.8, 0, 0]}>
                <div className={`transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="glass-card p-3 w-40 pointer-events-none">
                        <p className="text-[8px] font-heading text-highlight uppercase tracking-widest mb-1">Details</p>
                        <p className="text-[10px] text-white/70 line-clamp-2">{product.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-green-400 font-bold">VERIFIED</span>
                            <span className="text-[10px] text-white/50">Click to view</span>
                        </div>
                    </div>
                </div>
            </Html>
        </group>
    );
}
