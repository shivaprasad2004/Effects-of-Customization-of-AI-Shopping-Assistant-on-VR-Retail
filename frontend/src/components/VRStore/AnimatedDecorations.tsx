import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// ── 1. FloatingShoppingBag ──
// A shopping bag made from a tapered box + handle (torus), floating and slowly rotating
export function FloatingShoppingBag({
    position = [0, 0, 0] as [number, number, number],
    color = '#E94560',
}: {
    position?: [number, number, number];
    color?: string;
}) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <group ref={groupRef} position={position}>
                {/* Bag body - tapered box */}
                <mesh castShadow>
                    <boxGeometry args={[0.8, 1, 0.5]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.3}
                        roughness={0.6}
                    />
                </mesh>
                {/* Bag top flap */}
                <mesh position={[0, 0.55, 0]}>
                    <boxGeometry args={[0.85, 0.1, 0.55]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.2}
                        roughness={0.5}
                    />
                </mesh>
                {/* Handle */}
                <mesh position={[0, 0.85, 0]} rotation={[0, 0, 0]}>
                    <torusGeometry args={[0.25, 0.03, 12, 24, Math.PI]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.5}
                        toneMapped={false}
                    />
                </mesh>
            </group>
        </Float>
    );
}

// ── 2. AnimatedMannequin ──
// Simple T-pose figure with breathing animation
export function AnimatedMannequin({
    position = [0, 0, 0] as [number, number, number],
    color = '#E94560',
}: {
    position?: [number, number, number];
    color?: string;
}) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Subtle breathing animation - Y scale pulse
            const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
            groupRef.current.scale.y = breathe;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Head */}
            <mesh position={[0, 2.4, 0]} castShadow>
                <sphereGeometry args={[0.25, 24, 24]} />
                <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            {/* Torso */}
            <mesh position={[0, 1.6, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.25, 1.2, 16]} />
                <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            {/* Left arm */}
            <mesh position={[-0.55, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.08, 0.07, 0.8, 12]} />
                <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            {/* Right arm */}
            <mesh position={[0.55, 1.8, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.08, 0.07, 0.8, 12]} />
                <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            {/* Left leg */}
            <mesh position={[-0.15, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.08, 1, 12]} />
                <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            {/* Right leg */}
            <mesh position={[0.15, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.08, 1, 12]} />
                <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
        </group>
    );
}

// ── 3. RotatingDisplayShelf ──
// A circular 2-tier shelf, slowly rotating with emissive edge rings
export function RotatingDisplayShelf({
    position = [0, 0, 0] as [number, number, number],
    color = '#0F3460',
}: {
    position?: [number, number, number];
    color?: string;
}) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Bottom tier */}
            <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[2, 2, 0.15, 48]} />
                <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Bottom tier emissive ring */}
            <mesh position={[0, 0.18, 0]} rotation-x={-Math.PI / 2}>
                <torusGeometry args={[2, 0.03, 12, 48]} />
                <meshStandardMaterial
                    color="#4FC3F7"
                    emissive="#4FC3F7"
                    emissiveIntensity={3}
                    toneMapped={false}
                />
            </mesh>
            {/* Center pillar */}
            <mesh position={[0, 1.1, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 1.8, 16]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Top tier */}
            <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.5, 1.5, 0.12, 48]} />
                <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Top tier emissive ring */}
            <mesh position={[0, 2.16, 0]} rotation-x={-Math.PI / 2}>
                <torusGeometry args={[1.5, 0.03, 12, 48]} />
                <meshStandardMaterial
                    color="#4FC3F7"
                    emissive="#4FC3F7"
                    emissiveIntensity={3}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}

// ── 4. PromotionalBanner ──
// Floating holographic text banner with bobbing animation
export function PromotionalBanner({
    position = [0, 0, 0] as [number, number, number],
    text = 'SALE',
    color = '#E94560',
}: {
    position?: [number, number, number];
    text?: string;
    color?: string;
}) {
    return (
        <Float speed={2} rotationIntensity={0.05} floatIntensity={0.4}>
            <group position={position}>
                <Text
                    fontSize={0.6}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/Orbitron-Bold.ttf"
                >
                    {text}
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={2.5}
                        toneMapped={false}
                        transparent
                        opacity={0.9}
                    />
                </Text>
                {/* Subtle glow light */}
                <pointLight intensity={0.4} color={color} distance={6} />
            </group>
        </Float>
    );
}

// ── 5. NavigationArrow ──
// Glowing arrow on the floor (cone geometry rotated flat) with pulsing emissive
export function NavigationArrow({
    position = [0, 0, 0] as [number, number, number],
    rotation = [0, 0, 0] as [number, number, number],
    color = '#E94560',
}: {
    position?: [number, number, number];
    rotation?: [number, number, number];
    color?: string;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 1.5 + Math.sin(state.clock.elapsedTime * 2.5) * 1;
        }
    });

    return (
        <group position={position} rotation={rotation}>
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} castShadow>
                <coneGeometry args={[0.5, 1.5, 8]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={2}
                    toneMapped={false}
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </group>
    );
}

// ── 6. WelcomeHologram ──
// A VR headset shape (RoundedBox + cylinder lenses) that auto-rotates
export function WelcomeHologram({
    position = [0, 0, 0] as [number, number, number],
}: {
    position?: [number, number, number];
}) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
        }
    });

    return (
        <Float speed={1.8} rotationIntensity={0.1} floatIntensity={0.6}>
            <group ref={groupRef} position={position}>
                {/* Headset body */}
                <RoundedBox args={[1.2, 0.6, 0.5]} radius={0.12} smoothness={4} castShadow>
                    <meshStandardMaterial
                        color="#16213E"
                        emissive="#0F3460"
                        emissiveIntensity={0.8}
                        metalness={0.8}
                        roughness={0.2}
                        toneMapped={false}
                    />
                </RoundedBox>
                {/* Left lens */}
                <mesh position={[-0.25, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.18, 0.18, 0.05, 24]} />
                    <meshStandardMaterial
                        color="#4FC3F7"
                        emissive="#4FC3F7"
                        emissiveIntensity={3}
                        toneMapped={false}
                    />
                </mesh>
                {/* Right lens */}
                <mesh position={[0.25, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.18, 0.18, 0.05, 24]} />
                    <meshStandardMaterial
                        color="#4FC3F7"
                        emissive="#4FC3F7"
                        emissiveIntensity={3}
                        toneMapped={false}
                    />
                </mesh>
                {/* Strap hint */}
                <mesh position={[0, 0, -0.3]}>
                    <boxGeometry args={[1.4, 0.08, 0.05]} />
                    <meshStandardMaterial
                        color="#E94560"
                        emissive="#E94560"
                        emissiveIntensity={1.5}
                        toneMapped={false}
                    />
                </mesh>
            </group>
        </Float>
    );
}
