import { Plane, Box, MeshReflectorMaterial, Circle } from '@react-three/drei';

/**
 * StoreEnvironment: Static 3D architecture of the retail space.
 * Includes floor with reflections, central lobby structure, and zone markers.
 */
export default function StoreEnvironment() {
    return (
        <group>
            {/* Floor with reflection */}
            <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <MeshReflectorMaterial
                    blur={[300, 100]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={40}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#101018"
                    metalness={0.5}
                    mirror={1}
                />
            </mesh>

            {/* Grid helper (cyber aesthetic) */}
            <gridHelper args={[100, 50, 0x103460, 0x103460]} position={[0, 0, 0]} />

            {/* Central Lobby Structure */}
            <group position={[0, 0, 0]}>
                {/* Circular base */}
                <Circle args={[8, 64]} rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
                    <meshStandardMaterial color="#0F3460" emissive="#0F3460" emissiveIntensity={0.5} transparent opacity={0.3} />
                </Circle>

                {/* Floating Pillars */}
                {[0, 90, 180, 270].map((angle, i) => (
                    <group key={i} rotation-y={(angle * Math.PI) / 180}>
                        <Box args={[1, 10, 1]} position={[8, 5, 0]} castShadow>
                            <meshStandardMaterial color="#16213E" metalness={0.9} roughness={0.1} />
                        </Box>
                        {/* Neon light stripe */}
                        <Box args={[0.1, 10.1, 1.1]} position={[7.5, 5, 0]}>
                            <meshStandardMaterial color="#E94560" emissive="#E94560" emissiveIntensity={2} />
                        </Box>
                    </group>
                ))}
            </group>

            {/* Decorative ceiling grid */}
            <group position={[0, 15, 0]}>
                <Box args={[40, 0.2, 40]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#1A1A2E" transparent opacity={0.8} />
                </Box>
            </group>

            {/* Soft fill lights for architecture */}
            <pointLight position={[0, 10, 0]} intensity={0.5} color="#E94560" />
            <pointLight position={[10, 5, 10]} intensity={0.2} color="#0F3460" />
            <pointLight position={[-10, 5, -10]} intensity={0.2} color="#0F3460" />
        </group>
    );
}
