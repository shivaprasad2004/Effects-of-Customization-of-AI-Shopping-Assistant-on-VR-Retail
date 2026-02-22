import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import StoreEnvironment from './StoreEnvironment';
import ZoneManager from './ZoneManager';
import VRPlayer from './VRPlayer';

/**
 * VRScene: Orchestrates the 3D world contents.
 * Wraps environment, lighting, player, and dynamic zones.
 */
export default function VRScene() {
    const { vrZone } = useSelector((state: RootState) => state.ui);

    return (
        <group>
            {/* Lights & Atmosphere */}
            <fog attach="fog" args={['#050510', 0, 50]} />

            {/* Player / Camera Controller */}
            <VRPlayer />

            {/* Permanent Architecture */}
            <StoreEnvironment />

            {/* Dynamic Zone Contents */}
            <ZoneManager currentZone={vrZone} />
        </group>
    );
}
