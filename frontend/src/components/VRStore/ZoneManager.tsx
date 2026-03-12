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
            <ZoneMarker title="Beauty & Pets" position={[20, 0, 20]} color="#FBBF24" active={currentZone === 'beauty' || currentZone === 'pets'} />

            {/* Layer 1: Virtual Trial Room & Navigation Hub */}
            <group position={[0, 0, -30]}>
                <mesh position={[0, 2.5, 0]}>
                    <boxGeometry args={[10, 5, 0.5]} />
                    <meshStandardMaterial color="#30CFD0" transparent opacity={0.1} metalness={0.9} roughness={0.1} />
                </mesh>
                <Text position={[0, 6, 0]} fontSize={0.4} color="#30CFD0">VIRTUAL TRIAL ROOM</Text>
                <Text position={[0, 1, 1]} fontSize={0.15} color="white/40">Step inside to see 3D product overlays</Text>
            </group>

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
