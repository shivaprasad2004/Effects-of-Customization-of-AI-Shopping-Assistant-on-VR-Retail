import { useRef } from 'react';
import { Plane, Box, MeshReflectorMaterial, Circle, Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FloatingShoppingBag, WelcomeHologram, NavigationArrow } from './AnimatedDecorations';

/**
 * StoreEnvironment: Enhanced 3D architecture with volumetric lighting,
 * ambient particles, neon signage, emissive glow strips, and fog.
 */

function AmbientParticles({ count = 200 }: { count?: number }) {
    const meshRef = useRef<THREE.Points>(null);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 1] = Math.random() * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.01;
            const pos = meshRef.current.geometry.attributes.position;
            for (let i = 0; i < count; i++) {
                const y = pos.getY(i);
                pos.setY(i, y + Math.sin(state.clock.elapsedTime + i) * 0.002);
            }
            pos.needsUpdate = true;
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry><bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} /></bufferGeometry>
            <pointsMaterial size={0.05} color="#E94560" transparent opacity={0.4} sizeAttenuation />
        </points>
    );
}

function NeonSign({ text, position, color = '#E94560' }: { text: string; position: [number, number, number]; color?: string }) {
    return (
        <group position={position}>
            <Text fontSize={0.8} color={color} anchorX="center" anchorY="middle" font="/fonts/Orbitron-Bold.ttf">
                {text}
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} toneMapped={false} />
            </Text>
            <pointLight intensity={0.8} color={color} distance={8} />
        </group>
    );
}

function GlowStrip({ position, rotation = [0, 0, 0], length = 10, color = '#E94560' }: { position: [number, number, number]; rotation?: [number, number, number]; length?: number; color?: string }) {
    return (
        <mesh position={position} rotation={rotation as any}>
            <boxGeometry args={[length, 0.05, 0.05]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} toneMapped={false} />
        </mesh>
    );
}

export default function StoreEnvironment() {
    return (
        <group>
            {/* Fog */}
            <fog attach="fog" args={['#0A0A1A', 20, 80]} />

            {/* Floor with enhanced reflection */}
            <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <MeshReflectorMaterial
                    blur={[400, 200]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={60}
                    roughness={0.8}
                    depthScale={1.5}
                    minDepthThreshold={0.3}
                    maxDepthThreshold={1.5}
                    color="#080812"
                    metalness={0.6}
                    mirror={0.8}
                />
            </mesh>

            {/* Grid helper */}
            <gridHelper args={[100, 60, 0x0F3460, 0x0A2445]} position={[0, 0.01, 0]} />

            {/* Central Lobby */}
            <group position={[0, 0, 0]}>
                <Circle args={[10, 64]} rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
                    <meshStandardMaterial color="#0F3460" emissive="#0F3460" emissiveIntensity={0.8} transparent opacity={0.2} />
                </Circle>

                {/* Pillars with glow strips */}
                {[0, 72, 144, 216, 288].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const x = Math.cos(rad) * 10;
                    const z = Math.sin(rad) * 10;
                    return (
                        <group key={i} position={[x, 0, z]}>
                            <Box args={[0.8, 12, 0.8]} position={[0, 6, 0]} castShadow>
                                <meshStandardMaterial color="#16213E" metalness={0.95} roughness={0.05} />
                            </Box>
                            {/* Emissive glow strip on pillar */}
                            <Box args={[0.1, 12, 0.82]} position={[0.4, 6, 0]}>
                                <meshStandardMaterial color="#E94560" emissive="#E94560" emissiveIntensity={3} toneMapped={false} />
                            </Box>
                            <pointLight position={[0, 8, 0]} intensity={0.15} color="#E94560" distance={5} />
                        </group>
                    );
                })}
            </group>

            {/* Animated Decorations - Lobby */}
            <FloatingShoppingBag position={[0, 4, 0]} color="#E94560" />
            <FloatingShoppingBag position={[3, 5, -3]} color="#4FC3F7" />
            <FloatingShoppingBag position={[-3, 4.5, 2]} color="#FF6B85" />
            <WelcomeHologram position={[0, 3, 0]} />

            {/* Navigation Arrows - pointing toward each zone */}
            {/* Toward Fashion (back-left) */}
            <NavigationArrow position={[-7, 0.15, -7]} rotation={[0, Math.PI / 4 + Math.PI, 0]} color="#FF6B85" />
            {/* Toward Electronics (back-right) */}
            <NavigationArrow position={[7, 0.15, -7]} rotation={[0, -Math.PI / 4 + Math.PI, 0]} color="#4FC3F7" />
            {/* Toward Furniture (front-left) */}
            <NavigationArrow position={[-7, 0.15, 7]} rotation={[0, Math.PI / 4, 0]} color="#81C784" />
            {/* Toward Checkout (front-right) */}
            <NavigationArrow position={[7, 0.15, 7]} rotation={[0, -Math.PI / 4, 0]} color="#FFB74D" />

            {/* Zone Neon Signs */}
            <NeonSign text="FASHION" position={[-15, 6, -15]} color="#FF6B85" />
            <NeonSign text="ELECTRONICS" position={[15, 6, -15]} color="#4FC3F7" />
            <NeonSign text="FURNITURE" position={[0, 6, 15]} color="#81C784" />
            <NeonSign text="CHECKOUT" position={[-20, 6, 15]} color="#FFB74D" />

            {/* Floor glow strips between zones */}
            <GlowStrip position={[0, 0.1, -8]} length={20} color="#E94560" />
            <GlowStrip position={[-8, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} length={20} color="#0F3460" />
            <GlowStrip position={[8, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} length={20} color="#0F3460" />
            <GlowStrip position={[0, 0.1, 8]} length={20} color="#E94560" />

            {/* Ceiling */}
            <group position={[0, 15, 0]}>
                <Box args={[50, 0.15, 50]}>
                    <meshStandardMaterial color="#0D0D1A" transparent opacity={0.9} />
                </Box>
                {/* Ceiling glow strips */}
                {[-15, -5, 5, 15].map((x) => (
                    <GlowStrip key={x} position={[x, -0.1, 0]} length={50} color="#0F3460" rotation={[0, Math.PI / 2, 0]} />
                ))}
            </group>

            {/* Ambient particles */}
            <AmbientParticles count={300} />

            {/* Gradient dome skybox */}
            <mesh scale={[-1, 1, 1]}>
                <sphereGeometry args={[60, 32, 32]} />
                <meshBasicMaterial color="#0A0A1A" side={THREE.BackSide} />
            </mesh>

            {/* Lighting */}
            <ambientLight intensity={0.15} color="#B0BEC5" />
            <pointLight position={[0, 12, 0]} intensity={0.8} color="#E94560" distance={30} />
            <pointLight position={[15, 8, -15]} intensity={0.4} color="#4FC3F7" distance={20} />
            <pointLight position={[-15, 8, -15]} intensity={0.4} color="#FF6B85" distance={20} />
            <pointLight position={[0, 8, 15]} intensity={0.4} color="#81C784" distance={20} />
            <spotLight position={[0, 14, 0]} angle={0.6} penumbra={0.5} intensity={0.5} color="#FFFFFF" castShadow />
        </group>
    );
}
