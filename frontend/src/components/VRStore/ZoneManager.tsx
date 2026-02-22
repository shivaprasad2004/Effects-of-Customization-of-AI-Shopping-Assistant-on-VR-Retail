import { Suspense, lazy } from 'react';
import { Text, Float } from '@react-three/drei';

const FashionZone = lazy(() => import('./FashionZone'));
const ElectronicsZone = lazy(() => import('./ElectronicsZone'));
const FurnitureZone = lazy(() => import('./FurnitureZone'));
const CheckoutZone = lazy(() => import('./CheckoutZone'));

interface Props {
    currentZone: string;
}

/**
 * ZoneManager: Loads and unloads 3D zones based on player location.
 * Adds 3D floating markers for each zone.
 */
export default function ZoneManager({ currentZone }: Props) {
    return (
        <group>
            {/* Zone Markers / Gateways */}
            <ZoneMarker title="Fashion" position={[-20, 0, -20]} color="#E94560" active={currentZone === 'fashion'} />
            <ZoneMarker title="Electronics" position={[20, 0, -20]} color="#0F3460" active={currentZone === 'electronics'} />
            <ZoneMarker title="Furniture" position={[-20, 0, 20]} color="#34D399" active={currentZone === 'furniture'} />
            <ZoneMarker title="Checkout" position={[20, 0, 20]} color="#FBBF24" active={currentZone === 'checkout'} />

            <Suspense fallback={null}>
                <FashionZone active={currentZone === 'fashion'} />
                <ElectronicsZone active={currentZone === 'electronics'} />
                <FurnitureZone active={currentZone === 'furniture'} />
                <CheckoutZone active={currentZone === 'checkout'} />
            </Suspense>
        </group>
    );
}

function ZoneMarker({ title, position, color, active }: any) {
    return (
        <group position={position}>
            <Float speed={3} rotationIntensity={1} floatIntensity={1}>
                <mesh position={[0, 4, 0]}>
                    <torusGeometry args={[2, 0.05, 16, 100]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 2 : 0.5} transparent opacity={0.6} />
                </mesh>
            </Float>
            <Text
                position={[0, 4, 0]}
                fontSize={0.5}
                color="white"
                font="/fonts/Orbitron-Bold.ttf"
            >
                {title}
            </Text>
            {/* Floor glow circle */}
            <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
                <circleGeometry args={[3, 32]} />
                <meshStandardMaterial color={color} transparent opacity={active ? 0.3 : 0.05} />
            </mesh>
        </group>
    );
}
