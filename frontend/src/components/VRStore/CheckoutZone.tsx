import { Text } from '@react-three/drei';

/**
 * CheckoutZone: The payment and finalization area.
 * Features a 3D payment terminal and instructions.
 */
export default function CheckoutZone({ active }: { active: boolean }) {
    if (!active) return null;

    return (
        <group position={[25, 0, 25]}>
            {/* Floor Highlight */}
            <mesh rotation-x={-Math.PI / 2} position={[-5, 0.02, -5]}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#FBBF24" transparent opacity={0.1} />
            </mesh>

            {/* Terminal Placeholder */}
            <mesh position={[-5, 1, -5]}>
                <boxGeometry args={[2, 2, 0.5]} />
                <meshStandardMaterial color="#1A1A2E" emissive="#FBBF24" emissiveIntensity={0.2} />
            </mesh>

            <Text
                position={[-5, 2.5, -5]}
                fontSize={0.3}
                color="white"
                font="/fonts/Orbitron-Bold.ttf"
            >
                PAYMENT HUB
            </Text>

            <Text
                position={[-5, 2.1, -5]}
                fontSize={0.15}
                color="#FBBF24"
                font="/fonts/Orbitron-Regular.ttf"
            >
                Connect Wallet & Review Cart
            </Text>
        </group>
    );
}
